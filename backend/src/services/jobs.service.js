import { Job, Candidate } from '../models/index.js';

class JobsService {
  /**
   * Create a new job with criteria
   * @param {string} userId - User ID creating the job
   * @param {Object} jobData - Job data including criteria
   * @returns {Promise<Object>} Created job
   */
  async createJob(userId, jobData) {
    const job = await Job.create({
      ...jobData,
      userId,
    });

    // Add candidate count (will be 0 for new job)
    const candidateCount = await Candidate.countDocuments({ jobId: job._id });

    return {
      ...job.toObject(),
      candidateCount,
    };
  }

  /**
   * Get all jobs for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (status)
   * @returns {Promise<Array>} List of jobs
   */
  async getUserJobs(userId, filters = {}) {
    const query = { userId };

    if (filters.status) {
      query.status = filters.status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Add candidate count to each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const candidateCount = await Candidate.countDocuments({ jobId: job._id });
        return {
          ...job,
          candidateCount,
        };
      })
    );

    return jobsWithCounts;
  }

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<Object>} Job object
   */
  async getJobById(jobId, userId) {
    const job = await Job.findOne({ _id: jobId, userId });

    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    // Get candidate count
    const candidateCount = await Candidate.countDocuments({ jobId });

    return {
      ...job.toJSON(),
      candidateCount,
    };
  }

  /**
   * Update job
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated job
   */
  async updateJob(jobId, userId, updates) {
    const job = await Job.findOneAndUpdate(
      { _id: jobId, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    // Add candidate count
    const candidateCount = await Candidate.countDocuments({ jobId: job._id });

    return {
      ...job.toObject(),
      candidateCount,
    };
  }

  /**
   * Delete job and all associated candidates
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<void>}
   */
  async deleteJob(jobId, userId) {
    const job = await Job.findOne({ _id: jobId, userId });

    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete all candidates for this job
    await Candidate.deleteMany({ jobId });

    // Delete job
    await Job.deleteOne({ _id: jobId });
  }

  /**
   * Update job status
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated job
   */
  async updateJobStatus(jobId, userId, status) {
    return this.updateJob(jobId, userId, { status });
  }

  /**
   * Validate criteria weights sum to 100
   * @param {Array} criteria - Array of criteria objects
   * @returns {boolean} True if valid
   * @throws {Error} If invalid
   */
  validateCriteriaWeights(criteria) {
    if (!criteria || criteria.length === 0) {
      const error = new Error('At least one criterion is required');
      error.statusCode = 400;
      throw error;
    }

    const total = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

    if (Math.abs(total - 100) > 0.01) {
      const error = new Error(`Criteria weights must sum to 100. Current total: ${total}`);
      error.statusCode = 400;
      throw error;
    }

    return true;
  }
}

export default new JobsService();
