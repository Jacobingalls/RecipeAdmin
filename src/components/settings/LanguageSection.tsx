import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LocalePreference } from '../../i18n';
import {
  SUPPORTED_LOCALES,
  getLocalePreference,
  isLocalePreference,
  setLocalePreference,
} from '../../i18n';
import { SectionHeader } from '../common';

/** Lets the user pick the app's language, or keep following the browser's. */
export default function LanguageSection() {
  const { t } = useTranslation();
  const [preference, setPreference] = useState<LocalePreference>(getLocalePreference);
  const selectId = useId();

  function handleChange(value: string) {
    if (!isLocalePreference(value)) return;
    setPreference(value);
    setLocalePreference(value);
  }

  return (
    <>
      <SectionHeader title={t('language.title')} className="mt-4" />

      <div className="card mb-5">
        <div className="card-body">
          <label htmlFor={selectId} className="form-label">
            {t('language.selectLabel')}
          </label>
          <select
            className="form-select"
            id={selectId}
            value={preference}
            onChange={(e) => handleChange(e.target.value)}
            aria-describedby={`${selectId}-help`}
          >
            <option value="system">{t('language.system')}</option>
            {SUPPORTED_LOCALES.map((locale) => (
              <option key={locale} value={locale}>
                {t(`language.name.${locale}`)}
              </option>
            ))}
          </select>
          <div id={`${selectId}-help`} className="form-text">
            {t('language.description')}
          </div>
        </div>
      </div>
    </>
  );
}
