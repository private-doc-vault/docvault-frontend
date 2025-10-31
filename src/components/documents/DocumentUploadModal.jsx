import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  ProgressBar,
  Alert,
  ListGroup,
  Badge,
  Row,
  Col,
} from 'react-bootstrap';
import {
  CloudUpload,
  X,
  CheckCircle,
  XCircle,
  FileEarmark,
} from 'react-bootstrap-icons';
import useDocumentUpload from '../../hooks/useDocumentUpload';

/**
 * Format file size to human readable format
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

/**
 * DocumentUploadModal component
 * Provides drag-and-drop file upload with progress tracking
 */
const DocumentUploadModal = ({ show, onHide, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [metadata, setMetadata] = useState({
    category: '',
    tags: '',
  });

  const {
    uploading,
    uploadProgress,
    uploadErrors,
    uploadMultipleFiles,
    resetUpload,
    removeFile,
    getOverallProgress,
    isUploadComplete,
  } = useDocumentUpload();

  // Reset state when modal is closed
  useEffect(() => {
    if (!show) {
      setSelectedFiles([]);
      setMetadata({ category: '', tags: '' });
      resetUpload();
    }
  }, [show, resetUpload]);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  /**
   * Add files to selection
   */
  const addFiles = (files) => {
    const validFiles = files.filter((file) => {
      // Basic validation (you can add more rules)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 100MB.`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  /**
   * Remove file from selection
   */
  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Handle drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  /**
   * Handle upload
   */
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }

    // Prepare metadata
    const uploadMetadata = {
      category: metadata.category || undefined,
      tags: metadata.tags
        ? metadata.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : undefined,
    };

    const result = await uploadMultipleFiles(selectedFiles, uploadMetadata);

    // Show success message
    if (result.successful > 0) {
      // Wait a moment to show completion before closing
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1000);
    }
  };

  /**
   * Get upload status for display
   */
  const getUploadStatus = () => {
    const progressValues = Object.values(uploadProgress);
    if (progressValues.length === 0) return null;

    const completed = progressValues.filter((p) => p.status === 'completed').length;
    const failed = progressValues.filter((p) => p.status === 'failed').length;
    const total = progressValues.length;

    return { completed, failed, total };
  };

  const uploadStatus = getUploadStatus();
  const overallProgress = getOverallProgress();
  const uploadComplete = isUploadComplete();

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop={uploading ? 'static' : true}>
      <Modal.Header closeButton={!uploading}>
        <Modal.Title>Upload Documents</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Drag and Drop Area */}
        {!uploading && selectedFiles.length === 0 && (
          <div
            className={`border rounded p-5 text-center ${
              isDragging ? 'border-primary bg-light' : 'border-secondary'
            }`}
            style={{
              borderStyle: 'dashed',
              borderWidth: '2px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload size={64} className="text-muted mb-3" />
            <h5>Drag & Drop Files Here</h5>
            <p className="text-muted mb-3">or click to browse</p>
            <Button variant="primary">Select Files</Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            />
          </div>
        )}

        {/* Selected Files List */}
        {!uploading && selectedFiles.length > 0 && (
          <>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Selected Files ({selectedFiles.length})</h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add More
                </Button>
              </div>

              <ListGroup>
                {selectedFiles.map((file, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <FileEarmark size={20} />
                      <div>
                        <div className="fw-medium">{file.name}</div>
                        <small className="text-muted">
                          {formatFileSize(file.size)}
                        </small>
                      </div>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
            </div>

            {/* Metadata Form */}
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category (optional)</Form.Label>
                    <Form.Select
                      value={metadata.category}
                      onChange={(e) =>
                        setMetadata({ ...metadata, category: e.target.value })
                      }
                    >
                      <option value="">Select category...</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Receipt">Receipt</option>
                      <option value="Contract">Contract</option>
                      <option value="Report">Report</option>
                      <option value="Letter">Letter</option>
                      <option value="Tax Document">Tax Document</option>
                      <option value="Legal">Legal</option>
                      <option value="Medical">Medical</option>
                      <option value="Personal">Personal</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tags (optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., important, tax, 2024"
                      value={metadata.tags}
                      onChange={(e) =>
                        setMetadata({ ...metadata, tags: e.target.value })
                      }
                    />
                    <Form.Text className="text-muted">
                      Separate tags with commas
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div>
            <h6 className="mb-3">Uploading Files...</h6>

            {/* Overall Progress */}
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Overall Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <ProgressBar now={overallProgress} animated={!uploadComplete} />
            </div>

            {/* Individual File Progress */}
            <ListGroup>
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <ListGroup.Item key={fileId}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      {progress.status === 'completed' && (
                        <CheckCircle className="text-success" />
                      )}
                      {progress.status === 'failed' && (
                        <XCircle className="text-danger" />
                      )}
                      <span className="fw-medium">{progress.filename}</span>
                    </div>
                    <Badge
                      bg={
                        progress.status === 'completed'
                          ? 'success'
                          : progress.status === 'failed'
                          ? 'danger'
                          : 'primary'
                      }
                    >
                      {progress.status}
                    </Badge>
                  </div>
                  {progress.status === 'uploading' && (
                    <ProgressBar now={progress.progress} animated />
                  )}
                  {uploadErrors[fileId] && (
                    <Alert variant="danger" className="mt-2 mb-0 py-1 px-2 small">
                      {uploadErrors[fileId]}
                    </Alert>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>

            {/* Upload Summary */}
            {uploadStatus && uploadComplete && (
              <Alert
                variant={uploadStatus.failed > 0 ? 'warning' : 'success'}
                className="mt-3 mb-0"
              >
                <strong>Upload Complete:</strong> {uploadStatus.completed} succeeded
                {uploadStatus.failed > 0 && `, ${uploadStatus.failed} failed`}
              </Alert>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={uploading}>
          {uploadComplete ? 'Close' : 'Cancel'}
        </Button>
        {!uploading && selectedFiles.length > 0 && (
          <Button variant="primary" onClick={handleUpload}>
            Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

DocumentUploadModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default DocumentUploadModal;
