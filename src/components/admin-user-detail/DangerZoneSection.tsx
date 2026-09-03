import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      setError(t('adminUser.revokeSessions.error'));
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
      setError(t('adminUser.delete.error'));
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <SectionHeader title={t('adminUser.accountActions')} className="mt-5" />
      {revokeSessionsSuccess && (
        <div className="alert alert-success alert-dismissible small" role="status">
          <strong style={{ opacity: 0.8 }}>{t('adminUser.sessionsRevoked.title')}</strong>
          <p className="mb-0 mt-1">{t('adminUser.sessionsRevoked.description')}</p>
          <button
            type="button"
            className="btn-close btn-close-white"
            style={{ opacity: 0.8 }}
            aria-label={t('adminUser.sessionsRevoked.dismiss')}
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
            <strong>{t('adminUser.revokeSessions.title')}</strong>
            <p className="text-body-secondary small mb-0">
              {t('adminUser.revokeSessions.description')}
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
            {t('adminUser.revokeSessions.action')}
          </Button>
        </div>
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>{t('adminUser.delete.title')}</strong>
            <p className="text-body-secondary small mb-0">{t('adminUser.delete.description')}</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={() => setShowDeleteModal(true)}
          >
            {t('adminUser.delete.action')}
          </Button>
        </div>
      </div>

      {showRevokeConfirm && (
        <ModalBase
          onClose={() => setShowRevokeConfirm(false)}
          ariaLabelledBy="revoke-sessions-title"
        >
          <ModalHeader onClose={() => setShowRevokeConfirm(false)} titleId="revoke-sessions-title">
            {t('adminUser.revokeSessions.title')}
          </ModalHeader>
          <ModalBody>
            <Trans
              i18nKey="adminUser.revokeSessions.confirm"
              values={{ name: username }}
              components={{ strong: <strong /> }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowRevokeConfirm(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleRevokeSessions}>
              {t('adminUser.revokeSessions.action')}
            </Button>
          </ModalFooter>
        </ModalBase>
      )}

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title={t('adminUser.delete.modalTitle')}
        message={
          <>
            <Trans
              i18nKey="adminUser.delete.message"
              values={{ name: username }}
              components={{ strong: <strong /> }}
            />
          </>
        }
        itemName={username}
        confirmButtonText={t('adminUser.delete.confirm')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
