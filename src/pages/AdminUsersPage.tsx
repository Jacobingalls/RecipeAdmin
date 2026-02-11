import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { AdminCreateUserResponse } from '../api';
import { adminListUsers, adminCreateUser } from '../api';
import { LoadingState, ErrorState, CopyButton } from '../components/common';
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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  function closeModal() {
    setShowCreateForm(false);
    setCreatedResult(null);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);
    try {
      const result = await adminCreateUser(newUsername, newDisplayName, newEmail, newIsAdmin);
      setCreatedResult(result);
      refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Users</h1>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setNewUsername('');
            setNewDisplayName('');
            setNewEmail('');
            setNewIsAdmin(false);
            setCreateError(null);
            setCreatedResult(null);
            setShowCreateForm(true);
          }}
        >
          Create User
        </button>
      </div>

      {showCreateForm && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-labelledby="create-user-modal-title"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                {createdResult ? (
                  <>
                    <div className="modal-header">
                      <h5 className="modal-title" id="create-user-modal-title">
                        User Created
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={closeModal}
                      />
                    </div>
                    <div className="modal-body">
                      <div className="alert alert-success mb-0" role="status">
                        <p className="mb-2 small">
                          Temporary API key for <strong>{createdResult.user.username}</strong>{' '}
                          (expires in 24 hours):
                        </p>
                        <div className="d-flex gap-2 align-items-center">
                          <code className="flex-grow-1 text-break">
                            {createdResult.temporaryAPIKey}
                          </code>
                          <CopyButton
                            text={createdResult.temporaryAPIKey}
                            className="btn btn-outline-success btn-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-primary" onClick={closeModal}>
                        Done
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="modal-header">
                      <h5 className="modal-title" id="create-user-modal-title">
                        Create New User
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={closeModal}
                      />
                    </div>
                    <form onSubmit={handleCreate}>
                      <div className="modal-body">
                        {createError && (
                          <div className="alert alert-danger py-2 small" role="alert">
                            {createError}
                          </div>
                        )}
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
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isCreating}>
                          {isCreating ? 'Creating...' : 'Create'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
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
