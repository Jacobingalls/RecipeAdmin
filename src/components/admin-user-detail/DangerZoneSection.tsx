import { useState } from 'react';

import { adminDeleteUser, adminRevokeUserSessions } from '../../api';
import { ConfirmationModal } from '../common';

interface DangerZoneSectionProps {
  userId: string;
  username: string;
  onDeleted: () => void;
}

export default function DangerZoneSection({ userId, username, onDeleted }: DangerZoneSectionProps) {
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [revokeSessionsSuccess, setRevokeSessionsSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRevokeSessions() {
    if (
      !window.confirm(
        `Revoke all sessions for ${username}? They will be logged out of all devices.`,
      )
    ) {
      return;
    }
    setIsRevokingSessions(true);
    setRevokeSessionsSuccess(false);
    try {
      await adminRevokeUserSessions(userId);
      setRevokeSessionsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke sessions');
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
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <h5 className="mt-5 mb-3">Danger Zone</h5>
      {revokeSessionsSuccess && (
        <div className="alert alert-success alert-dismissible small" role="status">
          <strong style={{ opacity: 0.8 }}>All Sessions Revoked</strong>
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
          <button
            type="button"
            className="btn btn-secondary btn-sm flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={handleRevokeSessions}
            disabled={isRevokingSessions}
          >
            {isRevokingSessions ? 'Revoking...' : 'Revoke sessions'}
          </button>
        </div>
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>Delete this user</strong>
            <p className="text-body-secondary small mb-0">
              Permanently remove this user and all their data. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-danger btn-sm flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete user
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete User"
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
