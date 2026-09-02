import type { ProductGroupData } from '../../domain';
import { massUnits, unitGroup, volumeUnits } from '../../config/unitConfig';
import { useTranslation } from '../../contexts/LocaleContext';
import ServingSizeSelector from '../ServingSizeSelector';
import { SectionHeader } from '../common';
import { ServingSize } from '../../domain';

interface GroupServingSectionProps {
  group: ProductGroupData;
  onChange: (group: ProductGroupData) => void;
}

export default function GroupServingSection({ group, onChange }: GroupServingSectionProps) {
  const { t } = useTranslation();
  const massGroups = [unitGroup('unit.group.mass', massUnits, 'mass')];
  const volumeGroups = [unitGroup('unit.group.volume', volumeUnits, 'volume')];

  function handleMassChange(ss: ServingSize) {
    const nu = ss.value as { amount: number; unit: string };
    onChange({ ...group, mass: { amount: nu.amount, unit: nu.unit } });
  }

  function handleVolumeChange(ss: ServingSize) {
    const nu = ss.value as { amount: number; unit: string };
    onChange({ ...group, volume: { amount: nu.amount, unit: nu.unit } });
  }

  return (
    <>
      <SectionHeader title={t('editor.serving')} className="mt-5" />
      <div className="list-group">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <span className="text-body-secondary me-3 flex-shrink-0">
            {t('editor.massPerServing')}
          </span>
          <ServingSizeSelector
            size="sm"
            groups={massGroups}
            value={group.mass ? ServingSize.mass(group.mass.amount, group.mass.unit) : null}
            onChange={handleMassChange}
            onClear={() => onChange({ ...group, mass: null })}
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
            value={group.volume ? ServingSize.volume(group.volume.amount, group.volume.unit) : null}
            onChange={handleVolumeChange}
            onClear={() => onChange({ ...group, volume: null })}
            amountAriaLabel={t('editor.volumeAmount')}
            unitAriaLabel={t('editor.volumeUnit')}
          />
        </div>
      </div>
    </>
  );
}
