import apiClient from './apiClient';

/**
 * Document Sharing API methods
 */
const sharingApi = {
  /**
   * Fetch all shares for a document
   * @param {string|number} documentId - Document ID
   * @returns {Promise<object[]>} Array of share objects
   */
  fetchDocumentShares: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/shares`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new share for a document
   * @param {string|number} documentId - Document ID
   * @param {object} shareData - Share data
   * @param {string|number} shareData.userId - User ID to share with
   * @param {string[]} shareData.permissions - Array of permissions (e.g., ['read', 'write', 'delete'])
   * @returns {Promise<object>} Created share object
   */
  createShare: async (documentId, shareData) => {
    try {
      const response = await apiClient.post(`/documents/${documentId}/shares`, shareData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an existing share's permissions
   * @param {string|number} documentId - Document ID
   * @param {string|number} shareId - Share ID
   * @param {object} updates - Fields to update
   * @param {string[]} updates.permissions - Updated permissions array
   * @returns {Promise<object>} Updated share object
   */
  updateShare: async (documentId, shareId, updates) => {
    try {
      const response = await apiClient.put(
        `/documents/${documentId}/shares/${shareId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a share (revoke access)
   * @param {string|number} documentId - Document ID
   * @param {string|number} shareId - Share ID
   * @returns {Promise<void>}
   */
  deleteShare: async (documentId, shareId) => {
    try {
      await apiClient.delete(`/documents/${documentId}/shares/${shareId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search for users to share with
   * @param {string} query - Search query (username or email)
   * @param {number} limit - Maximum number of results
   * @returns {Promise<object[]>} Array of user objects
   */
  searchUsers: async (query, limit = 10) => {
    try {
      const response = await apiClient.get('/users/search', {
        params: { q: query, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current user's permission level for a document
   * @param {string|number} documentId - Document ID
   * @returns {Promise<object>} Permission information
   */
  getUserPermissions: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/my-permissions`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default sharingApi;
