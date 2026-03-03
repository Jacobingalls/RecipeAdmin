import type { ProductGroupData, ServingSizeType } from '../../domain';
import { massUnits, volumeUnits } from '../../config/unitConfig';
import type { OptionGroup } from '../../config/unitConfig';
import ServingSizeSelector from '../ServingSizeSelector';
import { SectionHeader } from '../common';
import { ServingSize } from '../../domain';

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

interface GroupServingSectionProps {
  group: ProductGroupData;
  onChange: (group: ProductGroupData) => void;
}

export default function GroupServingSection({ group, onChange }: GroupServingSectionProps) {
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
      <SectionHeader title="Serving" className="mt-5" />
      <div className="list-group">
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <span className="text-body-secondary me-3 flex-shrink-0">Mass per serving</span>
          <ServingSizeSelector
            size="sm"
            groups={massGroups}
            value={group.mass ? ServingSize.mass(group.mass.amount, group.mass.unit) : null}
            onChange={handleMassChange}
            onClear={() => onChange({ ...group, mass: null })}
            amountAriaLabel="Mass amount"
            unitAriaLabel="Mass unit"
          />
        </div>
        <div className="list-group-item d-flex align-items-center justify-content-between py-3">
          <span className="text-body-secondary me-3 flex-shrink-0">Volume per serving</span>
          <ServingSizeSelector
            size="sm"
            groups={volumeGroups}
            value={group.volume ? ServingSize.volume(group.volume.amount, group.volume.unit) : null}
            onChange={handleVolumeChange}
            onClear={() => onChange({ ...group, volume: null })}
            amountAriaLabel="Volume amount"
            unitAriaLabel="Volume unit"
          />
        </div>
      </div>
    </>
  );
}
