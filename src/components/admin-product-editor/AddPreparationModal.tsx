import { useState, useId } from 'react';

import type { ApiProduct } from '../../api';
import { ModalBase, ModalHeader, ModalBody, ModalFooter, Button } from '../common';

interface AddPreparationModalProps {
  product: ApiProduct;
  onChange: (product: ApiProduct) => void;
  onClose: () => void;
}

export default function AddPreparationModal({
  product,
  onChange,
  onClose,
}: AddPreparationModalProps) {
  const titleId = useId();
  const [name, setName] = useState('');

  function handleCreate() {
    if (!name.trim()) return;
    const newPrepId = crypto.randomUUID();
    const updatedProduct: ApiProduct = {
      ...product,
      preparations: [
        ...product.preparations,
        {
          id: newPrepId,
          name: name.trim(),
          nutritionalInformation: { calories: { amount: 0, unit: 'kcal' } },
          categories: [],
          customSizes: [],
        },
      ],
    };
    onChange(updatedProduct);
    onClose();
  }

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId}>
      <ModalHeader onClose={onClose} titleId={titleId}>
        New preparation
      </ModalHeader>
      <ModalBody>
        <label htmlFor="prep-name" className="form-label">
          Name
        </label>
        <input
          type="text"
          className="form-control form-control-sm"
          id="prep-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cooked"
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!name.trim()} onClick={handleCreate}>
          Create
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}
