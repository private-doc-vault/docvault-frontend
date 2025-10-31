import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  documents: [],
  selectedDocument: null,
  filters: {
    search: '',
    category: null,
    status: null,
    dateFrom: null,
    dateTo: null,
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

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setDocuments: (state, action) => {
      state.documents = action.payload;
      state.loading = false;
      state.error = null;
    },
    addDocument: (state, action) => {
      state.documents.unshift(action.payload);
      state.pagination.totalItems += 1;
    },
    updateDocument: (state, action) => {
      const index = state.documents.findIndex(
        (doc) => doc.id === action.payload.id
      );
      if (index !== -1) {
        state.documents[index] = {
          ...state.documents[index],
          ...action.payload,
        };
      }
      // Also update selectedDocument if it matches
      if (state.selectedDocument?.id === action.payload.id) {
        state.selectedDocument = {
          ...state.selectedDocument,
          ...action.payload,
        };
      }
    },
    deleteDocument: (state, action) => {
      const documentId = action.payload;
      state.documents = state.documents.filter((doc) => doc.id !== documentId);
      state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      // Clear selectedDocument if it was deleted
      if (state.selectedDocument?.id === documentId) {
        state.selectedDocument = null;
      }
    },
    setSelectedDocument: (state, action) => {
      state.selectedDocument = action.payload;
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
  },
});

export const {
  setDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  setSelectedDocument,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentPage,
  setLoading,
  setError,
  clearError,
} = documentsSlice.actions;

// Selectors
export const selectDocuments = (state) => state.documents.documents;
export const selectSelectedDocument = (state) => state.documents.selectedDocument;
export const selectDocumentById = (documentId) => (state) =>
  state.documents.documents.find((doc) => doc.id === documentId);
export const selectFilters = (state) => state.documents.filters;
export const selectPagination = (state) => state.documents.pagination;
export const selectDocumentsLoading = (state) => state.documents.loading;
export const selectDocumentsError = (state) => state.documents.error;

export default documentsSlice.reducer;
