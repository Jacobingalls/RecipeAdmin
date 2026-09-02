import type { ApiProduct } from '../../api';
import { ServingSize } from '../../domain';
import { massUnits, unitGroup, volumeUnits } from '../../config/unitConfig';
import { useTranslation } from '../../contexts/LocaleContext';
import type { PreparationData } from '../../domain/Preparation';
import ServingSizeSelector from '../ServingSizeSelector';

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
  const { t } = useTranslation();
  const massGroups = [unitGroup('unit.group.mass', massUnits, 'mass')];
  const volumeGroups = [unitGroup('unit.group.volume', volumeUnits, 'volume')];

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
    const nu = ss.value as { amount: number; unit: string };
    update({ mass: { amount: nu.amount, unit: nu.unit } });
  }

  function handleVolumeChange(ss: ServingSize) {
    const nu = ss.value as { amount: number; unit: string };
    update({ volume: { amount: nu.amount, unit: nu.unit } });
  }

  return (
    <div className="px-3 pt-3 pb-2">
      <div className="card">
        <div className="card-header">
          <strong>{t('editor.serving')}</strong>
        </div>
        <div className="list-group list-group-flush">
          <label
            htmlFor={`serving-desc-${preparationId}`}
            className="list-group-item d-flex align-items-center justify-content-between py-3"
          >
            <span className="text-body-secondary me-3 flex-shrink-0">
              {t('productEditor.servingDescription')}
            </span>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: '14rem' }}
              id={`serving-desc-${preparationId}`}
              value={prep.servingSizeDescription ?? ''}
              onChange={(e) => update({ servingSizeDescription: e.target.value || null })}
              placeholder={t('productEditor.servingDescriptionPlaceholder')}
            />
          </label>
          <div className="list-group-item d-flex align-items-center justify-content-between py-3">
            <span className="text-body-secondary me-3 flex-shrink-0">
              {t('editor.massPerServing')}
            </span>
            <ServingSizeSelector
              size="sm"
              groups={massGroups}
              value={prep.mass ? ServingSize.mass(prep.mass.amount, prep.mass.unit) : null}
              onChange={handleMassChange}
              onClear={() => update({ mass: null })}
              amountAriaLabel={t('editor.massAmount')}
              unitAriaLabel={t('editor.massUnit')}
            />
          </div>
          <div className="list-group-item d-flex align-items-center justify-content-between py-3">
            <span className="text-body-secondary me-3 flex-shrink-0">
              {t('editor.volumePerServing')}
            </span>
            <ServingSizeSelector
              size="sm"
              groups={volumeGroups}
              value={prep.volume ? ServingSize.volume(prep.volume.amount, prep.volume.unit) : null}
              onChange={handleVolumeChange}
              onClear={() => update({ volume: null })}
              amountAriaLabel={t('editor.volumeAmount')}
              unitAriaLabel={t('editor.volumeUnit')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
