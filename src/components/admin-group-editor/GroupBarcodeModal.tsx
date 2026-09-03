import { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { BarcodeData, ProductGroupData } from '../../domain';
import { ProductGroup, ServingSize } from '../../domain';
import { buildOptionGroups, buildFallbackOptionGroups } from '../../config/unitConfig';
import type { Note } from '../NotesDisplay';
import ServingSizeSelector from '../ServingSizeSelector';
import { Button, ModalBase, ModalHeader, ModalBody, ModalFooter } from '../common';
import { NotesSection } from '../admin-product-editor';

interface GroupBarcodeModalProps {
  group: ProductGroupData;
  barcode?: BarcodeData;
  onSave: (barcode: BarcodeData) => void;
  onClose: () => void;
}

export default function GroupBarcodeModal({
  group,
  barcode,
  onSave,
  onClose,
}: GroupBarcodeModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const editing = !!barcode;
  const [code, setCode] = useState(barcode?.code ?? '');
  const [servingSize, setServingSize] = useState<ServingSize>(
    (barcode?.servingSize ? ServingSize.fromObject(barcode.servingSize) : null) ??
      ServingSize.servings(1),
  );
  const [notesState, setNotesState] = useState<Note[]>(barcode?.notes ?? []);

  const pg = new ProductGroup(group);
  const selectorGroups = buildOptionGroups(pg) ?? buildFallbackOptionGroups();

  function handleSubmit() {
    const result: BarcodeData = { code: code.trim() };
    if (servingSize.type !== 'servings' || servingSize.amount !== 1) {
      result.servingSize = servingSize.toApiObject();
    }
    if (notesState.length > 0) result.notes = notesState;
    onSave(result);
  }

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId}>
      <ModalHeader onClose={onClose} titleId={titleId}>
        {t(editing ? 'editor.editBarcode' : 'editor.addBarcode')}
      </ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <label htmlFor="barcode-code" className="form-label">
            {t('editor.barcode')}
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="barcode-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('editor.barcodePlaceholder')}
          />
        </div>
        <div className="mb-3">
          <span className="form-label d-block">{t('editor.servingSize')}</span>
          <ServingSizeSelector
            size="sm"
            groups={selectorGroups}
            value={servingSize}
            onChange={setServingSize}
            amountAriaLabel={t('editor.barcodeServingAmount')}
            unitAriaLabel={t('editor.barcodeServingUnit')}
          />
        </div>
        <NotesSection notes={notesState} onChange={setNotesState} />
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button disabled={!code.trim()} onClick={handleSubmit}>
          {t(editing ? 'common.save' : 'common.add')}
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}
