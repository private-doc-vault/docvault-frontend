import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Save, X } from 'react-bootstrap-icons';
import usersApi from '../../api/usersApi';

// Available roles
const AVAILABLE_ROLES = [
  { value: 'ROLE_ADMIN', label: 'Admin', description: 'Full system access' },
  { value: 'ROLE_USER', label: 'User', description: 'Standard user access' },
  { value: 'ROLE_VIEWER', label: 'Viewer', description: 'Read-only access' },
];

// Available statuses
const AVAILABLE_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'locked', label: 'Locked' },
];

// Validation schema for creating a new user
const createUserSchema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  roles: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one role must be selected')
    .required('Roles are required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive', 'locked'], 'Invalid status')
    .required('Status is required'),
});

// Validation schema for editing an existing user
const editUserSchema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: yup
    .string()
    .nullable()
    .notRequired()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|^$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  roles: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one role must be selected')
    .required('Roles are required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive', 'locked'], 'Invalid status')
    .required('Status is required'),
});

/**
 * UserForm component
 * Form for creating and editing users
 */
const UserForm = ({ show, onHide, user, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEditMode = !!user;

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(isEditMode ? editUserSchema : createUserSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      roles: user?.roles || ['ROLE_USER'],
      status: user?.status || 'active',
    },
  });

  // Watch roles for checkbox management
  const selectedRoles = watch('roles');

  // Reset form when user changes or modal opens/closes
  useEffect(() => {
    if (show) {
      reset({
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        roles: user?.roles || ['ROLE_USER'],
        status: user?.status || 'active',
      });
      setError(null);
    }
  }, [user, show, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError(null);

      // Prepare user data
      const userData = {
        username: data.username,
        email: data.email,
        roles: data.roles,
        status: data.status,
      };

      // Only include password if provided (for create, it's required; for edit, it's optional)
      if (data.password) {
        userData.password = data.password;
      }

      // Call API
      if (isEditMode) {
        await usersApi.updateUser(user.id, userData);
      } else {
        await usersApi.createUser(userData);
      }

      // Success
      if (onSuccess) {
        onSuccess();
      }
      onHide();
    } catch (err) {
      console.error('Failed to save user:', err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          `Failed to ${isEditMode ? 'update' : 'create'} user`
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle role checkbox change
   */
  const handleRoleChange = (roleValue, isChecked) => {
    const currentRoles = selectedRoles || [];
    if (isChecked) {
      return [...currentRoles, roleValue];
    } else {
      return currentRoles.filter((r) => r !== roleValue);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? 'Edit User' : 'Create New User'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row>
            {/* Username */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>
                  Username <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  {...register('username')}
                  isInvalid={!!errors.username}
                  disabled={submitting}
                  autoComplete="username"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Letters, numbers, underscores, and hyphens only
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Email */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email address"
                  {...register('email')}
                  isInvalid={!!errors.email}
                  disabled={submitting}
                  autoComplete="email"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* Password */}
            <Col md={12}>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>
                  Password{' '}
                  {!isEditMode && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder={
                    isEditMode
                      ? 'Leave blank to keep current password'
                      : 'Enter password'
                  }
                  {...register('password')}
                  isInvalid={!!errors.password}
                  disabled={submitting}
                  autoComplete={isEditMode ? 'new-password' : 'new-password'}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {isEditMode ? 'Leave blank to keep current password. ' : ''}
                  Minimum 8 characters, must include uppercase, lowercase, and
                  number
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* Roles */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Roles <span className="text-danger">*</span>
                </Form.Label>
                {AVAILABLE_ROLES.map((role) => (
                  <Form.Check
                    key={role.value}
                    type="checkbox"
                    id={`role-${role.value}`}
                    label={
                      <div>
                        <strong>{role.label}</strong>
                        <br />
                        <small className="text-muted">{role.description}</small>
                      </div>
                    }
                    value={role.value}
                    {...register('roles')}
                    checked={selectedRoles?.includes(role.value)}
                    onChange={(e) => {
                      const newRoles = handleRoleChange(
                        role.value,
                        e.target.checked
                      );
                      reset({ ...watch(), roles: newRoles });
                    }}
                    disabled={submitting}
                    className="mb-2"
                  />
                ))}
                {errors.roles && (
                  <div className="text-danger small mt-1">
                    {errors.roles?.message}
                  </div>
                )}
              </Form.Group>
            </Col>

            {/* Status */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="status">
                <Form.Label>
                  Status <span className="text-danger">*</span>
                </Form.Label>
                {AVAILABLE_STATUSES.map((status) => (
                  <Form.Check
                    key={status.value}
                    type="radio"
                    id={`status-${status.value}`}
                    label={status.label}
                    value={status.value}
                    {...register('status')}
                    disabled={submitting}
                  />
                ))}
                {errors.status && (
                  <div className="text-danger small mt-1">
                    {errors.status?.message}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            <X className="me-2" />
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="me-2" />
                {isEditMode ? 'Update User' : 'Create User'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

UserForm.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    email: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
};

export default UserForm;
