import Procedure from '../models/Procedure.model.js';

const LEGAL_PRIORITY_ORDER = [
  'DEATH_CERT', 'SUCCESSION_CERT', 'EPF_FORM_20',
  'BANK_TRANSFER', 'INSURANCE_CLAIM', 'PROPERTY_MUTATION',
  'PENSION_TRANSFER', 'VEHICLE_TRANSFER', 'IT_FINAL_RETURN'
];

export async function matchProcedures(intakeAnswers, dateOfDeath) {
  console.log('🔵 [IR] Fetching procedures from Procedure collection...');
  const corpus = await Procedure.find({});
  console.log('🔵 [IR] Found', corpus.length, 'procedures');
  const scored = [];

  for (const proc of corpus) {
    const reqVector = proc.requirementVector;
    
    // STRICTER MATCHING: Check if ALL required conditions are met
    // If a field is required (value=1), the user MUST have selected it
    let allRequiredConditionsMet = true;
    for (const [key, required] of Object.entries(reqVector)) {
      if (required === 1 && intakeAnswers[key] !== true) {
        allRequiredConditionsMet = false;
        console.log(`  └─ ${proc.procedureId} skipped: requires ${key} but not selected`);
        break;
      }
    }
    
    // Only include procedures where all required conditions are satisfied
    if (allRequiredConditionsMet) {
      scored.push({ proc, normScore: 1 });
    }
  }

  console.log('🔵 [IR] Procedures matched (with all required conditions met):', scored.length);
  scored.sort((a, b) => {
    const pa = LEGAL_PRIORITY_ORDER.indexOf(a.proc.procedureId);
    const pb = LEGAL_PRIORITY_ORDER.indexOf(b.proc.procedureId);
    if (pa !== -1 && pb !== -1) return pa - pb;
    if (pa !== -1) return -1;
    if (pb !== -1) return 1;
    return b.normScore - a.normScore;
  });

  const result = scored.map(({ proc }) => ({
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
  
  console.log('🔵 [IR] Procedures ready for return:', result.length);
  return result;
}

function calculateDeadline(rule, dateOfDeath) {
  if (!rule || !dateOfDeath) return null;
  
  try {
    const base = new Date(dateOfDeath);
    if (isNaN(base.getTime())) return null; // Invalid date
    
    const { value, unit } = rule;
    if (!value || !unit) return null;
    
    if (unit === 'days') base.setDate(base.getDate() + value);
    else if (unit === 'months') base.setMonth(base.getMonth() + value);
    else if (unit === 'years') base.setFullYear(base.getFullYear() + value);
    
    return base;
  } catch (e) {
    console.error('Error calculating deadline:', e);
    return null;
  }
}
