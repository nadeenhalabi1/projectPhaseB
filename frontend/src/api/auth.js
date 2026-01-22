import api, { setAccessToken, clearAccessToken, getAccessToken } from './index.js';

/**
 * Authentication API calls
 * All functions return promises that resolve to the response data
 */
const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - { email, password, name, role }
   * @returns {Promise<Object>} { user, accessToken }
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);

    // Store access token in memory (refresh token is in httpOnly cookie)
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} { user, accessToken }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);

    // Store access token in memory (refresh token is in httpOnly cookie)
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Refresh access token using httpOnly refresh token cookie
   * @returns {Promise<Object>} { user, accessToken }
   */
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');

    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Get current user
   * @returns {Promise<Object>} { user }
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} { user }
   */
  updateProfile: async (updates) => {
    const response = await api.put('/auth/profile', updates);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Logout user
   * Clears access token from memory and refresh token cookie from server
   */
  logout: async () => {
    try {
      // Call backend to clear httpOnly cookie
      await api.post('/auth/logout');
    } catch (error) {
      // Even if backend call fails, still logout locally
      console.error('Logout error:', error);
    } finally {
      // Clear access token from memory
      clearAccessToken();
      // Clear user from localStorage
      localStorage.removeItem('user');
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!getAccessToken() || !!localStorage.getItem('user');
  },

  /**
   * Get stored user from localStorage
   * @returns {Object|null}
   */
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Initialize auth state
   * Should be called on app load to restore session
   * @returns {Promise<Object|null>} User object or null
   */
  initializeAuth: async () => {
    const storedUser = authAPI.getStoredUser();
    const accessToken = getAccessToken();

    if (!storedUser) {
      return null;
    }

    // If we have both user and access token, try to verify it first
    if (accessToken) {
      try {
        // Try to get current user with existing token
        const response = await authAPI.getCurrentUser();
        return response.user;
      } catch (error) {
        // Token is invalid/expired, try to refresh
        try {
          const response = await authAPI.refreshToken();
          return response.user;
        } catch (refreshError) {
          // Refresh also failed - clear everything
          clearAccessToken();
          localStorage.removeItem('user');
          return null;
        }
      }
    } else {
      // No access token but have user - try to refresh
      try {
        const response = await authAPI.refreshToken();
        return response.user;
      } catch (error) {
        // Refresh failed - clear everything
        clearAccessToken();
        localStorage.removeItem('user');
        return null;
      }
    }
  },
};

export default authAPI;
