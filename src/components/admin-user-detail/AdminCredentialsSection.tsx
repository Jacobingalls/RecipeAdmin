import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { AdminTempAPIKeyResponse, PasskeyInfo, AdminAPIKeyInfo } from '../../api';
import { adminDeleteUserPasskey, adminDeleteUserAPIKey, adminCreateUserAPIKey } from '../../api';
import { SectionHeader, CredentialRow, TypeToConfirmModal, Button } from '../common';

import TempAPIKeyModal from './TempAPIKeyModal';

/**
 * Manages passkeys and API keys for a user within the admin user detail page.
 *
 * Use this for the admin view where credentials are managed on behalf of another user.
 * For the self-service settings page, see `CredentialsSection` in `components/settings/`.
 */
interface AdminCredentialsSectionProps {
  userId: string;
  passkeys: PasskeyInfo[];
  apiKeys: AdminAPIKeyInfo[];
  onChanged: () => void;
}

export default function AdminCredentialsSection({
  userId,
  passkeys,
  apiKeys,
  onChanged,
}: AdminCredentialsSectionProps) {
  const { t } = useTranslation();
  const [now] = useState(Date.now);
  const [tempKeyModal, setTempKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState<AdminTempAPIKeyResponse | null>(null);
  const [deleteCredential, setDeleteCredential] = useState<{
    type: 'passkey' | 'apiKey';
    id: string;
    name: string;
  } | null>(null);

  async function generateTempKey() {
    setTempKeyModal(true);
    const result = await adminCreateUserAPIKey(userId);
    setTempKey(result);
    onChanged();
  }

  function closeTempKeyModal() {
    setTempKeyModal(false);
    setTempKey(null);
  }

  async function handleConfirmDeleteCredential() {
    if (!deleteCredential) return;
    if (deleteCredential.type === 'passkey') {
      await adminDeleteUserPasskey(userId, deleteCredential.id);
    } else {
      await adminDeleteUserAPIKey(userId, deleteCredential.id);
    }
    setDeleteCredential(null);
    onChanged();
  }

  const isPasskey = deleteCredential?.type === 'passkey';
  return (
    <>
      <SectionHeader title={t('adminUser.credentials')} className="mt-5">
        <Button variant="dark" size="sm" onClick={generateTempKey}>
          {t('adminUser.generateTempKey')}
        </Button>
      </SectionHeader>

      <TempAPIKeyModal isOpen={tempKeyModal} tempKey={tempKey} onClose={closeTempKeyModal} />

      {passkeys.length > 0 || apiKeys.length > 0 ? (
        <div className="list-group mb-3">
          {passkeys.map((pk) => (
            <CredentialRow
              key={pk.id}
              kind="passkey"
              name={pk.name}
              createdAt={pk.createdAt}
              onDelete={() => setDeleteCredential({ type: 'passkey', id: pk.id, name: pk.name })}
            />
          ))}
          {apiKeys.map((ak) => {
            const expired = ak.expiresAt != null && ak.expiresAt * 1000 < now;
            return (
              <CredentialRow
                key={ak.id}
                kind="apiKey"
                name={ak.name}
                createdAt={ak.createdAt}
                expiresAt={ak.expiresAt}
                isTemporary={ak.isTemporary}
                isExpired={expired}
                onDelete={async () => {
                  if (expired) {
                    await adminDeleteUserAPIKey(userId, ak.id);
                    onChanged();
                  } else {
                    setDeleteCredential({ type: 'apiKey', id: ak.id, name: ak.name });
                  }
                }}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-body-secondary small">{t('adminUser.noCredentials')}</p>
      )}

      <TypeToConfirmModal
        isOpen={!!deleteCredential}
        title={t(isPasskey ? 'credentials.deletePasskeyTitle' : 'credentials.revokeApiKeyTitle')}
        message={
          <>
            <Trans
              i18nKey={isPasskey ? 'credentials.deleteMessage' : 'credentials.revokeMessage'}
              values={{ name: deleteCredential?.name }}
              components={{ strong: <strong /> }}
            />
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
