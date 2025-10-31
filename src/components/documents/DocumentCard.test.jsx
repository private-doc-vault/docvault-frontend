import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DocumentCard from './DocumentCard';
import documentsApi from '../../api/documentsApi';

// Mock the documentsApi
jest.mock('../../api/documentsApi');

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('DocumentCard', () => {
  const mockDocument = {
    id: 1,
    filename: 'test-document.pdf',
    title: 'Test Document',
    ocrStatus: 'completed',
    createdAt: '2024-01-01T12:00:00Z',
    fileSize: 1024000, // 1MB
    category: 'Invoice',
    tags: ['important', 'tax', '2024'],
  };

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    documentsApi.getDocumentThumbnail.mockResolvedValue(null);
  });

  const renderCard = (props = {}) => {
    return render(
      <BrowserRouter>
        <DocumentCard
          document={mockDocument}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          {...props}
        />
      </BrowserRouter>
    );
  };

  it('should render document card with title', () => {
    renderCard();
    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });

  it('should display OCR status badge', () => {
    renderCard();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should display formatted file size', () => {
    renderCard();
    expect(screen.getByText('1000.0 KB')).toBeInTheDocument();
  });

  it('should display formatted date', () => {
    renderCard();
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
  });

  it('should display category badge', () => {
    renderCard();
    expect(screen.getByText('Invoice')).toBeInTheDocument();
  });

  it('should display first 3 tags', () => {
    renderCard();
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('tax')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('should navigate to detail page on card click', () => {
    renderCard();

    const card = screen.getByText('Test Document').closest('.document-card');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/documents/1');
  });

  it('should show dropdown menu when clicking actions button', async () => {
    renderCard();

    // Find and click the dropdown toggle
    const dropdownToggle = screen.getByRole('button', { hidden: true });
    fireEvent.click(dropdownToggle);

    // Wait for menu items to appear
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('should handle document download', async () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
    documentsApi.downloadDocument.mockResolvedValue(mockBlob);

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = jest.fn();

    renderCard();

    // Open dropdown
    const dropdownToggle = screen.getByRole('button', { hidden: true });
    fireEvent.click(dropdownToggle);

    // Click download
    await waitFor(() => {
      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);
    });

    await waitFor(() => {
      expect(documentsApi.downloadDocument).toHaveBeenCalledWith(1);
    });
  });

  it('should handle document deletion with confirmation', async () => {
    global.confirm = jest.fn(() => true);
    documentsApi.deleteDocument.mockResolvedValue();

    renderCard();

    // Open dropdown
    const dropdownToggle = screen.getByRole('button', { hidden: true });
    fireEvent.click(dropdownToggle);

    // Click delete
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(documentsApi.deleteDocument).toHaveBeenCalledWith(1);
      expect(mockOnDelete).toHaveBeenCalledWith(1);
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should cancel deletion if user cancels confirmation', async () => {
    global.confirm = jest.fn(() => false);

    renderCard();

    // Open dropdown
    const dropdownToggle = screen.getByRole('button', { hidden: true });
    fireEvent.click(dropdownToggle);

    // Click delete
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(documentsApi.deleteDocument).not.toHaveBeenCalled();
    });
  });

  it('should display filename when title is not provided', () => {
    const docWithoutTitle = { ...mockDocument, title: null };
    render(
      <BrowserRouter>
        <DocumentCard document={docWithoutTitle} />
      </BrowserRouter>
    );

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
  });

  it('should show correct status badge color for different statuses', () => {
    const statuses = [
      { status: 'pending', label: 'Pending' },
      { status: 'processing', label: 'Processing' },
      { status: 'completed', label: 'Completed' },
      { status: 'failed', label: 'Failed' },
    ];

    statuses.forEach(({ status, label }) => {
      const doc = { ...mockDocument, ocrStatus: status };
      const { unmount } = render(
        <BrowserRouter>
          <DocumentCard document={doc} />
        </BrowserRouter>
      );

      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('should truncate long filenames with title attribute', () => {
    const longTitleDoc = {
      ...mockDocument,
      title: 'This is a very long document title that should be truncated in the UI',
    };

    renderCard({ document: longTitleDoc });

    // The title attribute should be on the filename
    const titleElement = screen.getByTitle(longTitleDoc.filename);
    expect(titleElement).toBeInTheDocument();
    expect(screen.getByText(longTitleDoc.title)).toBeInTheDocument();
  });

  it('should show tag count when more than 3 tags', () => {
    const docWithManyTags = {
      ...mockDocument,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };

    renderCard({ document: docWithManyTags });

    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
