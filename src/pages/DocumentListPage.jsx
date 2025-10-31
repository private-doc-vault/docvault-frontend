import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  ToggleButton,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { Grid, List, Upload } from 'react-bootstrap-icons';
import {
  selectDocuments,
  selectPagination,
  selectFilters,
  selectDocumentsLoading,
  selectDocumentsError,
  setDocuments,
  setPagination,
  setLoading,
  setError,
  clearError,
} from '../features/documents/documentsSlice';
import documentsApi from '../api/documentsApi';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentTable from '../components/documents/DocumentTable';
import DocumentFilters from '../components/documents/DocumentFilters';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';

/**
 * DocumentListPage - Main document listing page
 * Displays documents in grid or list view with pagination and filters
 */
const DocumentListPage = () => {
  const dispatch = useDispatch();
  const documents = useSelector(selectDocuments);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectDocumentsLoading);
  const error = useSelector(selectDocumentsError);

  // Local state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showUploadModal, setShowUploadModal] = useState(false);

  /**
   * Fetch documents from API
   */
  const fetchDocuments = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      // Calculate offset from current page
      const offset = (pagination.currentPage - 1) * pagination.pageSize;

      // Build API params
      const params = {
        limit: pagination.pageSize,
        offset,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      };

      const response = await documentsApi.fetchDocuments(params);

      // Update Redux state
      dispatch(setDocuments(response.documents || response.data || []));
      dispatch(
        setPagination({
          totalItems: response.total || response.totalItems || 0,
          totalPages: response.totalPages || Math.ceil((response.total || 0) / pagination.pageSize),
        })
      );
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to load documents'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, pagination.currentPage, pagination.pageSize, filters]);

  // Fetch documents on mount and when dependencies change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    dispatch(setPagination({ currentPage: newPage }));
  };

  /**
   * Handle successful upload
   */
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    // Refresh document list
    fetchDocuments();
  };

  /**
   * Toggle between grid and list view
   */
  const viewModeRadios = [
    { name: 'Grid', value: 'grid', icon: <Grid className="me-1" /> },
    { name: 'List', value: 'list', icon: <List className="me-1" /> },
  ];

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-0">Documents</h1>
          <p className="text-muted">Manage and organize your documents</p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          {/* View Mode Toggle */}
          <ButtonGroup>
            {viewModeRadios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                variant="outline-secondary"
                name="radio"
                value={radio.value}
                checked={viewMode === radio.value}
                onChange={(e) => setViewMode(e.currentTarget.value)}
                title={`${radio.name} view`}
              >
                {radio.icon}
                <span className="d-none d-md-inline">{radio.name}</span>
              </ToggleButton>
            ))}
          </ButtonGroup>

          {/* Upload Button */}
          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
            className="d-flex align-items-center gap-2"
          >
            <Upload />
            <span className="d-none d-md-inline">Upload</span>
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <DocumentFilters />
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading documents...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <EmptyState
          icon={<Upload size={48} />}
          title="No documents found"
          message={
            filters.search || filters.category || filters.status
              ? 'Try adjusting your filters or search criteria'
              : 'Get started by uploading your first document'
          }
          action={
            <Button variant="primary" onClick={() => setShowUploadModal(true)}>
              <Upload className="me-2" />
              Upload Document
            </Button>
          }
        />
      )}

      {/* Documents Grid/List */}
      {!loading && documents.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4 mb-4">
              {documents.map((document) => (
                <Col key={document.id}>
                  <DocumentCard document={document} onUpdate={fetchDocuments} />
                </Col>
              ))}
            </Row>
          ) : (
            <DocumentTable documents={documents} onUpdate={fetchDocuments} />
          )}

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

      {/* Upload Modal */}
      <DocumentUploadModal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </Container>
  );
};

export default DocumentListPage;
