import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/rootReducer';
import {
  setQuery,
  setResults,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentPage,
  setLoading,
  setError,
  clearSearch,
  addSavedSearch,
  deleteSavedSearch,
} from '../../features/search/searchSlice';

describe('Search Workflow Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: rootReducer,
    });
  });

  describe('Basic Search Workflow', () => {
    it('should handle complete search workflow with query and results', () => {
      // Initial state
      expect(store.getState().search.query).toBe('');
      expect(store.getState().search.results).toEqual([]);
      expect(store.getState().search.loading).toBe(false);

      // User enters search query
      store.dispatch(setQuery('invoice 2024'));
      expect(store.getState().search.query).toBe('invoice 2024');

      // Search begins
      store.dispatch(setLoading(true));
      expect(store.getState().search.loading).toBe(true);

      // Search completes with results
      const mockResults = [
        {
          id: 1,
          filename: 'invoice-jan-2024.pdf',
          title: 'January Invoice',
          category: 'Invoice',
          ocrText: 'Invoice for January 2024',
        },
        {
          id: 2,
          filename: 'invoice-feb-2024.pdf',
          title: 'February Invoice',
          category: 'Invoice',
          ocrText: 'Invoice for February 2024',
        },
      ];

      store.dispatch(setResults(mockResults));
      store.dispatch(
        setPagination({
          totalItems: 2,
          totalPages: 1,
        })
      );

      // Verify final state
      const state = store.getState().search;
      expect(state.results).toHaveLength(2);
      expect(state.results).toEqual(mockResults);
      expect(state.loading).toBe(false);
      expect(state.pagination.totalItems).toBe(2);
      expect(state.pagination.totalPages).toBe(1);
    });

    it('should handle search with no results', () => {
      store.dispatch(setQuery('nonexistent document'));
      store.dispatch(setLoading(true));
      store.dispatch(setResults([]));
      store.dispatch(
        setPagination({
          totalItems: 0,
          totalPages: 0,
        })
      );

      const state = store.getState().search;
      expect(state.results).toHaveLength(0);
      expect(state.pagination.totalItems).toBe(0);
      expect(state.loading).toBe(false);
    });

    it('should handle search error', () => {
      store.dispatch(setQuery('test'));
      store.dispatch(setLoading(true));
      store.dispatch(setError('Search service unavailable'));

      const state = store.getState().search;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Search service unavailable');
      expect(state.results).toEqual([]);
    });
  });

  describe('Search with Filters Workflow', () => {
    it('should handle complete search workflow with filters', () => {
      // Set initial query
      store.dispatch(setQuery('invoice'));

      // Apply filters
      store.dispatch(
        setFilters({
          category: 'Invoice',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
        })
      );

      expect(store.getState().search.filters.category).toBe('Invoice');
      expect(store.getState().search.filters.dateFrom).toBe('2024-01-01');
      expect(store.getState().search.filters.dateTo).toBe('2024-12-31');

      // Verify page was reset when filters changed
      expect(store.getState().search.pagination.currentPage).toBe(1);

      // Simulate search with filters
      const filteredResults = [
        {
          id: 1,
          filename: 'invoice-2024.pdf',
          category: 'Invoice',
          createdAt: '2024-06-15',
        },
      ];

      store.dispatch(setResults(filteredResults));
      store.dispatch(setPagination({ totalItems: 1, totalPages: 1 }));

      const state = store.getState().search;
      expect(state.results).toEqual(filteredResults);
      expect(state.pagination.totalItems).toBe(1);
    });

    it('should handle progressive filter application', () => {
      // Start with query
      store.dispatch(setQuery('document'));

      // Apply category filter
      store.dispatch(setFilters({ category: 'Invoice' }));
      expect(store.getState().search.filters.category).toBe('Invoice');

      // Add date filter
      store.dispatch(setFilters({ dateFrom: '2024-01-01' }));
      const state = store.getState().search;
      expect(state.filters.category).toBe('Invoice'); // Previous filter preserved
      expect(state.filters.dateFrom).toBe('2024-01-01');

      // Add document type filter
      store.dispatch(setFilters({ documentType: 'pdf' }));
      const finalState = store.getState().search;
      expect(finalState.filters.category).toBe('Invoice');
      expect(finalState.filters.dateFrom).toBe('2024-01-01');
      expect(finalState.filters.documentType).toBe('pdf');
    });

    it('should reset pagination when filters change', () => {
      // Set up state with page 3
      store.dispatch(setQuery('test'));
      store.dispatch(setPagination({ currentPage: 3, totalPages: 5 }));
      expect(store.getState().search.pagination.currentPage).toBe(3);

      // Apply new filter
      store.dispatch(setFilters({ category: 'Invoice' }));

      // Page should reset to 1
      expect(store.getState().search.pagination.currentPage).toBe(1);
    });

    it('should clear all filters', () => {
      // Set multiple filters
      store.dispatch(
        setFilters({
          category: 'Invoice',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
          documentType: 'pdf',
        })
      );

      // Clear filters
      store.dispatch(clearFilters());

      const state = store.getState().search;
      expect(state.filters.category).toBe(null);
      expect(state.filters.dateFrom).toBe(null);
      expect(state.filters.dateTo).toBe(null);
      expect(state.filters.documentType).toBe(null);
      expect(state.pagination.currentPage).toBe(1);
    });
  });

  describe('Pagination Workflow', () => {
    it('should handle pagination through search results', () => {
      // Initial search with 50 results
      store.dispatch(setQuery('test'));
      store.dispatch(
        setPagination({
          currentPage: 1,
          pageSize: 20,
          totalItems: 50,
          totalPages: 3,
        })
      );

      // Navigate to page 2
      store.dispatch(setCurrentPage(2));
      expect(store.getState().search.pagination.currentPage).toBe(2);

      // Navigate to page 3
      store.dispatch(setCurrentPage(3));
      expect(store.getState().search.pagination.currentPage).toBe(3);

      // Navigate back to page 1
      store.dispatch(setCurrentPage(1));
      expect(store.getState().search.pagination.currentPage).toBe(1);
    });

    it('should maintain results when paginating', () => {
      const page1Results = [
        { id: 1, filename: 'doc1.pdf' },
        { id: 2, filename: 'doc2.pdf' },
      ];

      store.dispatch(setResults(page1Results));
      store.dispatch(setPagination({ currentPage: 1, totalItems: 25, totalPages: 3 }));

      expect(store.getState().search.results).toEqual(page1Results);

      // Move to page 2
      store.dispatch(setCurrentPage(2));

      // Simulate loading page 2 results
      const page2Results = [
        { id: 3, filename: 'doc3.pdf' },
        { id: 4, filename: 'doc4.pdf' },
      ];

      store.dispatch(setResults(page2Results));

      expect(store.getState().search.results).toEqual(page2Results);
      expect(store.getState().search.pagination.currentPage).toBe(2);
    });
  });

  describe('Saved Search Integration Workflow', () => {
    it('should handle saving and loading a search', () => {
      // Perform a search
      store.dispatch(setQuery('quarterly reports'));
      store.dispatch(setFilters({ category: 'Report', dateFrom: '2024-01-01' }));

      const searchQuery = store.getState().search.query;
      const searchFilters = store.getState().search.filters;

      // Save the search
      const savedSearch = {
        id: 1,
        name: 'Q1 2024 Reports',
        query: searchQuery,
        filters: {
          category: searchFilters.category,
          dateFrom: searchFilters.dateFrom,
        },
        createdAt: new Date().toISOString(),
      };

      store.dispatch(addSavedSearch(savedSearch));
      expect(store.getState().search.savedSearches).toHaveLength(1);
      expect(store.getState().search.savedSearches[0]).toEqual(savedSearch);

      // Clear current search
      store.dispatch(clearSearch());
      expect(store.getState().search.query).toBe('');
      expect(store.getState().search.filters.category).toBe(null);

      // Load saved search
      store.dispatch(setQuery(savedSearch.query));
      store.dispatch(setFilters(savedSearch.filters));

      const state = store.getState().search;
      expect(state.query).toBe('quarterly reports');
      expect(state.filters.category).toBe('Report');
      expect(state.filters.dateFrom).toBe('2024-01-01');
    });

    it('should handle multiple saved searches', () => {
      const savedSearches = [
        {
          id: 1,
          name: 'Invoices 2024',
          query: 'invoice',
          filters: { category: 'Invoice' },
        },
        {
          id: 2,
          name: 'Receipts Q1',
          query: 'receipt',
          filters: { category: 'Receipt', dateFrom: '2024-01-01' },
        },
        {
          id: 3,
          name: 'All Contracts',
          query: '',
          filters: { category: 'Contract' },
        },
      ];

      savedSearches.forEach((search) => {
        store.dispatch(addSavedSearch(search));
      });

      expect(store.getState().search.savedSearches).toHaveLength(3);

      // Delete second saved search
      store.dispatch(deleteSavedSearch(2));
      const state = store.getState().search;
      expect(state.savedSearches).toHaveLength(2);
      expect(state.savedSearches.find((s) => s.id === 2)).toBeUndefined();
    });
  });

  describe('Complex Search Workflow', () => {
    it('should handle complete workflow: query -> filter -> paginate -> modify filters -> clear', () => {
      // Step 1: Initial search
      store.dispatch(setQuery('invoice'));
      store.dispatch(setResults([
        { id: 1, filename: 'inv1.pdf' },
        { id: 2, filename: 'inv2.pdf' },
      ]));
      store.dispatch(setPagination({ currentPage: 1, totalItems: 100, totalPages: 5 }));

      expect(store.getState().search.results).toHaveLength(2);
      expect(store.getState().search.pagination.totalItems).toBe(100);

      // Step 2: Apply filter
      store.dispatch(setFilters({ category: 'Invoice' }));
      expect(store.getState().search.pagination.currentPage).toBe(1); // Reset to page 1

      // Simulate filtered results
      store.dispatch(setPagination({ totalItems: 50, totalPages: 3 }));

      // Step 3: Navigate to page 2
      store.dispatch(setCurrentPage(2));
      expect(store.getState().search.pagination.currentPage).toBe(2);

      // Step 4: Modify filters
      store.dispatch(setFilters({ dateFrom: '2024-01-01' }));
      expect(store.getState().search.pagination.currentPage).toBe(1); // Reset again

      // Step 5: Clear search
      store.dispatch(clearSearch());
      const finalState = store.getState().search;
      expect(finalState.query).toBe('');
      expect(finalState.results).toEqual([]);
      expect(finalState.filters.category).toBe(null);
      expect(finalState.pagination.currentPage).toBe(1);
    });

    it('should handle query change resetting pagination', () => {
      // Initial search on page 3
      store.dispatch(setQuery('initial query'));
      store.dispatch(setPagination({ currentPage: 3, totalPages: 5 }));
      expect(store.getState().search.pagination.currentPage).toBe(3);

      // Change query
      store.dispatch(setQuery('new query'));

      // Page should reset to 1
      expect(store.getState().search.pagination.currentPage).toBe(1);
    });

    it('should handle error recovery workflow', () => {
      // Search fails
      store.dispatch(setQuery('test'));
      store.dispatch(setLoading(true));
      store.dispatch(setError('Network error'));

      let state = store.getState().search;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');

      // User retries search
      store.dispatch(setLoading(true));

      // This time it succeeds
      store.dispatch(setResults([{ id: 1, filename: 'doc.pdf' }]));

      state = store.getState().search;
      expect(state.results).toHaveLength(1);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('State Consistency Workflow', () => {
    it('should maintain state consistency across multiple operations', () => {
      // Perform multiple operations
      store.dispatch(setQuery('test'));
      store.dispatch(setFilters({ category: 'Invoice' }));
      store.dispatch(setResults([{ id: 1 }]));
      store.dispatch(addSavedSearch({ id: 1, name: 'Test', query: 'test' }));

      const state = store.getState().search;

      // Verify all state is consistent
      expect(state.query).toBe('test');
      expect(state.filters.category).toBe('Invoice');
      expect(state.results).toHaveLength(1);
      expect(state.savedSearches).toHaveLength(1);
      expect(state.pagination.currentPage).toBe(1);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle rapid state changes', () => {
      // Simulate rapid user actions
      store.dispatch(setQuery('first'));
      store.dispatch(setQuery('second'));
      store.dispatch(setQuery('third'));

      expect(store.getState().search.query).toBe('third');
      expect(store.getState().search.pagination.currentPage).toBe(1);
    });
  });
});
