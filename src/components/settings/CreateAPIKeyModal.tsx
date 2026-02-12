import type { FormEvent } from 'react';
import { useState, useMemo } from 'react';

import type { CreateAPIKeyResponse } from '../../api';
import { settingsCreateAPIKey } from '../../api';
import { CopyButton, ModalBase, ModalHeader, ModalBody, ModalFooter, Button } from '../common';
import { formatRelativeTime, generateName } from '../../utils';

interface CreateAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAPIKeyModal({ isOpen, onClose, onCreated }: CreateAPIKeyModalProps) {
  const [newKeyName, setNewKeyName] = useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps -- regenerate each time modal opens
  const defaultKeyName = useMemo(() => generateName(), [isOpen]);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [newKeyExpiresAt, setNewKeyExpiresAt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<CreateAPIKeyResponse | null>(null);

  function handleClose() {
    const wasCreated = !!createdKey;
    setNewKeyName('');
    setHasExpiry(false);
    setNewKeyExpiresAt('');
    setCreatedKey(null);
    setError(null);
    if (wasCreated) onCreated();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsCreating(true);
    try {
      const expiresAt =
        hasExpiry && newKeyExpiresAt
          ? Math.floor(new Date(newKeyExpiresAt).getTime() / 1000)
          : undefined;
      const result = await settingsCreateAPIKey(newKeyName.trim() || defaultKeyName, expiresAt);
      setCreatedKey(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the API key. Try again.");
    } finally {
      setIsCreating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <ModalBase onClose={handleClose} ariaLabelledBy="create-api-key-title">
      <ModalHeader onClose={handleClose} titleId="create-api-key-title">
        Create API Key
      </ModalHeader>
      <ModalBody>
        {createdKey ? (
          <>
            <p className="small text-body-secondary">
              Make sure to save this key somewhere safe. It acts as your password and can&rsquo;t be
              retrieved once you close this dialog.
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
            <CopyButton text={createdKey.key} />
            {createdKey.expiresAt && (
              <p className="small text-body-secondary mt-2 mb-0">
                Expires {formatRelativeTime(createdKey.expiresAt)}
              </p>
            )}
          </>
        ) : (
          <form id="create-api-key-form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                {error}
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
      </ModalBody>
      <ModalFooter>
        {createdKey ? (
          <Button onClick={handleClose}>Done</Button>
        ) : (
          <>
            <Button variant="outline-secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" form="create-api-key-form" loading={isCreating}>
              Create
            </Button>
          </>
        )}
      </ModalFooter>
    </ModalBase>
  );
}
