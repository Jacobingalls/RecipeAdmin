import { useState, useCallback } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

import type { PasskeyInfo, APIKeyInfo } from '../../api';
import {
  settingsAddPasskeyBegin,
  settingsAddPasskeyFinish,
  settingsDeletePasskey,
  settingsRevokeAPIKey,
} from '../../api';
import { useTranslation } from '../../contexts/LocaleContext';
import { SectionHeader, CredentialRow, TypeToConfirmModal } from '../common';

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
  const { t, raw } = useTranslation();
  const [now] = useState(Date.now);
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
      setPasskeyError(err instanceof Error ? err.message : t('passkey.registerError'));
    } finally {
      setIsAddingPasskey(false);
    }
  }, [refetchPasskeys, t]);

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

  const isPasskey = deleteCredential?.type === 'passkey';
  // The credential name is emphasized inside the sentence, so render around the placeholder.
  const [beforeName, afterName] = raw(
    isPasskey ? 'credentials.deleteMessage' : 'credentials.revokeMessage',
  ).split('{name}');

  return (
    <>
      <SectionHeader title={t('credentials.title')} className="mt-4">
        <div className="dropdown">
          <button
            className="btn btn-dark btn-sm dropdown-toggle px-3"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {t('common.add')}
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
                {t('credentials.passkey')}
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => setShowCreateKeyModal(true)}
              >
                <i className="bi bi-key me-2" aria-hidden="true" />
                {t('credentials.apiKey')}
              </button>
            </li>
          </ul>
        </div>
      </SectionHeader>

      {passkeyError && (
        <div className="alert alert-danger alert-dismissible small" role="alert">
          <strong style={{ opacity: 0.8 }}>{t('passkey.registerErrorTitle')}</strong>
          <p className="mb-0 mt-1">{passkeyError}</p>
          <button
            type="button"
            className="btn-close btn-close-white"
            style={{ opacity: 0.8 }}
            aria-label={t('credentials.dismiss')}
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
          {apiKeys?.map((ak) => {
            const expired = ak.expiresAt != null && ak.expiresAt * 1000 < now;
            return (
              <CredentialRow
                key={ak.id}
                kind="apiKey"
                name={ak.name}
                keyPrefix={ak.keyPrefix}
                createdAt={ak.createdAt}
                expiresAt={ak.expiresAt}
                isTemporary={ak.isTemporary}
                isExpired={expired}
                onDelete={async () => {
                  if (expired) {
                    await settingsRevokeAPIKey(ak.id);
                    refetchApiKeys();
                  } else {
                    setDeleteCredential({ type: 'apiKey', id: ak.id, name: ak.name });
                  }
                }}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-body-secondary small">{t('credentials.empty')}</p>
      )}

      <TypeToConfirmModal
        isOpen={!!deleteCredential}
        title={t(isPasskey ? 'credentials.deletePasskeyTitle' : 'credentials.revokeApiKeyTitle')}
        message={
          <>
            {beforeName}
            <strong>{deleteCredential?.name}</strong>
            {afterName}
          </>
        }
        itemName={deleteCredential?.name ?? ''}
        confirmButtonText={t(
          isPasskey ? 'credentials.deletePasskeyTitle' : 'credentials.revokeKeyConfirm',
        )}
        onConfirm={handleConfirmDeleteCredential}
        onCancel={() => setDeleteCredential(null)}
      />
    </>
  );
}
