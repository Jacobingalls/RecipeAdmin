import type { CSSProperties, FormEvent } from 'react';
import { useState, useCallback } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

import type { CreateAPIKeyResponse } from '../api';
import {
  authListPasskeys,
  authAddPasskeyBegin,
  authAddPasskeyFinish,
  authDeletePasskey,
  authListAPIKeys,
  authCreateAPIKey,
  authRevokeAPIKey,
} from '../api';
import { LoadingState, ErrorState } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useApiQuery } from '../hooks';
import { formatRelativeTime } from '../utils';

export default function SettingsPage() {
  const { user } = useAuth();

  const {
    data: passkeys,
    loading: passkeysLoading,
    error: passkeysError,
    refetch: refetchPasskeys,
  } = useApiQuery(authListPasskeys, []);
  const {
    data: apiKeys,
    loading: apiKeysLoading,
    error: apiKeysError,
    refetch: refetchApiKeys,
  } = useApiQuery(authListAPIKeys, []);

  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [createKeyError, setCreateKeyError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<CreateAPIKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAddPasskey = useCallback(async () => {
    setPasskeyError(null);
    setIsAddingPasskey(true);
    try {
      const { options, sessionID } = await authAddPasskeyBegin();
      const credential = await startRegistration({ optionsJSON: options });
      await authAddPasskeyFinish(sessionID, credential, navigator.platform || 'Passkey');
      refetchPasskeys();
    } catch (err) {
      setPasskeyError(err instanceof Error ? err.message : 'Failed to register passkey');
    } finally {
      setIsAddingPasskey(false);
    }
  }, [refetchPasskeys]);

  async function handleDeletePasskey(id: string) {
    await authDeletePasskey(id);
    refetchPasskeys();
  }

  async function handleCreateAPIKey(e: FormEvent) {
    e.preventDefault();
    setCreateKeyError(null);
    setIsCreatingKey(true);
    try {
      const result = await authCreateAPIKey(newKeyName);
      setCreatedKey(result);
      setNewKeyName('');
      setShowCreateKey(false);
      refetchApiKeys();
    } catch (err) {
      setCreateKeyError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreatingKey(false);
    }
  }

  async function handleRevokeAPIKey(id: string) {
    await authRevokeAPIKey(id);
    refetchApiKeys();
  }

  async function handleCopyKey() {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const loading = passkeysLoading || apiKeysLoading;
  const error = passkeysError || apiKeysError;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h4 className="mb-3">Settings</h4>
      <p className="text-body-secondary">
        Signed in as <strong>{user?.username}</strong>
      </p>

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
            onClick={() => setShowCreateKey(!showCreateKey)}
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

      {createdKey && (
        <div className="alert alert-success" role="alert">
          <h6 className="alert-heading">API Key Created</h6>
          <p className="mb-2 small">Save this key now. You will not be able to see it again.</p>
          <div className="d-flex gap-2 align-items-center">
            <code className="flex-grow-1 text-break">{createdKey.key}</code>
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
            onClick={() => setCreatedKey(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {showCreateKey && (
        <div className="card mb-3">
          <div className="card-body">
            {createKeyError && (
              <div className="alert alert-danger py-2 small" role="alert">
                {createKeyError}
              </div>
            )}
            <form onSubmit={handleCreateAPIKey}>
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
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={isCreatingKey}>
                  {isCreatingKey ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowCreateKey(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
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
    </div>
  );
}
