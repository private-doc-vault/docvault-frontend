import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card, Badge, Dropdown, Spinner } from 'react-bootstrap';
import {
  ThreeDotsVertical,
  FileEarmark,
  Download,
  Pencil,
  Trash,
  Eye,
} from 'react-bootstrap-icons';
import { format } from 'date-fns';
import documentsApi from '../../api/documentsApi';
import OcrStatusBadge from '../ocr/OcrStatusBadge';
import OcrProgressBar from '../ocr/OcrProgressBar';

/**
 * Format file size to human readable format
 */
const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

/**
 * DocumentCard - Card component for displaying document in grid view
 */
const DocumentCard = ({ document, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Load thumbnail on mount
  useState(() => {
    const loadThumbnail = async () => {
      try {
        const url = await documentsApi.getDocumentThumbnail(document.id);
        setThumbnailUrl(url);
      } catch (error) {
        console.error('Failed to load thumbnail:', error);
      } finally {
        setThumbnailLoading(false);
      }
    };

    if (document.id) {
      loadThumbnail();
    }
  }, [document.id]);

  /**
   * Handle document download
   */
  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      const blob = await documentsApi.downloadDocument(document.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.filename || `document-${document.id}`;
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
  const handleDelete = async (e) => {
    e.stopPropagation();

    if (
      !window.confirm(`Are you sure you want to delete "${document.filename}"?`)
    ) {
      return;
    }

    try {
      await documentsApi.deleteDocument(document.id);
      if (onDelete) {
        onDelete(document.id);
      }
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  /**
   * Navigate to document detail page
   */
  const handleCardClick = () => {
    navigate(`/documents/${document.id}`);
  };

  /**
   * Navigate to edit page
   */
  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/documents/${document.id}/edit`);
  };

  /**
   * Format document date
   */
  const formattedDate = document.createdAt
    ? format(new Date(document.createdAt), 'MMM d, yyyy')
    : 'N/A';

  return (
    <Card
      className="h-100 document-card"
      style={{ cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      {/* Thumbnail */}
      <div
        className="position-relative bg-light d-flex align-items-center justify-content-center"
        style={{ height: '180px', overflow: 'hidden' }}
      >
        {thumbnailLoading ? (
          <Spinner animation="border" size="sm" variant="secondary" />
        ) : thumbnailUrl ? (
          <Card.Img
            variant="top"
            src={thumbnailUrl}
            alt={document.filename}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <FileEarmark size={64} className="text-muted" />
        )}

        {/* Status Badge */}
        {document.ocrStatus && (
          <div className="position-absolute top-0 start-0 m-2">
            <OcrStatusBadge status={document.ocrStatus} />
          </div>
        )}

        {/* Actions Dropdown */}
        <div className="position-absolute top-0 end-0 m-2">
          <Dropdown onClick={(e) => e.stopPropagation()}>
            <Dropdown.Toggle
              variant="light"
              size="sm"
              className="rounded-circle p-1"
              style={{ width: '32px', height: '32px' }}
            >
              <ThreeDotsVertical />
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={handleCardClick}>
                <Eye className="me-2" />
                View Details
              </Dropdown.Item>
              <Dropdown.Item onClick={handleEdit}>
                <Pencil className="me-2" />
                Edit
              </Dropdown.Item>
              <Dropdown.Item onClick={handleDownload} disabled={downloading}>
                <Download className="me-2" />
                {downloading ? 'Downloading...' : 'Download'}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleDelete} className="text-danger">
                <Trash className="me-2" />
                Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Card Body */}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate mb-2" title={document.filename}>
          {document.title || document.filename}
        </Card.Title>

        {/* Metadata */}
        <div className="text-muted small mb-2">
          <div className="d-flex justify-content-between mb-1">
            <span>Size:</span>
            <span>{formatFileSize(document.fileSize || document.size)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Uploaded:</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* OCR Progress Bar */}
        {(document.ocrStatus === 'processing' ||
          document.ocrStatus === 'pending') && (
          <div className="mb-2">
            <OcrProgressBar
              progress={document.ocrProgress || 0}
              status={document.ocrStatus}
              size="small"
              showLabel={false}
            />
          </div>
        )}

        {/* Category */}
        {document.category && (
          <div className="mt-auto">
            <Badge
              bg="info"
              className="text-truncate"
              style={{ maxWidth: '100%' }}
            >
              {document.category}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="mt-2 d-flex flex-wrap gap-1">
            {document.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} bg="secondary" className="small">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge bg="secondary" className="small">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

DocumentCard.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    filename: PropTypes.string.isRequired,
    title: PropTypes.string,
    ocrStatus: PropTypes.string,
    ocrProgress: PropTypes.number,
    createdAt: PropTypes.string,
    fileSize: PropTypes.number,
    size: PropTypes.number,
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default DocumentCard;
