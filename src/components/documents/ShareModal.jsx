import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
  ListGroup,
  Card,
} from 'react-bootstrap';
import { PersonPlus, Search, X } from 'react-bootstrap-icons';
import {
  selectShares,
  selectSharingLoading,
  selectSharingError,
  setShares,
  addShare,
  updateShare,
  removeShare,
  setLoading,
  setError,
  clearError,
  clearShares,
} from '../../features/sharing/sharingSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import sharingApi from '../../api/sharingApi';
import ShareList from './ShareList';
import PermissionSelector from './PermissionSelector';
import useDebounce from '../../hooks/useDebounce';

/**
 * ShareModal - Modal for managing document sharing
 */
const ShareModal = ({ show, onHide, document }) => {
  const dispatch = useDispatch();
  const shares = useSelector(selectShares);
  const loading = useSelector(selectSharingLoading);
  const error = useSelector(selectSharingError);
  const currentUser = useSelector(selectCurrentUser);

  // Local state for adding new share
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(['read']);
  const [adding, setAdding] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  /**
   * Fetch existing shares when modal opens
   */
  useEffect(() => {
    const fetchShares = async () => {
      if (!show || !document || !document.id) return;

      try {
        dispatch(setLoading(true));
        dispatch(clearError());

        const data = await sharingApi.fetchDocumentShares(document.id);
        dispatch(setShares(data.shares || data || []));
      } catch (err) {
        console.error('Failed to fetch shares:', err);
        dispatch(setError(err.response?.data?.message || 'Failed to load shares'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchShares();
  }, [show, document, dispatch]);

  /**
   * Search for users
   */
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const data = await sharingApi.searchUsers(debouncedSearchQuery);

        // Filter out users who already have access
        const existingUserIds = shares.map((s) => s.userId || s.user?.id);
        const filteredResults = (data.users || data || []).filter(
          (user) => !existingUserIds.includes(user.id)
        );

        setSearchResults(filteredResults);
      } catch (err) {
        console.error('Failed to search users:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearchQuery, shares]);

  /**
   * Handle user selection from search results
   */
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  /**
   * Handle add share
   */
  const handleAddShare = async () => {
    if (!selectedUser || !document || !document.id) return;

    try {
      setAdding(true);
      dispatch(clearError());

      const shareData = {
        userId: selectedUser.id,
        permissions: selectedPermissions,
      };

      const newShare = await sharingApi.createShare(document.id, shareData);
      dispatch(addShare(newShare));

      // Reset form
      setSelectedUser(null);
      setSelectedPermissions(['read']);
    } catch (err) {
      console.error('Failed to add share:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to share document'));
    } finally {
      setAdding(false);
    }
  };

  /**
   * Handle update share permissions
   */
  const handleUpdatePermissions = async (shareId, newPermissions) => {
    if (!document || !document.id) return;

    try {
      const updatedShare = await sharingApi.updateShare(document.id, shareId, {
        permissions: newPermissions,
      });
      dispatch(updateShare(updatedShare));
    } catch (err) {
      console.error('Failed to update share permissions:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to update permissions'));
      throw err;
    }
  };

  /**
   * Handle revoke share
   */
  const handleRevokeShare = async (shareId) => {
    if (!document || !document.id) return;

    try {
      await sharingApi.deleteShare(document.id, shareId);
      dispatch(removeShare(shareId));
    } catch (err) {
      console.error('Failed to revoke share:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to revoke access'));
      throw err;
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    // Clear local state
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedPermissions(['read']);

    // Clear Redux state
    dispatch(clearShares());
    dispatch(clearError());

    onHide();
  };

  if (!document) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Share "{document.title || document.filename}"</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}

        {/* Add New Share Section */}
        <Card className="mb-3">
          <Card.Header>
            <strong>Add People</strong>
          </Card.Header>
          <Card.Body>
            {!selectedUser ? (
              <>
                {/* User Search */}
                <InputGroup className="mb-2">
                  <InputGroup.Text>
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search for users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                </InputGroup>

                {/* Search Results */}
                {searching && (
                  <div className="text-center py-2">
                    <Spinner animation="border" size="sm" />
                  </div>
                )}

                {searchResults.length > 0 && (
                  <ListGroup className="mb-2">
                    {searchResults.map((user) => (
                      <ListGroup.Item
                        key={user.id}
                        action
                        onClick={() => handleSelectUser(user)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <strong>{user.username}</strong>
                          <br />
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}

                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                  <Alert variant="info" className="mb-0">
                    No users found matching "{searchQuery}"
                  </Alert>
                )}
              </>
            ) : (
              <>
                {/* Selected User & Permissions */}
                <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                  <div>
                    <strong>{selectedUser.username}</strong>
                    <br />
                    <small className="text-muted">{selectedUser.email}</small>
                  </div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X />
                  </Button>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Permission Level</Form.Label>
                  <PermissionSelector
                    value={selectedPermissions}
                    onChange={setSelectedPermissions}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleAddShare}
                  disabled={adding}
                  className="w-100"
                >
                  {adding ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <PersonPlus className="me-2" />
                      Share with {selectedUser.username}
                    </>
                  )}
                </Button>
              </>
            )}
          </Card.Body>
        </Card>

        {/* Existing Shares List */}
        <Card>
          <Card.Header>
            <strong>People with Access ({shares.length})</strong>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
                <p className="mt-2 text-muted">Loading shares...</p>
              </div>
            ) : (
              <ShareList
                shares={shares}
                onUpdatePermissions={handleUpdatePermissions}
                onRevoke={handleRevokeShare}
                currentUserId={currentUser?.id}
              />
            )}
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ShareModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  document: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    filename: PropTypes.string,
  }),
};

export default ShareModal;
