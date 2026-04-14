import express from 'express';
import { getCaseRssFeed } from '../controllers/rss.controller.js';

const router = express.Router();

router.get('/:id/rss', getCaseRssFeed);

export default router;
