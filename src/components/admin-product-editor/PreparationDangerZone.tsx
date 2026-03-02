import { useState } from 'react';

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
  const prep = product.preparations.find((p) => p.id === preparationId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!prep) return null;

  const prepName = prep.name || 'Default';
  const isOnlyPrep = product.preparations.length <= 1;

  function handleDelete() {
    const remaining = product.preparations.filter((p) => p.id !== preparationId);
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
          <strong>Preparation actions</strong>
        </div>
        <div className="list-group list-group-flush">
          <div className="list-group-item d-flex align-items-center justify-content-between py-3">
            <div className="me-3">
              <strong>Delete this preparation</strong>
              <p className="text-body-secondary small mb-0">
                {isOnlyPrep
                  ? "Can't delete the only preparation. Add another one first."
                  : 'This will permanently delete this preparation and its nutrition data.'}
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
              Delete
            </Button>
          </div>
        </div>
      </div>

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title="Delete preparation"
        message={
          <>
            This will permanently delete <strong>{prepName}</strong> and its nutrition data. This
            can&apos;t be undone.
          </>
        }
        itemName={prepName}
        confirmButtonText="Delete preparation"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
