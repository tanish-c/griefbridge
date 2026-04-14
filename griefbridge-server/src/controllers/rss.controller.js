import Case from '../models/Case.model.js';
import { generateCaseRssFeed } from '../services/rss.service.js';

export async function getCaseRssFeed(req, res, next) {
  try {
    const { id } = req.params;

    const caseDoc = await Case.findById(id);
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const feed = generateCaseRssFeed(caseDoc, baseUrl);

    res.setHeader('Content-Type', 'application/rss+xml');
    res.send(feed);
  } catch (error) {
    next(error);
  }
}
