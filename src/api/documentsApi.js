import apiClient from './apiClient';

/**
 * Documents API methods
 */
const documentsApi = {
  /**
   * Fetch documents with pagination and filters
   * @param {object} params - Query parameters
   * @param {number} params.limit - Number of documents per page
   * @param {number} params.offset - Offset for pagination
   * @param {string} params.search - Search query
   * @param {string} params.category - Filter by category
   * @param {string} params.status - Filter by OCR status
   * @param {string} params.dateFrom - Filter by start date (ISO format)
   * @param {string} params.dateTo - Filter by end date (ISO format)
   * @param {string} params.sortBy - Sort field (e.g., 'createdAt', 'filename')
   * @param {string} params.sortOrder - Sort order ('asc' or 'desc')
   * @returns {Promise<object>} Documents list with pagination metadata
   */
  fetchDocuments: async (params = {}) => {
    try {
      // Build query string from params, omitting null/undefined values
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await apiClient.get(
        `/documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch a single document by ID
   * @param {string|number} documentId - Document ID
   * @returns {Promise<object>} Document details
   */
  fetchDocumentById: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload a new document
   * @param {File} file - File to upload
   * @param {object} metadata - Document metadata
   * @param {string} metadata.title - Document title
   * @param {string} metadata.description - Document description
   * @param {string} metadata.category - Document category
   * @param {string[]} metadata.tags - Document tags
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise<object>} Uploaded document data
   */
  uploadDocument: async (file, metadata = {}, onUploadProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata fields if provided
      if (metadata.title) formData.append('title', metadata.title);
      if (metadata.description)
        formData.append('description', metadata.description);
      if (metadata.category) formData.append('category', metadata.category);
      if (metadata.tags && Array.isArray(metadata.tags)) {
        metadata.tags.forEach((tag) => formData.append('tags[]', tag));
      }

      const response = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress
          ? (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onUploadProgress(percentCompleted);
            }
          : undefined,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update document metadata
   * @param {string|number} documentId - Document ID
   * @param {object} updates - Fields to update
   * @param {string} updates.title - Document title
   * @param {string} updates.description - Document description
   * @param {string} updates.category - Document category
   * @param {string[]} updates.tags - Document tags
   * @returns {Promise<object>} Updated document data
   */
  updateDocument: async (documentId, updates) => {
    try {
      const response = await apiClient.put(`/documents/${documentId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a document
   * @param {string|number} documentId - Document ID
   * @returns {Promise<void>}
   */
  deleteDocument: async (documentId) => {
    try {
      await apiClient.delete(`/documents/${documentId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download a document
   * @param {string|number} documentId - Document ID
   * @returns {Promise<Blob>} Document file blob
   */
  downloadDocument: async (documentId) => {
    try {
      const response = await apiClient.get(
        `/documents/${documentId}/download`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get document thumbnail
   * @param {string|number} documentId - Document ID
   * @returns {Promise<string>} Thumbnail URL or blob URL
   */
  getDocumentThumbnail: async (documentId) => {
    try {
      const response = await apiClient.get(
        `/documents/${documentId}/thumbnail`,
        {
          responseType: 'blob',
        }
      );
      return URL.createObjectURL(response.data);
    } catch {
      // Return null if thumbnail doesn't exist
      return null;
    }
  },

  /**
   * Retry OCR processing for a failed document
   * @param {string|number} documentId - Document ID
   * @returns {Promise<object>} Updated document data
   */
  retryOcrProcessing: async (documentId) => {
    try {
      const response = await apiClient.post(
        `/documents/${documentId}/retry-processing`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch OCR status for a document
   * @param {string|number} documentId - Document ID
   * @returns {Promise<object>} OCR status information
   */
  fetchOcrStatus: async (documentId) => {
    try {
      const response = await apiClient.get(
        `/documents/${documentId}/ocr-status`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch extracted OCR text
   * @param {string|number} documentId - Document ID
   * @returns {Promise<object>} OCR text and metadata
   */
  fetchOcrText: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/ocr-text`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Batch upload multiple documents
   * @param {File[]} files - Array of files to upload
   * @param {Function} onProgress - Progress callback per file
   * @returns {Promise<object[]>} Array of upload results
   */
  batchUploadDocuments: async (files, onProgress = null) => {
    try {
      const uploadPromises = files.map((file, index) => {
        return documentsApi.uploadDocument(
          file,
          {},
          onProgress ? (percent) => onProgress(index, file.name, percent) : null
        );
      });

      // Wait for all uploads to complete
      const results = await Promise.allSettled(uploadPromises);

      return results.map((result, index) => ({
        filename: files[index].name,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
    } catch (error) {
      throw error;
    }
  },
};

export default documentsApi;
