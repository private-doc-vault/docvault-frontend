import apiClient from './apiClient';

/**
 * Users API methods (Admin only)
 */
const usersApi = {
  /**
   * Fetch users with pagination and filters
   * @param {object} params - Query parameters
   * @param {number} params.limit - Number of users per page
   * @param {number} params.offset - Offset for pagination
   * @param {string} params.search - Search query (username or email)
   * @param {string} params.status - Filter by status (active, inactive, locked)
   * @param {string} params.role - Filter by role
   * @param {string} params.sortBy - Sort field (e.g., 'username', 'createdAt')
   * @param {string} params.sortOrder - Sort order ('asc' or 'desc')
   * @returns {Promise<object>} Users list with pagination metadata
   */
  fetchUsers: async (params = {}) => {
    try {
      // Build query string from params, omitting null/undefined values
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await apiClient.get(
        `/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch a single user by ID
   * @param {string|number} userId - User ID
   * @returns {Promise<object>} User details
   */
  fetchUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @param {string[]} userData.roles - Array of role names
   * @param {string} userData.status - User status (active, inactive)
   * @returns {Promise<object>} Created user data
   */
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user information
   * @param {string|number} userId - User ID
   * @param {object} updates - Fields to update
   * @param {string} updates.username - Username
   * @param {string} updates.email - Email address
   * @param {string} updates.password - Password (optional, only if changing)
   * @param {string[]} updates.roles - Array of role names
   * @param {string} updates.status - User status (active, inactive, locked)
   * @returns {Promise<object>} Updated user data
   */
  updateUser: async (userId, updates) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a user
   * @param {string|number} userId - User ID
   * @returns {Promise<void>}
   */
  deleteUser: async (userId) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lock a user account
   * @param {string|number} userId - User ID
   * @returns {Promise<object>} Updated user data
   */
  lockUser: async (userId) => {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/lock`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unlock a user account
   * @param {string|number} userId - User ID
   * @returns {Promise<object>} Updated user data
   */
  unlockUser: async (userId) => {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/unlock`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset user password
   * @param {string|number} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<object>} Response data
   */
  resetPassword: async (userId, newPassword) => {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/reset-password`, {
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default usersApi;
