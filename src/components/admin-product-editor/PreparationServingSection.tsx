import type { ApiProduct } from '../../api';
import type { NutritionUnit, ServingSizeType } from '../../domain';
import { ServingSize } from '../../domain';
import { massUnits, volumeUnits } from '../../config/unitConfig';
import type { OptionGroup } from '../../config/unitConfig';
import type { PreparationData } from '../../domain/Preparation';
import ServingSizeSelector from '../ServingSizeSelector';

const massGroups: OptionGroup[] = [
  {
    label: 'Mass',
    options: massUnits.map((u) => ({
      type: 'mass' as ServingSizeType,
      value: u.value,
      label: u.label,
      aliases: u.aliases,
    })),
  },
];

const volumeGroups: OptionGroup[] = [
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

interface PreparationServingSectionProps {
  product: ApiProduct;
  preparationId: string;
  onChange: (product: ApiProduct) => void;
}

export default function PreparationServingSection({
  product,
  preparationId,
  onChange,
}: PreparationServingSectionProps) {
  const prep = product.preparations.find((p) => p.id === preparationId);
  if (!prep) return null;

  function update(partial: Partial<PreparationData>) {
    const updatedPrep: PreparationData = { ...prep, ...partial };
    const updatedProduct: ApiProduct = {
      ...product,
      preparations: product.preparations.map((p) => (p.id === preparationId ? updatedPrep : p)),
    };
    onChange(updatedProduct);
  }

  function handleMassChange(ss: ServingSize) {
    const nu = ss.value as NutritionUnit;
    update({ mass: nu.amount > 0 ? { amount: nu.amount, unit: nu.unit } : null });
  }

  function handleVolumeChange(ss: ServingSize) {
    const nu = ss.value as NutritionUnit;
    update({ volume: nu.amount > 0 ? { amount: nu.amount, unit: nu.unit } : null });
  }

  return (
    <div className="px-3 pt-3 pb-2">
      <div className="card">
        <div className="card-header">
          <strong>Serving</strong>
        </div>
        <div className="list-group list-group-flush">
          <label
            htmlFor={`serving-desc-${preparationId}`}
            className="list-group-item d-flex align-items-center justify-content-between py-3"
          >
            <span className="text-body-secondary me-3 flex-shrink-0">Serving size description</span>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: '14rem' }}
              id={`serving-desc-${preparationId}`}
              value={prep.servingSizeDescription ?? ''}
              onChange={(e) => update({ servingSizeDescription: e.target.value || null })}
              placeholder="e.g. 1 tbsp (14g)"
            />
          </label>
          <div className="list-group-item d-flex align-items-center justify-content-between py-3">
            <span className="text-body-secondary me-3 flex-shrink-0">Mass per serving</span>
            <ServingSizeSelector
              size="sm"
              groups={massGroups}
              value={ServingSize.mass(prep.mass?.amount ?? 0, prep.mass?.unit ?? 'g')}
              onChange={handleMassChange}
              amountAriaLabel="Mass amount"
              unitAriaLabel="Mass unit"
            />
          </div>
          <div className="list-group-item d-flex align-items-center justify-content-between py-3">
            <span className="text-body-secondary me-3 flex-shrink-0">Volume per serving</span>
            <ServingSizeSelector
              size="sm"
              groups={volumeGroups}
              value={ServingSize.volume(prep.volume?.amount ?? 0, prep.volume?.unit ?? 'mL')}
              onChange={handleVolumeChange}
              amountAriaLabel="Volume amount"
              unitAriaLabel="Volume unit"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
