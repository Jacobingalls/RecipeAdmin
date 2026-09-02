import type { FormEvent } from 'react';
import { useState } from 'react';

import type { AdminCreateUserResponse } from '../../api';
import { adminCreateUser } from '../../api';
import { useTranslation } from '../../contexts/LocaleContext';
import { CopyButton, ModalBase, ModalHeader, ModalBody, ModalFooter, Button } from '../common';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
  const { t, raw } = useTranslation();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdResult, setCreatedResult] = useState<AdminCreateUserResponse | null>(null);

  function handleClose() {
    const wasCreated = !!createdResult;
    setUsername('');
    setDisplayName('');
    setEmail('');
    setIsAdmin(false);
    setError(null);
    setCreatedResult(null);
    if (wasCreated) onUserCreated();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsCreating(true);
    try {
      const result = await adminCreateUser(username, displayName, email, isAdmin);
      setCreatedResult(result);
    } catch (err) {
      console.error("Couldn't create user", err);
      setError(t('createUser.error'));
    } finally {
      setIsCreating(false);
    }
  }

  if (!isOpen) return null;

  // The username is emphasized inside the sentence, so render around the placeholder.
  const [beforeName, afterName] = raw('createUser.tempKeyNotice').split('{name}');

  return (
    <ModalBase onClose={handleClose} ariaLabelledBy="create-user-modal-title">
      {createdResult ? (
        <>
          <ModalHeader onClose={handleClose} titleId="create-user-modal-title">
            {t('createUser.created')}
          </ModalHeader>
          <ModalBody>
            <div className="alert alert-success mb-0" role="status">
              <p className="mb-2 small">
                {beforeName}
                <strong>{createdResult.user.username}</strong>
                {afterName}
              </p>
              <div className="d-flex gap-2 align-items-center">
                <code className="flex-grow-1 text-break">{createdResult.temporaryAPIKey}</code>
                <CopyButton
                  text={createdResult.temporaryAPIKey}
                  className="btn btn-outline-success btn-sm"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose}>{t('common.done')}</Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalHeader onClose={handleClose} titleId="create-user-modal-title">
            {t('createUser.title')}
          </ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="new-username" className="form-label">
                  {t('createUser.username')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="new-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="new-display-name" className="form-label">
                  {t('createUser.displayName')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="new-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="new-email" className="form-label">
                  {t('createUser.email')}
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="new-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="new-is-admin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="new-is-admin">
                  {t('createUser.administrator')}
                </label>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={isCreating}>
                {t('common.add')}
              </Button>
            </ModalFooter>
          </form>
        </>
      )}
    </ModalBase>
  );
}
