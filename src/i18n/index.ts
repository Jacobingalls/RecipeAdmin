import { messages } from './messages';
import { getActiveLocale } from './locale';
import { createTranslator } from './translator';
import type { Translator } from './translator';
import type { Locale } from './types';

const translators = new Map<Locale, Translator>();

/** Translator for a specific language. Instances are cached, so this is cheap to call in render. */
export function translatorFor(locale: Locale): Translator {
  let translator = translators.get(locale);
  if (!translator) {
    translator = createTranslator(locale, messages[locale]);
    translators.set(locale, translator);
  }
  return translator;
}

/**
 * Translator for the language currently being rendered.
 *
 * Use this outside the React tree — in formatting helpers and other plain functions.
 * Components should use `useTranslation` so they re-render when the language changes.
 */
export function getTranslator(): Translator {
  return translatorFor(getActiveLocale());
}

export { messages } from './messages';
export { en } from './messages/en';
export type { MessageKey, Messages, PluralBaseKey } from './messages/en';
export { createTranslator, interpolate } from './translator';
export type { Translator } from './translator';
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isLocale,
  isLocalePreference,
  matchLocale,
  browserLanguages,
  resolveLocale,
  readStoredPreference,
  storePreference,
  getActiveLocale,
  setActiveLocale,
} from './locale';
export type { Locale, LocalePreference, TranslationValues } from './types';
