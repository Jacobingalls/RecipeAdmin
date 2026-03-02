import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApiProduct } from '../../api';
import { adminDeleteProduct } from '../../api';
import { SectionHeader, TypeToConfirmModal, Button } from '../common';

interface ProductDangerZoneProps {
  product: ApiProduct;
}

export default function ProductDangerZone({ product }: ProductDangerZoneProps) {
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
      setError(err instanceof Error ? err.message : "Couldn't delete this product. Try again.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <SectionHeader title="Product actions" className="mt-5" />
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}
      <div className="list-group border-danger">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>Delete this product</strong>
            <p className="text-body-secondary small mb-0">
              This will permanently delete this product and all its data. This can&apos;t be undone.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete product
          </Button>
        </div>
      </div>

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title="Delete product"
        message={
          <>
            This will permanently delete <strong>{product.name}</strong> and all its data. This
            action can&apos;t be undone.
          </>
        }
        itemName={product.name}
        confirmButtonText="Delete this product"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
