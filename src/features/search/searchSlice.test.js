import searchReducer, {
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
  selectQuery,
  selectResults,
  selectFilters,
  selectSavedSearches,
  selectSavedSearchById,
  selectPagination,
  selectSearchLoading,
  selectSearchError,
} from './searchSlice';

describe('searchSlice', () => {
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

  const mockSearchResult = {
    id: 1,
    filename: 'test.pdf',
    title: 'Test Document',
    category: 'Invoice',
    tags: ['test', 'sample'],
    ocrText: 'This is a test document',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockSearchResults = [
    mockSearchResult,
    {
      id: 2,
      filename: 'test2.pdf',
      title: 'Test Document 2',
      category: 'Receipt',
      tags: ['test'],
      ocrText: 'Another test document',
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockSavedSearch = {
    id: 1,
    name: 'My Saved Search',
    query: 'test query',
    filters: { category: 'Invoice' },
    createdAt: '2024-01-01T00:00:00Z',
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(searchReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('setQuery', () => {
      it('should set the query', () => {
        const actual = searchReducer(initialState, setQuery('test query'));
        expect(actual.query).toBe('test query');
      });

      it('should reset to page 1 when query changes', () => {
        const state = { ...initialState, pagination: { ...initialState.pagination, currentPage: 3 } };
        const actual = searchReducer(state, setQuery('new query'));
        expect(actual.pagination.currentPage).toBe(1);
      });
    });

    describe('setResults', () => {
      it('should set search results', () => {
        const actual = searchReducer(initialState, setResults(mockSearchResults));
        expect(actual.results).toEqual(mockSearchResults);
        expect(actual.loading).toBe(false);
        expect(actual.error).toBe(null);
      });

      it('should replace existing results', () => {
        const state = { ...initialState, results: [mockSearchResult] };
        const newResults = [mockSearchResults[1]];
        const actual = searchReducer(state, setResults(newResults));
        expect(actual.results).toEqual(newResults);
      });
    });

    describe('setFilters', () => {
      it('should set filters', () => {
        const filters = { category: 'Invoice', dateFrom: '2024-01-01' };
        const actual = searchReducer(initialState, setFilters(filters));
        expect(actual.filters.category).toBe('Invoice');
        expect(actual.filters.dateFrom).toBe('2024-01-01');
      });

      it('should merge with existing filters', () => {
        const state = {
          ...initialState,
          filters: { ...initialState.filters, category: 'Invoice' },
        };
        const actual = searchReducer(state, setFilters({ dateFrom: '2024-01-01' }));
        expect(actual.filters.category).toBe('Invoice');
        expect(actual.filters.dateFrom).toBe('2024-01-01');
      });

      it('should reset to page 1 when filters change', () => {
        const state = { ...initialState, pagination: { ...initialState.pagination, currentPage: 3 } };
        const actual = searchReducer(state, setFilters({ category: 'Invoice' }));
        expect(actual.pagination.currentPage).toBe(1);
      });
    });

    describe('clearFilters', () => {
      it('should reset filters to initial state', () => {
        const state = {
          ...initialState,
          filters: {
            category: 'Invoice',
            dateFrom: '2024-01-01',
            dateTo: '2024-01-31',
            documentType: 'pdf',
          },
        };
        const actual = searchReducer(state, clearFilters());
        expect(actual.filters).toEqual(initialState.filters);
      });

      it('should reset to page 1', () => {
        const state = {
          ...initialState,
          pagination: { ...initialState.pagination, currentPage: 3 },
        };
        const actual = searchReducer(state, clearFilters());
        expect(actual.pagination.currentPage).toBe(1);
      });
    });

    describe('setSavedSearches', () => {
      it('should set saved searches', () => {
        const savedSearches = [mockSavedSearch];
        const actual = searchReducer(initialState, setSavedSearches(savedSearches));
        expect(actual.savedSearches).toEqual(savedSearches);
      });

      it('should replace existing saved searches', () => {
        const state = { ...initialState, savedSearches: [mockSavedSearch] };
        const newSavedSearches = [{ ...mockSavedSearch, id: 2, name: 'New Search' }];
        const actual = searchReducer(state, setSavedSearches(newSavedSearches));
        expect(actual.savedSearches).toEqual(newSavedSearches);
      });
    });

    describe('addSavedSearch', () => {
      it('should add a saved search to the beginning of the list', () => {
        const actual = searchReducer(initialState, addSavedSearch(mockSavedSearch));
        expect(actual.savedSearches).toHaveLength(1);
        expect(actual.savedSearches[0]).toEqual(mockSavedSearch);
      });

      it('should prepend to existing saved searches', () => {
        const state = { ...initialState, savedSearches: [mockSavedSearch] };
        const newSearch = { ...mockSavedSearch, id: 2, name: 'New Search' };
        const actual = searchReducer(state, addSavedSearch(newSearch));
        expect(actual.savedSearches).toHaveLength(2);
        expect(actual.savedSearches[0]).toEqual(newSearch);
        expect(actual.savedSearches[1]).toEqual(mockSavedSearch);
      });
    });

    describe('updateSavedSearch', () => {
      it('should update an existing saved search', () => {
        const state = { ...initialState, savedSearches: [mockSavedSearch] };
        const updates = { id: 1, name: 'Updated Search' };
        const actual = searchReducer(state, updateSavedSearch(updates));
        expect(actual.savedSearches[0].name).toBe('Updated Search');
        expect(actual.savedSearches[0].query).toBe(mockSavedSearch.query);
      });

      it('should not modify other saved searches', () => {
        const secondSearch = { ...mockSavedSearch, id: 2, name: 'Second Search' };
        const state = { ...initialState, savedSearches: [mockSavedSearch, secondSearch] };
        const updates = { id: 1, name: 'Updated Search' };
        const actual = searchReducer(state, updateSavedSearch(updates));
        expect(actual.savedSearches[0].name).toBe('Updated Search');
        expect(actual.savedSearches[1]).toEqual(secondSearch);
      });

      it('should do nothing if saved search not found', () => {
        const state = { ...initialState, savedSearches: [mockSavedSearch] };
        const updates = { id: 999, name: 'Non-existent' };
        const actual = searchReducer(state, updateSavedSearch(updates));
        expect(actual.savedSearches).toEqual(state.savedSearches);
      });
    });

    describe('deleteSavedSearch', () => {
      it('should delete a saved search by id', () => {
        const state = { ...initialState, savedSearches: [mockSavedSearch] };
        const actual = searchReducer(state, deleteSavedSearch(1));
        expect(actual.savedSearches).toHaveLength(0);
      });

      it('should only delete the specified saved search', () => {
        const secondSearch = { ...mockSavedSearch, id: 2, name: 'Second Search' };
        const state = { ...initialState, savedSearches: [mockSavedSearch, secondSearch] };
        const actual = searchReducer(state, deleteSavedSearch(1));
        expect(actual.savedSearches).toHaveLength(1);
        expect(actual.savedSearches[0]).toEqual(secondSearch);
      });

      it('should do nothing if saved search not found', () => {
        const state = { ...initialState, savedSearches: [mockSavedSearch] };
        const actual = searchReducer(state, deleteSavedSearch(999));
        expect(actual.savedSearches).toEqual(state.savedSearches);
      });
    });

    describe('setPagination', () => {
      it('should update pagination', () => {
        const pagination = { currentPage: 2, totalItems: 50, totalPages: 3 };
        const actual = searchReducer(initialState, setPagination(pagination));
        expect(actual.pagination.currentPage).toBe(2);
        expect(actual.pagination.totalItems).toBe(50);
        expect(actual.pagination.totalPages).toBe(3);
        expect(actual.pagination.pageSize).toBe(20); // Should preserve existing values
      });

      it('should merge with existing pagination', () => {
        const state = {
          ...initialState,
          pagination: { ...initialState.pagination, totalItems: 100 },
        };
        const actual = searchReducer(state, setPagination({ currentPage: 2 }));
        expect(actual.pagination.currentPage).toBe(2);
        expect(actual.pagination.totalItems).toBe(100);
      });
    });

    describe('setCurrentPage', () => {
      it('should set current page', () => {
        const actual = searchReducer(initialState, setCurrentPage(3));
        expect(actual.pagination.currentPage).toBe(3);
      });

      it('should not affect other pagination properties', () => {
        const state = {
          ...initialState,
          pagination: { ...initialState.pagination, totalItems: 100, totalPages: 5 },
        };
        const actual = searchReducer(state, setCurrentPage(2));
        expect(actual.pagination.currentPage).toBe(2);
        expect(actual.pagination.totalItems).toBe(100);
        expect(actual.pagination.totalPages).toBe(5);
      });
    });

    describe('setLoading', () => {
      it('should set loading to true', () => {
        const actual = searchReducer(initialState, setLoading(true));
        expect(actual.loading).toBe(true);
      });

      it('should set loading to false', () => {
        const state = { ...initialState, loading: true };
        const actual = searchReducer(state, setLoading(false));
        expect(actual.loading).toBe(false);
      });
    });

    describe('setError', () => {
      it('should set error message', () => {
        const errorMessage = 'Search failed';
        const actual = searchReducer(initialState, setError(errorMessage));
        expect(actual.error).toBe(errorMessage);
        expect(actual.loading).toBe(false);
      });

      it('should set loading to false when error occurs', () => {
        const state = { ...initialState, loading: true };
        const actual = searchReducer(state, setError('Error'));
        expect(actual.loading).toBe(false);
      });
    });

    describe('clearError', () => {
      it('should clear error', () => {
        const state = { ...initialState, error: 'Some error' };
        const actual = searchReducer(state, clearError());
        expect(actual.error).toBe(null);
      });
    });

    describe('clearSearch', () => {
      it('should reset query, results, filters, and pagination', () => {
        const state = {
          ...initialState,
          query: 'test',
          results: mockSearchResults,
          filters: { category: 'Invoice', dateFrom: '2024-01-01' },
          pagination: { ...initialState.pagination, currentPage: 3, totalItems: 50 },
          error: 'Some error',
        };
        const actual = searchReducer(state, clearSearch());
        expect(actual.query).toBe('');
        expect(actual.results).toEqual([]);
        expect(actual.filters).toEqual(initialState.filters);
        expect(actual.pagination).toEqual(initialState.pagination);
        expect(actual.error).toBe(null);
      });

      it('should preserve saved searches and loading state', () => {
        const state = {
          ...initialState,
          query: 'test',
          savedSearches: [mockSavedSearch],
          loading: true,
        };
        const actual = searchReducer(state, clearSearch());
        expect(actual.savedSearches).toEqual([mockSavedSearch]);
        expect(actual.loading).toBe(true);
      });
    });
  });

  describe('selectors', () => {
    const mockState = {
      search: {
        query: 'test query',
        results: mockSearchResults,
        filters: { category: 'Invoice', dateFrom: '2024-01-01' },
        savedSearches: [mockSavedSearch, { ...mockSavedSearch, id: 2, name: 'Second Search' }],
        pagination: { currentPage: 2, pageSize: 20, totalItems: 50, totalPages: 3 },
        loading: true,
        error: 'Search error',
      },
    };

    it('should select query', () => {
      expect(selectQuery(mockState)).toBe('test query');
    });

    it('should select results', () => {
      expect(selectResults(mockState)).toEqual(mockSearchResults);
    });

    it('should select filters', () => {
      expect(selectFilters(mockState)).toEqual({ category: 'Invoice', dateFrom: '2024-01-01' });
    });

    it('should select saved searches', () => {
      expect(selectSavedSearches(mockState)).toHaveLength(2);
      expect(selectSavedSearches(mockState)[0]).toEqual(mockSavedSearch);
    });

    it('should select saved search by id', () => {
      const selector = selectSavedSearchById(1);
      expect(selector(mockState)).toEqual(mockSavedSearch);
    });

    it('should return undefined for non-existent saved search', () => {
      const selector = selectSavedSearchById(999);
      expect(selector(mockState)).toBeUndefined();
    });

    it('should select pagination', () => {
      expect(selectPagination(mockState)).toEqual({
        currentPage: 2,
        pageSize: 20,
        totalItems: 50,
        totalPages: 3,
      });
    });

    it('should select loading state', () => {
      expect(selectSearchLoading(mockState)).toBe(true);
    });

    it('should select error', () => {
      expect(selectSearchError(mockState)).toBe('Search error');
    });
  });
});
