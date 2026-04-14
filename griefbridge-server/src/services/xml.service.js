import { create } from 'xmlbuilder2';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateCaseBundle(caseData) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('GriefBridgeCase', {
      'xmlns:gb': 'https://griefbridge.in/schema/v1',
      caseId: caseData.caseId,
      exportDate: new Date().toISOString(),
      schemaVersion: '1.0'
    });

  root.ele('Deceased')
    .ele('FullName').txt(caseData.deceased.name).up()
    .ele('DateOfDeath').txt(caseData.deceased.dateOfDeath.toISOString().split('T')[0]).up()
    .ele('State').txt(caseData.deceased.state).up();

  const proceduresEl = root.ele('Procedures', { count: String(caseData.procedures.length) });
  for (const proc of caseData.procedures) {
    const pe = proceduresEl.ele('Procedure', {
      id: proc.procedureId,
      priority: String(proc.priority),
      status: proc.status,
      deadline: proc.deadline?.toISOString() || 'N/A'
    });
    pe.ele('Title').txt(proc.title).up();
    pe.ele('Department').txt(proc.department).up();
    if (proc.completedAt) pe.ele('CompletedAt').txt(proc.completedAt.toISOString()).up();
    if (proc.dependencies?.length) {
      const deps = pe.ele('Dependencies');
      proc.dependencies.forEach(d => deps.ele('DependsOn').txt(d).up());
    }
  }

  let xmlString = root.end({ prettyPrint: true });

  const sig = crypto.createHash('sha256').update(xmlString).digest('hex');
  const timestamp = new Date().toISOString();
  xmlString = xmlString.replace(
    '</GriefBridgeCase>',
    ` <ExportSignature algorithm="SHA-256" timestamp="${timestamp}">${sig}</ExportSignature>\n</GriefBridgeCase>`
  );

  const tmpXml = path.join('/tmp', `${caseData.caseId}_${Date.now()}.xml`);
  const tmpHtml = path.join('/tmp', `${caseData.caseId}_${Date.now()}.html`);
  const xsltPath = path.join(__dirname, '../xslt/caseReport.xsl');
  
  fs.writeFileSync(tmpXml, xmlString, 'utf8');

  try {
    execFileSync('xsltproc', ['-o', tmpHtml, xsltPath, tmpXml], { timeout: 10000 });
  } catch (err) {
    console.error('XSLT error:', err);
  }

  const htmlReport = fs.existsSync(tmpHtml) ? fs.readFileSync(tmpHtml, 'utf8') : '';

  const compressed = zlib.gzipSync(Buffer.from(xmlString, 'utf8'));

  [tmpXml, tmpHtml].forEach(f => {
    try { fs.unlinkSync(f); } catch {}
  });

  return { xmlString, htmlReport, compressedBundle: compressed, signature: sig };
}
