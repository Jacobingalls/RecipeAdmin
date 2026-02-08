import type { FormEvent } from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { AdminTempAPIKeyResponse } from '../api';
import {
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser,
  adminListUserPasskeys,
  adminDeleteUserPasskey,
  adminListUserAPIKeys,
  adminDeleteUserAPIKey,
  adminCreateUserAPIKey,
} from '../api';
import { LoadingState, ErrorState, BackButton } from '../components/common';
import { useApiQuery } from '../hooks';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: users, loading: usersLoading, error: usersError } = useApiQuery(adminListUsers, []);
  const {
    data: passkeys,
    loading: passkeysLoading,
    error: passkeysError,
    refetch: refetchPasskeys,
  } = useApiQuery(() => adminListUserPasskeys(id!), [id]);
  const {
    data: apiKeys,
    loading: apiKeysLoading,
    error: apiKeysError,
    refetch: refetchApiKeys,
  } = useApiQuery(() => adminListUserAPIKeys(id!), [id]);

  const [editUsername, setEditUsername] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [tempKey, setTempKey] = useState<AdminTempAPIKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const user = users?.find((u) => u.id === id);
  const loading = usersLoading || passkeysLoading || apiKeysLoading;
  const error = usersError || passkeysError || apiKeysError;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!user) return <ErrorState message="User not found" />;

  function openEditForm() {
    setEditUsername(user!.username);
    setEditIsAdmin(user!.isAdmin);
    setIsEditFormOpen(true);
    setEditError(null);
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    setIsEditing(true);
    try {
      await adminUpdateUser(id!, { username: editUsername, isAdmin: editIsAdmin });
      setIsEditFormOpen(false);
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
    refetchPasskeys();
  }

  async function handleDeleteApiKey(keyId: string) {
    await adminDeleteUserAPIKey(id!, keyId);
    refetchApiKeys();
  }

  async function handleGenerateTempKey() {
    const result = await adminCreateUserAPIKey(id!);
    setTempKey(result);
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
          <h4 className="mb-0">
            {user.username}
            {user.isAdmin && <span className="badge bg-warning text-dark ms-2 fs-6">Admin</span>}
          </h4>
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

      <h5 className="mt-4 mb-3">Passkeys</h5>
      {passkeys && passkeys.length > 0 ? (
        <div className="list-group mb-3">
          {passkeys.map((pk) => (
            <div
              key={pk.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{pk.name}</strong>
                {pk.createdAt && (
                  <small className="text-body-secondary ms-2">
                    Created {new Date(pk.createdAt * 1000).toLocaleDateString()}
                  </small>
                )}
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDeletePasskey(pk.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No passkeys registered.</p>
      )}

      <h5 className="mt-4 mb-3">API Keys</h5>

      {tempKey && (
        <div className="alert alert-success" role="alert">
          <h6 className="alert-heading">Temporary API Key</h6>
          <div className="d-flex gap-2 align-items-center">
            <code className="flex-grow-1 text-break">{tempKey.key}</code>
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={handleCopyKey}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <hr />
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setTempKey(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <button
        type="button"
        className="btn btn-outline-primary btn-sm mb-3"
        onClick={handleGenerateTempKey}
      >
        Generate Temporary API Key
      </button>

      {apiKeys && apiKeys.length > 0 ? (
        <div className="list-group mb-3">
          {apiKeys.map((ak) => (
            <div
              key={ak.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{ak.name}</strong>
                <code className="ms-2">{ak.keyPrefix}...</code>
                {ak.isTemporary && <span className="badge bg-secondary ms-2">Temporary</span>}
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDeleteApiKey(ak.id)}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No API keys.</p>
      )}
    </div>
  );
}
