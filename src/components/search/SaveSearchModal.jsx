import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { selectQuery, selectFilters, addSavedSearch } from '../../features/search/searchSlice';
import searchApi from '../../api/searchApi';

/**
 * SaveSearchModal - Modal for saving current search
 */
const SaveSearchModal = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const query = useSelector(selectQuery);
  const filters = useSelector(selectFilters);

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a name for this search');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Build search data
      const searchData = {
        name: name.trim(),
        query: query || '',
        filters: Object.keys(filters).reduce((acc, key) => {
          if (filters[key]) {
            acc[key] = filters[key];
          }
          return acc;
        }, {}),
      };

      // Save to backend
      const savedSearch = await searchApi.saveSavedSearch(searchData);

      // Update Redux state
      dispatch(addSavedSearch(savedSearch));

      // Close modal and reset form
      setName('');
      onHide();
    } catch (err) {
      console.error('Failed to save search:', err);
      setError(err.response?.data?.message || 'Failed to save search. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setName('');
    setError(null);
    onHide();
  };

  // Check if there's anything to save
  const hasSearchCriteria = query.trim() || Object.values(filters).some(v => v);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Save Search</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {!hasSearchCriteria && (
            <Alert variant="warning" className="mb-3">
              You don't have any search criteria to save. Enter a search query or apply filters first.
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Search Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter a name for this search..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!hasSearchCriteria}
              autoFocus
            />
            <Form.Text className="text-muted">
              Give your search a descriptive name so you can find it later.
            </Form.Text>
          </Form.Group>

          {/* Display current search criteria */}
          {hasSearchCriteria && (
            <div className="bg-light p-3 rounded">
              <h6 className="small text-muted mb-2">Search Criteria:</h6>
              {query && (
                <div className="mb-1">
                  <strong>Query:</strong> {query}
                </div>
              )}
              {filters.category && (
                <div className="mb-1">
                  <strong>Category:</strong> {filters.category}
                </div>
              )}
              {filters.documentType && (
                <div className="mb-1">
                  <strong>Type:</strong> {filters.documentType}
                </div>
              )}
              {filters.dateFrom && (
                <div className="mb-1">
                  <strong>Date From:</strong> {filters.dateFrom}
                </div>
              )}
              {filters.dateTo && (
                <div className="mb-1">
                  <strong>Date To:</strong> {filters.dateTo}
                </div>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={saving || !hasSearchCriteria || !name.trim()}
          >
            {saving ? 'Saving...' : 'Save Search'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SaveSearchModal;
