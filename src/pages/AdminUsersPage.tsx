import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { AdminCreateUserResponse } from '../api';
import { adminListUsers, adminCreateUser } from '../api';
import { LoadingState, ErrorState } from '../components/common';
import { useApiQuery } from '../hooks';

export default function AdminUsersPage() {
  const { data: users, loading, error, refetch } = useApiQuery(adminListUsers, []);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdResult, setCreatedResult] = useState<AdminCreateUserResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);
    try {
      const result = await adminCreateUser(newUsername, newDisplayName, newEmail, newIsAdmin);
      setCreatedResult(result);
      setNewUsername('');
      setNewDisplayName('');
      setNewEmail('');
      setNewIsAdmin(false);
      setShowCreateForm(false);
      refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopyKey() {
    if (createdResult) {
      await navigator.clipboard.writeText(createdResult.temporaryAPIKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Users</h1>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Create User
        </button>
      </div>

      {createdResult && (
        <div className="alert alert-success" role="alert">
          <h6 className="alert-heading">User created successfully</h6>
          <p className="mb-2 small">
            Temporary API key for <strong>{createdResult.user.username}</strong> (expires in 24
            hours):
          </p>
          <div className="d-flex gap-2 align-items-center">
            <code className="flex-grow-1 text-break">{createdResult.temporaryAPIKey}</code>
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
            onClick={() => setCreatedResult(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Create New User</h6>
            {createError && (
              <div className="alert alert-danger py-2 small" role="alert">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label htmlFor="new-username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="new-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="new-display-name" className="form-label">
                  Display Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="new-display-name"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="new-email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="new-email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="new-is-admin"
                  checked={newIsAdmin}
                  onChange={(e) => setNewIsAdmin(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="new-is-admin">
                  Administrator
                </label>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="list-group">
        {users?.map((u) => (
          <Link
            key={u.id}
            to={`/admin/users/${u.id}`}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{u.displayName}</strong>
              <small className="text-body-secondary ms-2">{u.username}</small>
              {u.isAdmin && <span className="badge bg-warning text-dark ms-2">Admin</span>}
            </div>
            <div className="text-body-secondary small">
              {u.passkeyCount} passkeys, {u.apiKeyCount} API keys
            </div>
          </Link>
        ))}
        {users?.length === 0 && (
          <div className="list-group-item text-body-secondary text-center">No users found</div>
        )}
      </div>
    </div>
  );
}
