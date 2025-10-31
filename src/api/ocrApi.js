import apiClient from './apiClient';

/**
 * OCR API Client
 *
 * Handles all OCR-related API calls including:
 * - Fetching OCR status and progress
 * - Retrieving OCR text
 * - Retrying failed OCR processing
 */

const ocrApi = {
  /**
   * Fetch OCR status for a specific document
   * @param {number} documentId - The document ID
   * @returns {Promise<Object>} OCR status data
   *   {
   *     status: 'pending' | 'processing' | 'completed' | 'failed',
   *     progress: number (0-100),
   *     error: string | null,
   *     startedAt: string | null,
   *     completedAt: string | null
   *   }
   */
  fetchOcrStatus: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/ocr-status`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch OCR status for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch OCR text for a completed document
   * @param {number} documentId - The document ID
   * @returns {Promise<Object>} OCR text data
   *   {
   *     text: string,
   *     confidence: number | null,
   *     language: string | null,
   *     pageCount: number | null
   *   }
   */
  fetchOcrText: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/ocr-text`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch OCR text for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Retry OCR processing for a failed document
   * @param {number} documentId - The document ID
   * @returns {Promise<Object>} Response confirming retry initiation
   *   {
   *     message: string,
   *     status: 'pending' | 'processing'
   *   }
   */
  retryOcrProcessing: async (documentId) => {
    try {
      const response = await apiClient.post(`/documents/${documentId}/retry-processing`);
      return response.data;
    } catch (error) {
      console.error(`Failed to retry OCR processing for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch detailed OCR processing history for a document
   * @param {number} documentId - The document ID
   * @returns {Promise<Object>} Processing history data
   *   {
   *     attempts: Array<{
   *       attemptNumber: number,
   *       status: string,
   *       startedAt: string,
   *       completedAt: string | null,
   *       error: string | null,
   *       duration: number | null
   *     }>
   *   }
   */
  fetchProcessingHistory: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/processing-history`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch processing history for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Batch fetch OCR status for multiple documents
   * @param {Array<number>} documentIds - Array of document IDs
   * @returns {Promise<Object>} Map of document IDs to their OCR status
   *   {
   *     [documentId]: { status, progress, error }
   *   }
   */
  batchFetchOcrStatus: async (documentIds) => {
    try {
      const response = await apiClient.post('/ocr/batch-status', {
        documentIds,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to batch fetch OCR status:', error);
      throw error;
    }
  },

  /**
   * Cancel ongoing OCR processing
   * @param {number} documentId - The document ID
   * @returns {Promise<Object>} Response confirming cancellation
   *   {
   *     message: string,
   *     status: 'cancelled'
   *   }
   */
  cancelOcrProcessing: async (documentId) => {
    try {
      const response = await apiClient.post(`/documents/${documentId}/cancel-processing`);
      return response.data;
    } catch (error) {
      console.error(`Failed to cancel OCR processing for document ${documentId}:`, error);
      throw error;
    }
  },
};

export default ocrApi;
