import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  query: '',
  results: [],
  filters: {
    category: null,
    dateFrom: null,
    dateTo: null,
    documentType: null,
  },
  savedSearches: [],
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
      // Reset to first page when query changes
      state.pagination.currentPage = 1;
    },
    setResults: (state, action) => {
      state.results = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    setSavedSearches: (state, action) => {
      state.savedSearches = action.payload;
    },
    addSavedSearch: (state, action) => {
      state.savedSearches.unshift(action.payload);
    },
    updateSavedSearch: (state, action) => {
      const index = state.savedSearches.findIndex(
        (search) => search.id === action.payload.id
      );
      if (index !== -1) {
        state.savedSearches[index] = {
          ...state.savedSearches[index],
          ...action.payload,
        };
      }
    },
    deleteSavedSearch: (state, action) => {
      const searchId = action.payload;
      state.savedSearches = state.savedSearches.filter(
        (search) => search.id !== searchId
      );
    },
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
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
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
      state.error = null;
    },
  },
});

export const {
  setQuery,
  setResults,
  setFilters,
  clearFilters,
  setSavedSearches,
  addSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  setPagination,
  setCurrentPage,
  setLoading,
  setError,
  clearError,
  clearSearch,
} = searchSlice.actions;

// Selectors
export const selectQuery = (state) => state.search.query;
export const selectResults = (state) => state.search.results;
export const selectFilters = (state) => state.search.filters;
export const selectSavedSearches = (state) => state.search.savedSearches;
export const selectSavedSearchById = (searchId) => (state) =>
  state.search.savedSearches.find((search) => search.id === searchId);
export const selectPagination = (state) => state.search.pagination;
export const selectSearchLoading = (state) => state.search.loading;
export const selectSearchError = (state) => state.search.error;

export default searchSlice.reducer;
