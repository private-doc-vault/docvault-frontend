import rolesReducer, {
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
  selectRoles,
  selectPermissions,
  selectRolePermissions,
  selectRoleById,
  selectPermissionById,
  selectPermissionsForRole,
  selectHasUnsavedChanges,
  selectRolesLoading,
  selectRolesError,
} from './rolesSlice';

describe('rolesSlice', () => {
  const initialState = {
    roles: [],
    permissions: [],
    rolePermissions: {},
    unsavedChanges: false,
    loading: false,
    error: null,
  };

  const mockRoles = [
    { id: 1, name: 'ROLE_ADMIN', description: 'Administrator role' },
    { id: 2, name: 'ROLE_USER', description: 'Standard user role' },
  ];

  const mockPermissions = [
    { id: 1, name: 'READ', description: 'Read access' },
    { id: 2, name: 'WRITE', description: 'Write access' },
    { id: 3, name: 'DELETE', description: 'Delete access' },
  ];

  const mockRolePermissions = {
    1: [1, 2, 3], // Admin has all permissions
    2: [1], // User has only read
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(rolesReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    it('should handle setRoles', () => {
      const actual = rolesReducer(initialState, setRoles(mockRoles));
      expect(actual.roles).toEqual(mockRoles);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });

    it('should handle setPermissions', () => {
      const actual = rolesReducer(
        initialState,
        setPermissions(mockPermissions)
      );
      expect(actual.permissions).toEqual(mockPermissions);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });

    it('should handle setRolePermissions', () => {
      const actual = rolesReducer(
        initialState,
        setRolePermissions(mockRolePermissions)
      );
      expect(actual.rolePermissions).toEqual(mockRolePermissions);
      expect(actual.unsavedChanges).toBe(false);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });

    it('should handle updateRolePermissions', () => {
      const state = {
        ...initialState,
        rolePermissions: mockRolePermissions,
      };

      const actual = rolesReducer(
        state,
        updateRolePermissions({ roleId: 2, permissions: [1, 2] })
      );

      expect(actual.rolePermissions[2]).toEqual([1, 2]);
      expect(actual.rolePermissions[1]).toEqual([1, 2, 3]); // Other roles unchanged
      expect(actual.unsavedChanges).toBe(true);
    });

    it('should handle toggleRolePermission - add permission', () => {
      const state = {
        ...initialState,
        rolePermissions: mockRolePermissions,
      };

      const actual = rolesReducer(
        state,
        toggleRolePermission({ roleId: 2, permissionId: 2 })
      );

      expect(actual.rolePermissions[2]).toContain(1);
      expect(actual.rolePermissions[2]).toContain(2);
      expect(actual.unsavedChanges).toBe(true);
    });

    it('should handle toggleRolePermission - remove permission', () => {
      const state = {
        ...initialState,
        rolePermissions: mockRolePermissions,
      };

      const actual = rolesReducer(
        state,
        toggleRolePermission({ roleId: 1, permissionId: 2 })
      );

      expect(actual.rolePermissions[1]).not.toContain(2);
      expect(actual.rolePermissions[1]).toContain(1);
      expect(actual.rolePermissions[1]).toContain(3);
      expect(actual.unsavedChanges).toBe(true);
    });

    it('should handle toggleRolePermission for role with no permissions', () => {
      const state = {
        ...initialState,
        rolePermissions: {},
      };

      const actual = rolesReducer(
        state,
        toggleRolePermission({ roleId: 3, permissionId: 1 })
      );

      expect(actual.rolePermissions[3]).toEqual([1]);
      expect(actual.unsavedChanges).toBe(true);
    });

    it('should handle markChangesSaved', () => {
      const state = {
        ...initialState,
        unsavedChanges: true,
      };

      const actual = rolesReducer(state, markChangesSaved());

      expect(actual.unsavedChanges).toBe(false);
    });

    it('should handle discardChanges', () => {
      const state = {
        ...initialState,
        unsavedChanges: true,
      };

      const actual = rolesReducer(state, discardChanges());

      expect(actual.unsavedChanges).toBe(false);
    });

    it('should handle setLoading', () => {
      const actual = rolesReducer(initialState, setLoading(true));
      expect(actual.loading).toBe(true);

      const actual2 = rolesReducer(actual, setLoading(false));
      expect(actual2.loading).toBe(false);
    });

    it('should handle setError', () => {
      const error = 'Failed to load roles';
      const stateWithLoading = { ...initialState, loading: true };

      const actual = rolesReducer(stateWithLoading, setError(error));

      expect(actual.error).toBe(error);
      expect(actual.loading).toBe(false);
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };

      const actual = rolesReducer(stateWithError, clearError());

      expect(actual.error).toBe(null);
    });
  });

  describe('selectors', () => {
    const mockState = {
      roles: {
        roles: mockRoles,
        permissions: mockPermissions,
        rolePermissions: mockRolePermissions,
        unsavedChanges: true,
        loading: true,
        error: 'Test error',
      },
    };

    it('should select roles', () => {
      expect(selectRoles(mockState)).toEqual(mockRoles);
    });

    it('should select permissions', () => {
      expect(selectPermissions(mockState)).toEqual(mockPermissions);
    });

    it('should select rolePermissions', () => {
      expect(selectRolePermissions(mockState)).toEqual(mockRolePermissions);
    });

    it('should select role by id', () => {
      const selector = selectRoleById(1);
      expect(selector(mockState)).toEqual(mockRoles[0]);
    });

    it('should return undefined for non-existent role id', () => {
      const selector = selectRoleById(999);
      expect(selector(mockState)).toBeUndefined();
    });

    it('should select permission by id', () => {
      const selector = selectPermissionById(2);
      expect(selector(mockState)).toEqual(mockPermissions[1]);
    });

    it('should return undefined for non-existent permission id', () => {
      const selector = selectPermissionById(999);
      expect(selector(mockState)).toBeUndefined();
    });

    it('should select permissions for role', () => {
      const selector = selectPermissionsForRole(1);
      expect(selector(mockState)).toEqual([1, 2, 3]);
    });

    it('should return empty array for role with no permissions', () => {
      const selector = selectPermissionsForRole(999);
      expect(selector(mockState)).toEqual([]);
    });

    it('should select has unsaved changes', () => {
      expect(selectHasUnsavedChanges(mockState)).toBe(true);
    });

    it('should select loading state', () => {
      expect(selectRolesLoading(mockState)).toBe(true);
    });

    it('should select error', () => {
      expect(selectRolesError(mockState)).toBe('Test error');
    });
  });

  describe('permission management flow', () => {
    it('should handle complete data loading flow', () => {
      let state = initialState;

      // Start loading
      state = rolesReducer(state, setLoading(true));
      expect(state.loading).toBe(true);

      // Load roles
      state = rolesReducer(state, setRoles(mockRoles));
      expect(state.roles).toHaveLength(2);
      expect(state.loading).toBe(false);

      // Load permissions
      state = rolesReducer(state, setPermissions(mockPermissions));
      expect(state.permissions).toHaveLength(3);

      // Load role-permission mappings
      state = rolesReducer(state, setRolePermissions(mockRolePermissions));
      expect(state.rolePermissions).toEqual(mockRolePermissions);
      expect(state.unsavedChanges).toBe(false);
    });

    it('should handle permission toggle flow', () => {
      let state = {
        ...initialState,
        roles: mockRoles,
        permissions: mockPermissions,
        rolePermissions: mockRolePermissions,
      };

      // Toggle off a permission
      state = rolesReducer(
        state,
        toggleRolePermission({ roleId: 1, permissionId: 3 })
      );
      expect(state.rolePermissions[1]).not.toContain(3);
      expect(state.unsavedChanges).toBe(true);

      // Toggle it back on
      state = rolesReducer(
        state,
        toggleRolePermission({ roleId: 1, permissionId: 3 })
      );
      expect(state.rolePermissions[1]).toContain(3);
      expect(state.unsavedChanges).toBe(true);
    });

    it('should handle save changes flow', () => {
      let state = {
        ...initialState,
        rolePermissions: mockRolePermissions,
        unsavedChanges: true,
      };

      // Make some changes
      state = rolesReducer(
        state,
        updateRolePermissions({ roleId: 2, permissions: [1, 2, 3] })
      );
      expect(state.unsavedChanges).toBe(true);

      // Mark changes as saved
      state = rolesReducer(state, markChangesSaved());
      expect(state.unsavedChanges).toBe(false);
    });

    it('should handle discard changes flow', () => {
      let state = {
        ...initialState,
        rolePermissions: mockRolePermissions,
        unsavedChanges: true,
      };

      // Discard changes
      state = rolesReducer(state, discardChanges());
      expect(state.unsavedChanges).toBe(false);
    });

    it('should handle error state flow', () => {
      let state = initialState;

      // Start loading
      state = rolesReducer(state, setLoading(true));
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);

      // Error occurs
      state = rolesReducer(state, setError('Failed to fetch data'));
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch data');

      // Clear error and retry
      state = rolesReducer(state, clearError());
      expect(state.error).toBe(null);

      state = rolesReducer(state, setLoading(true));
      state = rolesReducer(state, setRoles(mockRoles));
      expect(state.roles).toHaveLength(2);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle multiple role updates', () => {
      let state = {
        ...initialState,
        rolePermissions: mockRolePermissions,
      };

      // Update multiple roles
      state = rolesReducer(
        state,
        updateRolePermissions({ roleId: 1, permissions: [1] })
      );
      state = rolesReducer(
        state,
        updateRolePermissions({ roleId: 2, permissions: [1, 2, 3] })
      );

      expect(state.rolePermissions[1]).toEqual([1]);
      expect(state.rolePermissions[2]).toEqual([1, 2, 3]);
      expect(state.unsavedChanges).toBe(true);
    });
  });
});
