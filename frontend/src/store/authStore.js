import { create } from 'zustand';
import authAPI from '../api/auth';

/**
 * Flag to prevent multiple simultaneous initialization calls
 * Protects against double-initialization in StrictMode or rapid calls
 */
let isInitializingAuth = false;

/**
 * Zustand store for authentication state
 * Manages user login, registration, logout, and auth initialization
 */
export const useAuthStore = create((set, get) => ({
  /**
   * Current authenticated user or null
   */
  user: null,

  /**
   * Whether user is authenticated
   */
  isAuthenticated: false,

  /**
   * Whether auth is being initialized (checking for existing session)
   */
  isInitializing: true,

  /**
   * Initialize auth on app load
   * Tries to restore session from stored user + refresh token
   */
  initialize: async () => {
    // Guard against double-initialization
    if (isInitializingAuth) {
      return;
    }

    isInitializingAuth = true;

    try {
      set({ isInitializing: true });

      const user = await authAPI.initializeAuth();

      if (user) {
        set({
          user,
          isAuthenticated: true,
          isInitializing: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    } finally {
      isInitializingAuth = false;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} User object
   */
  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials);

      set({
        user: response.user,
        isAuthenticated: true,
      });

      return response.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - { email, password, name, role }
   * @returns {Promise<Object>} User object
   */
  register: async (userData) => {
    try {
      const response = await authAPI.register(userData);

      set({
        user: response.user,
        isAuthenticated: true,
      });

      return response.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   * Clears all auth state and tokens
   */
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  /**
   * Update user profile
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user object
   */
  updateProfile: async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);

      set({
        user: response.user,
      });

      return response.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if user has specific role
   * @param {string|string[]} roles - Role(s) to check
   * @returns {boolean}
   */
  hasRole: (roles) => {
    const { user } = get();
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  },

  /**
   * Check if user can manage jobs (all authenticated users are recruiters)
   * @returns {boolean}
   */
  canManageJobs: () => {
    const { user } = get();
    return !!user; // All authenticated users can manage jobs
  },
}));
