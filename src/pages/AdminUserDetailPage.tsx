import type { CSSProperties, FormEvent } from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { AdminTempAPIKeyResponse } from '../api';
import {
  adminGetUser,
  adminUpdateUser,
  adminDeleteUser,
  adminDeleteUserPasskey,
  adminDeleteUserAPIKey,
  adminCreateUserAPIKey,
} from '../api';
import { LoadingState, ErrorState, BackButton } from '../components/common';
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
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [tempKey, setTempKey] = useState<AdminTempAPIKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [tempKeyModal, setTempKeyModal] = useState<'confirm' | 'result' | null>(null);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!user) return <ErrorState message="User not found" />;

  function openEditForm() {
    setEditUsername(user!.username);
    setEditDisplayName(user!.displayName);
    setEditEmail(user!.email);
    setEditIsAdmin(user!.isAdmin);
    setIsEditFormOpen(true);
    setEditError(null);
  }

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
      setIsEditFormOpen(false);
      refetch();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsEditing(false);
    }
  }

  async function handleDelete() {
    try {
      await adminDeleteUser(id!);
      navigate('/admin/users');
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  }

  async function handleDeletePasskey(passkeyId: string) {
    await adminDeleteUserPasskey(id!, passkeyId);
    refetch();
  }

  async function handleDeleteApiKey(keyId: string) {
    await adminDeleteUserAPIKey(id!, keyId);
    refetch();
  }

  const hasTempKey = user?.apiKeys.some((ak) => ak.isTemporary) ?? false;

  function handleGenerateTempKeyClick() {
    if (hasTempKey) {
      setTempKeyModal('confirm');
      return;
    }
    generateTempKey();
  }

  async function generateTempKey() {
    setTempKeyModal('result');
    const result = await adminCreateUserAPIKey(id!);
    setTempKey(result);
    setCopied(false);
    refetch();
  }

  function closeTempKeyModal() {
    setTempKeyModal(null);
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
      <BackButton />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h4 mb-0">
            {user.displayName}
            {user.isAdmin && <span className="badge bg-warning text-dark ms-2 fs-6">Admin</span>}
          </h1>
          <div className="text-body-secondary small">
            <span>{user.username}</span>
            <span className="mx-1">&middot;</span>
            <span>{user.email}</span>
          </div>
          {user.createdAt && (
            <small className="text-body-secondary">
              Created {new Date(user.createdAt * 1000).toLocaleDateString()}
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={openEditForm}>
            Edit
          </button>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {isEditFormOpen && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Edit User</h6>
            {editError && (
              <div className="alert alert-danger py-2 small" role="alert">
                {editError}
              </div>
            )}
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label htmlFor="edit-username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="edit-username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="edit-display-name" className="form-label">
                  Display Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="edit-display-name"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="edit-email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="edit-email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="edit-is-admin"
                  checked={editIsAdmin}
                  onChange={(e) => setEditIsAdmin(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="edit-is-admin">
                  Administrator
                </label>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={isEditing}>
                  {isEditing ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setIsEditFormOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h5 className="mb-0">Credentials</h5>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={handleGenerateTempKeyClick}
        >
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
            <div className="modal-dialog">
              <div className="modal-content">
                {tempKeyModal === 'confirm' && (
                  <>
                    <div className="modal-header">
                      <h5 className="modal-title">Replace Temporary API Key?</h5>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={closeTempKeyModal}
                      />
                    </div>
                    <div className="modal-body">
                      <p className="mb-0">
                        <code>{user.username}</code> already has a temporary API key. Generating a
                        new one will replace the existing key.
                      </p>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={closeTempKeyModal}
                      >
                        Cancel
                      </button>
                      <button type="button" className="btn btn-warning" onClick={generateTempKey}>
                        Replace Key
                      </button>
                    </div>
                  </>
                )}
                {tempKeyModal === 'result' && (
                  <>
                    <div className="modal-header">
                      <h5 className="modal-title">Created Temporary API Key</h5>
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
                  </>
                )}
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
                onClick={() => handleDeletePasskey(pk.id)}
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
                onClick={() => handleDeleteApiKey(ak.id)}
              >
                <i className="bi bi-trash" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No credentials.</p>
      )}
    </div>
  );
}
