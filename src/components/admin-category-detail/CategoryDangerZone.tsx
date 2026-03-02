import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApiCategory, ApiLookupItem } from '../../api';
import { adminDeleteCategory, getCategoryItems } from '../../api';
import { useCategories } from '../../contexts/CategoriesContext';
import { SectionHeader, TypeToConfirmModal, Button } from '../common';

interface CategoryDangerZoneProps {
  category: ApiCategory;
}

export default function CategoryDangerZone({ category }: CategoryDangerZoneProps) {
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
    disabledReason = 'Remove all children before deleting this category.';
  } else if (hasItems) {
    disabledReason = 'This category has products assigned to it. Remove them first.';
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await adminDeleteCategory(category.id);
      refresh();
      navigate('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete this category. Try again.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <SectionHeader title="Category actions" className="mt-5" />
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}
      <div className="list-group border-danger">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>Delete this category</strong>
            <p className="text-body-secondary small mb-0">
              {disabledReason ??
                "This will permanently delete this category. This can't be undone."}
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
            Delete category
          </Button>
        </div>
      </div>

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title="Delete category"
        message={
          <>
            This will permanently delete <strong>{category.displayName}</strong>. This action
            can&apos;t be undone.
          </>
        }
        itemName={category.displayName}
        confirmButtonText="Delete this category"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
