import apiClient from './apiClient';

/**
 * Roles and Permissions API methods (Admin only)
 */
const rolesApi = {
  /**
   * Fetch all roles
   * @returns {Promise<object[]>} Array of role objects
   */
  fetchRoles: async () => {
    try {
      const response = await apiClient.get('/admin/roles');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch all available permissions
   * @returns {Promise<object[]>} Array of permission objects
   */
  fetchPermissions: async () => {
    try {
      const response = await apiClient.get('/admin/permissions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch role-permission mappings
   * Returns a map of roleId -> array of permission IDs
   * @returns {Promise<object>} Role-permission mappings
   */
  fetchRolePermissions: async () => {
    try {
      const response = await apiClient.get('/admin/role-permissions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch a single role by ID
   * @param {string|number} roleId - Role ID
   * @returns {Promise<object>} Role details with permissions and users
   */
  fetchRoleById: async (roleId) => {
    try {
      const response = await apiClient.get(`/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update permissions for a specific role
   * @param {string|number} roleId - Role ID
   * @param {string[]|number[]} permissionIds - Array of permission IDs to assign to the role
   * @returns {Promise<object>} Updated role data
   */
  updateRolePermissions: async (roleId, permissionIds) => {
    try {
      const response = await apiClient.put(
        `/admin/roles/${roleId}/permissions`,
        {
          permissions: permissionIds,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Batch update permissions for multiple roles
   * @param {object} rolePermissionsMap - Map of roleId -> array of permission IDs
   * @returns {Promise<object>} Response data
   */
  batchUpdateRolePermissions: async (rolePermissionsMap) => {
    try {
      const response = await apiClient.put('/admin/role-permissions/batch', {
        rolePermissions: rolePermissionsMap,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch users assigned to a specific role
   * @param {string|number} roleId - Role ID
   * @returns {Promise<object[]>} Array of user objects
   */
  fetchUsersForRole: async (roleId) => {
    try {
      const response = await apiClient.get(`/admin/roles/${roleId}/users`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default rolesApi;
