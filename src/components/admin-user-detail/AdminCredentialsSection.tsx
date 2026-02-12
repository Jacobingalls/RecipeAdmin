import { useState } from 'react';

import type { AdminTempAPIKeyResponse, PasskeyInfo, AdminAPIKeyInfo } from '../../api';
import { adminDeleteUserPasskey, adminDeleteUserAPIKey, adminCreateUserAPIKey } from '../../api';
import { ListRow, DeleteButton, ConfirmationModal } from '../common';
import { formatRelativeTime } from '../../utils';

import TempAPIKeyModal from './TempAPIKeyModal';

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
      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <h5 className="mb-0">Credentials</h5>
        <button type="button" className="btn btn-dark btn-sm" onClick={generateTempKey}>
          Generate Temporary API Key
        </button>
      </div>

      <TempAPIKeyModal isOpen={tempKeyModal} tempKey={tempKey} onClose={closeTempKeyModal} />

      {passkeys.length > 0 || apiKeys.length > 0 ? (
        <div className="list-group mb-3">
          {passkeys.map((pk) => (
            <ListRow
              key={pk.id}
              icon="bi-fingerprint"
              content={<strong>{pk.name}</strong>}
              secondary={pk.createdAt ? <>Created {formatRelativeTime(pk.createdAt)}</> : undefined}
            >
              <DeleteButton
                ariaLabel={`Delete passkey ${pk.name}`}
                onClick={() => setDeleteCredential({ type: 'passkey', id: pk.id, name: pk.name })}
              />
            </ListRow>
          ))}
          {apiKeys.map((ak) => {
            let secondary;
            if (ak.isTemporary && ak.expiresAt) {
              secondary = <>Expires {formatRelativeTime(ak.expiresAt)}</>;
            } else if (ak.createdAt) {
              secondary = <>Created {formatRelativeTime(ak.createdAt)}</>;
            }

            return (
              <ListRow
                key={ak.id}
                icon="bi-key"
                content={<strong>{ak.name}</strong>}
                secondary={secondary}
              >
                <DeleteButton
                  ariaLabel={`Revoke API key ${ak.name}`}
                  onClick={async () => {
                    if (ak.expiresAt && ak.expiresAt * 1000 < Date.now()) {
                      await adminDeleteUserAPIKey(userId, ak.id);
                      onChanged();
                    } else {
                      setDeleteCredential({ type: 'apiKey', id: ak.id, name: ak.name });
                    }
                  }}
                />
              </ListRow>
            );
          })}
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
