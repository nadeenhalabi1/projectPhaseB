import api from './index.js';

/**
 * Resumes API calls
 * All functions return promises that resolve to the response data
 */
const resumesAPI = {
  /**
   * Upload resume(s) to a job
   * @param {string} jobId - Job ID
   * @param {FileList|Array} files - Files to upload
   * @param {Function} onProgress - Optional progress callback
   * @returns {Promise<Object>} { success, errors, successCount, errorCount }
   */
  uploadResumes: async (jobId, files, onProgress) => {
    const formData = new FormData();

    // Add files to FormData
    Array.from(files).forEach((file) => {
      formData.append('resumes', file);
    });

    const response = await api.post(
      `/jobs/${jobId}/resumes/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Get all resumes for a job
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} { resumes }
   */
  getJobResumes: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/resumes`);
    return response.data;
  },

  /**
   * Delete a resume
   * @param {string} resumeId - Resume/Candidate ID
   * @returns {Promise<void>}
   */
  deleteResume: async (resumeId) => {
    await api.delete(`/resumes/${resumeId}`);
  },
};

export default resumesAPI;
