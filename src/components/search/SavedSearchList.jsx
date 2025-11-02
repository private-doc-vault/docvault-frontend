import { useState, useEffect } from 'react';
import { ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Search, Trash } from 'react-bootstrap-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSavedSearches,
  setSavedSearches,
  deleteSavedSearch as deleteSavedSearchAction,
  setQuery,
  setFilters,
} from '../../features/search/searchSlice';
import searchApi from '../../api/searchApi';

/**
 * SavedSearchList - Display and manage saved searches
 */
const SavedSearchList = () => {
  const dispatch = useDispatch();
  const savedSearches = useSelector(selectSavedSearches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load saved searches on mount
   */
  useEffect(() => {
    const loadSavedSearches = async () => {
      try {
        setLoading(true);
        const searches = await searchApi.getSavedSearches();
        dispatch(setSavedSearches(searches));
      } catch (err) {
        console.error('Failed to load saved searches:', err);
        setError('Failed to load saved searches');
      } finally {
        setLoading(false);
      }
    };

    loadSavedSearches();
  }, [dispatch]);

  /**
   * Load a saved search
   */
  const handleLoadSearch = (search) => {
    dispatch(setQuery(search.query || ''));
    dispatch(setFilters(search.filters || {}));
  };

  /**
   * Delete a saved search
   */
  const handleDeleteSearch = async (searchId, e) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    try {
      await searchApi.deleteSavedSearch(searchId);
      dispatch(deleteSavedSearchAction(searchId));
    } catch (err) {
      console.error('Failed to delete saved search:', err);
      alert('Failed to delete saved search');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3 mb-0">
        {error}
      </Alert>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="text-center text-muted py-4 px-3">
        <Search size={32} className="mb-2 opacity-50" />
        <p className="small mb-0">No saved searches yet</p>
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {savedSearches.map((search) => (
        <ListGroup.Item
          key={search.id}
          action
          onClick={() => handleLoadSearch(search)}
          className="d-flex justify-content-between align-items-start"
        >
          <div className="flex-grow-1">
            <div className="fw-semibold small">{search.name}</div>
            {search.query && (
              <div className="text-muted small text-truncate">
                {search.query}
              </div>
            )}
            {search.filters && Object.keys(search.filters).length > 0 && (
              <Badge bg="secondary" className="mt-1">
                {Object.keys(search.filters).length} filter
                {Object.keys(search.filters).length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button
            variant="link"
            size="sm"
            className="text-danger p-0 ms-2"
            onClick={(e) => handleDeleteSearch(search.id, e)}
            title="Delete saved search"
          >
            <Trash />
          </Button>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default SavedSearchList;
