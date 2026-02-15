import type { FormEvent } from 'react';
import { useState } from 'react';

import type { AdminCreateUserResponse } from '../../api';
import { adminCreateUser } from '../../api';
import { CopyButton, ModalBase, ModalHeader, ModalBody, ModalFooter, Button } from '../common';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
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
      setError("Couldn't create the user. Try again.");
    } finally {
      setIsCreating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <ModalBase onClose={handleClose} ariaLabelledBy="create-user-modal-title">
      {createdResult ? (
        <>
          <ModalHeader onClose={handleClose} titleId="create-user-modal-title">
            User created
          </ModalHeader>
          <ModalBody>
            <div className="alert alert-success mb-0" role="status">
              <p className="mb-2 small">
                Temporary API key for <strong>{createdResult.user.username}</strong>. Save it now —
                it expires in 24 hours and can&apos;t be retrieved later.
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
            <Button onClick={handleClose}>Done</Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalHeader onClose={handleClose} titleId="create-user-modal-title">
            Add User
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
                  Username
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
                  Display Name
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
                  Email
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
                  Administrator
                </label>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={isCreating}>
                Add
              </Button>
            </ModalFooter>
          </form>
        </>
      )}
    </ModalBase>
  );
}
