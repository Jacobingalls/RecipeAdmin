import type { Locale, LocalePreference } from './types';

/** Languages offered in the language picker, in display order. */
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'nl'];

/** Used whenever no preference is stored and the browser asks for a language we don't ship. */
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'recipeadmin.locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function isLocalePreference(value: unknown): value is LocalePreference {
  return value === 'system' || isLocale(value);
}

/**
 * Pick the first supported language from a browser language list.
 *
 * Region subtags are ignored, so `nl-BE` and `nl-NL` both match `nl`.
 * Returns `null` when nothing in the list is supported.
 */
export function matchLocale(languages: readonly string[] | undefined): Locale | null {
  for (const language of languages ?? []) {
    const base = language.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return null;
}

/** Read the languages the browser reports, most preferred first. */
export function browserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  if (navigator.languages?.length) return navigator.languages;
  return navigator.language ? [navigator.language] : [];
}

/** Turn a stored preference into the language to actually render in. */
export function resolveLocale(
  preference: LocalePreference,
  languages: readonly string[] = browserLanguages(),
): Locale {
  if (preference !== 'system') return preference;
  return matchLocale(languages) ?? DEFAULT_LOCALE;
}

/** Read the saved language preference, falling back to `system` when storage is unavailable. */
export function readStoredPreference(): LocalePreference {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocalePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** Persist the language preference, ignoring storage failures (private browsing, quota). */
export function storePreference(preference: LocalePreference): void {
  try {
    if (preference === 'system') {
      window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    } else {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, preference);
    }
  } catch {
    // A preference we can't save is still worth applying for this session.
  }
}

let activeLocale: Locale = DEFAULT_LOCALE;

/**
 * The language currently being rendered.
 *
 * Formatting helpers outside the React tree (number, date and list formatting) read this so
 * they don't each need the locale threaded through as an argument.
 */
export function getActiveLocale(): Locale {
  return activeLocale;
}

export function setActiveLocale(locale: Locale): void {
  activeLocale = locale;
}
