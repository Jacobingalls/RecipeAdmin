import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locales';
import type { Locale, LocalePreference } from './locales';
import { messages } from './messages';

export { DEFAULT_LOCALE, SUPPORTED_LOCALES };

export const LOCALE_STORAGE_KEY = 'recipeadmin.locale';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: Object.fromEntries(
      Object.entries(messages).map(([locale, catalog]) => [locale, { translation: catalog }]),
    ),
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    // Message keys are flat and contain dots ("settings.title"), so dots must not be
    // read as a path into nested resources.
    keySeparator: false,
    nsSeparator: false,
    // Match "nl-NL" to the "nl" catalog.
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      // The language picker writes the preference itself, so detection never caches:
      // an absent value has to keep meaning "follow the browser".
      caches: [],
    },
    interpolation: {
      // React escapes interpolated values already.
      escapeValue: false,
      // A placeholder with no value renders as literal "{{amount}}" text, which is easy to
      // ship unnoticed. Fail loudly while developing and in tests; keep rendering in
      // production rather than taking the page down over a formatting slip.
      missingInterpolationHandler: (text: string, match: unknown) => {
        const placeholder = Array.isArray(match) ? String(match[0]) : String(match);
        if (import.meta.env.DEV) {
          throw new Error(`No value supplied for ${placeholder} in message: ${text}`);
        }
        return placeholder;
      },
    },
  });

export default i18n;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function isLocalePreference(value: unknown): value is LocalePreference {
  return value === 'system' || isLocale(value);
}

/** The language currently being rendered, always one the app ships. */
export function getActiveLocale(): Locale {
  const resolved = i18n.resolvedLanguage ?? i18n.language;
  return isLocale(resolved) ? resolved : DEFAULT_LOCALE;
}

/** What the user chose — an explicit language, or `system` to follow the browser. */
export function getLocalePreference(): LocalePreference {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocalePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/**
 * Save the language preference and switch the app to it.
 *
 * `system` clears the saved value and re-runs detection, so the app follows the browser again.
 */
export async function setLocalePreference(preference: LocalePreference): Promise<void> {
  try {
    if (preference === 'system') {
      window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    } else {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, preference);
    }
  } catch {
    // A preference we can't save is still worth applying for this session.
  }

  await i18n.changeLanguage(preference === 'system' ? browserLocale() : preference);
}

/** The first language the browser asks for that the app ships, ignoring region subtags. */
function browserLocale(): Locale {
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export type { Locale, LocalePreference } from './locales';
export type { TranslationValues } from './types';
export type { MessageKey } from './messages/en';
