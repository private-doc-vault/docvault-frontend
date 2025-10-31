import usersReducer, {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setSelectedUser,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentPage,
  setLoading,
  setError,
  clearError,
  selectUsers,
  selectSelectedUser,
  selectUserById,
  selectFilters,
  selectPagination,
  selectUsersLoading,
  selectUsersError,
} from './usersSlice';

describe('usersSlice', () => {
  const initialState = {
    users: [],
    selectedUser: null,
    filters: {
      search: '',
      status: null,
      role: null,
    },
    pagination: {
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_USER'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockUsers = [
    mockUser,
    {
      id: 2,
      username: 'adminuser',
      email: 'admin@example.com',
      roles: ['ROLE_ADMIN', 'ROLE_USER'],
      status: 'active',
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(usersReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setUsers', () => {
      const actual = usersReducer(initialState, setUsers(mockUsers));
      expect(actual.users).toEqual(mockUsers);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });

    it('should handle addUser', () => {
      const stateWithUsers = {
        ...initialState,
        users: [mockUsers[0]],
        pagination: { ...initialState.pagination, totalItems: 1 },
      };

      const actual = usersReducer(
        stateWithUsers,
        addUser(mockUsers[1])
      );

      expect(actual.users).toHaveLength(2);
      expect(actual.users[0]).toEqual(mockUsers[1]); // Added to front
      expect(actual.pagination.totalItems).toBe(2);
    });

    it('should handle updateUser', () => {
      const stateWithUsers = {
        ...initialState,
        users: mockUsers,
      };

      const updatedUser = {
        ...mockUser,
        email: 'updated@example.com',
        status: 'inactive',
      };

      const actual = usersReducer(
        stateWithUsers,
        updateUser(updatedUser)
      );

      expect(actual.users[0].email).toBe('updated@example.com');
      expect(actual.users[0].status).toBe('inactive');
      expect(actual.users[1]).toEqual(mockUsers[1]); // Unchanged
    });

    it('should handle updateUser for selected user', () => {
      const stateWithSelection = {
        ...initialState,
        users: mockUsers,
        selectedUser: mockUser,
      };

      const updatedUser = {
        ...mockUser,
        email: 'updated@example.com',
      };

      const actual = usersReducer(
        stateWithSelection,
        updateUser(updatedUser)
      );

      expect(actual.selectedUser.email).toBe('updated@example.com');
      expect(actual.users[0].email).toBe('updated@example.com');
    });

    it('should handle deleteUser', () => {
      const stateWithUsers = {
        ...initialState,
        users: mockUsers,
        pagination: { ...initialState.pagination, totalItems: 2 },
      };

      const actual = usersReducer(stateWithUsers, deleteUser(1));

      expect(actual.users).toHaveLength(1);
      expect(actual.users[0].id).toBe(2);
      expect(actual.pagination.totalItems).toBe(1);
    });

    it('should handle deleteUser when selected', () => {
      const stateWithSelection = {
        ...initialState,
        users: mockUsers,
        selectedUser: mockUser,
        pagination: { ...initialState.pagination, totalItems: 2 },
      };

      const actual = usersReducer(stateWithSelection, deleteUser(1));

      expect(actual.users).toHaveLength(1);
      expect(actual.selectedUser).toBe(null);
    });

    it('should handle setSelectedUser', () => {
      const actual = usersReducer(
        initialState,
        setSelectedUser(mockUser)
      );

      expect(actual.selectedUser).toEqual(mockUser);
    });

    it('should handle setFilters', () => {
      const filters = {
        search: 'test query',
        status: 'active',
        role: 'ROLE_ADMIN',
      };

      const actual = usersReducer(initialState, setFilters(filters));

      expect(actual.filters.search).toBe('test query');
      expect(actual.filters.status).toBe('active');
      expect(actual.filters.role).toBe('ROLE_ADMIN');
      expect(actual.pagination.currentPage).toBe(1); // Reset to page 1
    });

    it('should handle setFilters partially', () => {
      const stateWithFilters = {
        ...initialState,
        filters: {
          ...initialState.filters,
          search: 'existing',
          status: 'active',
        },
      };

      const actual = usersReducer(
        stateWithFilters,
        setFilters({ role: 'ROLE_USER' })
      );

      expect(actual.filters.search).toBe('existing');
      expect(actual.filters.status).toBe('active');
      expect(actual.filters.role).toBe('ROLE_USER');
    });

    it('should handle clearFilters', () => {
      const stateWithFilters = {
        ...initialState,
        filters: {
          search: 'test',
          status: 'active',
          role: 'ROLE_ADMIN',
        },
        pagination: { ...initialState.pagination, currentPage: 5 },
      };

      const actual = usersReducer(stateWithFilters, clearFilters());

      expect(actual.filters).toEqual(initialState.filters);
      expect(actual.pagination.currentPage).toBe(1);
    });

    it('should handle setPagination', () => {
      const pagination = {
        totalItems: 100,
        totalPages: 5,
        currentPage: 2,
      };

      const actual = usersReducer(initialState, setPagination(pagination));

      expect(actual.pagination.totalItems).toBe(100);
      expect(actual.pagination.totalPages).toBe(5);
      expect(actual.pagination.currentPage).toBe(2);
      expect(actual.pagination.pageSize).toBe(20); // Unchanged
    });

    it('should handle setCurrentPage', () => {
      const actual = usersReducer(initialState, setCurrentPage(3));

      expect(actual.pagination.currentPage).toBe(3);
    });

    it('should handle setLoading', () => {
      const actual = usersReducer(initialState, setLoading(true));
      expect(actual.loading).toBe(true);

      const actual2 = usersReducer(actual, setLoading(false));
      expect(actual2.loading).toBe(false);
    });

    it('should handle setError', () => {
      const error = 'Failed to load users';
      const stateWithLoading = { ...initialState, loading: true };

      const actual = usersReducer(stateWithLoading, setError(error));

      expect(actual.error).toBe(error);
      expect(actual.loading).toBe(false); // Loading cleared on error
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };

      const actual = usersReducer(stateWithError, clearError());

      expect(actual.error).toBe(null);
    });
  });

  describe('selectors', () => {
    const mockState = {
      users: {
        users: mockUsers,
        selectedUser: mockUser,
        filters: {
          search: 'test',
          status: 'active',
          role: 'ROLE_ADMIN',
        },
        pagination: {
          currentPage: 2,
          pageSize: 20,
          totalItems: 100,
          totalPages: 5,
        },
        loading: true,
        error: 'Test error',
      },
    };

    it('should select users', () => {
      expect(selectUsers(mockState)).toEqual(mockUsers);
    });

    it('should select selected user', () => {
      expect(selectSelectedUser(mockState)).toEqual(mockUser);
    });

    it('should select user by id', () => {
      const selector = selectUserById(2);
      expect(selector(mockState)).toEqual(mockUsers[1]);
    });

    it('should return undefined for non-existent user id', () => {
      const selector = selectUserById(999);
      expect(selector(mockState)).toBeUndefined();
    });

    it('should select filters', () => {
      expect(selectFilters(mockState)).toEqual({
        search: 'test',
        status: 'active',
        role: 'ROLE_ADMIN',
      });
    });

    it('should select pagination', () => {
      expect(selectPagination(mockState)).toEqual({
        currentPage: 2,
        pageSize: 20,
        totalItems: 100,
        totalPages: 5,
      });
    });

    it('should select loading state', () => {
      expect(selectUsersLoading(mockState)).toBe(true);
    });

    it('should select error', () => {
      expect(selectUsersError(mockState)).toBe('Test error');
    });
  });

  describe('user management flow', () => {
    it('should handle complete user creation flow', () => {
      let state = initialState;

      // Start loading
      state = usersReducer(state, setLoading(true));
      expect(state.loading).toBe(true);

      // Add created user
      state = usersReducer(state, addUser(mockUser));
      expect(state.users).toHaveLength(1);
      expect(state.users[0]).toEqual(mockUser);

      // Stop loading
      state = usersReducer(state, setLoading(false));
      expect(state.loading).toBe(false);
    });

    it('should handle complete user edit flow', () => {
      let state = {
        ...initialState,
        users: [mockUser],
        selectedUser: mockUser,
      };

      // Update user
      const updatedUser = {
        ...mockUser,
        email: 'newemail@example.com',
        status: 'inactive',
        roles: ['ROLE_ADMIN', 'ROLE_USER'],
      };

      state = usersReducer(state, updateUser(updatedUser));

      expect(state.users[0].email).toBe('newemail@example.com');
      expect(state.users[0].status).toBe('inactive');
      expect(state.users[0].roles).toEqual(['ROLE_ADMIN', 'ROLE_USER']);
      expect(state.selectedUser.email).toBe('newemail@example.com');
    });

    it('should handle complete user delete flow', () => {
      let state = {
        ...initialState,
        users: mockUsers,
        selectedUser: mockUser,
        pagination: { ...initialState.pagination, totalItems: 2 },
      };

      // Delete user
      state = usersReducer(state, deleteUser(1));

      expect(state.users).toHaveLength(1);
      expect(state.users[0].id).toBe(2);
      expect(state.selectedUser).toBe(null);
      expect(state.pagination.totalItems).toBe(1);
    });

    it('should handle complete filter and search flow', () => {
      let state = {
        ...initialState,
        users: mockUsers,
        pagination: { ...initialState.pagination, currentPage: 3 },
      };

      // Apply filters
      state = usersReducer(
        state,
        setFilters({
          search: 'admin',
          status: 'active',
          role: 'ROLE_ADMIN',
        })
      );

      expect(state.filters.search).toBe('admin');
      expect(state.filters.status).toBe('active');
      expect(state.filters.role).toBe('ROLE_ADMIN');
      expect(state.pagination.currentPage).toBe(1); // Reset on filter

      // Clear filters
      state = usersReducer(state, clearFilters());

      expect(state.filters).toEqual(initialState.filters);
      expect(state.pagination.currentPage).toBe(1);
    });

    it('should handle pagination flow', () => {
      let state = initialState;

      // Load first page
      state = usersReducer(state, setUsers(mockUsers));
      state = usersReducer(
        state,
        setPagination({ totalItems: 100, totalPages: 5 })
      );

      expect(state.users).toHaveLength(2);
      expect(state.pagination.totalPages).toBe(5);

      // Change page
      state = usersReducer(state, setCurrentPage(2));
      expect(state.pagination.currentPage).toBe(2);
    });

    it('should handle error state flow', () => {
      let state = initialState;

      // Start loading
      state = usersReducer(state, setLoading(true));
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);

      // Error occurs
      state = usersReducer(state, setError('Failed to fetch users'));
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch users');

      // Clear error and retry
      state = usersReducer(state, clearError());
      expect(state.error).toBe(null);

      state = usersReducer(state, setLoading(true));
      state = usersReducer(state, setUsers(mockUsers));
      expect(state.users).toHaveLength(2);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle role-based filtering flow', () => {
      let state = {
        ...initialState,
        users: mockUsers,
      };

      // Filter by admin role
      state = usersReducer(state, setFilters({ role: 'ROLE_ADMIN' }));
      expect(state.filters.role).toBe('ROLE_ADMIN');
      expect(state.pagination.currentPage).toBe(1);

      // Filter by status
      state = usersReducer(state, setFilters({ status: 'active' }));
      expect(state.filters.role).toBe('ROLE_ADMIN'); // Preserved
      expect(state.filters.status).toBe('active');

      // Clear all filters
      state = usersReducer(state, clearFilters());
      expect(state.filters.role).toBe(null);
      expect(state.filters.status).toBe(null);
    });

    it('should handle user status change', () => {
      let state = {
        ...initialState,
        users: mockUsers,
      };

      // Lock user
      const lockedUser = {
        ...mockUser,
        status: 'locked',
      };

      state = usersReducer(state, updateUser(lockedUser));
      expect(state.users[0].status).toBe('locked');

      // Unlock user
      const unlockedUser = {
        ...mockUser,
        status: 'active',
      };

      state = usersReducer(state, updateUser(unlockedUser));
      expect(state.users[0].status).toBe('active');
    });
  });
});
