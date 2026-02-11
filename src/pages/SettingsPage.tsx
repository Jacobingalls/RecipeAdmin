import type { CSSProperties, FormEvent } from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRegistration } from '@simplewebauthn/browser';

import type { CreateAPIKeyResponse } from '../api';
import {
  settingsListPasskeys,
  settingsAddPasskeyBegin,
  settingsAddPasskeyFinish,
  settingsDeletePasskey,
  settingsListAPIKeys,
  settingsCreateAPIKey,
  settingsRevokeAPIKey,
  settingsUpdateProfile,
  settingsRevokeSessions,
  settingsListSessions,
  settingsRevokeSession,
} from '../api';
import { LoadingState, ErrorState } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useApiQuery } from '../hooks';
import { formatRelativeTime, generateName } from '../utils';

export default function SettingsPage() {
  const { user, logout, updateUser, refreshSession } = useAuth();
  const navigate = useNavigate();

  const {
    data: passkeys,
    loading: passkeysLoading,
    error: passkeysError,
    refetch: refetchPasskeys,
  } = useApiQuery(settingsListPasskeys, []);
  const {
    data: apiKeys,
    loading: apiKeysLoading,
    error: apiKeysError,
    refetch: refetchApiKeys,
  } = useApiQuery(settingsListAPIKeys, []);
  const {
    data: sessions,
    loading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions,
  } = useApiQuery(settingsListSessions, []);

  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps -- regenerate each time modal opens
  const defaultKeyName = useMemo(() => generateName(), [showCreateKeyModal]);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [newKeyExpiresAt, setNewKeyExpiresAt] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [createKeyError, setCreateKeyError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<CreateAPIKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [deleteCredential, setDeleteCredential] = useState<{
    type: 'passkey' | 'apiKey';
    id: string;
    name: string;
  } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  function startEditingDisplayName() {
    setDisplayNameInput(user?.displayName ?? '');
    setEditingDisplayName(true);
    setProfileError(null);
    setProfileSaved(false);
  }

  async function handleSaveDisplayName(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setIsSavingProfile(true);
    try {
      const updated = await settingsUpdateProfile({ displayName: displayNameInput });
      updateUser(updated);
      await refreshSession();
      setEditingDisplayName(false);
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  }

  const handleAddPasskey = useCallback(async () => {
    setPasskeyError(null);
    setIsAddingPasskey(true);
    try {
      const { options, sessionID } = await settingsAddPasskeyBegin();
      const credential = await startRegistration({ optionsJSON: options });
      await settingsAddPasskeyFinish(sessionID, credential, navigator.platform || 'Passkey');
      refetchPasskeys();
    } catch (err) {
      setPasskeyError(err instanceof Error ? err.message : 'Failed to register passkey');
    } finally {
      setIsAddingPasskey(false);
    }
  }, [refetchPasskeys]);

  async function handleConfirmDeleteCredential() {
    if (!deleteCredential) return;
    if (deleteCredential.type === 'passkey') {
      await settingsDeletePasskey(deleteCredential.id);
      refetchPasskeys();
    } else {
      await settingsRevokeAPIKey(deleteCredential.id);
      refetchApiKeys();
    }
    setDeleteCredential(null);
    setDeleteConfirmText('');
  }

  async function handleCreateAPIKey(e: FormEvent) {
    e.preventDefault();
    setCreateKeyError(null);
    setIsCreatingKey(true);
    try {
      const expiresAt =
        hasExpiry && newKeyExpiresAt
          ? Math.floor(new Date(newKeyExpiresAt).getTime() / 1000)
          : undefined;
      const result = await settingsCreateAPIKey(newKeyName.trim() || defaultKeyName, expiresAt);
      setCreatedKey(result);
      refetchApiKeys();
    } catch (err) {
      setCreateKeyError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreatingKey(false);
    }
  }

  function closeCreateKeyModal() {
    setShowCreateKeyModal(false);
    setNewKeyName('');
    setHasExpiry(false);
    setNewKeyExpiresAt('');
    setCreatedKey(null);
    setCreateKeyError(null);
    setCopied(false);
  }

  async function handleCopyKey() {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleRevokeSession(familyId: string) {
    await settingsRevokeSession(familyId);
    refetchSessions();
  }

  async function handleRevokeSessions() {
    if (!window.confirm('This will sign you out of all devices, including this one. Continue?')) {
      return;
    }
    setIsRevokingSessions(true);
    try {
      await settingsRevokeSessions();
      await logout();
      navigate('/login');
    } catch {
      setIsRevokingSessions(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const loading = passkeysLoading || apiKeysLoading || sessionsLoading;
  const error = passkeysError || apiKeysError || sessionsError;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="mb-5">Settings</h1>

      <h2 className="h4 mb-3">Profile</h2>

      {profileSaved && (
        <div className="alert alert-success py-2 small" role="status">
          Display name updated.
        </div>
      )}

      <div className="card mb-5">
        <div className="card-body">
          <dl className="row mb-0">
            <dt className="col-sm-4 text-body-secondary">Username</dt>
            <dd className="col-sm-8">{user?.username}</dd>
            <dt className="col-sm-4 text-body-secondary">Display Name</dt>
            <dd className="col-sm-8">
              {editingDisplayName ? (
                <form className="d-flex gap-2" onSubmit={handleSaveDisplayName}>
                  {profileError && (
                    <div className="alert alert-danger py-1 small w-100 mb-2" role="alert">
                      {profileError}
                    </div>
                  )}
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="edit-display-name"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setEditingDisplayName(false)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <span className="d-flex align-items-center gap-2">
                  {user?.displayName}
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-body-secondary"
                    aria-label="Edit display name"
                    onClick={startEditingDisplayName}
                  >
                    <i className="bi bi-pencil" aria-hidden="true" />
                  </button>
                </span>
              )}
            </dd>
            <dt className="col-sm-4 text-body-secondary">Email</dt>
            <dd className="col-sm-8 mb-0">{user?.email}</dd>
          </dl>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h5 className="mb-0">Credentials</h5>
        <div className="dropdown">
          <button
            className="btn btn-dark btn-sm dropdown-toggle px-3"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Add
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                className="dropdown-item"
                type="button"
                onClick={handleAddPasskey}
                disabled={isAddingPasskey}
              >
                <i className="bi bi-fingerprint me-2" aria-hidden="true" />
                {isAddingPasskey ? 'Registering...' : 'Passkey'}
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => setShowCreateKeyModal(true)}
              >
                <i className="bi bi-key me-2" aria-hidden="true" />
                API Key
              </button>
            </li>
          </ul>
        </div>
      </div>

      {passkeyError && (
        <div className="alert alert-danger alert-dismissible small" role="alert">
          <strong style={{ opacity: 0.8 }}>Passkey registration failed</strong>
          <p className="mb-0 mt-1">{passkeyError}</p>
          <button
            type="button"
            className="btn-close btn-close-white"
            style={{ opacity: 0.8 }}
            aria-label="Dismiss"
            onClick={() => setPasskeyError(null)}
          />
        </div>
      )}

      {showCreateKeyModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-labelledby="create-api-key-title"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="create-api-key-title">
                    Create API Key
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeCreateKeyModal}
                  />
                </div>
                <div className="modal-body">
                  {createdKey ? (
                    <>
                      <p className="small text-body-secondary">
                        Save this key now. You will not be able to see it again.
                      </p>
                      <div className="mb-3">
                        <label htmlFor="created-key" className="form-label">
                          API Key
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="created-key"
                          value={createdKey.key}
                          readOnly
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleCopyKey}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      {createdKey.expiresAt && (
                        <p className="small text-body-secondary mt-2 mb-0">
                          Expires {formatRelativeTime(createdKey.expiresAt)}
                        </p>
                      )}
                    </>
                  ) : (
                    <form id="create-api-key-form" onSubmit={handleCreateAPIKey}>
                      {createKeyError && (
                        <div className="alert alert-danger py-2 small" role="alert">
                          {createKeyError}
                        </div>
                      )}
                      <div className="mb-3">
                        <label htmlFor="key-name" className="form-label">
                          Key Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="key-name"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder={defaultKeyName}
                        />
                      </div>
                      <div className="form-check mb-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="has-expiry"
                          checked={hasExpiry}
                          onChange={(e) => setHasExpiry(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="has-expiry">
                          Set expiration
                        </label>
                      </div>
                      {hasExpiry && (
                        <div className="mb-3">
                          <label htmlFor="key-expires-at" className="form-label">
                            Expires at
                          </label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            id="key-expires-at"
                            value={newKeyExpiresAt}
                            onChange={(e) => setNewKeyExpiresAt(e.target.value)}
                            required
                          />
                        </div>
                      )}
                    </form>
                  )}
                </div>
                <div className="modal-footer">
                  {createdKey ? (
                    <button type="button" className="btn btn-primary" onClick={closeCreateKeyModal}>
                      Done
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={closeCreateKeyModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="create-api-key-form"
                        className="btn btn-primary"
                        disabled={isCreatingKey}
                      >
                        {isCreatingKey ? 'Creating...' : 'Create'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {(passkeys && passkeys.length > 0) || (apiKeys && apiKeys.length > 0) ? (
        <div className="list-group mb-5">
          {passkeys?.map((pk) => (
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
                  setDeleteConfirmText('');
                }}
              >
                <i className="bi bi-trash" />
              </button>
            </div>
          ))}
          {apiKeys?.map((ak) => (
            <div key={ak.id} className="list-group-item d-flex align-items-center">
              <i className="bi bi-key me-2" />
              <strong>{ak.name}</strong>
              <code className="ms-2">{ak.keyPrefix}...</code>
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
                    await settingsRevokeAPIKey(ak.id);
                    refetchApiKeys();
                  } else {
                    setDeleteCredential({ type: 'apiKey', id: ak.id, name: ak.name });
                    setDeleteConfirmText('');
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
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
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
                    disabled={deleteConfirmText !== deleteCredential.name}
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

      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h5 className="mb-0">Sessions</h5>
        <div className="btn-group">
          <button type="button" className="btn btn-dark btn-sm" onClick={handleLogout}>
            Sign out
          </button>
          <button
            type="button"
            className="btn btn-dark btn-sm dropdown-toggle dropdown-toggle-split"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="visually-hidden">More sign out options</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                className="dropdown-item text-danger"
                type="button"
                onClick={handleRevokeSessions}
                disabled={isRevokingSessions}
              >
                {isRevokingSessions ? 'Revoking...' : 'Sign out everywhere'}
              </button>
            </li>
          </ul>
        </div>
      </div>
      {sessions && sessions.length > 0 ? (
        <div className="list-group mb-3">
          {sessions.map((session) => (
            <div key={session.familyID} className="list-group-item d-flex align-items-center">
              <i className="bi bi-display me-2" />
              <div className="me-auto">
                <strong>{session.deviceName}</strong>
                <br />
                <small className="text-body-secondary">
                  Created {formatRelativeTime(session.sessionCreatedAt)}
                  {session.lastRefreshedAt && (
                    <> &middot; Last active {formatRelativeTime(session.lastRefreshedAt)}</>
                  )}
                  <> &middot; Expires {formatRelativeTime(session.expiresAt)}</>
                </small>
              </div>
              <button
                type="button"
                className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center p-0 text-body-secondary"
                style={
                  {
                    width: '2rem',
                    height: '2rem',
                    '--bs-btn-hover-bg': 'rgba(var(--bs-body-color-rgb), 0.1)',
                    '--bs-btn-hover-border-color': 'transparent',
                  } as CSSProperties
                }
                aria-label={`Revoke session ${session.deviceName}`}
                onClick={() => handleRevokeSession(session.familyID)}
              >
                <i className="bi bi-trash" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No active sessions.</p>
      )}
    </div>
  );
}
