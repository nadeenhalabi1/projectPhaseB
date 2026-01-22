import { Job, Candidate } from '../models/index.js';
import { CANDIDATE_STATUS } from '../config/constants.js';
import knnService from './knn.service.js';
import openaiService from './openai.service.js';
import { calculateCriteriaHash } from './resumes.service.js';

class CandidatesService {
  /**
   * Get ranked candidates for a job
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @param {Object} filters - Optional filters (status)
   * @returns {Promise<Array>} Ranked candidates
   */
  async getRankedCandidates(jobId, userId, filters = {}) {
    // Verify job exists and belongs to user
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    const query = { jobId };

    if (filters.status) {
      query.status = filters.status;
    }

    const candidates = await Candidate.find(query).lean();

    // If no candidates at all, return empty array
    if (!candidates || candidates.length === 0) {
      console.log(`No candidates found for job ${jobId}`);
      return [];
    }

    // If no processed candidates, return empty array
    const processedCandidates = candidates.filter(
      c => c.extractedData && c.extractedData.criteriaScores
    );

    console.log(`Found ${processedCandidates.length} processed candidates for ranking out of ${candidates.length} total`);

    if (processedCandidates.length === 0) {
      console.warn(`No candidates with valid extractedData for job ${jobId}`);
      return candidates; // Return as-is without ranking
    }

    if (processedCandidates.length < candidates.length) {
      console.warn(`Skipped ${candidates.length - processedCandidates.length} candidates without criteriaScores`);
    }

    // Rank candidates using KNN
    const rankings = knnService.rankCandidates(processedCandidates, job.criteria);

    // Update candidates in database with scores
    await Promise.all(
      rankings.map(async (ranking) => {
        await Candidate.findByIdAndUpdate(ranking.candidateId, {
          overallScore: ranking.overallScore,
          rank: ranking.rank,
          scores: ranking.scores,
        });
      })
    );

    // Fetch and return updated candidates
    const updatedCandidates = await Candidate.find(query)
      .sort({ rank: 1 }) // Sort by rank ascending (1 = best)
      .lean();

    return updatedCandidates;
  }

  /**
   * Re-rank all candidates for a job
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<Array>} Re-ranked candidates
   */
  async rerankCandidates(jobId, userId) {
    return this.getRankedCandidates(jobId, userId);
  }

  /**
   * Smart rerank - detects criteria changes and re-evaluates if needed
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<Array>} Re-ranked candidates
   */
  async smartRerankCandidates(jobId, userId) {
    // Verify job exists and belongs to user
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    // Calculate current criteria hash
    const currentCriteriaHash = calculateCriteriaHash(job.criteria);

    // Find candidates with stale criteria (hash mismatch or no hash)
    const staleCandidates = await Candidate.find({
      jobId: job._id,
      status: CANDIDATE_STATUS.PROCESSED,
      $or: [
        { criteriaHash: { $ne: currentCriteriaHash } },  // Hash mismatch = stale
        { criteriaHash: { $exists: false } }              // No hash = old candidate
      ]
    });

    console.log(`[SMART RERANK] Found ${staleCandidates.length} candidates with stale criteria`);

    // Re-evaluate stale candidates with OpenAI
    if (staleCandidates.length > 0) {
      for (const candidate of staleCandidates) {
        try {
          console.log(`[SMART RERANK] Re-evaluating candidate ${candidate._id}...`);

          // Re-extract with new criteria
          const extractedData = await openaiService.extractResumeData(
            candidate.resumeText,
            job.criteria
          );

          // Update candidate with new data
          candidate.extractedData = extractedData;
          candidate.criteriaHash = currentCriteriaHash;
          await candidate.save();

          console.log(`[SMART RERANK] ✓ Re-evaluated candidate ${candidate._id}`);
        } catch (error) {
          console.error(`[SMART RERANK] ✗ Failed to re-evaluate candidate ${candidate._id}:`, error.message);
          // Continue with other candidates even if one fails
        }
      }
    } else {
      console.log(`[SMART RERANK] No re-evaluation needed - all candidates up to date`);
    }

    // Now run normal ranking (recalculates for all candidates)
    return this.getRankedCandidates(jobId, userId);
  }

