import { useState } from 'react';

import type { ApiProduct } from '../../api';
import type { BarcodeData } from '../../domain';
import { ServingSize } from '../../domain';
import { formatSignificant } from '../../utils';
import NotesDisplay from '../NotesDisplay';
import type { Note } from '../NotesDisplay';
import {
  SectionHeader,
  Button,
  CircularButton,
  CircularButtonGroup,
  DeleteButton,
} from '../common';

import BarcodeModal, { resolvePrep } from './AddBarcodeModal';

function formatServingSizeLabel(ss: ServingSize): string {
  if (ss.type === 'servings') {
    return `${formatSignificant(ss.amount)} serving${ss.amount !== 1 ? 's' : ''}`;
  }
  if (ss.type === 'customSize') {
    const v = ss.value as { name: string; amount: number };
    return `${formatSignificant(v.amount)} ${v.name}`;
  }
  const v = ss.value as { amount: number; unit: string };
  return `${formatSignificant(v.amount)} ${v.unit}`;
}

function BarcodeRow({
  barcode,
  product,
  onEdit,
  onRemove,
}: {
  barcode: BarcodeData;
  product: ApiProduct;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const servingSize = ServingSize.fromObject(barcode.servingSize) ?? ServingSize.servings(1);
  const notes = (barcode.notes ?? []) as Note[];
  const hasExplicitPrep = !!barcode.preparationID;
  const resolvedPrepData = resolvePrep(barcode, product);
  const prepName = hasExplicitPrep ? resolvedPrepData?.name : undefined;

  return (
    <div className="list-group-item">
      <div className="d-flex align-items-center gap-2">
        <code className="fw-medium">{barcode.code}</code>
        <div className="flex-grow-1" />
        {prepName && <span className="text-body-secondary small">{prepName},</span>}
        <span className="text-body-secondary small">{formatServingSizeLabel(servingSize)}</span>
        <CircularButtonGroup>
          <CircularButton aria-label={`Edit barcode ${barcode.code}`} onClick={onEdit}>
            <i className="bi bi-pencil" aria-hidden="true" />
          </CircularButton>
          <DeleteButton ariaLabel={`Remove barcode ${barcode.code}`} onClick={onRemove} />
        </CircularButtonGroup>
      </div>
      {notes.length > 0 && (
        <div className="mt-1">
          <NotesDisplay notes={notes} />
        </div>
      )}
    </div>
  );
}

interface BarcodesSectionProps {
  product: ApiProduct;
  onChange: (product: ApiProduct) => void;
}

export default function BarcodesSection({ product, onChange }: BarcodesSectionProps) {
  const barcodes = product.barcodes ?? [];
  const [showAddModal, setShowAddModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  function handleAdd(barcode: BarcodeData) {
    setShowAddModal(false);
    onChange({ ...product, barcodes: [...barcodes, barcode] });
  }

  function handleEdit(index: number, barcode: BarcodeData) {
    setEditIndex(null);
    const updated = barcodes.map((bc, i) => (i === index ? barcode : bc));
    onChange({ ...product, barcodes: updated });
  }

  function handleRemove(index: number) {
    onChange({ ...product, barcodes: barcodes.filter((_, i) => i !== index) });
  }

  return (
    <>
      <SectionHeader title="Barcodes" className="mt-5">
        <Button size="sm" variant="dark" onClick={() => setShowAddModal(true)}>
          Add
        </Button>
      </SectionHeader>
      {barcodes.length > 0 ? (
        <div className="list-group">
          {barcodes.map((bc, i) => (
            <BarcodeRow
              key={bc.code}
              barcode={bc}
              product={product}
              onEdit={() => setEditIndex(i)}
              onRemove={() => handleRemove(i)}
            />
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No barcodes</p>
      )}

      {showAddModal && (
        <BarcodeModal product={product} onSave={handleAdd} onClose={() => setShowAddModal(false)} />
      )}
      {editIndex != null && (
        <BarcodeModal
          product={product}
          barcode={barcodes[editIndex]}
          onSave={(bc) => handleEdit(editIndex, bc)}
          onClose={() => setEditIndex(null)}
        />
      )}
    </>
  );
}
