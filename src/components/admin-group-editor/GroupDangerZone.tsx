import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ProductGroupData } from '../../domain';
import { adminDeleteGroup } from '../../api';
import { SectionHeader, TypeToConfirmModal, Button } from '../common';

interface GroupDangerZoneProps {
  group: ProductGroupData;
}

export default function GroupDangerZone({ group }: GroupDangerZoneProps) {
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
      setError(err instanceof Error ? err.message : "Couldn't delete this group. Try again.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  const groupName = group.name ?? 'this group';

  return (
    <>
      <SectionHeader title="Group actions" className="mt-5" />
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}
      <div className="list-group border-danger">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <div className="me-3">
            <strong>Delete this group</strong>
            <p className="text-body-secondary small mb-0">
              This will permanently delete this group and all its data. This can&apos;t be undone.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="flex-shrink-0"
            style={{ minWidth: '9rem' }}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete group
          </Button>
        </div>
      </div>

      <TypeToConfirmModal
        isOpen={showDeleteModal}
        title="Delete group"
        message={
          <>
            This will permanently delete <strong>{groupName}</strong> and all its data. This action
            can&apos;t be undone.
          </>
        }
        itemName={groupName}
        confirmButtonText="Delete this group"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
