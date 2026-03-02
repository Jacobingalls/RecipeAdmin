import { useState, useMemo, useId } from 'react';

import type { ApiProduct } from '../../api';
import type { ServingSizeType } from '../../domain';
import { ServingSize } from '../../domain';
import type { CustomSizeData } from '../../domain/CustomSize';
import { massUnits, volumeUnits, energyUnits } from '../../config/unitConfig';
import type { OptionGroup } from '../../config/unitConfig';
import { DeleteButton, Button, ModalBase, ModalHeader, ModalBody, ModalFooter } from '../common';
import ServingSizeSelector from '../ServingSizeSelector';

// ---------------------------------------------------------------------------
// Preset custom sizes (from RecipeKit/CustomSize+Helpers.swift)
// ---------------------------------------------------------------------------

interface PresetCustomSize {
  name: string;
  singularName: string;
  pluralName: string;
  servingSize:
    | { servings: number }
    | { mass: { amount: number; unit: string } }
    | { volume: { amount: number; unit: string } };
  group: string;
}

const PRESET_CUSTOM_SIZES: PresetCustomSize[] = [
  // Generic containers
  {
    name: 'Bag',
    singularName: 'bag',
    pluralName: 'bags',
    servingSize: { servings: 1 },
    group: 'Containers',
  },
  {
    name: 'Box',
    singularName: 'box',
    pluralName: 'boxes',
    servingSize: { servings: 1 },
    group: 'Containers',
  },
  {
    name: 'Bottle',
    singularName: 'bottle',
    pluralName: 'bottles',
    servingSize: { servings: 1 },
    group: 'Containers',
  },
  {
    name: 'Jar',
    singularName: 'jar',
    pluralName: 'jars',
    servingSize: { servings: 1 },
    group: 'Containers',
  },
  {
    name: 'Jug',
    singularName: 'jug',
    pluralName: 'jugs',
    servingSize: { servings: 1 },
    group: 'Containers',
  },
  {
    name: 'Package',
    singularName: 'package',
    pluralName: 'packages',
    servingSize: { servings: 1 },
    group: 'Containers',
  },
  // Units
  {
    name: 'Chip',
    singularName: 'chip',
    pluralName: 'chips',
    servingSize: { servings: 1 },
    group: 'Units',
  },
  {
    name: 'Loaf',
    singularName: 'loaf',
    pluralName: 'loaves',
    servingSize: { servings: 1 },
    group: 'Units',
  },
  {
    name: 'Shot',
    singularName: 'shot',
    pluralName: 'shots',
    servingSize: { servings: 1 },
    group: 'Units',
  },
  {
    name: 'Slice',
    singularName: 'slice',
    pluralName: 'slices',
    servingSize: { servings: 1 },
    group: 'Units',
  },
  {
    name: 'Stick',
    singularName: 'stick',
    pluralName: 'sticks',
    servingSize: { servings: 1 },
    group: 'Units',
  },
  {
    name: 'Pump',
    singularName: 'pump',
    pluralName: 'pumps',
    servingSize: { servings: 1 },
    group: 'Units',
  },
  // Soda cans
  {
    name: 'Mini Soda Can',
    singularName: 'mini can',
    pluralName: 'mini cans',
    servingSize: { volume: { amount: 8, unit: 'fl oz' } },
    group: 'Soda sizes',
  },
  {
    name: 'Soda Can',
    singularName: 'can',
    pluralName: 'cans',
    servingSize: { volume: { amount: 12, unit: 'fl oz' } },
    group: 'Soda sizes',
  },
  {
    name: 'Soda Bottle',
    singularName: 'bottle',
    pluralName: 'bottles',
    servingSize: { volume: { amount: 20, unit: 'fl oz' } },
    group: 'Soda sizes',
  },
  {
    name: 'Two-Liter Soda Bottle',
    singularName: 'two-liter bottle',
    pluralName: 'two-liter bottles',
    servingSize: { volume: { amount: 2, unit: 'L' } },
    group: 'Soda sizes',
  },
  // Eggs
  {
    name: 'Small Egg',
    singularName: 'small egg',
    pluralName: 'small eggs',
    servingSize: { mass: { amount: 1.5, unit: 'oz' } },
    group: 'Eggs',
  },
  {
    name: 'Medium Egg',
    singularName: 'medium egg',
    pluralName: 'medium eggs',
    servingSize: { mass: { amount: 1.5, unit: 'oz' } },
    group: 'Eggs',
  },
  {
    name: 'Large Egg',
    singularName: 'large egg',
    pluralName: 'large eggs',
    servingSize: { mass: { amount: 1.5, unit: 'oz' } },
    group: 'Eggs',
  },
  {
    name: 'Extra-Large Egg',
    singularName: 'extra-large egg',
    pluralName: 'extra-large eggs',
    servingSize: { mass: { amount: 1.5, unit: 'oz' } },
    group: 'Eggs',
  },
  {
    name: 'Jumbo Egg',
    singularName: 'jumbo egg',
    pluralName: 'jumbo eggs',
    servingSize: { servings: 1 },
    group: 'Eggs',
  },
];

function formatPresetServing(s: PresetCustomSize['servingSize']): string {
  if ('servings' in s) return `${s.servings} serving(s)`;
  if ('mass' in s) return `${s.mass.amount} ${s.mass.unit}`;
  return `${s.volume.amount} ${s.volume.unit}`;
}

