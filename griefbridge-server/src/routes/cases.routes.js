import express from 'express';
import { createCase, getCases, getCase, updateProcedureStatus, deleteCase, getProcedureGuideDetails, getCaseWithGuides } from '../controllers/cases.controller.js';
import { getCaseRssFeed } from '../controllers/rss.controller.js';

const router = express.Router();

router.post('/', createCase);
router.get('/', getCases);

// Specific routes must come before :id routes
router.get('/:id/with-guides', getCaseWithGuides);
router.get('/:id/rss', getCaseRssFeed);

// Generic :id routes come last
router.get('/:id', getCase);
router.get('/:id/procedures/:procedureId', getProcedureGuideDetails);
router.patch('/:id/procedures/:procedureId', updateProcedureStatus);
router.delete('/:id', deleteCase);

export default router;
