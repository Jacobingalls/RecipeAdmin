import { useState, useMemo } from 'react';

import type { ProductGroupData, ServingSizeType } from '../../domain';
import { ServingSize } from '../../domain';
import type { CustomSizeData } from '../../domain/CustomSize';
import { massUnits, volumeUnits, energyUnits } from '../../config/unitConfig';
import type { OptionGroup } from '../../config/unitConfig';
import { SectionHeader, DeleteButton } from '../common';
import ServingSizeSelector from '../ServingSizeSelector';

import { AddCustomSizeModal, CreateCustomSizeModal } from './CustomSizeModals';

type CustomSizeModal = 'preset' | 'custom' | null;

interface GroupCustomSizesSectionProps {
  group: ProductGroupData;
  onChange: (group: ProductGroupData) => void;
}

const optionGroups: OptionGroup[] = [
  {
    label: 'Servings',
    options: [
      {
        type: 'servings' as ServingSizeType,
        value: 'servings',
        label: 'Servings',
        aliases: ['serving', 'servings'],
      },
    ],
  },
  {
    label: 'Mass',
    options: massUnits.map((u) => ({
      type: 'mass' as ServingSizeType,
      value: u.value,
      label: u.label,
      aliases: u.aliases,
    })),
  },
  {
    label: 'Volume',
    options: volumeUnits.map((u) => ({
      type: 'volume' as ServingSizeType,
      value: u.value,
      label: u.label,
      aliases: u.aliases,
    })),
  },
  {
    label: 'Energy',
    options: energyUnits.map((u) => ({
      type: 'energy' as ServingSizeType,
      value: u.value,
      label: u.label,
      aliases: u.aliases,
    })),
  },
];

export default function GroupCustomSizesSection({ group, onChange }: GroupCustomSizesSectionProps) {
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
      <SectionHeader title="Custom sizes" className="mt-5">
        <div className="dropdown">
          <button
            className="btn btn-dark btn-sm dropdown-toggle px-3"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Add
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" type="button" onClick={() => setModal('preset')}>
                <i className="bi bi-list-ul me-2" aria-hidden="true" />
                Preset size
              </button>
            </li>
            <li>
              <button className="dropdown-item" type="button" onClick={() => setModal('custom')}>
                <i className="bi bi-plus-circle me-2" aria-hidden="true" />
                Custom size
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
                    amountAriaLabel={`${cs.name} amount`}
                    unitAriaLabel={`${cs.name} unit`}
                  />
                  <DeleteButton ariaLabel={`Remove ${cs.name}`} onClick={() => handleRemove(i)} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-body-secondary small mb-0">No custom sizes</p>
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
