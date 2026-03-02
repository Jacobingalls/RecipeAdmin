import { useState, useId } from 'react';

import type { ApiProduct } from '../../api';
import type { BarcodeData, PreparationData } from '../../domain';
import { Preparation, ServingSize } from '../../domain';
import { buildOptionGroups, fallbackOptionGroups } from '../../config/unitConfig';
import type { Note } from '../NotesDisplay';
import ServingSizeSelector from '../ServingSizeSelector';
import { Button, ModalBase, ModalHeader, ModalBody, ModalFooter } from '../common';

import NotesSection from './NotesSection';

/** barcode.preparationID -> product.defaultPreparationID -> first preparation */
export function resolvePrep(
  barcode: BarcodeData,
  product: ApiProduct,
): PreparationData | undefined {
  const preps = product.preparations ?? [];
  if (preps.length === 0) return undefined;
  const id = barcode.preparationID ?? product.defaultPreparationID;
  return (id ? preps.find((p) => p.id === id) : undefined) ?? preps[0];
}

interface BarcodeModalProps {
  product: ApiProduct;
  barcode?: BarcodeData;
  onSave: (barcode: BarcodeData) => void;
  onClose: () => void;
}

export default function BarcodeModal({ product, barcode, onSave, onClose }: BarcodeModalProps) {
  const titleId = useId();
  const editing = !!barcode;
  const [code, setCode] = useState(barcode?.code ?? '');
  const [prepId, setPrepId] = useState<string | undefined>(barcode?.preparationID);
  const [servingSize, setServingSize] = useState<ServingSize>(
    (barcode?.servingSize ? ServingSize.fromObject(barcode.servingSize) : null) ??
      ServingSize.servings(1),
  );
  const [notesState, setNotesState] = useState<Note[]>((barcode?.notes ?? []) as Note[]);

  const preps = product.preparations ?? [];
  const draftBarcode: BarcodeData = { code, preparationID: prepId };
  const resolvedPrepData = resolvePrep(draftBarcode, product);
  const resolvedPrep = resolvedPrepData ? new Preparation(resolvedPrepData) : undefined;
  const selectorGroups = resolvedPrep ? buildOptionGroups(resolvedPrep) : fallbackOptionGroups;
  const defaultLabel =
    (preps.find((p) => p.id === product.defaultPreparationID) ?? preps[0])?.name ?? 'Default';

  function handleSubmit() {
    const result: BarcodeData = { code: code.trim() };
    if (prepId) result.preparationID = prepId;
    if (servingSize.type !== 'servings' || servingSize.amount !== 1) {
      result.servingSize = servingSize.toApiObject();
    }
    if (notesState.length > 0) result.notes = notesState;
    onSave(result);
  }

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId}>
      <ModalHeader onClose={onClose} titleId={titleId}>
        {editing ? 'Edit barcode' : 'Add barcode'}
      </ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <label htmlFor="barcode-code" className="form-label">
            Barcode
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="barcode-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 012345678905"
          />
        </div>
        {preps.length > 0 && (
          <div className="mb-3">
            <label htmlFor="barcode-prep" className="form-label">
              Preparation
            </label>
            <select
              className="form-select form-select-sm"
              id="barcode-prep"
              value={prepId ?? ''}
              onChange={(e) => setPrepId(e.target.value || undefined)}
            >
              <option value="">Default ({defaultLabel})</option>
              {preps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.id}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-3">
          <span className="form-label d-block">Serving size</span>
          <ServingSizeSelector
            size="sm"
            groups={selectorGroups}
            value={servingSize}
            onChange={setServingSize}
            amountAriaLabel="Barcode serving amount"
            unitAriaLabel="Barcode serving unit"
          />
        </div>
        <NotesSection notes={notesState} onChange={setNotesState} />
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!code.trim()} onClick={handleSubmit}>
          {editing ? 'Save' : 'Add'}
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}
