import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { ApiProduct } from '../../api';
import { TypeToConfirmModal, Button } from '../common';

interface PreparationDangerZoneProps {
  product: ApiProduct;
  preparationId: string;
  onChange: (product: ApiProduct) => void;
  onPrepDeleted: () => void;
}

export default function PreparationDangerZone({
  product,
  preparationId,
  onChange,
  onPrepDeleted,
}: PreparationDangerZoneProps) {
  const { t } = useTranslation();
  const preparations = product.preparations ?? [];
  const prep = preparations.find((p) => p.id === preparationId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!prep) return null;

  const prepName = prep.name || t('editor.default');
  const isOnlyPrep = preparations.length <= 1;

  function handleDelete() {
    const remaining = preparations.filter((p) => p.id !== preparationId);
    const updatedProduct: ApiProduct = {
      ...product,
      preparations: remaining,
      defaultPreparationID:
        product.defaultPreparationID === preparationId
          ? remaining[0]?.id
          : product.defaultPreparationID,
    };
    onChange(updatedProduct);
    onPrepDeleted();
    setShowDeleteModal(false);
  }

  return (
    <div className="px-3 pt-3 pb-3">
      <div className="card">
        <div className="card-header">
          <strong>{t('prepEditor.actions')}</strong>
        </div>
        <div className="list-group list-group-flush">
          <div className="list-group-item d-flex align-items-center justify-content-between py-3">
            <div className="me-3">
              <strong>{t('prepEditor.delete.title')}</strong>
              <p className="text-body-secondary small mb-0">
                {t(isOnlyPrep ? 'prepEditor.delete.onlyPrep' : 'prepEditor.delete.description')}
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="flex-shrink-0"
              style={{ minWidth: '9rem' }}
              disabled={isOnlyPrep}
              onClick={() => setShowDeleteModal(true)}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </div>

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title={t('prepEditor.delete.modalTitle')}
        message={
          <>
            <Trans
              i18nKey="prepEditor.delete.message"
              values={{ name: prepName }}
              components={{ strong: <strong /> }}
            />
          </>
        }
        itemName={prepName}
        confirmButtonText={t('prepEditor.delete.confirm')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
