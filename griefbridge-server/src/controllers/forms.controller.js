import Case from '../models/Case.model.js';
import { generateCaseBundle } from '../services/xml.service.js';
import pdfReportService from '../services/pdfReport.service.js';
import formPreFillerService from '../services/formPreFiller.service.js';

export async function generateXmlExport(req, res, next) {
  try {
    const { id } = req.params;

    const caseDoc = await Case.findById(id);
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const { xmlString, compressedBundle, signature } = await generateCaseBundle(caseDoc);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${caseDoc.caseId}.gb"`);
    res.send(compressedBundle);
  } catch (error) {
    next(error);
  }
}

/**
 * Generate comprehensive PDF case report
 */
export async function generatePdfReport(req, res, next) {
  try {
    const { id } = req.params;
    const { reportType = 'summary' } = req.query; // summary, comprehensive, timeline

    const caseDoc = await Case.findById(id).lean();
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    let pdfBuffer;

    if (reportType === 'comprehensive') {
      pdfBuffer = await pdfReportService.generateCaseReport(caseDoc);
    } else if (reportType === 'timeline') {
      pdfBuffer = await pdfReportService.generateTimelineReport(caseDoc);
    } else {
      // Default: summary report
      pdfBuffer = await pdfReportService.generateSummaryReport(caseDoc);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${caseDoc.caseId}_${reportType}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

/**
 * Get available form templates
 */
export async function getFormTemplates(req, res, next) {
  try {
    const templates = formPreFillerService.getAvailableTemplates();
    res.json({
      data: templates,
      meta: { totalTemplates: templates.length }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single form template details
 */
export async function getFormTemplate(req, res, next) {
  try {
    const { templateId } = req.params;
    const template = formPreFillerService.getTemplate(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const instructions = formPreFillerService.getFormInstructions(templateId);

    res.json({
      data: template,
      instructions
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate prefilled form
 */
export async function generatePrefilledForm(req, res, next) {
  try {
    const { id } = req.params;
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'templateId is required' });
    }

    const caseDoc = await Case.findById(id).lean();
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Add owner data if available
    const caseDataWithOwner = {
      ...caseDoc,
      owner: req.user // Add current user as owner
    };

    const pdfBuffer = await formPreFillerService.generateFilledPdf(
      caseDataWithOwner,
      templateId
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${templateId}_${caseDoc.caseId}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

/**
 * Get form field mappings for case
 */
export async function getFormFieldMappings(req, res, next) {
  try {
    const { id } = req.params;
    const { templateId } = req.query;

    if (!templateId) {
      return res.status(400).json({ error: 'templateId is required' });
    }

    const caseDoc = await Case.findById(id).lean();
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseDataWithOwner = {
      ...caseDoc,
      owner: req.user
    };

    const fieldMappings = formPreFillerService.mapCaseDataToFormFields(
      caseDataWithOwner,
      templateId
    );

    res.json({
      data: fieldMappings,
      meta: { templateId, caseId: id }
    });
  } catch (error) {
    next(error);
  }
}
