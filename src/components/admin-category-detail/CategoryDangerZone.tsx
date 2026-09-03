import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import type { ApiCategory, ApiLookupItem } from '../../api';
import { adminDeleteCategory, getCategoryItems } from '../../api';
import { useCategories } from '../../contexts/CategoriesContext';
import { SectionHeader, TypeToConfirmModal, Button } from '../common';

interface CategoryDangerZoneProps {
  category: ApiCategory;
}

export default function CategoryDangerZone({ category }: CategoryDangerZoneProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refresh } = useCategories();
  const [items, setItems] = useState<ApiLookupItem[] | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCategoryItems(category.id)
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [category.id]);

  const hasChildren = category.children.length > 0;
  const hasItems = items !== null && items.length > 0;
  const canDelete = !hasChildren && !hasItems;

  let disabledReason: string | null = null;
  if (hasChildren) {
    disabledReason = t('categoryEditor.delete.hasChildren');
  } else if (hasItems) {
    disabledReason = t('categoryEditor.delete.hasItems');
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await adminDeleteCategory(category.id);
      refresh();
      navigate('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('categoryEditor.delete.error'));
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <SectionHeader title={t('categoryEditor.actions')} className="mt-5" />
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}
      <div className="list-group border-danger">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>{t('categoryEditor.delete.title')}</strong>
            <p className="text-body-secondary small mb-0">
              {disabledReason ?? t('categoryEditor.delete.description')}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="flex-shrink-0"
            style={{ minWidth: '9rem' }}
            disabled={!canDelete}
            onClick={() => setShowDeleteModal(true)}
          >
            {t('categoryEditor.delete.action')}
          </Button>
        </div>
      </div>

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title={t('categoryEditor.delete.modalTitle')}
        message={
          <>
            <Trans
              i18nKey="categoryEditor.delete.message"
              values={{ name: category.displayName }}
              components={{ strong: <strong /> }}
            />
          </>
        }
        itemName={category.displayName}
        confirmButtonText={t('categoryEditor.delete.confirm')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
