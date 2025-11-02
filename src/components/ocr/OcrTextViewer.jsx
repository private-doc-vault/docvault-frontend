import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { Clipboard, Check, Download, Search } from 'react-bootstrap-icons';
import PropTypes from 'prop-types';
import ocrApi from '../../api/ocrApi';

/**
 * OcrTextViewer Component
 *
 * Displays extracted OCR text with copy-to-clipboard and search functionality
 *
 * Features:
 * - Fetches OCR text from API
 * - Displays text in scrollable area
 * - Copy to clipboard button
 * - Download as text file
 * - Search/highlight within text
 * - Loading and error states
 */
const OcrTextViewer = ({
  documentId,
  ocrText: initialText = null,
  className = '',
}) => {
  const [ocrText, setOcrText] = useState(initialText);
  const [loading, setLoading] = useState(!initialText);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Fetch OCR text from API if not provided
   */
  useEffect(() => {
    if (!initialText && documentId) {
      const fetchOcrText = async () => {
        try {
          setLoading(true);
          setError(null);

          const data = await ocrApi.fetchOcrText(documentId);
          setOcrText(data.text || '');
        } catch (err) {
          console.error('Failed to fetch OCR text:', err);
          setError(
            err.response?.data?.message ||
              'Failed to load OCR text. The document may not have completed OCR processing yet.'
          );
        } finally {
          setLoading(false);
        }
      };

      fetchOcrText();
    }
  }, [documentId, initialText]);

  /**
   * Copy text to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ocrText);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy text to clipboard');
    }
  };

  /**
   * Download text as file
   */
  const handleDownload = () => {
    const blob = new Blob([ocrText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${documentId}-ocr-text.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Highlight search results in text
   */
  const getHighlightedText = () => {
    if (!searchQuery || !ocrText) {
      return ocrText;
    }

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = ocrText.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: '#fff3cd' }}>
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  // Loading state
  if (loading) {
    return (
      <Card className={`ocr-text-viewer ${className}`}>
        <Card.Header>
          <h5 className="mb-0">Extracted Text</h5>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading OCR text...</p>
        </Card.Body>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`ocr-text-viewer ${className}`}>
        <Card.Header>
          <h5 className="mb-0">Extracted Text</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            <Alert.Heading>Error Loading Text</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Empty text state
  if (!ocrText || ocrText.trim() === '') {
    return (
      <Card className={`ocr-text-viewer ${className}`}>
        <Card.Header>
          <h5 className="mb-0">Extracted Text</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <p className="mb-0">No text extracted from this document.</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Main render
  return (
    <Card className={`ocr-text-viewer ${className}`}>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Extracted Text</h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="me-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Clipboard className="me-1" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="me-1" />
              Download
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Search Bar */}
        <div className="mb-3">
          <Form.Group>
            <div className="input-group">
              <span className="input-group-text">
                <Search size={16} />
              </span>
              <Form.Control
                type="text"
                placeholder="Search in text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </Form.Group>
        </div>

        {/* Text Display */}
        <div
          className="border rounded p-3 bg-light"
          style={{
            maxHeight: '500px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.6',
          }}
        >
          {getHighlightedText()}
        </div>

        {/* Text Stats */}
        <div className="mt-3 text-muted small">
          <div className="d-flex justify-content-between">
            <span>Characters: {ocrText.length.toLocaleString()}</span>
            <span>
              Words:{' '}
              {ocrText.split(/\s+/).filter(Boolean).length.toLocaleString()}
            </span>
            <span>Lines: {ocrText.split('\n').length.toLocaleString()}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

OcrTextViewer.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ocrText: PropTypes.string,
  className: PropTypes.string,
};

export default OcrTextViewer;
