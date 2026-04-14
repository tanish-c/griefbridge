import express from 'express';
import { uploadDocument, getDocuments, deleteDocument, updateDocumentType } from '../controllers/documents.controller.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/', upload.single('file'), uploadDocument);
router.get('/case/:caseId', getDocuments);
router.delete('/:id', deleteDocument);
router.patch('/:id', updateDocumentType);

export default router;
