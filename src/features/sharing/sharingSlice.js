import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shares: [], // Array of share objects for current document
  loading: false,
  error: null,
};

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    setShares: (state, action) => {
      state.shares = action.payload;
      state.loading = false;
      state.error = null;
    },
    addShare: (state, action) => {
      state.shares.push(action.payload);
    },
    updateShare: (state, action) => {
      const index = state.shares.findIndex(
        (share) => share.id === action.payload.id
      );
      if (index !== -1) {
        state.shares[index] = {
          ...state.shares[index],
          ...action.payload,
        };
      }
    },
    removeShare: (state, action) => {
      const shareId = action.payload;
      state.shares = state.shares.filter((share) => share.id !== shareId);
    },
    clearShares: (state) => {
      state.shares = [];
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
  setShares,
  addShare,
  updateShare,
  removeShare,
  clearShares,
  setLoading,
  setError,
  clearError,
} = sharingSlice.actions;

// Selectors
export const selectShares = (state) => state.sharing.shares;
export const selectShareById = (shareId) => (state) =>
  state.sharing.shares.find((share) => share.id === shareId);
export const selectShareByUserId = (userId) => (state) =>
  state.sharing.shares.find((share) => share.userId === userId);
export const selectSharingLoading = (state) => state.sharing.loading;
export const selectSharingError = (state) => state.sharing.error;
export const selectShareCount = (state) => state.sharing.shares.length;

export default sharingSlice.reducer;
