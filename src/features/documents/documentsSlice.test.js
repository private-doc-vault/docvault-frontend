import documentsReducer, {
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
  selectDocuments,
  selectSelectedDocument,
  selectDocumentById,
  selectFilters,
  selectPagination,
  selectDocumentsLoading,
  selectDocumentsError,
} from './documentsSlice';

describe('documentsSlice', () => {
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

  const mockDocument = {
    id: 1,
    filename: 'test.pdf',
    title: 'Test Document',
    category: 'Invoice',
    tags: ['test', 'sample'],
    ocrStatus: 'completed',
    fileSize: 1024,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockDocuments = [
    mockDocument,
    {
      id: 2,
      filename: 'test2.pdf',
      title: 'Test Document 2',
      category: 'Receipt',
      tags: ['test'],
      ocrStatus: 'pending',
      fileSize: 2048,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(documentsReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    it('should handle setDocuments', () => {
      const actual = documentsReducer(
        initialState,
        setDocuments(mockDocuments)
      );
      expect(actual.documents).toEqual(mockDocuments);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });

    it('should handle addDocument', () => {
      const stateWithDocuments = {
        ...initialState,
        documents: [mockDocuments[0]],
        pagination: { ...initialState.pagination, totalItems: 1 },
      };

      const actual = documentsReducer(
        stateWithDocuments,
        addDocument(mockDocuments[1])
      );

      expect(actual.documents).toHaveLength(2);
      expect(actual.documents[0]).toEqual(mockDocuments[1]); // Added to front
      expect(actual.pagination.totalItems).toBe(2);
    });

    it('should handle updateDocument', () => {
      const stateWithDocuments = {
        ...initialState,
        documents: mockDocuments,
      };

      const updatedDocument = {
        ...mockDocument,
        title: 'Updated Title',
        category: 'Contract',
      };

      const actual = documentsReducer(
        stateWithDocuments,
        updateDocument(updatedDocument)
      );

      expect(actual.documents[0].title).toBe('Updated Title');
      expect(actual.documents[0].category).toBe('Contract');
      expect(actual.documents[1]).toEqual(mockDocuments[1]); // Unchanged
    });

    it('should handle updateDocument for selected document', () => {
      const stateWithSelection = {
        ...initialState,
        documents: mockDocuments,
        selectedDocument: mockDocument,
      };

      const updatedDocument = {
        ...mockDocument,
        title: 'Updated Title',
      };

      const actual = documentsReducer(
        stateWithSelection,
        updateDocument(updatedDocument)
      );

      expect(actual.selectedDocument.title).toBe('Updated Title');
      expect(actual.documents[0].title).toBe('Updated Title');
    });

    it('should handle deleteDocument', () => {
      const stateWithDocuments = {
        ...initialState,
        documents: mockDocuments,
        pagination: { ...initialState.pagination, totalItems: 2 },
      };

      const actual = documentsReducer(stateWithDocuments, deleteDocument(1));

      expect(actual.documents).toHaveLength(1);
      expect(actual.documents[0].id).toBe(2);
      expect(actual.pagination.totalItems).toBe(1);
    });

    it('should handle deleteDocument when selected', () => {
      const stateWithSelection = {
        ...initialState,
        documents: mockDocuments,
        selectedDocument: mockDocument,
        pagination: { ...initialState.pagination, totalItems: 2 },
      };

      const actual = documentsReducer(stateWithSelection, deleteDocument(1));

      expect(actual.documents).toHaveLength(1);
      expect(actual.selectedDocument).toBe(null);
    });

    it('should handle setSelectedDocument', () => {
      const actual = documentsReducer(
        initialState,
        setSelectedDocument(mockDocument)
      );

      expect(actual.selectedDocument).toEqual(mockDocument);
    });

    it('should handle setFilters', () => {
      const filters = {
        search: 'test query',
        category: 'Invoice',
        status: 'completed',
      };

      const actual = documentsReducer(initialState, setFilters(filters));

      expect(actual.filters.search).toBe('test query');
      expect(actual.filters.category).toBe('Invoice');
      expect(actual.filters.status).toBe('completed');
      expect(actual.pagination.currentPage).toBe(1); // Reset to page 1
    });

    it('should handle setFilters partially', () => {
      const stateWithFilters = {
        ...initialState,
        filters: {
          ...initialState.filters,
          search: 'existing',
          category: 'Invoice',
        },
      };

      const actual = documentsReducer(
        stateWithFilters,
        setFilters({ status: 'completed' })
      );

      expect(actual.filters.search).toBe('existing');
      expect(actual.filters.category).toBe('Invoice');
      expect(actual.filters.status).toBe('completed');
    });

    it('should handle clearFilters', () => {
      const stateWithFilters = {
        ...initialState,
        filters: {
          search: 'test',
          category: 'Invoice',
          status: 'completed',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
        },
        pagination: { ...initialState.pagination, currentPage: 5 },
      };

      const actual = documentsReducer(stateWithFilters, clearFilters());

      expect(actual.filters).toEqual(initialState.filters);
      expect(actual.pagination.currentPage).toBe(1);
    });

    it('should handle setPagination', () => {
      const pagination = {
        totalItems: 100,
        totalPages: 5,
        currentPage: 2,
      };

      const actual = documentsReducer(initialState, setPagination(pagination));

      expect(actual.pagination.totalItems).toBe(100);
      expect(actual.pagination.totalPages).toBe(5);
      expect(actual.pagination.currentPage).toBe(2);
      expect(actual.pagination.pageSize).toBe(20); // Unchanged
    });

    it('should handle setCurrentPage', () => {
      const actual = documentsReducer(initialState, setCurrentPage(3));

      expect(actual.pagination.currentPage).toBe(3);
    });

    it('should handle setLoading', () => {
      const actual = documentsReducer(initialState, setLoading(true));
      expect(actual.loading).toBe(true);

      const actual2 = documentsReducer(actual, setLoading(false));
      expect(actual2.loading).toBe(false);
    });

    it('should handle setError', () => {
      const error = 'Failed to load documents';
      const stateWithLoading = { ...initialState, loading: true };

      const actual = documentsReducer(stateWithLoading, setError(error));

      expect(actual.error).toBe(error);
      expect(actual.loading).toBe(false); // Loading cleared on error
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };

      const actual = documentsReducer(stateWithError, clearError());

      expect(actual.error).toBe(null);
    });
  });

  describe('selectors', () => {
    const mockState = {
      documents: {
        documents: mockDocuments,
        selectedDocument: mockDocument,
        filters: {
          search: 'test',
          category: 'Invoice',
          status: 'completed',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
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

    it('should select documents', () => {
      expect(selectDocuments(mockState)).toEqual(mockDocuments);
    });

    it('should select selected document', () => {
      expect(selectSelectedDocument(mockState)).toEqual(mockDocument);
    });

    it('should select document by id', () => {
      const selector = selectDocumentById(2);
      expect(selector(mockState)).toEqual(mockDocuments[1]);
    });

    it('should return undefined for non-existent document id', () => {
      const selector = selectDocumentById(999);
      expect(selector(mockState)).toBeUndefined();
    });

    it('should select filters', () => {
      expect(selectFilters(mockState)).toEqual({
        search: 'test',
        category: 'Invoice',
        status: 'completed',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
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
      expect(selectDocumentsLoading(mockState)).toBe(true);
    });

    it('should select error', () => {
      expect(selectDocumentsError(mockState)).toBe('Test error');
    });
  });

  describe('document management flow', () => {
    it('should handle complete document upload flow', () => {
      let state = initialState;

      // Start loading
      state = documentsReducer(state, setLoading(true));
      expect(state.loading).toBe(true);

      // Add uploaded document
      state = documentsReducer(state, addDocument(mockDocument));
      expect(state.documents).toHaveLength(1);
      expect(state.documents[0]).toEqual(mockDocument);

      // Stop loading
      state = documentsReducer(state, setLoading(false));
      expect(state.loading).toBe(false);
    });

    it('should handle complete document edit flow', () => {
      let state = {
        ...initialState,
        documents: [mockDocument],
        selectedDocument: mockDocument,
      };

      // Update document
      const updatedDocument = {
        ...mockDocument,
        title: 'Updated Title',
        category: 'Contract',
        tags: ['updated'],
      };

      state = documentsReducer(state, updateDocument(updatedDocument));

      expect(state.documents[0].title).toBe('Updated Title');
      expect(state.documents[0].category).toBe('Contract');
      expect(state.documents[0].tags).toEqual(['updated']);
      expect(state.selectedDocument.title).toBe('Updated Title');
    });

    it('should handle complete document delete flow', () => {
      let state = {
        ...initialState,
        documents: mockDocuments,
        selectedDocument: mockDocument,
        pagination: { ...initialState.pagination, totalItems: 2 },
      };

      // Delete document
      state = documentsReducer(state, deleteDocument(1));

      expect(state.documents).toHaveLength(1);
      expect(state.documents[0].id).toBe(2);
      expect(state.selectedDocument).toBe(null);
      expect(state.pagination.totalItems).toBe(1);
    });

    it('should handle complete filter and search flow', () => {
      let state = {
        ...initialState,
        documents: mockDocuments,
        pagination: { ...initialState.pagination, currentPage: 3 },
      };

      // Apply filters
      state = documentsReducer(
        state,
        setFilters({
          search: 'invoice',
          category: 'Invoice',
          status: 'completed',
        })
      );

      expect(state.filters.search).toBe('invoice');
      expect(state.filters.category).toBe('Invoice');
      expect(state.pagination.currentPage).toBe(1); // Reset on filter

      // Clear filters
      state = documentsReducer(state, clearFilters());

      expect(state.filters).toEqual(initialState.filters);
      expect(state.pagination.currentPage).toBe(1);
    });

    it('should handle pagination flow', () => {
      let state = initialState;

      // Load first page
      state = documentsReducer(state, setDocuments(mockDocuments));
      state = documentsReducer(
        state,
        setPagination({ totalItems: 100, totalPages: 5 })
      );

      expect(state.documents).toHaveLength(2);
      expect(state.pagination.totalPages).toBe(5);

      // Change page
      state = documentsReducer(state, setCurrentPage(2));
      expect(state.pagination.currentPage).toBe(2);
    });
  });
});
