<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:gb="https://griefbridge.in/schema/v1">
  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>GriefBridge Case Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; page-break-after: avoid; }
          .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #1e40af; font-size: 28px; }
          .header p { margin: 5px 0; font-size: 12px; color: #666; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section h2 { background-color: #e0e7ff; padding: 10px; border-left: 4px solid #2563eb; margin: 0 0 15px 0; }
          .deceased-info { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
          .deceased-info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #374151; color: white; padding: 10px; text-align: left; font-weight: bold; }
          td { padding: 10px; border-bottom: 1px solid #d1d5db; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .status-completed { color: #059669; font-weight: bold; }
          .status-in-progress { color: #2563eb; font-weight: bold; }
          .status-unlocked { color: #7c3aed; }
          .status-blocked { color: #dc2626; }
          .status-overdue { color: #dc2626; font-weight: bold; }
          .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .summary-card { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0284c7; border-radius: 5px; }
          .summary-card h3 { margin: 0 0 10px 0; color: #0c4a6e; font-size: 14px; }
          .summary-card .value { font-size: 28px; font-weight: bold; color: #0284c7; }
          .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #d1d5db; font-size: 12px; color: #666; }
          .signature-hash { word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GriefBridge Case Report</h1>
          <p>Case ID: <xsl:value-of select="/gb:GriefBridgeCase/@caseId"/></p>
          <p>Generated: <xsl:value-of select="/gb:GriefBridgeCase/@exportDate"/></p>
        </div>

        <div class="section">
          <h2>Deceased Information</h2>
          <div class="deceased-info">
            <p><strong>Name:</strong> <xsl:value-of select="/gb:GriefBridgeCase/gb:Deceased/gb:FullName"/></p>
            <p><strong>Date of Death:</strong> <xsl:value-of select="/gb:GriefBridgeCase/gb:Deceased/gb:DateOfDeath"/></p>
            <p><strong>State:</strong> <xsl:value-of select="/gb:GriefBridgeCase/gb:Deceased/gb:State"/></p>
          </div>
        </div>

        <div class="section">
          <h2>Case Summary</h2>
          <div class="summary">
            <div class="summary-card">
              <h3>Total Procedures</h3>
              <div class="value"><xsl:value-of select="/gb:GriefBridgeCase/gb:Procedures/@count"/></div>
            </div>
            <div class="summary-card">
              <h3>Completed</h3>
              <div class="value"><xsl:value-of select="count(/gb:GriefBridgeCase/gb:Procedures/gb:Procedure[@status='COMPLETED'])"/></div>
            </div>
            <div class="summary-card">
              <h3>In Progress</h3>
              <div class="value"><xsl:value-of select="count(/gb:GriefBridgeCase/gb:Procedures/gb:Procedure[@status='IN_PROGRESS'])"/></div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Procedures Status</h2>
          <table>
            <tr>
              <th>Priority</th>
              <th>Procedure</th>
              <th>Department</th>
              <th>Status</th>
              <th>Deadline</th>
            </tr>
            <xsl:for-each select="/gb:GriefBridgeCase/gb:Procedures/gb:Procedure">
              <xsl:sort select="@priority" data-type="number"/>
              <tr>
                <td><xsl:value-of select="@priority"/></td>
                <td><xsl:value-of select="gb:Title"/></td>
                <td><xsl:value-of select="gb:Department"/></td>
                <td>
                  <xsl:choose>
                    <xsl:when test="@status='COMPLETED'">
                      <span class="status-completed"><xsl:value-of select="@status"/></span>
                    </xsl:when>
                    <xsl:when test="@status='IN_PROGRESS'">
                      <span class="status-in-progress"><xsl:value-of select="@status"/></span>
                    </xsl:when>
                    <xsl:when test="@status='BLOCKED'">
                      <span class="status-blocked"><xsl:value-of select="@status"/></span>
                    </xsl:when>
                    <xsl:when test="@status='OVERDUE'">
                      <span class="status-overdue"><xsl:value-of select="@status"/></span>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:value-of select="@status"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
                <td><xsl:value-of select="@deadline"/></td>
              </tr>
            </xsl:for-each>
          </table>
        </div>

        <div class="signature">
          <p><strong>Export Verification</strong></p>
          <xsl:for-each select="/gb:GriefBridgeCase/gb:ExportSignature">
            <p>Algorithm: <xsl:value-of select="@algorithm"/></p>
            <p>Timestamp: <xsl:value-of select="@timestamp"/></p>
            <div class="signature-hash">SHA-256: <xsl:value-of select="text()"/></div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
