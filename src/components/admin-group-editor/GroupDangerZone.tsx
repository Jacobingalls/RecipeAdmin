import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import type { ProductGroupData } from '../../domain';
import { adminDeleteGroup } from '../../api';
import { SectionHeader, TypeToConfirmModal, Button } from '../common';

interface GroupDangerZoneProps {
  group: ProductGroupData;
}

export default function GroupDangerZone({ group }: GroupDangerZoneProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!group.id) return;
    setIsDeleting(true);
    setError(null);
    try {
      await adminDeleteGroup(group.id);
      navigate('/admin/groups');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('groupEditor.delete.error'));
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  const groupName = group.name ?? t('groupEditor.thisGroup');

  return (
    <>
      <SectionHeader title={t('groupEditor.actions')} className="mt-5" />
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}
      <div className="list-group border-danger">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>{t('groupEditor.delete.title')}</strong>
            <p className="text-body-secondary small mb-0">{t('groupEditor.delete.description')}</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={() => setShowDeleteModal(true)}
          >
            {t('groupEditor.delete.action')}
          </Button>
        </div>
      </div>

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title={t('groupEditor.delete.modalTitle')}
        message={
          <>
            <Trans
              i18nKey="groupEditor.delete.message"
              values={{ name: groupName }}
              components={{ strong: <strong /> }}
            />
          </>
        }
        itemName={groupName}
        confirmButtonText={t('groupEditor.delete.confirm')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
