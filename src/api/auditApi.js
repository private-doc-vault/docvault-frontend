import apiClient from './apiClient';

/**
 * Fetch audit logs with filters and pagination
 * @param {Object} params - Query parameters
 * @param {string} params.documentId - Filter by document ID
 * @param {string} params.userId - Filter by user ID
 * @param {string} params.action - Filter by action type (create, update, delete, view, share, etc.)
 * @param {string} params.startDate - Start date for date range filter (ISO format)
 * @param {string} params.endDate - End date for date range filter (ISO format)
 * @param {number} params.page - Current page number (1-indexed)
 * @param {number} params.limit - Number of items per page
 * @returns {Promise} Resolves to { data: Array, pagination: Object }
 */
export const fetchAuditLogs = async (params = {}) => {
  const {
    documentId,
    userId,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = params;

  // Build query parameters, only including non-null values
  const queryParams = new URLSearchParams();

  if (documentId) queryParams.append('documentId', documentId);
  if (userId) queryParams.append('userId', userId);
  if (action) queryParams.append('action', action);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  queryParams.append('page', page);
  queryParams.append('limit', limit);

  const response = await apiClient.get(`/audit-logs?${queryParams.toString()}`);

  return {
    data: response.data.data || response.data,
    pagination: response.data.pagination || {
      currentPage: page,
      pageSize: limit,
      totalItems: response.data.total || 0,
      totalPages: Math.ceil((response.data.total || 0) / limit),
    },
  };
};

/**
 * Export audit logs to CSV format
 * @param {Object} params - Query parameters (same as fetchAuditLogs)
 * @returns {Promise} Resolves to Blob
 */
export const exportAuditLogs = async (params = {}) => {
  const {
    documentId,
    userId,
    action,
    startDate,
    endDate,
  } = params;

  const queryParams = new URLSearchParams();

  if (documentId) queryParams.append('documentId', documentId);
  if (userId) queryParams.append('userId', userId);
  if (action) queryParams.append('action', action);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  queryParams.append('format', 'csv');

  const response = await apiClient.get(`/audit-logs/export?${queryParams.toString()}`, {
    responseType: 'blob',
  });

  return response.data;
};

/**
 * Fetch audit logs for a specific document
 * @param {string} documentId - Document ID
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @returns {Promise} Resolves to { data: Array, pagination: Object }
 */
export const fetchDocumentAuditLogs = async (documentId, page = 1, limit = 20) => {
  return fetchAuditLogs({ documentId, page, limit });
};
