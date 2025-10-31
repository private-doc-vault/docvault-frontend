import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Table,
  Badge,
  Button,
  ButtonGroup,
  Dropdown,
} from 'react-bootstrap';
import {
  ArrowUp,
  ArrowDown,
  Download,
  Pencil,
  Trash,
  Eye,
  ThreeDotsVertical,
} from 'react-bootstrap-icons';
import { format } from 'date-fns';
import documentsApi from '../../api/documentsApi';

/**
 * Get badge variant based on OCR status
 */
const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'processing':
      return 'primary';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

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
 * DocumentTable - Table component for displaying documents in list view
 */
const DocumentTable = ({ documents, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [downloading, setDownloading] = useState({});

  /**
   * Handle column sort
   */
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  /**
   * Sort documents
   */
  const sortedDocuments = [...documents].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle special cases
    if (sortField === 'fileSize' || sortField === 'size') {
      aVal = a.fileSize || a.size || 0;
      bVal = b.fileSize || b.size || 0;
    }

    // Handle dates
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    // Handle strings
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal?.toLowerCase() || '';
    }

    // Compare
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  /**
   * Render sort indicator
   */
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="ms-1" />
    ) : (
      <ArrowDown size={14} className="ms-1" />
    );
  };

  /**
   * Handle document download
   */
  const handleDownload = async (document) => {
    try {
      setDownloading((prev) => ({ ...prev, [document.id]: true }));
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
      setDownloading((prev) => ({ ...prev, [document.id]: false }));
    }
  };

  /**
   * Handle document deletion
   */
  const handleDelete = async (document) => {
    if (!window.confirm(`Are you sure you want to delete "${document.filename}"?`)) {
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
  const handleViewDetails = (document) => {
    navigate(`/documents/${document.id}`);
  };

  /**
   * Navigate to edit page
   */
  const handleEdit = (document) => {
    navigate(`/documents/${document.id}/edit`);
  };

  return (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead className="table-light">
          <tr>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort('filename')}
            >
              Filename {renderSortIndicator('filename')}
            </th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort('category')}
              className="d-none d-md-table-cell"
            >
              Category {renderSortIndicator('category')}
            </th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort('ocrStatus')}
            >
              Status {renderSortIndicator('ocrStatus')}
            </th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort('fileSize')}
              className="d-none d-lg-table-cell"
            >
              Size {renderSortIndicator('fileSize')}
            </th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort('createdAt')}
              className="d-none d-lg-table-cell"
            >
              Uploaded {renderSortIndicator('createdAt')}
            </th>
            <th className="text-end" style={{ width: '120px' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDocuments.map((document) => (
            <tr
              key={document.id}
              style={{ cursor: 'pointer' }}
              onClick={() => handleViewDetails(document)}
            >
              {/* Filename */}
              <td>
                <div className="d-flex flex-column">
                  <span className="fw-medium text-truncate" style={{ maxWidth: '300px' }}>
                    {document.title || document.filename}
                  </span>
                  {document.title && (
                    <small className="text-muted text-truncate" style={{ maxWidth: '300px' }}>
                      {document.filename}
                    </small>
                  )}
                  {/* Tags on mobile */}
                  {document.tags && document.tags.length > 0 && (
                    <div className="d-md-none mt-1">
                      {document.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} bg="secondary" className="me-1 small">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </td>

              {/* Category */}
              <td className="d-none d-md-table-cell">
                {document.category ? (
                  <Badge bg="info">{document.category}</Badge>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>

              {/* Status */}
              <td>
                <Badge bg={getStatusVariant(document.ocrStatus)}>
                  {document.ocrStatus || 'unknown'}
                </Badge>
              </td>

              {/* File Size */}
              <td className="d-none d-lg-table-cell">
                {formatFileSize(document.fileSize || document.size)}
              </td>

              {/* Upload Date */}
              <td className="d-none d-lg-table-cell">
                {document.createdAt
                  ? format(new Date(document.createdAt), 'MMM d, yyyy')
                  : 'N/A'}
              </td>

              {/* Actions */}
              <td className="text-end" onClick={(e) => e.stopPropagation()}>
                {/* Desktop Actions */}
                <ButtonGroup size="sm" className="d-none d-lg-flex">
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleViewDetails(document)}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleEdit(document)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleDownload(document)}
                    disabled={downloading[document.id]}
                    title="Download"
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleDelete(document)}
                    title="Delete"
                  >
                    <Trash size={16} />
                  </Button>
                </ButtonGroup>

                {/* Mobile Dropdown */}
                <Dropdown className="d-lg-none">
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <ThreeDotsVertical />
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end">
                    <Dropdown.Item onClick={() => handleViewDetails(document)}>
                      <Eye className="me-2" />
                      View Details
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleEdit(document)}>
                      <Pencil className="me-2" />
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleDownload(document)}
                      disabled={downloading[document.id]}
                    >
                      <Download className="me-2" />
                      {downloading[document.id] ? 'Downloading...' : 'Download'}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => handleDelete(document)}
                      className="text-danger"
                    >
                      <Trash className="me-2" />
                      Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {documents.length === 0 && (
        <div className="text-center py-5 text-muted">
          <p>No documents to display</p>
        </div>
      )}
    </div>
  );
};

DocumentTable.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      filename: PropTypes.string.isRequired,
      title: PropTypes.string,
      ocrStatus: PropTypes.string,
      createdAt: PropTypes.string,
      fileSize: PropTypes.number,
      size: PropTypes.number,
      category: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default DocumentTable;
