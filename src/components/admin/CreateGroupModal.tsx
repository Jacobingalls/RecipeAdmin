import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProductGroupData } from '../../domain';
import { adminUpsertGroups } from '../../api';
import { ModalBase, ModalHeader, ModalBody, ModalFooter, Button } from '../common';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (id: string) => void;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
}: CreateGroupModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function handleClose() {
    setName('');
    setBrand('');
    setError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsCreating(true);
    try {
      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        items: [],
        notes: [],
      } as unknown as ProductGroupData;

      const [created] = await adminUpsertGroups(payload);
      onGroupCreated(created.id);
      handleClose();
    } catch (err) {
      console.error("Couldn't create group", err);
      setError(t('createGroup.error'));
    } finally {
      setIsCreating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <ModalBase onClose={handleClose} ariaLabelledBy="create-group-modal-title">
      <ModalHeader onClose={handleClose} titleId="create-group-modal-title">
        {t('createGroup.title')}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="new-group-name" className="form-label">
              {t('common.name')}
            </label>
            <input
              type="text"
              className="form-control"
              id="new-group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="new-group-brand" className="form-label">
              {t('common.brand')}
            </label>
            <input
              type="text"
              className="form-control"
              id="new-group-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={isCreating}>
            {t('common.add')}
          </Button>
        </ModalFooter>
      </form>
    </ModalBase>
  );
}
