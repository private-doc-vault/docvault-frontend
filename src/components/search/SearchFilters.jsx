import { Form, Row, Col, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { selectFilters, setFilters, clearFilters } from '../../features/search/searchSlice';

/**
 * SearchFilters - Search filter component
 * Provides filtering options for search results
 */
const SearchFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);

  const handleFilterChange = (filterName, value) => {
    dispatch(setFilters({ [filterName]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <Form>
      <Row className="g-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Category</Form.Label>
            <Form.Select
              size="sm"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || null)}
            >
              <option value="">All Categories</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="contract">Contract</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Document Type</Form.Label>
            <Form.Select
              size="sm"
              value={filters.documentType || ''}
              onChange={(e) => handleFilterChange('documentType', e.target.value || null)}
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="document">Document</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Date From</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value || null)}
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Date To</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value || null)}
            />
          </Form.Group>
        </Col>

        {hasActiveFilters && (
          <Col xs={12}>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default SearchFilters;