  /**
   * Get candidate by ID
   * @param {string} candidateId - Candidate ID
   * @param {Object} user - User object (for ownership verification)
   * @returns {Promise<Object>} Candidate with job details
   */
  async getCandidateById(candidateId, user) {
    const candidate = await Candidate.findById(candidateId).populate('jobId');

    if (!candidate) {
      const error = new Error('Candidate not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify job belongs to user (admins can access all candidates)
    if (user.role !== 'ADMIN' && candidate.jobId.userId.toString() !== user._id.toString()) {
      const error = new Error('Access forbidden');
      error.statusCode = 403;
      throw error;
    }

    return candidate;
  }

  /**
   * Update candidate status
   * @param {string} candidateId - Candidate ID
   * @param {Object} user - User object (for ownership verification)
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated candidate
   */
  async updateCandidateStatus(candidateId, user, status) {
    const candidate = await Candidate.findById(candidateId).populate('jobId');

    if (!candidate) {
      const error = new Error('Candidate not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify job belongs to user (admins can update any candidate)
    if (user.role !== 'ADMIN' && candidate.jobId.userId.toString() !== user._id.toString()) {
      const error = new Error('Access forbidden');
      error.statusCode = 403;
      throw error;
    }

    candidate.status = status;
    await candidate.save();

    return candidate;
  }

  /**
   * Get candidate statistics for a job
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<Object>} Statistics
   */
  async getCandidateStats(jobId, userId) {
    // Verify job exists and belongs to user
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    const candidates = await Candidate.find({ jobId });

    const stats = {
      total: candidates.length,
      byStatus: {},
      averageScore: 0,
      topScore: 0,
    };

    // Count by status
    candidates.forEach(c => {
      stats.byStatus[c.status] = (stats.byStatus[c.status] || 0) + 1;
    });

    // Calculate score stats
    const scoredCandidates = candidates.filter(c => c.overallScore != null);
    if (scoredCandidates.length > 0) {
      const totalScore = scoredCandidates.reduce((sum, c) => sum + c.overallScore, 0);
      stats.averageScore = Math.round((totalScore / scoredCandidates.length) * 100) / 100;
      stats.topScore = Math.max(...scoredCandidates.map(c => c.overallScore));
    }

    return stats;
  }

  /**
   * Delete a candidate
   * @param {string} candidateId - Candidate ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<boolean>} Success
   */
  async deleteCandidate(candidateId, userId) {
    // Get candidate and verify job ownership
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      const error = new Error('Candidate not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify user owns the job
    const job = await Job.findOne({ _id: candidate.jobId, userId });
    if (!job) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    await Candidate.findByIdAndDelete(candidateId);

    return true;
  }

  /**
   * Update candidate data
   * @param {string} candidateId - Candidate ID
   * @param {string} userId - User ID (for ownership verification)
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated candidate
   */
  async updateCandidateData(candidateId, userId, updates) {
    // Get candidate and verify job ownership
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      const error = new Error('Candidate not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify user owns the job
    const job = await Job.findOne({ _id: candidate.jobId, userId });
    if (!job) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    // Allowed fields to update
    const allowedUpdates = ['name', 'email', 'phone', 'extractedData'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    // Re-rank candidates after update (runs in background, don't wait)
    this.getRankedCandidates(job._id, userId).catch(err => {
      console.error('Error re-ranking candidates:', err);
    });

    return updatedCandidate;
  }

  /**
   * Clean up ghost candidates stuck in PROCESSING state
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async cleanupProcessingCandidates(jobId, userId) {
    // Verify job belongs to user
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete all candidates in PROCESSING state for this job
    const result = await Candidate.deleteMany({
      jobId,
      status: CANDIDATE_STATUS.PROCESSING,
    });

    return result;
  }

  /**
   * Delete multiple candidates at once
   * @param {Array<string>} candidateIds - Array of candidate IDs to delete
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Deletion result with count
   */
  async bulkDeleteCandidates(candidateIds, userId) {
    if (!candidateIds || candidateIds.length === 0) {
      const error = new Error('No candidate IDs provided');
      error.statusCode = 400;
      throw error;
    }

    // Find all candidates and verify they belong to jobs owned by this user
    const candidates = await Candidate.find({
      _id: { $in: candidateIds },
    }).populate('jobId');

    if (candidates.length === 0) {
      const error = new Error('No candidates found');
      error.statusCode = 404;
      throw error;
    }

    // Verify all candidates belong to jobs owned by this user
    const unauthorizedCandidates = candidates.filter(
      (candidate) => candidate.jobId.userId.toString() !== userId.toString()
    );

    if (unauthorizedCandidates.length > 0) {
      const error = new Error('You do not have permission to delete some of these candidates');
      error.statusCode = 403;
      throw error;
    }

    // Delete all candidates
    const result = await Candidate.deleteMany({
      _id: { $in: candidateIds },
    });

    return {
      deletedCount: result.deletedCount,
      requestedCount: candidateIds.length,
    };
  }
}

export default new CandidatesService();
