import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Breadcrumb,
  ButtonGroup,
} from 'react-bootstrap';
import {
  ArrowLeft,
  Download,
  Pencil,
  Trash,
  Share,
  Eye,
  Clock,
  FileEarmark,
  Tag,
  Folder,
} from 'react-bootstrap-icons';
import { format } from 'date-fns';
import documentsApi from '../api/documentsApi';
import {
  selectSelectedDocument,
  setSelectedDocument,
  deleteDocument as deleteDocumentAction,
} from '../features/documents/documentsSlice';
import OcrStatusBadge from '../components/ocr/OcrStatusBadge';
import OcrProgressBar from '../components/ocr/OcrProgressBar';
import OcrTextViewer from '../components/ocr/OcrTextViewer';
import useOcrPolling from '../hooks/useOcrPolling';
import ShareModal from '../components/documents/ShareModal';
import DocumentAuditLog from '../components/audit/DocumentAuditLog';

/**
 * Format file size to human readable format
 */
const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

/**
 * DocumentDetailPage - Display full document details
 */
const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedDocument = useSelector(selectSelectedDocument);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Use OCR polling hook for documents in processing/pending status
  useOcrPolling(id, {
    enabled: selectedDocument?.ocrStatus === 'processing' || selectedDocument?.ocrStatus === 'pending',
    onComplete: () => {
      console.log('OCR processing completed!');
      // Refetch document to get latest data
      if (id) {
        documentsApi.fetchDocumentById(id).then((data) => {
          dispatch(setSelectedDocument(data));
        });
      }
    },
    onError: (errorMsg) => {
      console.error('OCR processing failed:', errorMsg);
    },
  });

  /**
   * Fetch document details
   */
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await documentsApi.fetchDocumentById(id);
        dispatch(setSelectedDocument(data));

        // Try to load thumbnail
        try {
          const thumbUrl = await documentsApi.getDocumentThumbnail(id);
          setThumbnailUrl(thumbUrl);
        } catch (thumbError) {
          // Thumbnail not available, that's okay
          console.log('Thumbnail not available:', thumbError);
        }
      } catch (err) {
        console.error('Failed to fetch document:', err);
        setError(err.response?.data?.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }

    // Cleanup
    return () => {
      dispatch(setSelectedDocument(null));
    };
  }, [id, dispatch]);

  /**
   * Handle document download
   */
  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await documentsApi.downloadDocument(id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = selectedDocument.filename || `document-${id}`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Handle document deletion
   */
  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${selectedDocument.filename}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await documentsApi.deleteDocument(id);

      // Remove from Redux state
      dispatch(deleteDocumentAction(id));

      // Navigate back to document list
      navigate('/documents', {
        replace: true,
        state: { message: 'Document deleted successfully' }
      });
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document. Please try again.');
      setDeleting(false);
    }
  };

  /**
   * Navigate to edit page
   */
  const handleEdit = () => {
    navigate(`/documents/${id}/edit`);
  };

  /**
   * Handle retry OCR processing
   */
  const handleRetryOcr = async () => {
    try {
      setRetrying(true);
      await documentsApi.retryOcrProcessing(id);

      // Refetch document to get updated status
      const data = await documentsApi.fetchDocumentById(id);
      dispatch(setSelectedDocument(data));

      // Polling will automatically start if status is processing/pending
      alert('OCR processing has been restarted.');
    } catch (error) {
      console.error('Failed to retry OCR:', error);
      alert('Failed to retry OCR processing. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  /**
   * Handle share button click
   */
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading document...</p>
      </Container>
    );
  }

  // Error state
  if (error || !selectedDocument) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Document not found'}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={() => navigate('/documents')}>
              Back to Documents
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const doc = selectedDocument;

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item onClick={() => navigate('/documents')} style={{ cursor: 'pointer' }}>
          Documents
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{doc.title || doc.filename}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/documents')}
            >
              <ArrowLeft className="me-1" /> Back
            </Button>
          </div>
          <h1 className="h3 mb-2">{doc.title || doc.filename}</h1>
          {doc.title && <p className="text-muted mb-0">{doc.filename}</p>}
        </Col>
        <Col xs="auto" className="d-flex align-items-start gap-2">
          <ButtonGroup>
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="me-2" />
              {downloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button variant="outline-primary" onClick={handleEdit}>
              <Pencil className="me-2" />
              Edit
            </Button>
          </ButtonGroup>
          <Button
            variant="outline-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash className="me-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Col>
      </Row>

      <Row>
        {/* Document Preview */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <Eye className="me-2" />
                Preview
              </h5>
            </Card.Header>
            <Card.Body className="bg-light" style={{ minHeight: '500px' }}>
              {thumbnailUrl ? (
                <div className="text-center">
                  <img
                    src={thumbnailUrl}
                    alt={doc.filename}
                    className="img-fluid"
                    style={{ maxHeight: '700px', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                  <FileEarmark size={64} className="mb-3" />
                  <p>Preview not available</p>
                  <Button variant="primary" onClick={handleDownload}>
                    Download to View
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* OCR Text (if available) */}
          {doc.ocrStatus === 'completed' && (
            <OcrTextViewer
              documentId={id}
              ocrText={doc.ocrText}
              className="mb-4"
            />
          )}

          {/* Audit Log */}
          <DocumentAuditLog documentId={id} />
        </Col>

        {/* Document Metadata */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Document Information</h5>
            </Card.Header>
            <Card.Body>
              {/* OCR Status */}
              <div className="mb-3">
                <strong className="d-block mb-1">OCR Status</strong>
                <div className="d-flex align-items-center gap-2">
                  <OcrStatusBadge status={doc.ocrStatus || 'unknown'} />
                  {doc.ocrStatus === 'failed' && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0"
                      onClick={handleRetryOcr}
                      disabled={retrying}
                    >
                      {retrying ? 'Retrying...' : 'Retry'}
                    </Button>
                  )}
                </div>

                {/* OCR Progress Bar */}
                {(doc.ocrStatus === 'processing' || doc.ocrStatus === 'pending') && (
                  <div className="mt-2">
                    <OcrProgressBar
                      progress={doc.ocrProgress || 0}
                      status={doc.ocrStatus}
                      size="default"
                      showLabel={true}
                    />
                  </div>
                )}
              </div>

              {/* File Size */}
              <div className="mb-3">
                <strong className="d-block mb-1">
                  <FileEarmark className="me-1" />
                  File Size
                </strong>
                <span className="text-muted">
                  {formatFileSize(doc.fileSize || doc.size)}
                </span>
              </div>

              {/* Upload Date */}
              <div className="mb-3">
                <strong className="d-block mb-1">
                  <Clock className="me-1" />
                  Uploaded
                </strong>
                <span className="text-muted">
                  {doc.createdAt
                    ? format(new Date(doc.createdAt), 'PPpp')
                    : 'N/A'}
                </span>
              </div>

              {/* Last Modified */}
              {doc.updatedAt && doc.updatedAt !== doc.createdAt && (
                <div className="mb-3">
                  <strong className="d-block mb-1">Last Modified</strong>
                  <span className="text-muted">
                    {format(new Date(doc.updatedAt), 'PPpp')}
                  </span>
                </div>
              )}

              {/* Category */}
              <div className="mb-3">
                <strong className="d-block mb-1">
                  <Folder className="me-1" />
                  Category
                </strong>
                {doc.category ? (
                  <Badge bg="info">{doc.category}</Badge>
                ) : (
                  <span className="text-muted">Not set</span>
                )}
              </div>

              {/* Tags */}
              <div className="mb-3">
                <strong className="d-block mb-1">
                  <Tag className="me-1" />
                  Tags
                </strong>
                {doc.tags && doc.tags.length > 0 ? (
                  <div className="d-flex flex-wrap gap-1">
                    {doc.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">No tags</span>
                )}
              </div>

              {/* Description */}
              {doc.description && (
                <div className="mb-3">
                  <strong className="d-block mb-1">Description</strong>
                  <p className="text-muted mb-0">{doc.description}</p>
                </div>
              )}

              {/* Uploader */}
              {doc.uploadedBy && (
                <div className="mb-3">
                  <strong className="d-block mb-1">Uploaded By</strong>
                  <span className="text-muted">
                    {doc.uploadedBy.username || doc.uploadedBy.email}
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Actions Card */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Actions</h5>
            </Card.Header>
            <Card.Body className="d-grid gap-2">
              <Button variant="outline-primary" onClick={handleEdit}>
                <Pencil className="me-2" />
                Edit Metadata
              </Button>
              <Button variant="outline-primary" onClick={handleShare}>
                <Share className="me-2" />
                Share Document
              </Button>
              <hr className="my-2" />
              <Button variant="outline-danger" onClick={handleDelete}>
                <Trash className="me-2" />
                Delete Document
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Share Modal */}
      <ShareModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        document={doc}
      />
    </Container>
  );
};

export default DocumentDetailPage;
