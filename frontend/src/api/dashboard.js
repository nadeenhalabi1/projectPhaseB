import api from './index.js';

/**
 * Dashboard API
 * Handles dashboard data fetching
 */
const dashboardAPI = {
  /**
   * Get dashboard data
   * @returns {Promise<Object>} Dashboard data with stats and recent jobs
   */
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export default dashboardAPI;
