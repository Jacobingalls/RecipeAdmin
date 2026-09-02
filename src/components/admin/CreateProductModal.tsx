import type { FormEvent } from 'react';
import { useState } from 'react';

import type { ApiProduct } from '../../api';
import { adminUpsertProducts } from '../../api';
import { useTranslation } from '../../contexts/LocaleContext';
import { ModalBase, ModalHeader, ModalBody, ModalFooter, Button } from '../common';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (id: string) => void;
}

export default function CreateProductModal({
  isOpen,
  onClose,
  onProductCreated,
}: CreateProductModalProps) {
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
        barcodes: [],
        preparations: [
          { name: '', nutritionalInformation: { calories: { amount: 0, unit: 'kcal' } } },
        ],
        notes: [],
      } as unknown as ApiProduct;

      const [created] = await adminUpsertProducts(payload);
      onProductCreated(created.id);
      handleClose();
    } catch (err) {
      console.error("Couldn't create product", err);
      setError(t('createProduct.error'));
    } finally {
      setIsCreating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <ModalBase onClose={handleClose} ariaLabelledBy="create-product-modal-title">
      <ModalHeader onClose={handleClose} titleId="create-product-modal-title">
        {t('createProduct.title')}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="new-product-name" className="form-label">
              {t('common.name')}
            </label>
            <input
              type="text"
              className="form-control"
              id="new-product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="new-product-brand" className="form-label">
              {t('common.brand')}
            </label>
            <input
              type="text"
              className="form-control"
              id="new-product-brand"
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
