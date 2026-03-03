import { useState } from 'react';

import type { BarcodeData, ProductGroupData } from '../../domain';
import { ServingSize } from '../../domain';
import { formatSignificant } from '../../utils';
import type { Note } from '../NotesDisplay';
import {
  SectionHeader,
  Button,
  CircularButton,
  CircularButtonGroup,
  DeleteButton,
  NoteContent,
} from '../common';

import GroupBarcodeModal from './GroupBarcodeModal';

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
  onEdit,
  onRemove,
}: {
  barcode: BarcodeData;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const servingSize = ServingSize.fromObject(barcode.servingSize) ?? ServingSize.servings(1);
  const notes = (barcode.notes ?? []) as Note[];

  return (
    <div className="list-group-item">
      <div className="d-flex align-items-center gap-2">
        <code className="fw-medium">{barcode.code}</code>
        <div className="flex-grow-1" />
        <span className="text-body-secondary small">{formatServingSizeLabel(servingSize)}</span>
        <CircularButtonGroup>
          <CircularButton aria-label={`Edit barcode ${barcode.code}`} onClick={onEdit}>
            <i className="bi bi-pencil" aria-hidden="true" />
          </CircularButton>
          <DeleteButton ariaLabel={`Remove barcode ${barcode.code}`} onClick={onRemove} />
        </CircularButtonGroup>
      </div>
      {notes.length > 0 && (
        <ul className="list-unstyled mb-0 mt-1 small">
          {/* eslint-disable react/no-array-index-key -- Notes lack stable IDs */}
          {notes.map((note, i) => (
            <li key={i}>
              <NoteContent note={note} />
            </li>
          ))}
          {/* eslint-enable react/no-array-index-key */}
        </ul>
      )}
    </div>
  );
}

interface GroupBarcodesSectionProps {
  group: ProductGroupData;
  onChange: (group: ProductGroupData) => void;
}

export default function GroupBarcodesSection({ group, onChange }: GroupBarcodesSectionProps) {
  const barcodes = group.barcodes ?? [];
  const [showAddModal, setShowAddModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  function handleAdd(barcode: BarcodeData) {
    setShowAddModal(false);
    onChange({ ...group, barcodes: [...barcodes, barcode] });
  }

  function handleEdit(index: number, barcode: BarcodeData) {
    setEditIndex(null);
    onChange({ ...group, barcodes: barcodes.map((bc, i) => (i === index ? barcode : bc)) });
  }

  function handleRemove(index: number) {
    onChange({ ...group, barcodes: barcodes.filter((_, i) => i !== index) });
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
              onEdit={() => setEditIndex(i)}
              onRemove={() => handleRemove(i)}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-body-secondary small mb-0">No barcodes</p>
          </div>
        </div>
      )}

      {showAddModal && (
        <GroupBarcodeModal
          group={group}
          onSave={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editIndex != null && (
        <GroupBarcodeModal
          group={group}
          barcode={barcodes[editIndex]}
          onSave={(bc) => handleEdit(editIndex, bc)}
          onClose={() => setEditIndex(null)}
        />
      )}
    </>
  );
}
