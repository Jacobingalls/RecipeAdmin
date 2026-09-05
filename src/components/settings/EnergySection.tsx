import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { EnergyDisplayPreference } from '../../utils';
import {
  getEnergyDisplayPreference,
  isEnergyDisplayPreference,
  setEnergyDisplayPreference,
} from '../../utils';
import { SectionHeader } from '../common';

/** Lets the user read energy as calories or kilojoules, or keep following their language. */
export default function EnergySection() {
  const { t } = useTranslation();
  const [preference, setPreference] = useState<EnergyDisplayPreference>(getEnergyDisplayPreference);
  const selectId = useId();

  function handleChange(value: string) {
    if (!isEnergyDisplayPreference(value)) return;
    setPreference(value);
    setEnergyDisplayPreference(value);
  }

  return (
    <>
      <SectionHeader title={t('energy.title')} className="mt-4" />

      <div className="card mb-5">
        <div className="card-body">
          <label htmlFor={selectId} className="form-label">
            {t('energy.selectLabel')}
          </label>
          <select
            className="form-select"
            id={selectId}
            value={preference}
            onChange={(e) => handleChange(e.target.value)}
            aria-describedby={`${selectId}-help`}
          >
            <option value="system">{t('energy.system')}</option>
            <option value="calories">{t('energy.calories')}</option>
            <option value="kilojoules">{t('energy.kilojoules')}</option>
          </select>
          <div id={`${selectId}-help`} className="form-text">
            {t('energy.description')}
          </div>
        </div>
      </div>
    </>
  );
}
