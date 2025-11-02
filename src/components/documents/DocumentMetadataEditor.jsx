import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Breadcrumb,
  Badge,
} from 'react-bootstrap';
import { ArrowLeft, Save, X } from 'react-bootstrap-icons';
import documentsApi from '../../api/documentsApi';
import { updateDocument } from '../../features/documents/documentsSlice';

// Predefined categories
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

// Validation schema
const metadataSchema = yup.object().shape({
  title: yup.string().max(255, 'Title must not exceed 255 characters'),
  description: yup
    .string()
    .max(1000, 'Description must not exceed 1000 characters'),
  category: yup.string(),
  tags: yup.string(),
});

/**
 * DocumentMetadataEditor component
 * Form for editing document metadata
 */
const DocumentMetadataEditor = ({
  document,
  onCancel,
  onSuccess,
  inline = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: yupResolver(metadataSchema),
    defaultValues: {
      title: document?.title || '',
      description: document?.description || '',
      category: document?.category || '',
      tags: document?.tags?.join(', ') || '',
    },
  });

  // Reset form when document changes
  useEffect(() => {
    if (document) {
      reset({
        title: document.title || '',
        description: document.description || '',
        category: document.category || '',
        tags: document.tags?.join(', ') || '',
      });
    }
  }, [document, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      // Parse tags from comma-separated string
      const tags = data.tags
        ? data.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      // Prepare update data
      const updateData = {
        title: data.title || null,
        description: data.description || null,
        category: data.category || null,
        tags: tags.length > 0 ? tags : [],
      };

      // Call API to update document
      const updatedDocument = await documentsApi.updateDocument(
        document.id,
        updateData
      );

      // Update Redux state
      dispatch(updateDocument(updatedDocument));

      setSuccess(true);

      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(updatedDocument);
        }, 1000);
      } else if (!inline) {
        // Navigate back to document detail page after a delay
        setTimeout(() => {
          navigate(`/documents/${document.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to update document:', err);
      setError(
        err.response?.data?.message || 'Failed to update document metadata'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/documents/${document.id}`);
    }
  };

  /**
   * Render form content
   */
  const renderForm = () => (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Success Alert */}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
          Document metadata updated successfully!
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Title */}
      <Form.Group className="mb-3" controlId="title">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter document title (optional)"
          {...register('title')}
          isInvalid={!!errors.title}
          disabled={submitting}
        />
        <Form.Control.Feedback type="invalid">
          {errors.title?.message}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          A descriptive title for the document (defaults to filename if not set)
        </Form.Text>
      </Form.Group>

      {/* Description */}
      <Form.Group className="mb-3" controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Enter document description (optional)"
          {...register('description')}
          isInvalid={!!errors.description}
          disabled={submitting}
        />
        <Form.Control.Feedback type="invalid">
          {errors.description?.message}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          A brief description of what this document contains
        </Form.Text>
      </Form.Group>

      {/* Category */}
      <Form.Group className="mb-3" controlId="category">
        <Form.Label>Category</Form.Label>
        <Form.Select
          {...register('category')}
          isInvalid={!!errors.category}
          disabled={submitting}
        >
          <option value="">Select category (optional)</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.category?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Tags */}
      <Form.Group className="mb-3" controlId="tags">
        <Form.Label>Tags</Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g., important, tax, 2024"
          {...register('tags')}
          isInvalid={!!errors.tags}
          disabled={submitting}
        />
        <Form.Control.Feedback type="invalid">
          {errors.tags?.message}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Separate multiple tags with commas
        </Form.Text>
        {/* Tag Preview */}
        {document?.tags && document.tags.length > 0 && (
          <div className="mt-2">
            <small className="text-muted d-block mb-1">Current tags:</small>
            <div className="d-flex flex-wrap gap-1">
              {document.tags.map((tag, index) => (
                <Badge key={index} bg="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Form.Group>

      {/* Form Actions */}
      <div className="d-flex gap-2 justify-content-end">
        <Button
          variant="secondary"
          onClick={handleCancel}
          disabled={submitting}
        >
          <X className="me-2" />
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={submitting || !isDirty}
        >
          <Save className="me-2" />
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Form>
  );

  // Inline mode - just return the form
  if (inline) {
    return renderForm();
  }

  // Full page mode - with container and breadcrumbs
  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item
          onClick={() => navigate('/documents')}
          style={{ cursor: 'pointer' }}
        >
          Documents
        </Breadcrumb.Item>
        <Breadcrumb.Item
          onClick={() => navigate(`/documents/${document?.id}`)}
          style={{ cursor: 'pointer' }}
        >
          {document?.title || document?.filename}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Edit</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(`/documents/${document?.id}`)}
            className="mb-2"
          >
            <ArrowLeft className="me-1" /> Back
          </Button>
          <h1 className="h3 mb-2">Edit Document Metadata</h1>
          <p className="text-muted mb-0">{document?.filename}</p>
        </Col>
      </Row>

      {/* Form Card */}
      <Row>
        <Col lg={8} xl={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Document Information</h5>
            </Card.Header>
            <Card.Body>{renderForm()}</Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

DocumentMetadataEditor.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    filename: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onCancel: PropTypes.func,
  onSuccess: PropTypes.func,
  inline: PropTypes.bool,
};

export default DocumentMetadataEditor;
