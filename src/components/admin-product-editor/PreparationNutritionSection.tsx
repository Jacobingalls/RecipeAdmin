import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiProduct } from '../../api';
import type { NutritionUnit } from '../../domain';
import { ServingSize } from '../../domain';
import type { NutritionInformationData } from '../../domain/NutritionInformation';
import { nutritionMassUnits, nutritionEnergyUnits, unitGroup } from '../../config/unitConfig';
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

function isEnergyNutrient(def: NutrientDef): boolean {
  return def.defaultUnit === 'kcal' || def.defaultUnit === 'kJ';
}

export default function PreparationNutritionSection({
  product,
  preparationId,
  onChange,
}: PreparationNutritionSectionProps) {
  const { t } = useTranslation();
  const energyGroups = [unitGroup('unit.group.energy', nutritionEnergyUnits, 'energy')];
  const massGroups = [unitGroup('unit.group.mass', nutritionMassUnits, 'mass')];

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
          <strong>{t('productEditor.nutrition')}</strong>
          {missingNutrients.length > 0 && (
            <div className="dropdown">
              <button
                className="btn btn-dark btn-sm dropdown-toggle px-3"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t('common.add')}
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
                      {t(def.labelKey)}
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
                    {t(def.labelKey)}
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <ServingSizeSelector
                      size="sm"
                      groups={isEnergy ? energyGroups : massGroups}
                      value={servingSize}
                      onChange={(ss) => handleNutrientChange(def.key, ss)}
                      amountAriaLabel={t('editor.amountLabel', { name: t(def.labelKey) })}
                      unitAriaLabel={t('editor.unitLabel', { name: t(def.labelKey) })}
                    />
                    {def.key !== 'calories' && (
                      <DeleteButton
                        ariaLabel={t('editor.removeItem', { name: t(def.labelKey) })}
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
            <p className="text-body-secondary small mb-0">{t('productEditor.noNutrition')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
