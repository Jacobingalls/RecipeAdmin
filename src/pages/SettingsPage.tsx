import type { CSSProperties, FormEvent } from 'react';
import { useState, useCallback } from 'react';
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
} from '../api';
import { LoadingState, ErrorState } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useApiQuery } from '../hooks';
import { formatRelativeTime } from '../utils';

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
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

  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [newKeyExpiresAt, setNewKeyExpiresAt] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [createKeyError, setCreateKeyError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<CreateAPIKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

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

  async function handleDeletePasskey(id: string) {
    await settingsDeletePasskey(id);
    refetchPasskeys();
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
      const result = await settingsCreateAPIKey(newKeyName, expiresAt);
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

  async function handleRevokeAPIKey(id: string) {
    await settingsRevokeAPIKey(id);
    refetchApiKeys();
  }

  async function handleCopyKey() {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const loading = passkeysLoading || apiKeysLoading;
  const error = passkeysError || apiKeysError;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="h4 mb-3">Settings</h1>

      {profileSaved && (
        <div className="alert alert-success py-2 small" role="status">
          Display name updated. It may take a moment to appear everywhere. Signing out and back in
          will update it immediately.
        </div>
      )}

      <div className="card mb-4">
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
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={handleAddPasskey}
            disabled={isAddingPasskey}
          >
            {isAddingPasskey ? 'Registering...' : 'Add Passkey'}
          </button>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowCreateKeyModal(true)}
          >
            Create API Key
          </button>
        </div>
      </div>

      {passkeyError && (
        <div className="alert alert-danger py-2 small" role="alert">
          {passkeyError}
        </div>
      )}

      {showCreateKeyModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="create-api-key-title"
          aria-modal="true"
        >
          <div className="modal-dialog">
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
                        required
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
      )}

      {(passkeys && passkeys.length > 0) || (apiKeys && apiKeys.length > 0) ? (
        <div className="list-group mb-3">
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
                onClick={() => handleDeletePasskey(pk.id)}
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
                onClick={() => handleRevokeAPIKey(ak.id)}
              >
                <i className="bi bi-trash" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No credentials.</p>
      )}

      <hr className="my-4" />
      <button type="button" className="btn btn-outline-danger w-100" onClick={handleLogout}>
        Sign out
      </button>
    </div>
  );
}
