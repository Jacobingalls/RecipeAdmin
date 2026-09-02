/** A language the app ships translations for. */
export type Locale = 'en' | 'nl';

/** What the user picked in settings — an explicit language, or "follow the browser". */
export type LocalePreference = 'system' | Locale;

/** Values substituted into `{placeholder}` slots in a message. */
export type TranslationValues = Record<string, string | number>;
