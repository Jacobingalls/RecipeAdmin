import { useState, useCallback } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

import type { PasskeyInfo, APIKeyInfo } from '../../api';
import {
  settingsAddPasskeyBegin,
  settingsAddPasskeyFinish,
  settingsDeletePasskey,
  settingsRevokeAPIKey,
} from '../../api';
import { SectionHeader, CredentialRow, ConfirmationModal } from '../common';

import CreateAPIKeyModal from './CreateAPIKeyModal';

interface CredentialsSectionProps {
  passkeys: PasskeyInfo[] | null;
  apiKeys: APIKeyInfo[] | null;
  refetchPasskeys: () => void;
  refetchApiKeys: () => void;
}

export default function CredentialsSection({
  passkeys,
  apiKeys,
  refetchPasskeys,
  refetchApiKeys,
}: CredentialsSectionProps) {
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [deleteCredential, setDeleteCredential] = useState<{
    type: 'passkey' | 'apiKey';
    id: string;
    name: string;
  } | null>(null);

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
  }

  return (
    <>
      <SectionHeader title="Credentials" className="mt-4">
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
      </SectionHeader>

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

      <CreateAPIKeyModal
        isOpen={showCreateKeyModal}
        onClose={() => setShowCreateKeyModal(false)}
        onCreated={refetchApiKeys}
      />

      {(passkeys && passkeys.length > 0) || (apiKeys && apiKeys.length > 0) ? (
        <div className="list-group mb-5">
          {passkeys?.map((pk) => (
            <CredentialRow
              key={pk.id}
              kind="passkey"
              name={pk.name}
              createdAt={pk.createdAt}
              onDelete={() => setDeleteCredential({ type: 'passkey', id: pk.id, name: pk.name })}
            />
          ))}
          {apiKeys?.map((ak) => (
            <CredentialRow
              key={ak.id}
              kind="apiKey"
              name={ak.name}
              keyPrefix={ak.keyPrefix}
              createdAt={ak.createdAt}
              expiresAt={ak.expiresAt}
              isTemporary={ak.isTemporary}
              onDelete={async () => {
                if (ak.expiresAt && ak.expiresAt * 1000 < Date.now()) {
                  await settingsRevokeAPIKey(ak.id);
                  refetchApiKeys();
                } else {
                  setDeleteCredential({ type: 'apiKey', id: ak.id, name: ak.name });
                }
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No credentials.</p>
      )}

      <ConfirmationModal
        isOpen={!!deleteCredential}
        title={deleteCredential?.type === 'passkey' ? 'Delete Passkey' : 'Revoke API Key'}
        message={
          <>
            This will permanently {deleteCredential?.type === 'passkey' ? 'delete' : 'revoke'}{' '}
            <strong>{deleteCredential?.name}</strong>. This action cannot be undone.
          </>
        }
        itemName={deleteCredential?.name ?? ''}
        confirmButtonText={deleteCredential?.type === 'passkey' ? 'Delete passkey' : 'Revoke key'}
        onConfirm={handleConfirmDeleteCredential}
        onCancel={() => setDeleteCredential(null)}
      />
    </>
  );
}
