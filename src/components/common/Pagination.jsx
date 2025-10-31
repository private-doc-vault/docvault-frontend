import PropTypes from 'prop-types';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

/**
 * Pagination component
 * Provides page navigation controls with ellipsis for large page counts
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
  showFirstLast = true,
  showPrevNext = true,
  totalItems,
  pageSize,
  size = 'md', // 'sm' | 'md' | 'lg'
}) => {
  /**
   * Generate page numbers to display
   */
  const getPageNumbers = () => {
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const halfMax = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, currentPage + halfMax);

    // Adjust if we're near the start or end
    if (currentPage <= halfMax) {
      endPage = maxPagesToShow;
    } else if (currentPage >= totalPages - halfMax) {
      startPage = totalPages - maxPagesToShow + 1;
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Don't render if only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  // Calculate item range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="d-flex flex-column align-items-center gap-2">
      <BootstrapPagination size={size} className="mb-0">
        {/* First Page */}
        {showFirstLast && (
          <BootstrapPagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
        )}

        {/* Previous Page */}
        {showPrevNext && (
          <BootstrapPagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
        )}

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (typeof page === 'string' && page.startsWith('ellipsis')) {
            return <BootstrapPagination.Ellipsis key={page} disabled />;
          }

          return (
            <BootstrapPagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </BootstrapPagination.Item>
          );
        })}

        {/* Next Page */}
        {showPrevNext && (
          <BootstrapPagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        )}

        {/* Last Page */}
        {showFirstLast && (
          <BootstrapPagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        )}
      </BootstrapPagination>

      {/* Item count display */}
      {totalItems > 0 && (
        <div className="text-muted small">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      )}
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxPagesToShow: PropTypes.number,
  showFirstLast: PropTypes.bool,
  showPrevNext: PropTypes.bool,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default Pagination;
