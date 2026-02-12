import { useState } from 'react';

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

  return (
    <>
      <SectionHeader title="Credentials" className="mt-5">
        <Button variant="dark" size="sm" onClick={generateTempKey}>
          Generate Temporary API Key
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
          {apiKeys.map((ak) => (
            <CredentialRow
              key={ak.id}
              kind="apiKey"
              name={ak.name}
              createdAt={ak.createdAt}
              expiresAt={ak.expiresAt}
              isTemporary={ak.isTemporary}
              onDelete={async () => {
                if (ak.expiresAt && ak.expiresAt * 1000 < Date.now()) {
                  await adminDeleteUserAPIKey(userId, ak.id);
                  onChanged();
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

      <TypeToConfirmModal
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
