import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const procedureGuidePath = path.join(__dirname, '../data/procedures.guide.json');
const proceduresGuide = JSON.parse(fs.readFileSync(procedureGuidePath, 'utf-8'));

export const getProcedureGuide = (procedureId, caseData) => {
  const guide = proceduresGuide[procedureId];
  
  if (!guide) {
    return null;
  }

  const stateSpecificGuide = guide.statefulGuide?.[caseData?.deceased?.state];
  const applicableGuide = stateSpecificGuide || guide.statefulGuide?.default;

  return {
    summary: guide.summary,
    what: guide.what,
    where: applicableGuide?.where,
    how: applicableGuide?.how,
    processingTime: applicableGuide?.processingTime,
    cost: applicableGuide?.cost,
    documents: guide.requiredDocuments,
    website: applicableGuide?.website,
    contacts: applicableGuide?.contacts,
    legalImportance: guide.legalImportance,
    challenges: guide.challenges,
    tips: guide.tips,
    isApplicable: isApplicable(procedureId, caseData?.deceased?.intakeAnswers)
  };
};

export const isApplicable = (procedureId, intakeAnswers) => {
  const guide = proceduresGuide[procedureId];
  const applicable = guide?.applicableScenarios;

  if (!applicable) {
    return true;
  }

  for (const [key, value] of Object.entries(applicable)) {
    if (value === true && !intakeAnswers?.[key]) {
      return false; // Required scenario is false
    }
    if (value === false && intakeAnswers?.[key]) {
      return false; // Scenario should be false but is true
    }
  }

  return true;
};

/**
 * Get all procedures with their guides for a case
 * @param {object} caseData - The case object
 * @param {array} procedures - Array of procedures from the case
 * @returns {array} Array of procedures with contextualized guides
 */
export const getAllProcedureGuides = (caseData, procedures) => {
  return procedures
    .map(procedure => ({
      ...procedure,
      guide: getProcedureGuide(procedure.procedureId, caseData)
    }))
    .sort((a, b) => {
      // Show applicable procedures first
      if (a.guide?.isApplicable !== b.guide?.isApplicable) {
        return b.guide?.isApplicable ? 1 : -1;
      }
      return 0;
    });
};

/**
 * Get contact information for a procedure
 * @param {string} procedureId - The procedure ID
 * @param {string} state - The state code
 * @returns {array} Array of contact strings
 */
export const getProcedureContacts = (procedureId, state) => {
  const guide = proceduresGuide[procedureId];
  const stateGuide = guide?.statefulGuide?.[state];
  
  return stateGuide?.contacts || guide?.statefulGuide?.default?.contacts || [];
};

/**
 * Get website reference for a procedure
 * @param {string} procedureId - The procedure ID
 * @param {string} state - The state code
 * @returns {string} URL to official website
 */
export const getProcedureWebsite = (procedureId, state) => {
  const guide = proceduresGuide[procedureId];
  const stateGuide = guide?.statefulGuide?.[state];
  
  return stateGuide?.website || guide?.statefulGuide?.default?.website || '';
};

export default {
  getProcedureGuide,
  isApplicable,
  getAllProcedureGuides,
  getProcedureContacts,
  getProcedureWebsite
};
