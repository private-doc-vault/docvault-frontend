import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import ROUTES from '../../routes/routes';

/**
 * Get badge variant for action type
 */
const getActionBadge = (action) => {
  const badges = {
    create: { variant: 'success', icon: 'bi-plus-circle' },
    update: { variant: 'primary', icon: 'bi-pencil' },
    delete: { variant: 'danger', icon: 'bi-trash' },
    view: { variant: 'info', icon: 'bi-eye' },
    share: { variant: 'warning', icon: 'bi-share' },
    download: { variant: 'secondary', icon: 'bi-download' },
    login: { variant: 'success', icon: 'bi-box-arrow-in-right' },
    logout: { variant: 'secondary', icon: 'bi-box-arrow-right' },
  };

  const badge = badges[action?.toLowerCase()] || { variant: 'secondary', icon: 'bi-info-circle' };

  return (
    <Badge bg={badge.variant} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
      <i className={badge.icon}></i>
      <span>{action}</span>
    </Badge>
  );
};

/**
 * AuditLogTable Component
 * Displays audit logs in a table format with clickable links
 */
const AuditLogTable = ({ logs }) => {
  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    if (userId) {
      navigate(`${ROUTES.ADMIN_USERS}?userId=${userId}`);
    }
  };

  const handleDocumentClick = (documentId) => {
    if (documentId) {
      navigate(ROUTES.DOCUMENT_DETAIL.replace(':id', documentId));
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No audit logs to display
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Document</th>
            <th>IP Address</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="text-nowrap">
                {formatTimestamp(log.timestamp || log.createdAt)}
              </td>
              <td>
                {log.userId ? (
                  <span
                    role="button"
                    className="text-primary text-decoration-none"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleUserClick(log.userId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleUserClick(log.userId);
                      }
                    }}
                    tabIndex={0}
                  >
                    {log.userName || log.username || `User #${log.userId}`}
                  </span>
                ) : (
                  <span className="text-muted">System</span>
                )}
              </td>
              <td>
                {getActionBadge(log.action)}
              </td>
              <td>
                {log.documentId ? (
                  <span
                    role="button"
                    className="text-primary text-decoration-none"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDocumentClick(log.documentId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleDocumentClick(log.documentId);
                      }
                    }}
                    tabIndex={0}
                  >
                    {log.documentName || log.documentFilename || `Document #${log.documentId}`}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="text-nowrap">
                <code className="text-muted small">{log.ipAddress || '—'}</code>
              </td>
              <td>
                <small className="text-muted">
                  {log.details || log.description || '—'}
                </small>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

AuditLogTable.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      timestamp: PropTypes.string,
      createdAt: PropTypes.string,
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      userName: PropTypes.string,
      username: PropTypes.string,
      action: PropTypes.string.isRequired,
      documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      documentName: PropTypes.string,
      documentFilename: PropTypes.string,
      ipAddress: PropTypes.string,
      details: PropTypes.string,
      description: PropTypes.string,
    })
  ).isRequired,
};

export default AuditLogTable;
