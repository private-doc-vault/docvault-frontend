import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Row,
  Col,
  Button,
  InputGroup,
  Card,
  Collapse,
} from 'react-bootstrap';
import { Search, FunnelFill, X } from 'react-bootstrap-icons';
import {
  selectFilters,
  setFilters,
  clearFilters,
} from '../../features/documents/documentsSlice';

// Predefined categories (these could come from an API in the future)
const CATEGORIES = [
  'Invoice',
  'Receipt',
  'Contract',
  'Report',
  'Letter',
  'Tax Document',
  'Legal',
  'Medical',
  'Personal',
  'Other',
];

// OCR status options
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

/**
 * DocumentFilters component
 * Provides search and filtering controls for documents
 */
const DocumentFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);

  // Local state for controlled inputs
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    category: filters.category || '',
    status: filters.status || '',
    dateFrom: filters.dateFrom || '',
    dateTo: filters.dateTo || '',
  });

  // Track if advanced filters are expanded
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update local state when Redux filters change
  useEffect(() => {
    setLocalFilters({
      search: filters.search || '',
      category: filters.category || '',
      status: filters.status || '',
      dateFrom: filters.dateFrom || '',
      dateTo: filters.dateTo || '',
    });
  }, [filters]);

  // Auto-expand advanced filters if any are set
  useEffect(() => {
    if (
      filters.category ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo
    ) {
      setShowAdvanced(true);
    }
  }, [filters.category, filters.status, filters.dateFrom, filters.dateTo]);

  /**
   * Handle local filter change
   */
  const handleLocalChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Apply filters to Redux (triggers document refetch)
   */
  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
  };

  /**
   * Handle search input change with debounce
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    handleLocalChange('search', value);

    // Debounce search - apply after user stops typing
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      dispatch(setFilters({ ...localFilters, search: value }));
    }, 500);
  };

  /**
   * Handle Enter key in search
   */
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(window.searchTimeout);
      handleApplyFilters();
    }
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      category: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
    dispatch(clearFilters());
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.category ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo
    );
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Row className="g-3">
          {/* Search Bar */}
          <Col xs={12} md={8} lg={6}>
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search documents by filename or content..."
                value={localFilters.search}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                aria-label="Search documents"
              />
              {localFilters.search && (
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    handleLocalChange('search', '');
                    dispatch(setFilters({ ...filters, search: '' }));
                  }}
                  title="Clear search"
                >
                  <X />
                </Button>
              )}
            </InputGroup>
          </Col>

          {/* Filter Toggle Button */}
          <Col
            xs={12}
            md={4}
            lg={6}
            className="d-flex gap-2 justify-content-md-end"
          >
            <Button
              variant={showAdvanced ? 'primary' : 'outline-secondary'}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="d-flex align-items-center gap-2"
            >
              <FunnelFill />
              <span className="d-none d-sm-inline">
                {showAdvanced ? 'Hide Filters' : 'Show Filters'}
              </span>
            </Button>

            {hasActiveFilters() && (
              <Button
                variant="outline-danger"
                onClick={handleClearFilters}
                title="Clear all filters"
              >
                Clear
              </Button>
            )}
          </Col>
        </Row>

        {/* Advanced Filters */}
        <Collapse in={showAdvanced}>
          <div>
            <hr className="my-3" />
            <Row className="g-3">
              {/* Category Filter */}
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium">Category</Form.Label>
                  <Form.Select
                    value={localFilters.category}
                    onChange={(e) =>
                      handleLocalChange('category', e.target.value)
                    }
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Status Filter */}
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium">
                    OCR Status
                  </Form.Label>
                  <Form.Select
                    value={localFilters.status}
                    onChange={(e) =>
                      handleLocalChange('status', e.target.value)
                    }
                    aria-label="Filter by status"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Date From */}
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium">From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={localFilters.dateFrom}
                    onChange={(e) =>
                      handleLocalChange('dateFrom', e.target.value)
                    }
                    max={localFilters.dateTo || undefined}
                    aria-label="Filter from date"
                  />
                </Form.Group>
              </Col>

              {/* Date To */}
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium">To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={localFilters.dateTo}
                    onChange={(e) =>
                      handleLocalChange('dateTo', e.target.value)
                    }
                    min={localFilters.dateFrom || undefined}
                    aria-label="Filter to date"
                  />
                </Form.Group>
              </Col>

              {/* Apply Button */}
              <Col xs={12}>
                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setLocalFilters({
                        search: filters.search || '',
                        category: filters.category || '',
                        status: filters.status || '',
                        dateFrom: filters.dateFrom || '',
                        dateTo: filters.dateTo || '',
                      });
                    }}
                  >
                    Reset
                  </Button>
                  <Button variant="primary" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default DocumentFilters;
