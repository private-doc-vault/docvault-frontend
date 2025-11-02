import apiClient from './apiClient';

/**
 * Search API methods
 */
const searchApi = {
  /**
   * Search documents using Meilisearch
   * @param {object} params - Search parameters
   * @param {string} params.query - Search query string
   * @param {object} params.filters - Search filters
   * @param {string} params.filters.category - Filter by category
   * @param {string} params.filters.dateFrom - Filter by start date (ISO format)
   * @param {string} params.filters.dateTo - Filter by end date (ISO format)
   * @param {string} params.filters.documentType - Filter by document type
   * @param {number} params.limit - Number of results per page (default: 20)
   * @param {number} params.offset - Offset for pagination (default: 0)
   * @returns {Promise<object>} Search results with metadata
   */
  searchDocuments: async (params = {}) => {
    try {
      const { query = '', filters = {}, limit = 20, offset = 0 } = params;

      // Build request payload
      const payload = {
        query,
        limit,
        offset,
        filters: {},
      };

      // Add non-empty filters
      if (filters.category) payload.filters.category = filters.category;
      if (filters.dateFrom) payload.filters.dateFrom = filters.dateFrom;
      if (filters.dateTo) payload.filters.dateTo = filters.dateTo;
      if (filters.documentType)
        payload.filters.documentType = filters.documentType;

      const response = await apiClient.post('/search', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export search results to various formats
   * @param {object} params - Export parameters
   * @param {string} params.query - Search query string
   * @param {object} params.filters - Search filters
   * @param {string} params.format - Export format ('csv', 'pdf', 'json')
   * @returns {Promise<Blob>} Exported file blob
   */
  exportSearchResults: async (params = {}) => {
    try {
      const { query = '', filters = {}, format = 'csv' } = params;

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      if (query) queryParams.append('query', query);

      // Add filters to query params
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.documentType)
        queryParams.append('documentType', filters.documentType);

      const response = await apiClient.get(
        `/search/export?${queryParams.toString()}`,
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
   * Get user's saved searches
   * @returns {Promise<object[]>} Array of saved searches
   */
  getSavedSearches: async () => {
    try {
      const response = await apiClient.get('/saved-searches');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save a new search
   * @param {object} searchData - Search data to save
   * @param {string} searchData.name - Name/title of the saved search
   * @param {string} searchData.query - Search query string
   * @param {object} searchData.filters - Search filters
   * @returns {Promise<object>} Created saved search
   */
  saveSavedSearch: async (searchData) => {
    try {
      const response = await apiClient.post('/saved-searches', searchData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an existing saved search
   * @param {string|number} searchId - Saved search ID
   * @param {object} updates - Fields to update
   * @param {string} updates.name - Name/title of the saved search
   * @param {string} updates.query - Search query string
   * @param {object} updates.filters - Search filters
   * @returns {Promise<object>} Updated saved search
   */
  updateSavedSearch: async (searchId, updates) => {
    try {
      const response = await apiClient.put(
        `/saved-searches/${searchId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a saved search
   * @param {string|number} searchId - Saved search ID
   * @returns {Promise<void>}
   */
  deleteSavedSearch: async (searchId) => {
    try {
      await apiClient.delete(`/saved-searches/${searchId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Execute a saved search by ID
   * @param {string|number} searchId - Saved search ID
   * @param {number} limit - Number of results per page
   * @param {number} offset - Offset for pagination
   * @returns {Promise<object>} Search results
   */
  executeSavedSearch: async (searchId, limit = 20, offset = 0) => {
    try {
      const response = await apiClient.post(
        `/saved-searches/${searchId}/execute`,
        {
          limit,
          offset,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default searchApi;
