import { useState } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, Badge, Button, ButtonGroup } from 'react-bootstrap';
import { Trash, PersonCircle } from 'react-bootstrap-icons';
import PermissionSelector from './PermissionSelector';

/**
 * ShareList - Displays list of users with access to a document
 */
const ShareList = ({
  shares,
  onUpdatePermissions,
  onRevoke,
  currentUserId,
}) => {
  const [updating, setUpdating] = useState({});

  /**
   * Handle permission change
   */
  const handlePermissionChange = async (share, newPermissions) => {
    if (!onUpdatePermissions) return;

    try {
      setUpdating((prev) => ({ ...prev, [share.id]: true }));
      await onUpdatePermissions(share.id, newPermissions);
    } catch (error) {
      console.error('Failed to update permissions:', error);
    } finally {
      setUpdating((prev) => ({ ...prev, [share.id]: false }));
    }
  };

  /**
   * Handle revoke access
   */
  const handleRevoke = async (share) => {
    if (!onRevoke) return;

    const username = share.user?.username || share.username || 'this user';
    if (
      !window.confirm(`Are you sure you want to revoke access for ${username}?`)
    ) {
      return;
    }

    try {
      await onRevoke(share.id);
    } catch (error) {
      console.error('Failed to revoke access:', error);
    }
  };

  /**
   * Check if share is for current user (owner)
   */
  const isCurrentUser = (share) => {
    return share.userId === currentUserId || share.user?.id === currentUserId;
  };

  if (shares.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <PersonCircle size={48} className="mb-2" />
        <p className="mb-0">This document is not shared with anyone yet</p>
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {shares.map((share) => {
        const user = share.user || {};
        const username = user.username || share.username || 'Unknown User';
        const email = user.email || share.email || '';
        const isOwner = share.isOwner || isCurrentUser(share);

        return (
          <ListGroup.Item key={share.id} className="px-0">
            <div className="d-flex justify-content-between align-items-center">
              {/* User Info */}
              <div className="flex-grow-1 me-3">
                <div className="d-flex align-items-center">
                  <PersonCircle size={32} className="me-2 text-muted" />
                  <div>
                    <div className="fw-medium">
                      {username}
                      {isOwner && (
                        <Badge bg="primary" className="ms-2">
                          You
                        </Badge>
                      )}
                    </div>
                    {email && <small className="text-muted">{email}</small>}
                  </div>
                </div>
              </div>

              {/* Permissions & Actions */}
              <div className="d-flex align-items-center gap-2">
                {/* Permission Selector */}
                <div style={{ minWidth: '150px' }}>
                  {share.isOwner ? (
                    <Badge bg="secondary" className="px-3 py-2">
                      Owner
                    </Badge>
                  ) : (
                    <PermissionSelector
                      value={share.permissions || ['read']}
                      onChange={(newPermissions) =>
                        handlePermissionChange(share, newPermissions)
                      }
                      disabled={updating[share.id]}
                      size="sm"
                    />
                  )}
                </div>

                {/* Revoke Button */}
                {!share.isOwner && onRevoke && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRevoke(share)}
                    title="Revoke Access"
                  >
                    <Trash size={16} />
                  </Button>
                )}
              </div>
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

ShareList.propTypes = {
  shares: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      username: PropTypes.string,
      email: PropTypes.string,
      permissions: PropTypes.arrayOf(PropTypes.string),
      isOwner: PropTypes.bool,
      user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        username: PropTypes.string,
        email: PropTypes.string,
      }),
    })
  ).isRequired,
  onUpdatePermissions: PropTypes.func,
  onRevoke: PropTypes.func,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ShareList;
