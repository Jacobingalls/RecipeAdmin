import type { CSSProperties, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { AdminTempAPIKeyResponse } from '../api';
import {
  adminGetUser,
  adminUpdateUser,
  adminDeleteUser,
  adminDeleteUserPasskey,
  adminDeleteUserAPIKey,
  adminCreateUserAPIKey,
  adminRevokeUserSessions,
} from '../api';
import { LoadingState, ErrorState } from '../components/common';
import { useApiQuery } from '../hooks';
import { formatRelativeTime } from '../utils';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, loading, error, refetch } = useApiQuery(() => adminGetUser(id!), [id]);

  const [editUsername, setEditUsername] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState<AdminTempAPIKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [tempKeyModal, setTempKeyModal] = useState(false);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [revokeSessionsSuccess, setRevokeSessionsSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCredential, setDeleteCredential] = useState<{
    type: 'passkey' | 'apiKey';
    id: string;
    name: string;
  } | null>(null);
  const [credentialConfirmText, setCredentialConfirmText] = useState('');

  useEffect(() => {
    if (user) {
      setEditUsername(user.username);
      setEditDisplayName(user.displayName);
      setEditEmail(user.email);
      setEditIsAdmin(user.isAdmin);
    }
  }, [user]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!user) return <ErrorState message="User not found" />;

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    setIsEditing(true);
    try {
      await adminUpdateUser(id!, {
        username: editUsername,
        displayName: editDisplayName,
        email: editEmail,
        isAdmin: editIsAdmin,
      });
      refetch();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsEditing(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await adminDeleteUser(id!);
      navigate('/admin/users');
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to delete user');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleConfirmDeleteCredential() {
    if (!deleteCredential) return;
    if (deleteCredential.type === 'passkey') {
      await adminDeleteUserPasskey(id!, deleteCredential.id);
    } else {
      await adminDeleteUserAPIKey(id!, deleteCredential.id);
    }
    setDeleteCredential(null);
    setCredentialConfirmText('');
    refetch();
  }

  async function generateTempKey() {
    setTempKeyModal(true);
    const result = await adminCreateUserAPIKey(id!);
    setTempKey(result);
    setCopied(false);
    refetch();
  }

  async function handleRevokeSessions() {
    if (
      !window.confirm(
        `Revoke all sessions for ${user!.username}? They will be logged out of all devices.`,
      )
    ) {
      return;
    }
    setIsRevokingSessions(true);
    setRevokeSessionsSuccess(false);
    try {
      await adminRevokeUserSessions(id!);
      setRevokeSessionsSuccess(true);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to revoke sessions');
    } finally {
      setIsRevokingSessions(false);
    }
  }

  function closeTempKeyModal() {
    setTempKeyModal(false);
    setTempKey(null);
    setCopied(false);
  }

  async function handleCopyKey() {
    if (tempKey) {
      await navigator.clipboard.writeText(tempKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h1 className="h4 mb-0">{user.displayName || user.username}</h1>
      </div>
      <p className="text-body-secondary small mb-3">
        <code>{user.id}</code>
        {user.createdAt && (
          <>
            <span className="mx-1">&middot;</span>
            Created {new Date(user.createdAt * 1000).toLocaleDateString()}
          </>
        )}
      </p>

      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <h5 className="mb-0">Profile</h5>
        <button
          type="submit"
          form="edit-user-form"
          className="btn btn-primary btn-sm"
          disabled={isEditing}
        >
          {isEditing ? 'Saving...' : 'Save'}
        </button>
      </div>
      {editError && (
        <div className="alert alert-danger py-2 small" role="alert">
          {editError}
        </div>
      )}
      <form id="edit-user-form" onSubmit={handleUpdate}>
        <div className="list-group">
          <label
            htmlFor="edit-username"
            className="list-group-item d-flex align-items-center justify-content-between py-3"
          >
            <span className="me-3 flex-shrink-0">Username</span>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: '20rem' }}
              id="edit-username"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              required
            />
          </label>
          <label
            htmlFor="edit-display-name"
            className="list-group-item d-flex align-items-center justify-content-between py-3"
          >
            <span className="me-3 flex-shrink-0">Display Name</span>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: '20rem' }}
              id="edit-display-name"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              required
            />
          </label>
          <label
            htmlFor="edit-email"
            className="list-group-item d-flex align-items-center justify-content-between py-3"
          >
            <span className="me-3 flex-shrink-0">Email</span>
            <input
              type="email"
              className="form-control form-control-sm"
              style={{ maxWidth: '20rem' }}
              id="edit-email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </label>
          <label
            htmlFor="edit-is-admin"
            className="list-group-item d-flex align-items-center justify-content-between py-3"
          >
            <span className="me-3 flex-shrink-0">Administrator</span>
            <div className="form-check form-switch mb-0">
              <input
                type="checkbox"
                className="form-check-input"
                role="switch"
                id="edit-is-admin"
                checked={editIsAdmin}
                onChange={(e) => setEditIsAdmin(e.target.checked)}
              />
            </div>
          </label>
        </div>
      </form>

      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <h5 className="mb-0">Credentials</h5>
        <button type="button" className="btn btn-dark btn-sm" onClick={generateTempKey}>
          Generate Temporary API Key
        </button>
      </div>

      {tempKeyModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-label="Temporary API key"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Temporary API Key</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeTempKeyModal}
                  />
                </div>
                <div className="modal-body">
                  {tempKey ? (
                    <>
                      <div className="mb-3">
                        <label htmlFor="temp-key-value" className="form-label">
                          API Key
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="temp-key-value"
                            value={tempKey.key}
                            readOnly
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleCopyKey}
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <p className="text-body-secondary small mb-0">
                        Expires {new Date(tempKey.expiresAt * 1000).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Generating...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeTempKeyModal}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {user.passkeys.length > 0 || user.apiKeys.length > 0 ? (
        <div className="list-group mb-3">
          {user.passkeys.map((pk) => (
            <div key={pk.id} className="list-group-item d-flex align-items-center">
              <i className="bi bi-fingerprint me-2" />
              <strong>{pk.name}</strong>
              {pk.createdAt && (
                <small className="text-body-secondary ms-auto me-2">
                  Created {formatRelativeTime(pk.createdAt)}
                </small>
              )}
              <button
                type="button"
                className={`btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center p-0 text-body-secondary${pk.createdAt ? '' : ' ms-auto'}`}
                style={
                  {
                    width: '2rem',
                    height: '2rem',
                    '--bs-btn-hover-bg': 'rgba(var(--bs-body-color-rgb), 0.1)',
                    '--bs-btn-hover-border-color': 'transparent',
                  } as CSSProperties
                }
                aria-label={`Delete passkey ${pk.name}`}
                onClick={() => {
                  setDeleteCredential({ type: 'passkey', id: pk.id, name: pk.name });
                  setCredentialConfirmText('');
                }}
              >
                <i className="bi bi-trash" />
              </button>
            </div>
          ))}
          {user.apiKeys.map((ak) => (
            <div key={ak.id} className="list-group-item d-flex align-items-center">
              <i className="bi bi-key me-2" />
              <strong>{ak.name}</strong>
              {ak.isTemporary && ak.expiresAt ? (
                <small className="text-body-secondary ms-auto me-2">
                  Expires {formatRelativeTime(ak.expiresAt)}
                </small>
              ) : (
                ak.createdAt && (
                  <small className="text-body-secondary ms-auto me-2">
                    Created {formatRelativeTime(ak.createdAt)}
                  </small>
                )
              )}
              <button
                type="button"
                className={`btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center p-0 text-body-secondary${!ak.createdAt && !(ak.isTemporary && ak.expiresAt) ? ' ms-auto' : ''}`}
                style={
                  {
                    width: '2rem',
                    height: '2rem',
                    '--bs-btn-hover-bg': 'rgba(var(--bs-body-color-rgb), 0.1)',
                    '--bs-btn-hover-border-color': 'transparent',
                  } as CSSProperties
                }
                aria-label={`Revoke API key ${ak.name}`}
                onClick={async () => {
                  if (ak.expiresAt && ak.expiresAt * 1000 < Date.now()) {
                    await adminDeleteUserAPIKey(id!, ak.id);
                    refetch();
                  } else {
                    setDeleteCredential({ type: 'apiKey', id: ak.id, name: ak.name });
                    setCredentialConfirmText('');
                  }
                }}
              >
                <i className="bi bi-trash" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No credentials.</p>
      )}

      {deleteCredential && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-labelledby="delete-credential-title"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="delete-credential-title">
                    {deleteCredential.type === 'passkey' ? 'Delete Passkey' : 'Revoke API Key'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setDeleteCredential(null)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    This will permanently{' '}
                    {deleteCredential.type === 'passkey' ? 'delete' : 'revoke'}{' '}
                    <strong>{deleteCredential.name}</strong>. This action cannot be undone.
                  </p>
                  <label htmlFor="delete-credential-confirm" className="form-label">
                    Type <strong>{deleteCredential.name}</strong> to confirm
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="delete-credential-confirm"
                    value={credentialConfirmText}
                    onChange={(e) => setCredentialConfirmText(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDeleteCredential(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={credentialConfirmText !== deleteCredential.name}
                    onClick={handleConfirmDeleteCredential}
                  >
                    {deleteCredential.type === 'passkey' ? 'Delete passkey' : 'Revoke key'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <h5 className="mt-5 mb-3">Danger Zone</h5>
      {revokeSessionsSuccess && (
        <div className="alert alert-success alert-dismissible small" role="status">
          <strong style={{ opacity: 0.8 }}>All Sessions Revoked</strong>
          <p className="mb-0 mt-1">
            Active sessions may remain valid briefly until their current access token expires.
          </p>
          <button
            type="button"
            className="btn-close btn-close-white"
            style={{ opacity: 0.8 }}
            aria-label="Dismiss"
            onClick={() => setRevokeSessionsSuccess(false)}
          />
        </div>
      )}
      <div className="list-group border-danger">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>Revoke all sessions</strong>
            <p className="text-body-secondary small mb-0">
              Log this user out of all devices immediately.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={handleRevokeSessions}
            disabled={isRevokingSessions}
          >
            {isRevokingSessions ? 'Revoking...' : 'Revoke sessions'}
          </button>
        </div>
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>Delete this user</strong>
            <p className="text-body-secondary small mb-0">
              Permanently remove this user and all their data. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-danger btn-sm flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={() => {
              setDeleteConfirmText('');
              setShowDeleteModal(true);
            }}
          >
            Delete user
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-labelledby="delete-user-modal-title"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="delete-user-modal-title">
                    Delete User
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowDeleteModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    This will permanently delete <strong>{user.username}</strong>. This action
                    cannot be undone.
                  </p>
                  <label htmlFor="delete-confirm-input" className="form-label">
                    Type <strong>{user.username}</strong> to confirm
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="delete-confirm-input"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={deleteConfirmText !== user.username || isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete this user'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
