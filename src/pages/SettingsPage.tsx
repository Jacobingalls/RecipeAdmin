import type { FormEvent } from 'react';
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
      const credential = await startRegistration(
        options as Parameters<typeof startRegistration>[0],
      );
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

      <h5 className="mt-4 mb-3">Passkeys</h5>
      {passkeyError && (
        <div className="alert alert-danger py-2 small" role="alert">
          {passkeyError}
        </div>
      )}
      <button
        type="button"
        className="btn btn-outline-primary btn-sm mb-3"
        onClick={handleAddPasskey}
        disabled={isAddingPasskey}
      >
        {isAddingPasskey ? 'Registering...' : 'Add Passkey'}
      </button>
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

      <div className="d-flex gap-2 mb-3">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowCreateKey(!showCreateKey)}
        >
          Create API Key
        </button>
      </div>

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
                onClick={() => handleRevokeAPIKey(ak.id)}
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
