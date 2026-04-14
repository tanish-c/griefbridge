import express from 'express';
import * as experiencesController from '../controllers/experiences.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Middleware to check validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Create new experience (authenticated)
 * POST /api/experiences
 */
router.post(
  '/',
  authMiddleware,
  body('procedureId').notEmpty().withMessage('procedureId is required'),
  body('content')
    .notEmpty()
    .withMessage('content is required')
    .isLength({ max: 5000 })
    .withMessage('content must be 5000 characters or less'),
  body('city').optional().isString(),
  body('state').optional().isString(),
  body('institution').optional().isString(),
  body('tags').optional().isArray().withMessage('tags must be an array'),
  body('anonymous').optional().isBoolean(),
  handleValidationErrors,
  experiencesController.createExperience
);

/**
 * Search experiences
 * GET /api/experiences/search?q=...&searchType=query&procedureId=...
 */
router.get('/search', experiencesController.searchExperiences);

/**
 * Get trending experiences
 * GET /api/experiences/trending?timeframe=30&limit=10
 */
router.get('/trending', experiencesController.getTrendingExperiences);

/**
 * Get popular tags
 * GET /api/experiences/tags/popular
 */
router.get('/tags/popular', experiencesController.getPopularTags);

/**
 * Get statistics
 * GET /api/experiences/stats
 */
router.get('/stats', experiencesController.getExperienceStats);

/**
 * Get experiences for a specific procedure
 * GET /api/experiences/procedure/:procedureId
 */
router.get(
  '/procedure/:procedureId',
  experiencesController.getExperiencesByProcedure
);

/**
 * Get single experience
 * GET /api/experiences/:id
 */
router.get('/:id', experiencesController.getExperience);

/**
 * Upvote experience
 * PATCH /api/experiences/:id/upvote
 */
router.patch(
  '/:id/upvote',
  authMiddleware,
  experiencesController.upvoteExperience
);

/**
 * Bookmark experience
 * PATCH /api/experiences/:id/bookmark
 */
router.patch(
  '/:id/bookmark',
  authMiddleware,
  experiencesController.bookmarkExperience
);

/**
 * Delete experience
 * DELETE /api/experiences/:id
 */
router.delete(
  '/:id',
  authMiddleware,
  experiencesController.deleteExperience
);

export default router;
