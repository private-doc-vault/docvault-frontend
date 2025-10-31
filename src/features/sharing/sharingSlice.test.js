import sharingReducer, {
  setShares,
  addShare,
  updateShare,
  removeShare,
  clearShares,
  setLoading,
  setError,
  clearError,
  selectShares,
  selectShareById,
  selectShareByUserId,
  selectShareCount,
  selectSharingLoading,
  selectSharingError,
} from './sharingSlice';

describe('sharingSlice', () => {
  describe('reducers', () => {
    const initialState = {
      shares: [],
      loading: false,
      error: null,
    };

    it('should return the initial state', () => {
      expect(sharingReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setShares', () => {
      const shares = [
        {
          id: 1,
          userId: 100,
          permissions: ['read'],
          user: { id: 100, username: 'user1', email: 'user1@example.com' },
        },
        {
          id: 2,
          userId: 200,
          permissions: ['read', 'write'],
          user: { id: 200, username: 'user2', email: 'user2@example.com' },
        },
      ];

      const state = sharingReducer(initialState, setShares(shares));

      expect(state.shares).toEqual(shares);
      expect(state.shares).toHaveLength(2);
    });

    it('should handle setShares with empty array', () => {
      const state = sharingReducer(
        { ...initialState, shares: [{ id: 1, userId: 100 }] },
        setShares([])
      );

      expect(state.shares).toEqual([]);
      expect(state.shares).toHaveLength(0);
    });

    it('should handle addShare', () => {
      const existingShare = {
        id: 1,
        userId: 100,
        permissions: ['read'],
        user: { id: 100, username: 'user1', email: 'user1@example.com' },
      };

      const newShare = {
        id: 2,
        userId: 200,
        permissions: ['read', 'write'],
        user: { id: 200, username: 'user2', email: 'user2@example.com' },
      };

      const state = sharingReducer(
        { ...initialState, shares: [existingShare] },
        addShare(newShare)
      );

      expect(state.shares).toHaveLength(2);
      expect(state.shares[1]).toEqual(newShare);
    });

    it('should handle addShare to empty list', () => {
      const newShare = {
        id: 1,
        userId: 100,
        permissions: ['read'],
        user: { id: 100, username: 'user1', email: 'user1@example.com' },
      };

      const state = sharingReducer(initialState, addShare(newShare));

      expect(state.shares).toHaveLength(1);
      expect(state.shares[0]).toEqual(newShare);
    });

    it('should handle updateShare', () => {
      const existingShares = [
        {
          id: 1,
          userId: 100,
          permissions: ['read'],
          user: { id: 100, username: 'user1', email: 'user1@example.com' },
        },
        {
          id: 2,
          userId: 200,
          permissions: ['read'],
          user: { id: 200, username: 'user2', email: 'user2@example.com' },
        },
      ];

      const updatedShare = {
        id: 2,
        userId: 200,
        permissions: ['read', 'write', 'delete'],
        user: { id: 200, username: 'user2', email: 'user2@example.com' },
      };

      const state = sharingReducer(
        { ...initialState, shares: existingShares },
        updateShare(updatedShare)
      );

      expect(state.shares).toHaveLength(2);
      expect(state.shares[1].permissions).toEqual(['read', 'write', 'delete']);
      expect(state.shares[0].permissions).toEqual(['read']); // First share unchanged
    });

    it('should not modify state if updateShare with non-existent id', () => {
      const existingShares = [
        {
          id: 1,
          userId: 100,
          permissions: ['read'],
          user: { id: 100, username: 'user1', email: 'user1@example.com' },
        },
      ];

      const updatedShare = {
        id: 999,
        userId: 999,
        permissions: ['read', 'write'],
      };

      const state = sharingReducer(
        { ...initialState, shares: existingShares },
        updateShare(updatedShare)
      );

      expect(state.shares).toEqual(existingShares);
      expect(state.shares).toHaveLength(1);
    });

    it('should handle removeShare', () => {
      const existingShares = [
        {
          id: 1,
          userId: 100,
          permissions: ['read'],
          user: { id: 100, username: 'user1', email: 'user1@example.com' },
        },
        {
          id: 2,
          userId: 200,
          permissions: ['read', 'write'],
          user: { id: 200, username: 'user2', email: 'user2@example.com' },
        },
      ];

      const state = sharingReducer(
        { ...initialState, shares: existingShares },
        removeShare(1)
      );

      expect(state.shares).toHaveLength(1);
      expect(state.shares[0].id).toBe(2);
    });

    it('should not modify state if removeShare with non-existent id', () => {
      const existingShares = [
        {
          id: 1,
          userId: 100,
          permissions: ['read'],
          user: { id: 100, username: 'user1', email: 'user1@example.com' },
        },
      ];

      const state = sharingReducer(
        { ...initialState, shares: existingShares },
        removeShare(999)
      );

      expect(state.shares).toEqual(existingShares);
      expect(state.shares).toHaveLength(1);
    });

    it('should handle clearShares', () => {
      const existingShares = [
        {
          id: 1,
          userId: 100,
          permissions: ['read'],
          user: { id: 100, username: 'user1', email: 'user1@example.com' },
        },
      ];

      const state = sharingReducer(
        { ...initialState, shares: existingShares },
        clearShares()
      );

      expect(state.shares).toEqual([]);
      expect(state.shares).toHaveLength(0);
    });

    it('should handle setLoading', () => {
      const state = sharingReducer(initialState, setLoading(true));

      expect(state.loading).toBe(true);
    });

    it('should handle setLoading false', () => {
      const state = sharingReducer(
        { ...initialState, loading: true },
        setLoading(false)
      );

      expect(state.loading).toBe(false);
    });

    it('should handle setError', () => {
      const errorMessage = 'Failed to load shares';
      const state = sharingReducer(initialState, setError(errorMessage));

      expect(state.error).toBe(errorMessage);
    });

    it('should handle clearError', () => {
      const state = sharingReducer(
        { ...initialState, error: 'Some error' },
        clearError()
      );

      expect(state.error).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockState = {
      sharing: {
        shares: [
          {
            id: 1,
            userId: 100,
            permissions: ['read'],
            user: { id: 100, username: 'user1', email: 'user1@example.com' },
          },
          {
            id: 2,
            userId: 200,
            permissions: ['read', 'write'],
            user: { id: 200, username: 'user2', email: 'user2@example.com' },
          },
        ],
        loading: false,
        error: null,
      },
    };

    it('selectShares should return all shares', () => {
      const shares = selectShares(mockState);

      expect(shares).toEqual(mockState.sharing.shares);
      expect(shares).toHaveLength(2);
    });

    it('selectShares should return empty array when no shares', () => {
      const emptyState = {
        sharing: {
          shares: [],
          loading: false,
          error: null,
        },
      };

      const shares = selectShares(emptyState);

      expect(shares).toEqual([]);
      expect(shares).toHaveLength(0);
    });

    it('selectShareById should return share with matching id', () => {
      const share = selectShareById(2)(mockState);

      expect(share).toBeDefined();
      expect(share.id).toBe(2);
      expect(share.userId).toBe(200);
    });

    it('selectShareById should return undefined for non-existent id', () => {
      const share = selectShareById(999)(mockState);

      expect(share).toBeUndefined();
    });

    it('selectShareByUserId should return share with matching userId', () => {
      const share = selectShareByUserId(100)(mockState);

      expect(share).toBeDefined();
      expect(share.id).toBe(1);
      expect(share.userId).toBe(100);
    });

    it('selectShareByUserId should return undefined for non-existent userId', () => {
      const share = selectShareByUserId(999)(mockState);

      expect(share).toBeUndefined();
    });

    it('selectShareCount should return correct count', () => {
      const count = selectShareCount(mockState);

      expect(count).toBe(2);
    });

    it('selectShareCount should return 0 when no shares', () => {
      const emptyState = {
        sharing: {
          shares: [],
          loading: false,
          error: null,
        },
      };

      const count = selectShareCount(emptyState);

      expect(count).toBe(0);
    });

    it('selectSharingLoading should return loading state', () => {
      const loading = selectSharingLoading(mockState);

      expect(loading).toBe(false);
    });

    it('selectSharingLoading should return true when loading', () => {
      const loadingState = {
        sharing: {
          ...mockState.sharing,
          loading: true,
        },
      };

      const loading = selectSharingLoading(loadingState);

      expect(loading).toBe(true);
    });

    it('selectSharingError should return error', () => {
      const error = selectSharingError(mockState);

      expect(error).toBeNull();
    });

    it('selectSharingError should return error message when error exists', () => {
      const errorState = {
        sharing: {
          ...mockState.sharing,
          error: 'Failed to fetch shares',
        },
      };

      const error = selectSharingError(errorState);

      expect(error).toBe('Failed to fetch shares');
    });
  });

  describe('complete sharing flow', () => {
    it('should handle loading, setting shares, and updating permissions', () => {
      const initialState = {
        shares: [],
        loading: false,
        error: null,
      };

      // Start loading
      let state = sharingReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);

      // Set initial shares
      const shares = [
        {
          id: 1,
          userId: 100,
          permissions: ['read'],
          user: { id: 100, username: 'user1', email: 'user1@example.com' },
        },
      ];
      state = sharingReducer(state, setShares(shares));
      expect(state.shares).toHaveLength(1);

      // Stop loading
      state = sharingReducer(state, setLoading(false));
      expect(state.loading).toBe(false);

      // Update permissions
      const updatedShare = {
        id: 1,
        userId: 100,
        permissions: ['read', 'write'],
        user: { id: 100, username: 'user1', email: 'user1@example.com' },
      };
      state = sharingReducer(state, updateShare(updatedShare));
      expect(state.shares[0].permissions).toEqual(['read', 'write']);
    });

    it('should handle adding and removing shares', () => {
      const initialState = {
        shares: [],
        loading: false,
        error: null,
      };

      // Add first share
      const share1 = {
        id: 1,
        userId: 100,
        permissions: ['read'],
        user: { id: 100, username: 'user1', email: 'user1@example.com' },
      };
      let state = sharingReducer(initialState, addShare(share1));
      expect(state.shares).toHaveLength(1);

      // Add second share
      const share2 = {
        id: 2,
        userId: 200,
        permissions: ['read', 'write'],
        user: { id: 200, username: 'user2', email: 'user2@example.com' },
      };
      state = sharingReducer(state, addShare(share2));
      expect(state.shares).toHaveLength(2);

      // Remove first share
      state = sharingReducer(state, removeShare(1));
      expect(state.shares).toHaveLength(1);
      expect(state.shares[0].id).toBe(2);

      // Clear all shares
      state = sharingReducer(state, clearShares());
      expect(state.shares).toHaveLength(0);
    });

    it('should handle error during share operations', () => {
      const initialState = {
        shares: [],
        loading: false,
        error: null,
      };

      // Start loading
      let state = sharingReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);

      // Set error
      state = sharingReducer(state, setError('Failed to fetch shares'));
      expect(state.error).toBe('Failed to fetch shares');

      // Stop loading
      state = sharingReducer(state, setLoading(false));
      expect(state.loading).toBe(false);

      // Clear error
      state = sharingReducer(state, clearError());
      expect(state.error).toBeNull();
    });
  });
});
