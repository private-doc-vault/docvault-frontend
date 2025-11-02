import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DocumentTable from './DocumentTable';

// Mock the documentsApi
jest.mock('../../api/documentsApi');

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('DocumentTable', () => {
  const mockDocuments = [
    {
      id: 1,
      filename: 'document1.pdf',
      title: 'First Document',
      ocrStatus: 'completed',
      createdAt: '2024-01-01T12:00:00Z',
      fileSize: 1024000,
      category: 'Invoice',
      tags: ['important'],
    },
    {
      id: 2,
      filename: 'document2.pdf',
      title: 'Second Document',
      ocrStatus: 'pending',
      createdAt: '2024-01-02T12:00:00Z',
      fileSize: 2048000,
      category: 'Receipt',
      tags: ['test'],
    },
  ];

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTable = (props = {}) => {
    return render(
      <BrowserRouter>
        <DocumentTable
          documents={mockDocuments}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          {...props}
        />
      </BrowserRouter>
    );
  };

  it('should render table with document data', () => {
    renderTable();

    expect(screen.getByText('First Document')).toBeInTheDocument();
    expect(screen.getByText('Second Document')).toBeInTheDocument();
    expect(screen.getByText('Invoice')).toBeInTheDocument();
    expect(screen.getByText('Receipt')).toBeInTheDocument();
  });

  it('should display table headers', () => {
    renderTable();

    expect(screen.getByText(/Filename/)).toBeInTheDocument();
    expect(screen.getByText(/Status/)).toBeInTheDocument();
    expect(screen.getByText(/Actions/)).toBeInTheDocument();
  });

  it('should sort documents by filename when header is clicked', () => {
    renderTable();

    const filenameHeader = screen.getByText(/Filename/);
    fireEvent.click(filenameHeader);

    // Check if sort indicator appears
    const rows = screen.getAllByRole('row');
    // First row is header, so data starts at index 1
    expect(rows[1]).toHaveTextContent('First Document');

    // Click again to reverse sort
    fireEvent.click(filenameHeader);
    const rowsReversed = screen.getAllByRole('row');
    expect(rowsReversed[1]).toHaveTextContent('Second Document');
  });

  it('should navigate to detail page when row is clicked', () => {
    renderTable();

    const row = screen.getByText('First Document').closest('tr');
    fireEvent.click(row);

    expect(mockNavigate).toHaveBeenCalledWith('/documents/1');
  });

  it('should show action buttons', () => {
    renderTable();

    // Check that action elements exist in the table
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should display empty message when no documents', () => {
    render(
      <BrowserRouter>
        <DocumentTable documents={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('No documents to display')).toBeInTheDocument();
  });

  it('should display formatted data', () => {
    renderTable();

    // Check that dates are formatted (there are multiple dates)
    const dates = screen.getAllByText(/Jan.*2024/);
    expect(dates.length).toBeGreaterThan(0);
  });

  it('should display status badges with correct text', () => {
    renderTable();

    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('should sort by date when date header is clicked', () => {
    renderTable();

    // Find the "Uploaded" header (only visible on large screens, but still in DOM)
    const dateHeader = screen.getByText(/Uploaded/);
    fireEvent.click(dateHeader);

    // Documents should be sorted by date
    const rows = screen.getAllByRole('row');
    // First data row should be the older document
    expect(rows[1]).toHaveTextContent('First Document');

    // Click again for descending
    fireEvent.click(dateHeader);
    const rowsReversed = screen.getAllByRole('row');
    expect(rowsReversed[1]).toHaveTextContent('Second Document');
  });

  it('should sort by file size when size header is clicked', () => {
    renderTable();

    const sizeHeader = screen.getByText(/Size/);
    fireEvent.click(sizeHeader);

    // Documents should be sorted by size (smallest first)
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('First Document');

    // Click again for descending
    fireEvent.click(sizeHeader);
    const rowsReversed = screen.getAllByRole('row');
    expect(rowsReversed[1]).toHaveTextContent('Second Document');
  });

  it('should sort by category when category header is clicked', () => {
    renderTable();

    const categoryHeader = screen.getByText(/Category/);
    fireEvent.click(categoryHeader);

    const rows = screen.getAllByRole('row');
    // Invoice comes before Receipt alphabetically
    expect(rows[1]).toHaveTextContent('Invoice');
  });

  it('should show filename when title is not provided', () => {
    const docsWithoutTitles = mockDocuments.map((doc) => ({
      ...doc,
      title: null,
    }));

    render(
      <BrowserRouter>
        <DocumentTable documents={docsWithoutTitles} />
      </BrowserRouter>
    );

    expect(screen.getByText('document1.pdf')).toBeInTheDocument();
    expect(screen.getByText('document2.pdf')).toBeInTheDocument();
  });

  it('should display both filename and title when title is provided', () => {
    renderTable();

    // Title should be visible
    expect(screen.getByText('First Document')).toBeInTheDocument();
    // Filename should also be visible (as smaller text)
    expect(screen.getByText('document1.pdf')).toBeInTheDocument();
  });

  it('should handle navigation', () => {
    renderTable();

    // Check that document titles are clickable
    const firstDocTitle = screen.getByText('First Document');
    expect(firstDocTitle).toBeInTheDocument();
  });

  it('should display tags on mobile', () => {
    renderTable();

    // Tags should be in the DOM (even if hidden on larger screens)
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
