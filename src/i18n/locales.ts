/**
 * The languages the app ships, in the order the picker offers them.
 *
 * This list is the single source of truth: `Locale` derives from it, and the message
 * catalog is typed as `Record<Locale, Messages>`, so adding a language here fails to
 * compile until its translations exist.
 */
export const SUPPORTED_LOCALES = ['en', 'da', 'es', 'nl', 'sv'] as const;

/** A language the app ships translations for. */
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Used when no preference is stored and the browser asks for a language we don't ship. */
export const DEFAULT_LOCALE: Locale = 'en';

/** What the user picked in settings — an explicit language, or "follow the browser". */
export type LocalePreference = 'system' | Locale;
