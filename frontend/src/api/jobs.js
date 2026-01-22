import api from './index.js';

/**
 * Jobs API calls
 * All functions return promises that resolve to the response data
 */
const jobsAPI = {
  /**
   * Get all jobs
   * @param {Object} filters - Optional filters { status }
   * @returns {Promise<Object>} { jobs }
   */
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/jobs${params ? `?${params}` : ''}`);
    return response.data;
  },

  /**
   * Create a new job
   * @param {Object} jobData - Job data including criteria
   * @returns {Promise<Object>} { job }
   */
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} { job }
   */
  getJobById: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Update job
   * @param {string} jobId - Job ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} { job }
   */
  updateJob: async (jobId, updates) => {
    const response = await api.put(`/jobs/${jobId}`, updates);
    return response.data;
  },

  /**
   * Delete job
   * @param {string} jobId - Job ID
   * @returns {Promise<void>}
   */
  deleteJob: async (jobId) => {
    await api.delete(`/jobs/${jobId}`);
  },
};

export default jobsAPI;
