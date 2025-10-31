import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roles: [],
  permissions: [],
  rolePermissions: {}, // Map of roleId -> array of permission IDs
  unsavedChanges: false,
  loading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setRoles: (state, action) => {
      state.roles = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
      state.loading = false;
      state.error = null;
    },
    setRolePermissions: (state, action) => {
      state.rolePermissions = action.payload;
      state.unsavedChanges = false;
      state.loading = false;
      state.error = null;
    },
    updateRolePermissions: (state, action) => {
      const { roleId, permissions } = action.payload;
      state.rolePermissions = {
        ...state.rolePermissions,
        [roleId]: permissions,
      };
      state.unsavedChanges = true;
    },
    toggleRolePermission: (state, action) => {
      const { roleId, permissionId } = action.payload;
      const currentPermissions = state.rolePermissions[roleId] || [];

      if (currentPermissions.includes(permissionId)) {
        // Remove permission
        state.rolePermissions[roleId] = currentPermissions.filter(
          (id) => id !== permissionId
        );
      } else {
        // Add permission
        state.rolePermissions[roleId] = [...currentPermissions, permissionId];
      }

      state.unsavedChanges = true;
    },
    markChangesSaved: (state) => {
      state.unsavedChanges = false;
    },
    discardChanges: (state) => {
      state.unsavedChanges = false;
      // Note: Caller should refetch data to restore original state
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setRoles,
  setPermissions,
  setRolePermissions,
  updateRolePermissions,
  toggleRolePermission,
  markChangesSaved,
  discardChanges,
  setLoading,
  setError,
  clearError,
} = rolesSlice.actions;

// Selectors
export const selectRoles = (state) => state.roles.roles;
export const selectPermissions = (state) => state.roles.permissions;
export const selectRolePermissions = (state) => state.roles.rolePermissions;
export const selectRoleById = (roleId) => (state) =>
  state.roles.roles.find((role) => role.id === roleId);
export const selectPermissionById = (permissionId) => (state) =>
  state.roles.permissions.find((perm) => perm.id === permissionId);
export const selectPermissionsForRole = (roleId) => (state) =>
  state.roles.rolePermissions[roleId] || [];
export const selectHasUnsavedChanges = (state) => state.roles.unsavedChanges;
export const selectRolesLoading = (state) => state.roles.loading;
export const selectRolesError = (state) => state.roles.error;

export default rolesSlice.reducer;
