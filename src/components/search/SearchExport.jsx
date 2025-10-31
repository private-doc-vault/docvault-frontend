import { useState } from 'react';
import { Dropdown, Button, Spinner } from 'react-bootstrap';
import { Download, FileEarmarkText, FiletypeCsv, FiletypePdf, FileEarmarkCode } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { selectQuery, selectFilters } from '../../features/search/searchSlice';
import searchApi from '../../api/searchApi';

/**
 * SearchExport - Export search results component
 * Allows exporting search results to various formats
 */
const SearchExport = () => {
  const query = useSelector(selectQuery);
  const filters = useSelector(selectFilters);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  /**
   * Handle export to a specific format
   */
  const handleExport = async (format) => {
    try {
      setExporting(true);
      setExportFormat(format);

      // Call export API
      const blob = await searchApi.exportSearchResults({
        query,
        filters,
        format,
      });

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Set filename based on format
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `search-results-${timestamp}.${format}`;
      link.setAttribute('download', filename);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export search results. Please try again.');
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  // Check if there's anything to export
  const hasSearchCriteria = query.trim() || Object.values(filters).some(v => v);

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-secondary"
        disabled={!hasSearchCriteria || exporting}
        className="d-flex align-items-center gap-2"
      >
        {exporting ? (
          <>
            <Spinner animation="border" size="sm" />
            <span className="d-none d-md-inline">Exporting...</span>
          </>
        ) : (
          <>
            <Download />
            <span className="d-none d-md-inline">Export</span>
          </>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>Export Format</Dropdown.Header>

        <Dropdown.Item
          onClick={() => handleExport('csv')}
          disabled={exporting}
        >
          <FiletypeCsv className="me-2" />
          CSV (Comma-separated values)
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => handleExport('pdf')}
          disabled={exporting}
        >
          <FiletypePdf className="me-2" />
          PDF (Portable Document Format)
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => handleExport('json')}
          disabled={exporting}
        >
          <FileEarmarkCode className="me-2" />
          JSON (JavaScript Object Notation)
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.ItemText className="small text-muted">
          Export will include all search results
        </Dropdown.ItemText>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SearchExport;
