import { useState, useMemo } from 'react';

import type { ProductGroupData } from '../../domain';
import { ServingSize } from '../../domain';
import type { CustomSizeData } from '../../domain/CustomSize';
import {
  massUnits,
  volumeUnits,
  energyUnits,
  servingsGroup,
  unitGroup,
} from '../../config/unitConfig';
import type { OptionGroup } from '../../config/unitConfig';
import { useTranslation } from '../../contexts/LocaleContext';
import { SectionHeader, DeleteButton } from '../common';
import ServingSizeSelector from '../ServingSizeSelector';

import { AddCustomSizeModal, CreateCustomSizeModal } from './CustomSizeModals';

type CustomSizeModal = 'preset' | 'custom' | null;

interface GroupCustomSizesSectionProps {
  group: ProductGroupData;
  onChange: (group: ProductGroupData) => void;
}

export default function GroupCustomSizesSection({ group, onChange }: GroupCustomSizesSectionProps) {
  const { t } = useTranslation();
  const optionGroups: OptionGroup[] = [
    servingsGroup(),
    unitGroup('unit.group.mass', massUnits, 'mass'),
    unitGroup('unit.group.volume', volumeUnits, 'volume'),
    unitGroup('unit.group.energy', energyUnits, 'energy'),
  ];

  const customSizes = useMemo(() => group.customSizes ?? [], [group.customSizes]);
  const [modal, setModal] = useState<CustomSizeModal>(null);
  const existingNames = useMemo(
    () => new Set(customSizes.map((cs) => cs.name ?? '')),
    [customSizes],
  );

  function updateCustomSizes(newSizes: CustomSizeData[]) {
    onChange({ ...group, customSizes: newSizes });
  }

  function handleAdd(data: CustomSizeData) {
    setModal(null);
    updateCustomSizes([...customSizes, data]);
  }

  function handleRemove(index: number) {
    updateCustomSizes(customSizes.filter((_, i) => i !== index));
  }

  function handleServingSizeChange(index: number, ss: ServingSize) {
    const cs = customSizes[index];
    updateCustomSizes(
      customSizes.map((item, i) => (i === index ? { ...cs, servingSize: ss.toApiObject() } : item)),
    );
  }

  return (
    <>
      <SectionHeader title={t('editor.customSizes')} className="mt-5">
        <div className="dropdown">
          <button
            className="btn btn-dark btn-sm dropdown-toggle px-3"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {t('common.add')}
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" type="button" onClick={() => setModal('preset')}>
                <i className="bi bi-list-ul me-2" aria-hidden="true" />
                {t('editor.presetSize')}
              </button>
            </li>
            <li>
              <button className="dropdown-item" type="button" onClick={() => setModal('custom')}>
                <i className="bi bi-plus-circle me-2" aria-hidden="true" />
                {t('editor.customSize')}
              </button>
            </li>
          </ul>
        </div>
      </SectionHeader>
      {customSizes.length > 0 ? (
        <div className="list-group">
          {customSizes.map((cs, i) => {
            const servingSize = ServingSize.fromObject(cs.servingSize) ?? ServingSize.servings(1);
            return (
              <div
                key={cs.id ?? i}
                className="list-group-item d-flex align-items-center justify-content-between py-2"
              >
                <div>
                  <strong>{cs.name}</strong>
                  {cs.singularName && cs.singularName !== cs.name && (
                    <span className="text-body-secondary ms-2 small">
                      ({cs.singularName} / {cs.pluralName})
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <ServingSizeSelector
                    size="sm"
                    groups={optionGroups}
                    value={servingSize}
                    onChange={(ss) => handleServingSizeChange(i, ss)}
                    amountAriaLabel={t('editor.amountLabel', { name: cs.name ?? '' })}
                    unitAriaLabel={t('editor.unitLabel', { name: cs.name ?? '' })}
                  />
                  <DeleteButton
                    ariaLabel={t('editor.removeItem', { name: cs.name ?? '' })}
                    onClick={() => handleRemove(i)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-body-secondary small mb-0">{t('editor.noCustomSizes')}</p>
          </div>
        </div>
      )}

      {modal === 'preset' && (
        <AddCustomSizeModal
          existingNames={existingNames}
          onAdd={handleAdd}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'custom' && (
        <CreateCustomSizeModal onAdd={handleAdd} onClose={() => setModal(null)} />
      )}
    </>
  );
}
