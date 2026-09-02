import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Locale, LocalePreference, Translator } from '../i18n';
import {
  DEFAULT_LOCALE,
  readStoredPreference,
  resolveLocale,
  setActiveLocale,
  storePreference,
  translatorFor,
} from '../i18n';

interface LocaleContextValue extends Translator {
  /** What the user chose — an explicit language, or `system` to follow the browser. */
  preference: LocalePreference;
  setPreference: (preference: LocalePreference) => void;
}

const fallbackTranslator = translatorFor(DEFAULT_LOCALE);

const LocaleContext = createContext<LocaleContextValue>({
  ...fallbackTranslator,
  preference: 'system',
  setPreference: () => {},
});

/**
 * Makes translations available to the tree and keeps the document language in sync.
 *
 * The language starts from the saved preference, falling back to the browser's language
 * when the user hasn't chosen one.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<LocalePreference>(readStoredPreference);

  const locale: Locale = useMemo(() => resolveLocale(preference), [preference]);

  // Formatting helpers outside the React tree read the active locale, so set it during render
  // rather than in an effect — otherwise the first paint formats numbers in the old language.
  setActiveLocale(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setPreference = useCallback((next: LocalePreference) => {
    storePreference(next);
    setPreferenceState(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ ...translatorFor(locale), preference, setPreference }),
    [locale, preference, setPreference],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * Translate text in a component.
 *
 * ```tsx
 * const { t, tPlural } = useTranslation();
 * <h1>{t('settings.title')}</h1>
 * <p>{tPlural('history.entryCount', entries.length)}</p>
 * ```
 *
 * Outside a `LocaleProvider` this falls back to English, so components stay renderable
 * in isolation.
 */
export function useTranslation(): LocaleContextValue {
  return useContext(LocaleContext);
}
