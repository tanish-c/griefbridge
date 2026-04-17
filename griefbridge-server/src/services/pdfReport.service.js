import puppeteer from 'puppeteer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PdfReportService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      } catch (error) {
        console.error('Failed to launch Puppeteer:', error.message);
        throw new Error('PDF generation temporarily unavailable');
      }
    }
    return this.browser;
  }

  /**
   * Generate comprehensive case report
   */
  async generateReport(caseId, caseData) {
    const {
      deceased,
      procedures,
      documents,
      createdAt
    } = caseData;

    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Generate HTML content
      const htmlContent = this.generateHtmlContent(
        caseId,
        deceased,
        procedures,
        createdAt
      );

      // Set HTML and render
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Configure PDF options
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: this.generateHeaderTemplate(caseId),
        footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;"><span class="pageNumber"></span> of <span class="totalPages"></span></div>'
      });

      await page.close();

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  /**
   * Generate summary report (lightweight version)
   */
  async generateSummaryReport(caseData) {
    try {
      const {
        caseId,
        deceased,
        procedures,
        createdAt
      } = caseData;

      // Create a PDF using pdfkit for lightweight generation
      const doc = new PDFDocument({
        margin: 40
      });

      // Title
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('GriefBridge Case Summary', { align: 'center' })
        .moveDown();

      // Case information
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Case Information')
        .font('Helvetica')
        .fontSize(10);

      doc
        .text(`Case ID: ${caseId}`)
        .text(`Created: ${new Date(createdAt).toLocaleDateString('en-IN')}`)
        .text(`Deceased: ${deceased.name}`)
        .text(`Date of Death: ${new Date(deceased.dateOfDeath).toLocaleDateString('en-IN')}`)
        .moveDown();

      // Procedures section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Procedures & Status');

      doc.fontSize(10).font('Helvetica');

      // Create table-like structure
      doc.text('', { underline: true });
      
      const startX = 40;
      const colWidths = { status: 100, title: 250, deadline: 120 };
      let y = doc.y;

      procedures.forEach((proc, idx) => {
        if (y > 700) {
          doc.addPage();
          y = 40;
        }

        // Status indicator
        const statusColor = this.getStatusColor(proc.status);
        doc
          .fillColor(statusColor)
          .rect(startX, y, 15, 15)
          .fill()
          .fillColor('black');

        // Procedure info
        doc.fontSize(9).text(
          `${proc.title}`,
          startX + 25,
          y,
          { width: colWidths.title, lineBreak: false }
        );

        // Status
        doc.fontSize(8).text(
          proc.status.replace(/_/g, ' '),
          startX + colWidths.title + 25,
          y,
          { width: colWidths.status }
        );

        // Deadline
        if (proc.deadline) {
          doc.text(
            new Date(proc.deadline).toLocaleDateString('en-IN'),
            startX + colWidths.title + colWidths.status + 25,
            y
          );
        }

        y = doc.y + 5;
      });

      // Summary statistics
      doc.moveDown(2);
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Summary Statistics');

      const stats = this.calculateStats(procedures);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Total Procedures: ${stats.total}`)
        .text(`Completed: ${stats.completed}`)
        .text(`In Progress: ${stats.inProgress}`)
        .text(`Pending: ${stats.pending}`)
        .text(`Overdue: ${stats.overdue}`)
        .moveDown();

      // Completion percentage
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`Overall Completion: ${stats.completionPercentage}%`);

      // Generate buffer
      return new Promise((resolve, reject) => {
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        doc.end();
      });
    } catch (error) {
      console.error('Error generating summary report:', error);
      throw error;
    }
  }

  /**
   * Generate Timeline Report
   */
  async generateTimelineReport(caseData) {
    try {
      const { caseId, procedures } = caseData;

      const doc = new PDFDocument();

      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('GriefBridge Timeline Report', { align: 'center' })
        .moveDown();

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Case ID: ${caseId}`)
        .moveDown(2);

      // Sort by deadline
      const sortedProc = [...procedures].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });

      // Timeline visualization in text
      sortedProc.forEach((proc, idx) => {
        const deadlineDate = proc.deadline
          ? new Date(proc.deadline).toLocaleDateString('en-IN')
          : 'No deadline';

        const urgency = this.getUrgency(proc.deadline);
        const urgencyText =
          urgency === 'overdue'
            ? ' [OVERDUE]'
            : urgency === 'urgent'
              ? ' [URGENT]'
              : '';

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`${idx + 1}. ${proc.title}`, 50)
          .fontSize(9)
          .font('Helvetica')
          .text(`Status: ${proc.status.replace(/_/g, ' ')}`)
          .text(`Deadline: ${deadlineDate}${urgencyText}`)
          .moveDown(0.5);
      });

      // Generate buffer
      return new Promise((resolve, reject) => {
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        doc.end();
      });
    } catch (error) {
      console.error('Error generating timeline report:', error);
      throw error;
    }
  }

  /**
   * Generate HTML content for Puppeteer
   */
  generateHtmlContent(caseId, deceased, procedures, createdAt) {
    const stats = this.calculateStats(procedures);

    const proceduresHtml = procedures
      .map(
        proc => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${proc.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          <span style="
            padding: 4px 8px;
            border-radius: 4px;
            background-color: ${this.getStatusColor(proc.status)};
            color: white;
            font-size: 12px;
          ">${proc.status.replace(/_/g, ' ')}</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          ${proc.deadline ? new Date(proc.deadline).toLocaleDateString('en-IN') : 'N/A'}
        </td>
      </tr>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #7f8c8d;
          }
          .section {
            margin: 20px 0;
          }
          .section h2 {
            background-color: #ecf0f1;
            padding: 10px;
            border-left: 4px solid #2c3e50;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th {
            background-color: #2c3e50;
            color: white;
            padding: 12px;
            text-align: left;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 15px 0;
          }
          .stat-box {
            padding: 15px;
            background-color: #ecf0f1;
            border-radius: 5px;
            text-align: center;
          }
          .stat-box .number {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
          }
          .stat-box .label {
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 5px;
          }
          .completion-bar {
            width: 100%;
            height: 30px;
            background-color: #ecf0f1;
            border-radius: 5px;
            overflow: hidden;
            margin: 20px 0;
          }
          .completion-progress {
            height: 100%;
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            font-size: 12px;
            color: #95a5a6;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GriefBridge Case Report</h1>
          <p>Case ID: ${caseId}</p>
          <p>Generated: ${new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <div class="section">
          <h2>Case Information</h2>
          <p><strong>Deceased:</strong> ${deceased.name}</p>
          <p><strong>Date of Death:</strong> ${new Date(deceased.dateOfDeath).toLocaleDateString('en-IN')}</p>
          <p><strong>State:</strong> ${deceased.state}</p>
          <p><strong>Case Created:</strong> ${new Date(createdAt).toLocaleDateString('en-IN')}</p>
        </div>

        <div class="section">
          <h2>Overall Progress</h2>
          <div class="completion-bar">
            <div class="completion-progress" style="width: ${stats.completionPercentage}%">
              ${stats.completionPercentage}% Complete
            </div>
          </div>
          <div class="stats">
            <div class="stat-box">
              <div class="number">${stats.total}</div>
              <div class="label">Total Procedures</div>
            </div>
            <div class="stat-box">
              <div class="number">${stats.completed}</div>
              <div class="label">Completed</div>
            </div>
            <div class="stat-box">
              <div class="number">${stats.overdue}</div>
              <div class="label">Overdue</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Procedures</h2>
          <table>
            <thead>
              <tr>
                <th>Procedure</th>
                <th>Status</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              ${proceduresHtml}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This is an official GriefBridge case report. Keep this document for your records.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate header template
   */
  generateHeaderTemplate(caseId) {
    return `
      <div style="font-size: 12px; width: 100%; text-align: center; padding: 10px;">
        <span>GriefBridge | Case Report | ${caseId}</span>
      </div>
    `;
  }

  /**
   * Calculate case statistics
   */
  calculateStats(procedures) {
    const now = new Date();
    const completed = procedures.filter(p => p.status === 'COMPLETED').length;
    const inProgress = procedures.filter(
      p => p.status === 'IN_PROGRESS'
    ).length;
    const overdue = procedures.filter(p => {
      if (p.deadline && new Date(p.deadline) < now && p.status !== 'COMPLETED') {
        return true;
      }
      return false;
    }).length;
    const pending = procedures.filter(
      p => p.status === 'NOT_STARTED' || p.status === 'UNLOCKED'
    ).length;

    return {
      total: procedures.length,
      completed,
      inProgress,
      pending,
      overdue,
      completionPercentage: Math.round((completed / procedures.length) * 100) || 0
    };
  }

  /**
   * Get status color for visualization
   */
  getStatusColor(status) {
    const colors = {
      COMPLETED: '#27ae60',
      IN_PROGRESS: '#3498db',
      NOT_STARTED: '#95a5a6',
      UNLOCKED: '#f39c12',
      BLOCKED: '#e74c3c',
      OVERDUE: '#c0392b'
    };
    return colors[status] || '#95a5a6';
  }

  /**
   * Get urgency level based on deadline
   */
  getUrgency(deadline) {
    if (!deadline) return 'none';
    const now = new Date();
    const daysUntil = Math.ceil(
      (new Date(deadline) - now) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 7) return 'urgent';
    return 'normal';
  }

  /**
   * Graceful browser shutdown
   */
  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
}

export default new PdfReportService();
