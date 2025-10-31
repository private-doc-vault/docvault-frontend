import { Card, Badge, Row, Col } from 'react-bootstrap';
import { FileEarmarkText, Calendar, Tag } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

/**
 * SearchResults - Display search results
 * Shows search results with highlighted matches
 */
const SearchResults = ({ results, query }) => {
  /**
   * Highlight matching text in search results
   */
  const highlightText = (text, highlights = []) => {
    if (!highlights || highlights.length === 0) {
      return text;
    }

    // For now, just return the text
    // In a real implementation, you'd parse and highlight the matches
    return text;
  };

  return (
    <div className="search-results">
      <div className="mb-3">
        <h5 className="text-muted">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
          {query && ` for "${query}"`}
        </h5>
      </div>

      <Row className="g-3">
        {results.map((result) => (
          <Col xs={12} key={result.id}>
            <Card className="h-100 shadow-sm hover-shadow">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="h5 mb-0">
                    <Link
                      to={`/documents/${result.id}`}
                      className="text-decoration-none text-dark"
                    >
                      <FileEarmarkText className="me-2" />
                      {result.filename || result.title || 'Untitled'}
                    </Link>
                  </Card.Title>
                  {result.category && (
                    <Badge bg="secondary" className="ms-2">
                      {result.category}
                    </Badge>
                  )}
                </div>

                {/* Highlighted excerpt */}
                {result._formatted?.ocrText && (
                  <Card.Text className="text-muted small">
                    {highlightText(
                      result._formatted.ocrText.substring(0, 200) + '...',
                      result._matchesPosition?.ocrText
                    )}
                  </Card.Text>
                )}

                {/* Metadata */}
                <div className="d-flex gap-3 text-muted small mt-2">
                  {result.createdAt && (
                    <span>
                      <Calendar className="me-1" />
                      {formatDate(result.createdAt)}
                    </span>
                  )}
                  {result.tags && result.tags.length > 0 && (
                    <span>
                      <Tag className="me-1" />
                      {result.tags.join(', ')}
                    </span>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SearchResults;
