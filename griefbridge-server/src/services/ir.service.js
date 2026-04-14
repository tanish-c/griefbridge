import Procedure from '../models/Procedure.model.js';

const LEGAL_PRIORITY_ORDER = [
  'DEATH_CERT', 'SUCCESSION_CERT', 'EPF_FORM_20',
  'BANK_TRANSFER', 'INSURANCE_CLAIM', 'PROPERTY_MUTATION',
  'PENSION_TRANSFER', 'VEHICLE_TRANSFER', 'IT_FINAL_RETURN'
];

export async function matchProcedures(intakeAnswers, dateOfDeath) {
  const corpus = await Procedure.find({});
  const scored = [];

  for (const proc of corpus) {
    const reqVector = proc.requirementVector;
    const weights = proc.requirementWeights || {};
    let score = 0, totalWeight = 0;

    for (const [key, required] of Object.entries(reqVector)) {
      const weight = weights[key] || 1;
      totalWeight += weight;
      if (required === 0) {
        score += weight;
        continue;
      }
      if (intakeAnswers[key] === true) {
        score += weight;
      }
    }

    const normScore = totalWeight > 0 ? score / totalWeight : 0;
    if (normScore >= 0.5) scored.push({ proc, normScore });
  }

  scored.sort((a, b) => {
    const pa = LEGAL_PRIORITY_ORDER.indexOf(a.proc.procedureId);
    const pb = LEGAL_PRIORITY_ORDER.indexOf(b.proc.procedureId);
    if (pa !== -1 && pb !== -1) return pa - pb;
    if (pa !== -1) return -1;
    if (pb !== -1) return 1;
    return b.normScore - a.normScore;
  });

  return scored.map(({ proc }) => ({
    procedureId: proc.procedureId,
    title: proc.title,
    department: proc.department,
    status: proc.procedureId === 'DEATH_CERT' ? 'UNLOCKED' : 'NOT_STARTED',
    priority: LEGAL_PRIORITY_ORDER.indexOf(proc.procedureId),
    deadline: calculateDeadline(proc.legalDeadline, dateOfDeath),
    dependencies: proc.dependencies || [],
    requiredDocTypes: proc.requiredDocTypes || [],
    formTemplateId: proc.formTemplateId || null
  }));
}

function calculateDeadline(rule, dateOfDeath) {
  if (!rule || !dateOfDeath) return null;
  const base = new Date(dateOfDeath);
  const { value, unit } = rule;
  if (unit === 'days') base.setDate(base.getDate() + value);
  if (unit === 'months') base.setMonth(base.getMonth() + value);
  if (unit === 'years') base.setFullYear(base.getFullYear() + value);
  return base;
}
