import Experience from '../models/Experience.model.js';
import experienceSearchService from '../services/experiences.service.js';
import crypto from 'crypto';

/**
 * Create new experience
 */
export async function createExperience(req, res, next) {
  try {
    const {
      procedureId,
      institution,
      city,
      state,
      content,
      tags = [],
      anonymous = false
    } = req.body;

    // Validation
    if (!procedureId || !content) {
      return res.status(400).json({
        error: 'procedureId and content are required'
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        error: 'Content exceeds maximum length of 5000 characters'
      });
    }

    // Create anonymous hash if specified
    const anonymousAuthorId = anonymous
      ? crypto
          .createHash('sha256')
          .update(`${req.user.id}-${procedureId}`)
          .digest('hex')
          .substring(0, 8)
      : undefined;

    const experience = new Experience({
      procedureId,
      institution: institution || '',
      city: city || '',
      state: state || '',
      content,
      tags: tags.filter(t => t.length > 0).slice(0, 10), // Max 10 tags
      anonymousAuthorId
    });

    await experience.save();

    res.status(201).json({
      message: 'Experience created successfully',
      data: experience
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Search experiences
 */
export async function searchExperiences(req, res, next) {
  try {
    const {
      q = '',
      procedureId = null,
      limit = 10,
      skip = 0,
      sortBy = 'relevance', // relevance, recent, popular
      searchType = 'query' // query, tags, location
    } = req.query;

    let result;

    if (searchType === 'tags') {
      const tags = q.split(',').map(t => t.trim()).filter(t => t);
      result = await experienceSearchService.searchByTags(tags, {
        procedureId,
        limit: Math.min(parseInt(limit), 50),
        skip: Math.min(parseInt(skip), 10000)
      });
    } else if (searchType === 'location') {
      const [city, state] = q.split(',').map(t => t.trim());
      if (!city || !state) {
        return res.status(400).json({
          error: 'Please provide city and state separated by comma'
        });
      }
      result = await experienceSearchService.getByLocation(city, state, {
        procedureId,
        limit: Math.min(parseInt(limit), 50),
        skip: Math.min(parseInt(skip), 10000)
      });
    } else {
      // Default: query search with TF-IDF
      result = await experienceSearchService.searchByQuery(q, {
        procedureId,
        limit: Math.min(parseInt(limit), 50),
        skip: Math.min(parseInt(skip), 10000),
        sortBy
      });
    }

    res.json({
      data: result.results,
      meta: {
        totalCount: result.totalCount,
        pageInfo: result.pageInfo,
        searchType
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get trending experiences
 */
export async function getTrendingExperiences(req, res, next) {
  try {
    const {
      timeframe = 30,
      limit = 10,
      procedureId = null
    } = req.query;

    const results = await experienceSearchService.getTrendingExperiences({
      timeframe: Math.min(parseInt(timeframe), 365),
      limit: Math.min(parseInt(limit), 50),
      procedureId
    });

    res.json({
      data: results,
      meta: { count: results.length }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get experience by ID
 */
export async function getExperience(req, res, next) {
  try {
    const experience = await Experience.findById(req.params.id).lean();

    if (!experience) {
      return res.status(404).json({
        error: 'Experience not found'
      });
    }

    // Get related experiences
    const related = await experienceSearchService.getRelatedExperiences(
      req.params.id,
      5
    );

    res.json({
      data: experience,
      related
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all experiences for a procedure
 */
export async function getExperiencesByProcedure(req, res, next) {
  try {
    const {
      procedureId
    } = req.params;
    const {
      limit = 20,
      skip = 0,
      sortBy = 'recent'
    } = req.query;

    const filter = { procedureId };

    let query = Experience.find(filter);
    if (sortBy === 'popular') {
      query = query.sort({ upvotes: -1, bookmarks: -1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const experiences = await query
      .limit(Math.min(parseInt(limit), 100))
      .skip(Math.min(parseInt(skip), 10000))
      .lean();

    const totalCount = await Experience.countDocuments(filter);

    res.json({
      data: experiences,
      meta: {
        totalCount,
        limit: Math.min(parseInt(limit), 100),
        skip: Math.min(parseInt(skip), 10000)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Upvote experience
 */
export async function upvoteExperience(req, res, next) {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({
        error: 'Experience not found'
      });
    }

    res.json({
      message: 'Upvote recorded',
      data: experience
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Bookmark experience
 */
export async function bookmarkExperience(req, res, next) {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { $inc: { bookmarks: 1 } },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({
        error: 'Experience not found'
      });
    }

    res.json({
      message: 'Bookmark recorded',
      data: experience
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete experience (owner only)
 */
export async function deleteExperience(req, res, next) {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        error: 'Experience not found'
      });
    }

    // Note: In a real app, verify ownership here
    // For Phase 2, we allow deletion for demo purposes
    await Experience.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get experience statistics
 */
export async function getExperienceStats(req, res, next) {
  try {
    const {
      procedureId = null
    } = req.query;

    const filter = procedureId ? { procedureId } : {};

    const stats = await Experience.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalExperiences: { $sum: 1 },
          totalUpvotes: { $sum: '$upvotes' },
          totalBookmarks: { $sum: '$bookmarks' },
          avgUpvotes: { $avg: '$upvotes' },
          avgBookmarks: { $avg: '$bookmarks' }
        }
      }
    ]);

    res.json({
      data: stats[0] || {
        totalExperiences: 0,
        totalUpvotes: 0,
        totalBookmarks: 0
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get popular tags
 */
export async function getPopularTags(req, res, next) {
  try {
    const {
      procedureId = null,
      limit = 20
    } = req.query;

    const filter = procedureId ? { procedureId } : {};

    const tags = await Experience.aggregate([
      { $match: filter },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: Math.min(parseInt(limit), 100) }
    ]);

    res.json({
      data: tags.map(t => ({ tag: t._id, count: t.count }))
    });
  } catch (error) {
    next(error);
  }
}
