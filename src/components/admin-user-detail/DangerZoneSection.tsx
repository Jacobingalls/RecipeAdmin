import { useState } from 'react';

import { adminDeleteUser, adminRevokeUserSessions } from '../../api';
import {
  SectionHeader,
  TypeToConfirmModal,
  Button,
  ModalBase,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../common';

interface DangerZoneSectionProps {
  userId: string;
  username: string;
  onDeleted: () => void;
}

export default function DangerZoneSection({ userId, username, onDeleted }: DangerZoneSectionProps) {
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [revokeSessionsSuccess, setRevokeSessionsSuccess] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRevokeSessions() {
    setShowRevokeConfirm(false);
    setIsRevokingSessions(true);
    setRevokeSessionsSuccess(false);
    try {
      await adminRevokeUserSessions(userId);
      setRevokeSessionsSuccess(true);
    } catch (err) {
      console.error("Couldn't revoke sessions", err);
      setError("Couldn't revoke sessions. Try again.");
    } finally {
      setIsRevokingSessions(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await adminDeleteUser(userId);
      onDeleted();
    } catch (err) {
      console.error("Couldn't delete user", err);
      setError("Couldn't delete this user. Try again.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <SectionHeader title="Account actions" className="mt-5" />
      {revokeSessionsSuccess && (
        <div className="alert alert-success alert-dismissible small" role="status">
          <strong style={{ opacity: 0.8 }}>All sessions revoked</strong>
          <p className="mb-0 mt-1">
            Active sessions may remain valid briefly until their current access token expires.
          </p>
          <button
            type="button"
            className="btn-close btn-close-white"
            style={{ opacity: 0.8 }}
            aria-label="Dismiss"
            onClick={() => setRevokeSessionsSuccess(false)}
          />
        </div>
      )}
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}
      <div className="list-group border-danger">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>Revoke all sessions</strong>
            <p className="text-body-secondary small mb-0">
              Log this user out of all devices immediately.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={() => setShowRevokeConfirm(true)}
            loading={isRevokingSessions}
          >
            Revoke sessions
          </Button>
        </div>
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>Delete this user</strong>
            <p className="text-body-secondary small mb-0">
              This will permanently delete this user and all their data. This can&apos;t be undone.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete user
          </Button>
        </div>
      </div>

      {showRevokeConfirm && (
        <ModalBase
          onClose={() => setShowRevokeConfirm(false)}
          ariaLabelledBy="revoke-sessions-title"
        >
          <ModalHeader onClose={() => setShowRevokeConfirm(false)} titleId="revoke-sessions-title">
            Revoke all sessions
          </ModalHeader>
          <ModalBody>
            Revoke all sessions for <strong>{username}</strong>? They will be logged out of all
            devices.
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowRevokeConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevokeSessions}>
              Revoke sessions
            </Button>
          </ModalFooter>
        </ModalBase>
      )}

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title="Delete user"
        message={
          <>
            This will permanently delete <strong>{username}</strong>. This action cannot be undone.
          </>
        }
        itemName={username}
        confirmButtonText="Delete this user"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
