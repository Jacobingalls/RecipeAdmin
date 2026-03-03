import { useMemo } from 'react';

import type { PreparationData, ProductGroupData, ServingSize } from '../../domain';
import { Preparation, ProductGroup } from '../../domain';
import { buildOptionGroups, fallbackOptionGroups } from '../../config/unitConfig';
import ServingSizeSelector from '../ServingSizeSelector';

interface SelectedItemConfigProps {
  product?: { name?: string; brand?: string; preparations?: PreparationData[] };
  group?: ProductGroupData;
  prepId: string | undefined;
  onPrepChange: (id: string | undefined) => void;
  servingSize: ServingSize;
  onServingSizeChange: (ss: ServingSize) => void;
  onClear: () => void;
}

export default function SelectedItemConfig({
  product,
  group,
  prepId,
  onPrepChange,
  servingSize,
  onServingSizeChange,
  onClear,
}: SelectedItemConfigProps) {
  const name = product ? (product.name ?? 'Product') : (group?.name ?? 'Group');
  const brand = product ? product.brand : group?.brand;
  const icon = product ? 'bi-box-seam' : 'bi-collection';
  const preps = product?.preparations ?? [];

  const selectorGroups = useMemo(() => {
    if (product) {
      const prepData = preps.find((p) => p.id === prepId) ?? preps[0];
      if (prepData) return buildOptionGroups(new Preparation(prepData));
    } else if (group) {
      return buildOptionGroups(new ProductGroup(group));
    }
    return fallbackOptionGroups;
  }, [product, group, preps, prepId]);

  return (
    <>
      <div className="d-flex align-items-center gap-2 border rounded px-3 py-2 mb-3">
        <i className={`bi ${icon} text-body-secondary`} aria-hidden="true" />
        <div className="flex-grow-1">
          <span className="fw-medium">{name}</span>
          {brand && <small className="text-body-secondary ms-2">{brand}</small>}
        </div>
        <button
          type="button"
          className="btn-close btn-close-sm"
          aria-label="Clear selection"
          onClick={onClear}
        />
      </div>

      {product && preps.length > 1 && (
        <div className="mb-3">
          <label htmlFor="item-modal-prep" className="form-label">
            Preparation
          </label>
          <select
            className="form-select form-select-sm"
            id="item-modal-prep"
            value={prepId ?? ''}
            onChange={(e) => onPrepChange(e.target.value || undefined)}
          >
            {preps.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || 'Default'}
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
          onChange={onServingSizeChange}
          amountAriaLabel="Item serving amount"
          unitAriaLabel="Item serving unit"
        />
      </div>
    </>
  );
}