function presetToCustomSizeData(preset: PresetCustomSize): CustomSizeData {
  return {
    id: crypto.randomUUID(),
    name: preset.name,
    singularName: preset.singularName,
    pluralName: preset.pluralName,
    servingSize: preset.servingSize,
  };
}

// ---------------------------------------------------------------------------
// Add custom size modal (preset picker)
// ---------------------------------------------------------------------------

function AddCustomSizeModal({
  existingNames,
  onAdd,
  onClose,
}: {
  existingNames: Set<string>;
  onAdd: (data: CustomSizeData) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const available = useMemo(
    () => PRESET_CUSTOM_SIZES.filter((p) => !existingNames.has(p.name)),
    [existingNames],
  );

  const groups = useMemo(() => {
    const map = new Map<string, PresetCustomSize[]>();
    for (const p of available) {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    }
    return map;
  }, [available]);

  function handleConfirm() {
    const preset = available.find((p) => p.name === selectedName);
    if (preset) onAdd(presetToCustomSizeData(preset));
  }

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId} scrollable>
      <ModalHeader onClose={onClose} titleId={titleId}>
        Add custom size
      </ModalHeader>
      <ModalBody>
        {available.length === 0 ? (
          <p className="text-body-secondary small mb-0">All preset sizes have been added</p>
        ) : (
          <div className="list-group" style={{ maxHeight: '20rem', overflowY: 'auto' }}>
            {[...groups.entries()].map(([group, items]) => (
              <div key={group}>
                <div className="list-group-item bg-body-tertiary py-1 px-3">
                  <small className="fw-bold text-body-secondary">{group}</small>
                </div>
                {items.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center${selectedName === p.name ? ' active' : ''}`}
                    onClick={() => setSelectedName(p.name)}
                  >
                    <div>
                      <span className="fw-bold">{p.name}</span>
                      <br />
                      <small className={selectedName === p.name ? '' : 'text-body-secondary'}>
                        {p.singularName} / {p.pluralName}
                      </small>
                    </div>
                    <small className={selectedName === p.name ? '' : 'text-body-secondary'}>
                      {formatPresetServing(p.servingSize)}
                    </small>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!selectedName} onClick={handleConfirm}>
          Add
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}

// ---------------------------------------------------------------------------
// Create custom size modal
// ---------------------------------------------------------------------------

function CreateCustomSizeModal({
  onAdd,
  onClose,
}: {
  onAdd: (data: CustomSizeData) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const [name, setName] = useState('');
  const [singularName, setSingularName] = useState('');
  const [pluralName, setPluralName] = useState('');

  const canCreate =
    name.trim().length > 0 && singularName.trim().length > 0 && pluralName.trim().length > 0;

  function handleCreate() {
    if (!canCreate) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      singularName: singularName.trim(),
      pluralName: pluralName.trim(),
      servingSize: { servings: 1 },
    });
  }

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId}>
      <ModalHeader onClose={onClose} titleId={titleId}>
        New custom size
      </ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <label htmlFor="cs-name" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="cs-name"
            placeholder="e.g. Cookie"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cs-singular" className="form-label">
            Singular name
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="cs-singular"
            placeholder="e.g. cookie"
            value={singularName}
            onChange={(e) => setSingularName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="cs-plural" className="form-label">
            Plural name
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="cs-plural"
            placeholder="e.g. cookies"
            value={pluralName}
            onChange={(e) => setPluralName(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!canCreate} onClick={handleCreate}>
          Create
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

type CustomSizeModal = 'preset' | 'custom' | null;

interface PreparationCustomSizesSectionProps {
  product: ApiProduct;
  preparationId: string;
  onChange: (product: ApiProduct) => void;
}

export default function PreparationCustomSizesSection({
  product,
  preparationId,
  onChange,
}: PreparationCustomSizesSectionProps) {
  const prep = product.preparations.find((p) => p.id === preparationId);
  const customSizes = useMemo(() => prep?.customSizes ?? [], [prep?.customSizes]);

  const [modal, setModal] = useState<CustomSizeModal>(null);

  const existingNames = useMemo(() => new Set(customSizes.map((cs) => cs.name)), [customSizes]);

  // Build unit option groups: always include servings + mass + volume,
  // plus energy if the prep has calories defined.
  const customSizeOptionGroups: OptionGroup[] = useMemo(() => {
    const result: OptionGroup[] = [
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
    ];

    if (prep?.nutritionalInformation?.calories) {
      result.push({
        label: 'Energy',
        options: energyUnits.map((u) => ({
          type: 'energy' as ServingSizeType,
          value: u.value,
          label: u.label,
          aliases: u.aliases,
        })),
      });
    }

    return result;
  }, [prep?.nutritionalInformation?.calories]);

  if (!prep) return null;

  function updateCustomSizes(newSizes: CustomSizeData[]) {
    const updatedProduct: ApiProduct = {
      ...product,
      preparations: product.preparations.map((p) =>
        p.id === preparationId ? { ...p, customSizes: newSizes } : p,
      ),
    };
    onChange(updatedProduct);
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
    <div className="px-3 pt-3 pb-2">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Custom sizes</strong>
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
        </div>
        {customSizes.length > 0 ? (
          <div className="list-group list-group-flush">
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
                      groups={customSizeOptionGroups}
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
          <div className="card-body">
            <p className="text-body-secondary small mb-0">No custom sizes</p>
          </div>
        )}
      </div>

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
    </div>
  );
}
