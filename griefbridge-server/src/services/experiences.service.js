import Experience from '../models/Experience.model.js';

/**
 * TF-IDF Based Experience Search Service
 * Performs semantic search on community experiences
 */

class ExperienceSearchService {
  constructor() {}

  async searchByQuery(query, options = {}) {
    const {
      procedureId = null,
      limit = 10,
      skip = 0,
      sortBy = 'relevance' // relevance, recent, popular
    } = options;

    try {
      // Get all experiences matching procedure filter
      const filter = procedureId ? { procedureId } : {};
      const allExperiences = await Experience.find(filter)
        .select('procedureId content tags city state upvotes bookmarks createdAt')
        .lean();

      if (allExperiences.length === 0) {
        return { results: [], totalCount: 0 };
      }

      // Calculate TF-IDF scores for query vs each experience
      const documents = allExperiences.map(exp => exp.content);
      const scores = this.calculateTfIdfScores(query, documents);

      // Combine experiences with scores
      const scoredResults = allExperiences.map((exp, idx) => ({
        ...exp,
        relevanceScore: scores[idx] || 0
      }));

      // Filter out zero-score results
      let filteredResults = scoredResults.filter(r => r.relevanceScore > 0);

      // Sort based on sortBy parameter
      if (sortBy === 'relevance') {
        filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      } else if (sortBy === 'recent') {
        filteredResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'popular') {
        filteredResults.sort((a, b) => (b.upvotes + b.bookmarks) - (a.upvotes + a.bookmarks));
      }

      // Paginate
      const paginatedResults = filteredResults.slice(skip, skip + limit);

      return {
        results: paginatedResults,
        totalCount: filteredResults.length,
        pageInfo: {
          limit,
          skip,
          hasMore: skip + limit < filteredResults.length
        }
      };
    } catch (error) {
      console.error('Error searching experiences:', error);
      throw error;
    }
  }

  async searchByTags(tags, options = {}) {
    const {
      procedureId = null,
      limit = 10,
      skip = 0
    } = options;

    try {
      const filter = {};
      if (procedureId) filter.procedureId = procedureId;
      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      const results = await Experience.find(filter)
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const totalCount = await Experience.countDocuments(filter);

      return {
        results,
        totalCount,
        pageInfo: {
          limit,
          skip,
          hasMore: skip + limit < totalCount
        }
      };
    } catch (error) {
      console.error('Error searching by tags:', error);
      throw error;
    }
  }

  /**
   * Get trending/popular experiences
   */
  async getTrendingExperiences(options = {}) {
    const {
      timeframe = 30, // days
      limit = 10,
      procedureId = null
    } = options;

    try {
      const filter = {};
      if (procedureId) filter.procedureId = procedureId;

      // Calculate date from timeframe
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframe);
      filter.createdAt = { $gte: cutoffDate };

      const results = await Experience.find(filter)
        .sort({ upvotes: -1, bookmarks: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      return results;
    } catch (error) {
      console.error('Error getting trending experiences:', error);
      throw error;
    }
  }

  /**
   * Get experiences by location
   */
  async getByLocation(city, state, options = {}) {
    const {
      procedureId = null,
      limit = 10,
      skip = 0
    } = options;

    try {
      const filter = { city, state };
      if (procedureId) filter.procedureId = procedureId;

      const results = await Experience.find(filter)
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const totalCount = await Experience.countDocuments(filter);

      return {
        results,
        totalCount,
        pageInfo: { limit, skip, hasMore: skip + limit < totalCount }
      };
    } catch (error) {
      console.error('Error getting experiences by location:', error);
      throw error;
    }
  }

  /**
   * Calculate TF-IDF scores for query against documents
   * Returns array of scores parallel to documents
   */
  calculateTfIdfScores(query, documents) {
    try {
      // Tokenize query
      const queryTokens = this.tokenize(query);
      if (queryTokens.length === 0) return documents.map(() => 0);

      // Calculate score for each document
      return documents.map(doc => {
        const docTokens = this.tokenize(doc);
        return this.calculateCosineSimilarity(queryTokens, docTokens, documents);
      });
    } catch (error) {
      console.error('Error calculating TF-IDF scores:', error);
      return documents.map(() => 0);
    }
  }

  /**
   * Simple tokenization and preprocessing
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .match(/\b\w+\b/g) || [];
  }

  /**
   * Calculate cosine similarity between query tokens and document tokens
   * Simplified TF-IDF implementation
   */
  calculateCosineSimilarity(queryTokens, docTokens, allDocuments) {
    if (docTokens.length === 0) return 0;

    // Create TF vectors
    const queryTf = this.calculateTermFrequency(queryTokens);
    const docTf = this.calculateTermFrequency(docTokens);

    // Calculate IDF for each term in query
    const idf = {};
    for (const term of Object.keys(queryTf)) {
      const docsWithTerm = allDocuments.filter(doc => {
        const tokens = this.tokenize(doc);
        return tokens.includes(term);
      }).length;
      idf[term] = Math.log(allDocuments.length / (1 + docsWithTerm));
    }

    // Calculate dot product
    let dotProduct = 0;
    let queryMagnitude = 0;
    let docMagnitude = 0;

    for (const term of Object.keys(queryTf)) {
      const queryScore = queryTf[term] * (idf[term] || 0);
      const docScore = (docTf[term] || 0) * (idf[term] || 0);
      
      dotProduct += queryScore * docScore;
      queryMagnitude += queryScore * queryScore;
      docMagnitude += docScore * docScore;
    }

    // Calculate cosine similarity
    if (queryMagnitude === 0 || docMagnitude === 0) return 0;
    return dotProduct / (Math.sqrt(queryMagnitude) * Math.sqrt(docMagnitude));
  }

  /**
   * Calculate term frequency
   */
  calculateTermFrequency(tokens) {
    const tf = {};
    for (const token of tokens) {
      tf[token] = (tf[token] || 0) + 1;
    }
    return tf;
  }

  /**
   * Get related experiences based on content similarity
   */
  async getRelatedExperiences(experienceId, limit = 5) {
    try {
      const experience = await Experience.findById(experienceId).lean();
      if (!experience) return [];

      // Get experiences with same procedure
      const similarContent = await Experience.find({
        procedureId: experience.procedureId,
        _id: { $ne: experienceId }
      })
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(limit * 5)
        .lean();

      // Score by content similarity
      const queryTokens = this.tokenize(experience.content);
      const scored = similarContent.map(exp => ({
        ...exp,
        similarityScore: this.calculateCosineSimilarity(
          queryTokens,
          this.tokenize(exp.content),
          similarContent.map(e => e.content)
        )
      }));

      // Sort by similarity and return top results
      return scored
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting related experiences:', error);
      return [];
    }
  }
}

export default new ExperienceSearchService();
