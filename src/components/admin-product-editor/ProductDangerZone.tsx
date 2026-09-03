import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import type { ApiProduct } from '../../api';
import { adminDeleteProduct } from '../../api';
import { SectionHeader, TypeToConfirmModal, Button } from '../common';

interface ProductDangerZoneProps {
  product: ApiProduct;
}

export default function ProductDangerZone({ product }: ProductDangerZoneProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await adminDeleteProduct(product.id);
      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('productEditor.delete.error'));
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <SectionHeader title={t('productEditor.actions')} className="mt-5" />
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}
      <div className="list-group border-danger">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>{t('productEditor.delete.title')}</strong>
            <p className="text-body-secondary small mb-0">
              {t('productEditor.delete.description')}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={() => setShowDeleteModal(true)}
          >
            {t('productEditor.delete.action')}
          </Button>
        </div>
      </div>

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title={t('productEditor.delete.modalTitle')}
        message={
          <>
            <Trans
              i18nKey="productEditor.delete.message"
              values={{ name: product.name }}
              components={{ strong: <strong /> }}
            />
          </>
        }
        itemName={product.name}
        confirmButtonText={t('productEditor.delete.confirm')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
