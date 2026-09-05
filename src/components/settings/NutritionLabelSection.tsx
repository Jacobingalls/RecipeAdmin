import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LabelStylePreference } from '../../utils';
import {
  getLabelStylePreference,
  isLabelStylePreference,
  setLabelStylePreference,
} from '../../utils';
import { SectionHeader } from '../common';

/** Lets the user read nutrition the US or the European way, or keep following their language. */
export default function NutritionLabelSection() {
  const { t } = useTranslation();
  const [preference, setPreference] = useState<LabelStylePreference>(getLabelStylePreference);
  const selectId = useId();

  function handleChange(value: string) {
    if (!isLabelStylePreference(value)) return;
    setPreference(value);
    setLabelStylePreference(value);
  }

  return (
    <>
      <SectionHeader title={t('labelStyle.title')} className="mt-4" />

      <div className="card mb-5">
        <div className="card-body">
          <label htmlFor={selectId} className="form-label">
            {t('labelStyle.selectLabel')}
          </label>
          <select
            className="form-select"
            id={selectId}
            value={preference}
            onChange={(e) => handleChange(e.target.value)}
            aria-describedby={`${selectId}-help`}
          >
            <option value="system">{t('labelStyle.system')}</option>
            <option value="us">{t('labelStyle.us')}</option>
            <option value="european">{t('labelStyle.european')}</option>
          </select>
          <div id={`${selectId}-help`} className="form-text">
            {t('labelStyle.description')}
          </div>
        </div>
      </div>
    </>
  );
}
