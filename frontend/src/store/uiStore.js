import { create } from 'zustand';

/**
 * Zustand store for UI state
 * Manages toasts, sidebar, and other UI elements
 */
export const useUIStore = create((set, get) => ({
  /**
   * Toast notifications array
   * Each toast: { id, type, message, duration }
   */
  toasts: [],

  /**
   * Add a toast notification
   * @param {Object} toast - { type: 'success'|'error'|'info'|'warning', message, duration? }
   * @returns {string} Toast ID
   */
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = {
      id,
      type: toast.type || 'info',
      message: toast.message,
      duration: toast.duration || 5000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  /**
   * Remove a toast by ID
   * @param {string} id - Toast ID
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  /**
   * Clear all toasts
   */
  clearToasts: () => {
    set({ toasts: [] });
  },

  /**
   * Convenience methods for different toast types
   */
  success: (message, duration) => {
    return get().addToast({ type: 'success', message, duration });
  },

  error: (message, duration) => {
    return get().addToast({ type: 'error', message, duration });
  },

  info: (message, duration) => {
    return get().addToast({ type: 'info', message, duration });
  },

  warning: (message, duration) => {
    return get().addToast({ type: 'warning', message, duration });
  },

  /**
   * Sidebar state (for mobile responsiveness)
   * Start closed on mobile, will be visible on desktop via CSS
   */
  sidebarOpen: false,

  /**
   * Toggle sidebar open/closed
   */
  toggleSidebar: () => {
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    }));
  },

  /**
   * Set sidebar state
   * @param {boolean} open
   */
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },
}));
