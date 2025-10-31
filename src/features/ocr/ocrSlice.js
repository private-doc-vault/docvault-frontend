import { createSlice } from '@reduxjs/toolkit';

/**
 * OCR Slice
 *
 * Manages OCR processing state for documents including:
 * - OCR status tracking (pending, processing, completed, failed)
 * - Processing progress (0-100%)
 * - Extracted OCR text
 * - Error messages
 * - Documents currently being polled
 */

const initialState = {
  // Map of document IDs to their OCR status
  // Format: { [documentId]: { status, progress, text, error, lastUpdated } }
  ocrData: {},

  // List of document IDs currently being polled for status updates
  pollingDocuments: [],

  // Global loading state for OCR operations
  loading: false,

  // Global error state
  error: null,
};

const ocrSlice = createSlice({
  name: 'ocr',
  initialState,
  reducers: {
    /**
     * Set OCR status for a specific document
     * @param {Object} payload - { documentId, status, progress?, text?, error?, lastUpdated? }
     */
    setOcrStatus: (state, action) => {
      const { documentId, status, progress, text, error, lastUpdated } = action.payload;

      if (!state.ocrData[documentId]) {
        state.ocrData[documentId] = {};
      }

      state.ocrData[documentId].status = status;

      if (progress !== undefined) {
        state.ocrData[documentId].progress = progress;
      }

      if (text !== undefined) {
        state.ocrData[documentId].text = text;
      }

      if (error !== undefined) {
        state.ocrData[documentId].error = error;
      }

      state.ocrData[documentId].lastUpdated = lastUpdated || new Date().toISOString();
    },

    /**
     * Update processing progress for a document
     * @param {Object} payload - { documentId, progress }
     */
    updateProgress: (state, action) => {
      const { documentId, progress } = action.payload;

      if (!state.ocrData[documentId]) {
        state.ocrData[documentId] = {};
      }

      state.ocrData[documentId].progress = progress;
      state.ocrData[documentId].lastUpdated = new Date().toISOString();
    },

    /**
     * Set extracted OCR text for a document
     * @param {Object} payload - { documentId, text }
     */
    setOcrText: (state, action) => {
      const { documentId, text } = action.payload;

      if (!state.ocrData[documentId]) {
        state.ocrData[documentId] = {};
      }

      state.ocrData[documentId].text = text;
      state.ocrData[documentId].lastUpdated = new Date().toISOString();
    },

    /**
     * Set error for a document's OCR processing
     * @param {Object} payload - { documentId, error }
     */
    setOcrError: (state, action) => {
      const { documentId, error } = action.payload;

      if (!state.ocrData[documentId]) {
        state.ocrData[documentId] = {};
      }

      state.ocrData[documentId].error = error;
      state.ocrData[documentId].status = 'failed';
      state.ocrData[documentId].lastUpdated = new Date().toISOString();
    },

    /**
     * Add a document to the polling list
     * @param {Object} payload - { documentId }
     */
    startPolling: (state, action) => {
      const { documentId } = action.payload;

      if (!state.pollingDocuments.includes(documentId)) {
        state.pollingDocuments.push(documentId);
      }
    },

    /**
     * Remove a document from the polling list
     * @param {Object} payload - { documentId }
     */
    stopPolling: (state, action) => {
      const { documentId } = action.payload;

      state.pollingDocuments = state.pollingDocuments.filter(
        (id) => id !== documentId
      );
    },

    /**
     * Clear all polling documents (e.g., on component unmount)
     */
    clearPolling: (state) => {
      state.pollingDocuments = [];
    },

    /**
     * Remove OCR data for a specific document
     * @param {Object} payload - { documentId }
     */
    clearOcrData: (state, action) => {
      const { documentId } = action.payload;
      delete state.ocrData[documentId];
    },

    /**
     * Set global loading state
     * @param {boolean} payload - loading state
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /**
     * Set global error state
     * @param {string|null} payload - error message
     */
    setError: (state, action) => {
      state.error = action.payload;
    },

    /**
     * Clear global error state
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Reset OCR state to initial state
     */
    resetOcrState: () => initialState,
  },
});

// Actions
export const {
  setOcrStatus,
  updateProgress,
  setOcrText,
  setOcrError,
  startPolling,
  stopPolling,
  clearPolling,
  clearOcrData,
  setLoading,
  setError,
  clearError,
  resetOcrState,
} = ocrSlice.actions;

// Selectors
export const selectOcrData = (state) => state.ocr.ocrData;
export const selectOcrDataForDocument = (documentId) => (state) =>
  state.ocr.ocrData[documentId] || null;
export const selectOcrStatus = (documentId) => (state) =>
  state.ocr.ocrData[documentId]?.status || null;
export const selectOcrProgress = (documentId) => (state) =>
  state.ocr.ocrData[documentId]?.progress || 0;
export const selectOcrText = (documentId) => (state) =>
  state.ocr.ocrData[documentId]?.text || null;
export const selectOcrError = (documentId) => (state) =>
  state.ocr.ocrData[documentId]?.error || null;
export const selectPollingDocuments = (state) => state.ocr.pollingDocuments;
export const selectIsPolling = (documentId) => (state) =>
  state.ocr.pollingDocuments.includes(documentId);
export const selectOcrLoading = (state) => state.ocr.loading;
export const selectOcrGlobalError = (state) => state.ocr.error;

// Reducer
export default ocrSlice.reducer;
