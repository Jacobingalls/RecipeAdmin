import { useMemo } from 'react';

import type { ApiProduct } from '../../api';
import type { NutritionUnit, ServingSizeType } from '../../domain';
import { ServingSize } from '../../domain';
import type { NutritionInformationData } from '../../domain/NutritionInformation';
import { nutritionMassUnits, nutritionEnergyUnits } from '../../config/unitConfig';
import type { OptionGroup } from '../../config/unitConfig';
import type { NutrientDef } from '../../config/nutrientConfig';
import NUTRIENT_ORDER from '../../config/nutrientConfig';
import { DeleteButton } from '../common';
import ServingSizeSelector from '../ServingSizeSelector';

interface PreparationNutritionSectionProps {
  product: ApiProduct;
  preparationId: string;
  onChange: (product: ApiProduct) => void;
}

interface NutrientValue {
  amount: number;
  unit: string;
}

const ENERGY_GROUPS: OptionGroup[] = [
  {
    label: 'Energy',
    options: nutritionEnergyUnits.map((u) => ({
      type: 'energy' as ServingSizeType,
      value: u.value,
      label: u.label,
      aliases: u.aliases,
    })),
  },
];

const MASS_GROUPS: OptionGroup[] = [
  {
    label: 'Mass',
    options: nutritionMassUnits.map((u) => ({
      type: 'mass' as ServingSizeType,
      value: u.value,
      label: u.label,
      aliases: u.aliases,
    })),
  },
];

function isEnergyNutrient(def: NutrientDef): boolean {
  return def.defaultUnit === 'kcal' || def.defaultUnit === 'kJ';
}

export default function PreparationNutritionSection({
  product,
  preparationId,
  onChange,
}: PreparationNutritionSectionProps) {
  const prep = product.preparations.find((p) => p.id === preparationId);
  const nutrition = prep?.nutritionalInformation;

  const populatedNutrients = useMemo(
    () =>
      NUTRIENT_ORDER.filter((def) => {
        const val = nutrition?.[def.key];
        return val != null && typeof val === 'object' && 'amount' in val;
      }),
    [nutrition],
  );

  const missingNutrients = useMemo(
    () =>
      NUTRIENT_ORDER.filter((def) => {
        if (def.key === 'calories') return false;
        const val = nutrition?.[def.key];
        return !(val != null && typeof val === 'object' && 'amount' in val);
      }),
    [nutrition],
  );

  if (!prep) return null;

  function updateNutrition(newNutrition: Record<string, NutrientValue>) {
    const updatedProduct: ApiProduct = {
      ...product,
      preparations: product.preparations.map((p) =>
        p.id === preparationId
          ? { ...p, nutritionalInformation: newNutrition as unknown as NutritionInformationData }
          : p,
      ),
    };
    onChange(updatedProduct);
  }

  function handleNutrientChange(key: string, ss: ServingSize) {
    const rec = (nutrition ?? {}) as Record<string, NutrientValue | undefined>;
    const current = rec[key];
    if (!current) return;
    const nu = ss.value as NutritionUnit;
    const updated = { ...rec, [key]: { amount: nu.amount, unit: nu.unit } } as Record<
      string,
      NutrientValue
    >;
    updateNutrition(updated);
  }

  function handleAdd(key: string, defaultUnit: string) {
    const rec = (nutrition ?? {}) as Record<string, NutrientValue>;
    const updated = { ...rec, [key]: { amount: 0, unit: defaultUnit } };
    updateNutrition(updated);
  }

  function handleRemove(key: string) {
    const rec = { ...(nutrition ?? {}) } as Record<string, NutrientValue | undefined>;
    delete rec[key];
    updateNutrition(rec as Record<string, NutrientValue>);
  }

  return (
    <div className="px-3 pt-3 pb-2">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Nutrition (per serving)</strong>
          {missingNutrients.length > 0 && (
            <div className="dropdown">
              <button
                className="btn btn-dark btn-sm dropdown-toggle px-3"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Add
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                style={{ maxHeight: '16rem', overflowY: 'auto' }}
              >
                {missingNutrients.map((def) => (
                  <li key={def.key}>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => handleAdd(def.key, def.defaultUnit)}
                    >
                      {def.indent ? '\u00A0'.repeat(def.indent * 3) : ''}
                      {def.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {populatedNutrients.length > 0 ? (
          <div className="list-group list-group-flush">
            {populatedNutrients.map((def) => {
              const val = (nutrition as unknown as Record<string, NutrientValue>)[def.key];
              const isEnergy = isEnergyNutrient(def);
              const servingSize = isEnergy
                ? ServingSize.energy(val.amount, val.unit)
                : ServingSize.mass(val.amount, val.unit);
              return (
                <div
                  key={def.key}
                  className="list-group-item d-flex align-items-center justify-content-between py-2"
                >
                  <span
                    className={def.indent ? 'text-body-secondary' : ''}
                    style={def.indent ? { paddingLeft: `${def.indent * 1}rem` } : undefined}
                  >
                    {def.label}
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <ServingSizeSelector
                      size="sm"
                      groups={isEnergy ? ENERGY_GROUPS : MASS_GROUPS}
                      value={servingSize}
                      onChange={(ss) => handleNutrientChange(def.key, ss)}
                      amountAriaLabel={`${def.label} amount`}
                      unitAriaLabel={`${def.label} unit`}
                    />
                    {def.key !== 'calories' && (
                      <DeleteButton
                        ariaLabel={`Remove ${def.label}`}
                        onClick={() => handleRemove(def.key)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-body">
            <p className="text-body-secondary small mb-0">No nutrition data</p>
          </div>
        )}
      </div>
    </div>
  );
}
