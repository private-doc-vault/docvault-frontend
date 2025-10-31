import { createSlice } from '@reduxjs/toolkit';

/**
 * UI Slice - Manages UI state including toast notifications
 */

const initialState = {
  toasts: [],
};

let toastIdCounter = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Show a toast notification
     * @param {Object} action.payload - Toast configuration
     * @param {string} action.payload.message - Toast message
     * @param {string} action.payload.variant - Toast variant (success, error, warning, info)
     * @param {string} action.payload.title - Optional toast title
     * @param {number} action.payload.delay - Auto-hide delay (default: 5000)
     * @param {boolean} action.payload.autohide - Auto-hide toast (default: true)
     */
    showToast: (state, action) => {
      const {
        message,
        variant = 'info',
        title,
        delay = 5000,
        autohide = true,
      } = action.payload;

      const toast = {
        id: `toast-${++toastIdCounter}-${Date.now()}`,
        message,
        variant,
        title,
        delay,
        autohide,
        show: true,
      };

      state.toasts.push(toast);
    },

    /**
     * Hide a specific toast
     * @param {Object} action.payload - Toast ID to hide
     */
    hideToast: (state, action) => {
      const toastId = action.payload;
      state.toasts = state.toasts.filter((toast) => toast.id !== toastId);
    },

    /**
     * Clear all toasts
     */
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { showToast, hideToast, clearAllToasts } = uiSlice.actions;

// Selectors
export const selectToasts = (state) => state.ui.toasts;

export default uiSlice.reducer;
