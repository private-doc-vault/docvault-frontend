import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import documentsApi from '../api/documentsApi';
import DocumentMetadataEditor from '../components/documents/DocumentMetadataEditor';

/**
 * DocumentEditPage - Page for editing document metadata
 */
const DocumentEditPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch document details
   */
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await documentsApi.fetchDocumentById(id);
        setDocument(data);
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
  }, [id]);

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
  if (error || !document) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Document not found'}</p>
        </Alert>
      </Container>
    );
  }

  return <DocumentMetadataEditor document={document} />;
};

export default DocumentEditPage;
