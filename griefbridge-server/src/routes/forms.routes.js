import express from 'express';
import {
  generateXmlExport,
  generatePdfReport,
  getFormTemplates,
  getFormTemplate,
  generatePrefilledForm,
  getFormFieldMappings
} from '../controllers/forms.controller.js';

const router = express.Router();

// XML Export
router.get('/export/xml/:id', generateXmlExport);

// PDF Report Generation
router.get('/export/pdf/:id', generatePdfReport);

// Form Templates
router.get('/templates', getFormTemplates);
router.get('/templates/:templateId', getFormTemplate);

// Generate Pre-filled Forms
router.post('/generate-filled/:id', generatePrefilledForm);

// Get Form Field Mappings
router.get('/field-mappings/:id', getFormFieldMappings);

export default router;
