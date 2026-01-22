import axios from 'axios';

/**
 * localStorage key for access token
 */
const TOKEN_KEY = 'access_token';

/**
 * Set access token in localStorage
 * Persists across page refreshes
 * @param {string} token - Access token
 */
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Get access token from localStorage
 * @returns {string|null} Access token
 */
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Clear access token from localStorage
 */
export const clearAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Axios instance with default configuration
 * This is a singleton pattern - single instance used throughout the app
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send cookies with requests
});

/**
 * Request interceptor
 * Automatically adds JWT access token to requests if available
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Flag to prevent multiple simultaneous refresh requests
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Response interceptor
 * Handles automatic token refresh and common error scenarios
 */
api.interceptors.response.use(
  (response) => {
    // Return just the data from successful responses
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // If 401 and not already retrying, try to refresh token
      if (status === 401 && !originalRequest._retry) {
        // Don't try to refresh token for login/register requests
        // Just propagate the original error (e.g., "Invalid credentials")
        const isAuthRequest = originalRequest.url?.includes('/auth/login') ||
                              originalRequest.url?.includes('/auth/register');

        if (isAuthRequest) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Try to refresh the token
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
            {},
            { withCredentials: true } // Send httpOnly cookie
          );

          const newAccessToken = response.data.data.accessToken;

          // Store new token in memory
          setAccessToken(newAccessToken);

          // Update user in localStorage
          if (response.data.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
          }

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          processQueue(refreshError, null);
          clearAccessToken();
          localStorage.removeItem('user');

          // Don't redirect if the original request was login/register
          // Let the error propagate to show toast on the auth page
          const isAuthRequest = originalRequest.url?.includes('/auth/login') ||
                                originalRequest.url?.includes('/auth/register');

          if (!isAuthRequest) {
            // Only redirect for protected endpoints
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Return error message from server or generic message
      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        errors: data.errors,
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default api;
