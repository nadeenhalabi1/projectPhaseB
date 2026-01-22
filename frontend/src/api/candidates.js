import api from './index.js';

/**
 * Candidates API calls
 * All functions return promises that resolve to the response data
 */
const candidatesAPI = {
  /**
   * Get ranked candidates for a job
   * @param {string} jobId - Job ID
   * @param {Object} filters - Optional filters { status }
   * @returns {Promise<Object>} { candidates }
   */
  getRankedCandidates: async (jobId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(
      `/jobs/${jobId}/candidates${params ? `?${params}` : ''}`
    );
    return response.data;
  },

  /**
   * Re-rank all candidates for a job
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} { candidates }
   */
  rerankCandidates: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/candidates/rerank`);
    return response.data;
  },

  /**
   * Smart re-rank - detects criteria changes and re-evaluates if needed
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} { candidates }
   */
  smartRerankCandidates: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/candidates/smart-rerank`);
    return response.data;
  },

  /**
   * Get candidate statistics for a job
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} { stats }
   */
  getCandidateStats: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/candidates/stats`);
    return response.data;
  },

  /**
   * Get candidate by ID
   * @param {string} candidateId - Candidate ID
   * @returns {Promise<Object>} { candidate }
   */
  getCandidateById: async (candidateId) => {
    const response = await api.get(`/candidates/${candidateId}`);
    return response.data;
  },

  /**
   * Update candidate status
   * @param {string} candidateId - Candidate ID
   * @param {string} status - New status
   * @returns {Promise<Object>} { candidate }
   */
  updateCandidateStatus: async (candidateId, status) => {
    const response = await api.patch(`/candidates/${candidateId}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Delete a candidate
   * @param {string} candidateId - Candidate ID
   * @returns {Promise<Object>} Response data
   */
  deleteCandidate: async (candidateId) => {
    const response = await api.delete(`/candidates/${candidateId}`);
    return response.data;
  },

  /**
   * Update candidate data
   * @param {string} candidateId - Candidate ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Response data
   */
  updateCandidateData: async (candidateId, updates) => {
    const response = await api.patch(`/candidates/${candidateId}`, updates);
    return response.data;
  },

  /**
   * Delete multiple candidates at once
   * @param {Array<string>} candidateIds - Array of candidate IDs
   * @returns {Promise<Object>} Response data with deletion count
   */
  bulkDeleteCandidates: async (candidateIds) => {
    const response = await api.post('/candidates/bulk-delete', { candidateIds });
    return response.data;
  },
};

export default candidatesAPI;
