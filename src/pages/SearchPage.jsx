import { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Card,
  Button,
} from 'react-bootstrap';
import { Search as SearchIcon, BookmarkPlus } from 'react-bootstrap-icons';
import {
  selectQuery,
  selectResults,
  selectFilters,
  selectPagination,
  selectSearchLoading,
  selectSearchError,
  setResults,
  setPagination,
  setLoading,
  setError,
  clearError,
} from '../features/search/searchSlice';
import searchApi from '../api/searchApi';
import SearchBar from '../components/search/SearchBar';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import SavedSearchList from '../components/search/SavedSearchList';
import SaveSearchModal from '../components/search/SaveSearchModal';
import SearchExport from '../components/search/SearchExport';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import useDebounce from '../hooks/useDebounce';

/**
 * SearchPage - Document search page
 * Provides full-text search with filters and saved searches
 */
const SearchPage = () => {
  const dispatch = useDispatch();
  const query = useSelector(selectQuery);
  const results = useSelector(selectResults);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectSearchLoading);
  const error = useSelector(selectSearchError);

  // Local state
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Debounce filters to avoid excessive API calls
  const debouncedFilters = useDebounce(filters, 500);

  // Track initial mount to prevent search on first render
  const isInitialMount = useRef(true);

  /**
   * Perform search
   */
  const performSearch = useCallback(async () => {
    // Don't search if query is empty and no filters
    if (!query.trim() && !Object.values(debouncedFilters).some((v) => v)) {
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      // Calculate offset from current page
      const offset = (pagination.currentPage - 1) * pagination.pageSize;

      // Build search params
      const params = {
        query: query.trim(),
        filters: debouncedFilters,
        limit: pagination.pageSize,
        offset,
      };

      const response = await searchApi.searchDocuments(params);

      // Update Redux state
      dispatch(setResults(response.results || response.hits || []));
      dispatch(
        setPagination({
          totalItems: response.total || response.estimatedTotalHits || 0,
          totalPages: Math.ceil(
            (response.total || response.estimatedTotalHits || 0) /
              pagination.pageSize
          ),
        })
      );
    } catch (err) {
      console.error('Search failed:', err);
      dispatch(
        setError(
          err.response?.data?.message || 'Search failed. Please try again.'
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [
    dispatch,
    query,
    debouncedFilters,
    pagination.currentPage,
    pagination.pageSize,
  ]);

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    dispatch(setPagination({ currentPage: newPage }));
  };

  /**
   * Handle search submission from SearchBar
   * This is called both on manual search button click and debounced auto-search
   */
  const handleSearch = useCallback(() => {
    // Reset to first page when performing new search (not when paginating)
    if (pagination.currentPage !== 1) {
      dispatch(setPagination({ currentPage: 1 }));
    } else {
      performSearch();
    }
  }, [dispatch, pagination.currentPage, performSearch]);

  /**
   * Perform search when page changes (for pagination)
   */
  useEffect(() => {
    if (query.trim() || Object.values(debouncedFilters).some((v) => v)) {
      performSearch();
    }
  }, [pagination.currentPage, performSearch]); // Trigger on page change

  /**
   * Perform search when debounced filters change
   */
  useEffect(() => {
    // Skip search on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Reset to first page when filters change
    if (pagination.currentPage !== 1) {
      dispatch(setPagination({ currentPage: 1 }));
    } else {
      // If already on page 1, trigger search directly
      if (query.trim() || Object.values(debouncedFilters).some((v) => v)) {
        performSearch();
      }
    }
  }, [debouncedFilters]); // Only trigger when debounced filters change

  // Determine if we have search criteria
  const hasSearchCriteria =
    query.trim() || Object.values(filters).some((v) => v);
  const hasResults = results.length > 0;

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-0">Search Documents</h1>
          <p className="text-muted">
            Search across all your documents using full-text search
          </p>
        </Col>
        {hasSearchCriteria && (
          <Col xs="auto" className="d-flex align-items-center gap-2">
            <SearchExport />
            <Button
              variant="outline-primary"
              onClick={() => setShowSaveModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <BookmarkPlus />
              <span className="d-none d-md-inline">Save Search</span>
            </Button>
          </Col>
        )}
      </Row>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col>
          <SearchBar onSearch={handleSearch} />
        </Col>
      </Row>

      <Row>
        {/* Main Content */}
        <Col lg={9}>
          {/* Filters */}
          <Card className="mb-4">
            <Card.Body>
              <SearchFilters />
            </Card.Body>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => dispatch(clearError())}
            >
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Searching...</span>
              </Spinner>
              <p className="mt-3 text-muted">Searching documents...</p>
            </div>
          )}

          {/* Empty State - No Search Criteria */}
          {!loading && !hasSearchCriteria && (
            <EmptyState
              icon={<SearchIcon size={48} />}
              title="Start searching"
              message="Enter keywords or use filters to search your documents"
            />
          )}

          {/* Empty State - No Results */}
          {!loading && hasSearchCriteria && !hasResults && (
            <EmptyState
              icon={<SearchIcon size={48} />}
              title="No results found"
              message="Try different keywords or adjust your filters"
            />
          )}

          {/* Search Results */}
          {!loading && hasResults && (
            <>
              <SearchResults results={results} query={query} />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Row className="mt-4">
                  <Col className="d-flex justify-content-center">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      totalItems={pagination.totalItems}
                      pageSize={pagination.pageSize}
                    />
                  </Col>
                </Row>
              )}
            </>
          )}
        </Col>

        {/* Sidebar - Saved Searches */}
        <Col lg={3}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Saved Searches</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <SavedSearchList />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Save Search Modal */}
      <SaveSearchModal
        show={showSaveModal}
        onHide={() => setShowSaveModal(false)}
      />
    </Container>
  );
};

export default SearchPage;
