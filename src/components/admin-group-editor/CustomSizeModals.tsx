import { useState, useMemo, useId } from 'react';

import type { CustomSizeData } from '../../domain/CustomSize';
import {
  PRESET_CUSTOM_SIZES,
  formatPresetServing,
  presetToCustomSizeData,
} from '../../config/customSizePresets';
import { Button, ModalBase, ModalHeader, ModalBody, ModalFooter } from '../common';

// ---------------------------------------------------------------------------
// Preset picker
// ---------------------------------------------------------------------------

export function AddCustomSizeModal({
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
    const map = new Map<string, (typeof PRESET_CUSTOM_SIZES)[number][]>();
    for (const p of available) {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    }
    return map;
  }, [available]);

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
        <Button
          disabled={!selectedName}
          onClick={() => {
            const preset = available.find((p) => p.name === selectedName);
            if (preset) onAdd(presetToCustomSizeData(preset));
          }}
        >
          Add
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}

// ---------------------------------------------------------------------------
// Create from scratch
// ---------------------------------------------------------------------------

export function CreateCustomSizeModal({
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
        <Button
          disabled={!canCreate}
          onClick={() => {
            if (!canCreate) return;
            onAdd({
              id: crypto.randomUUID(),
              name: name.trim(),
              singularName: singularName.trim(),
              pluralName: pluralName.trim(),
              servingSize: { kind: 'servings', amount: 1 },
            });
          }}
        >
          Create
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}
