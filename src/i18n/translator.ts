import { en } from './messages/en';
import type { MessageKey, Messages, PluralBaseKey } from './messages/en';
import type { Locale, TranslationValues } from './types';

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/**
 * Substitute `{name}` placeholders in a message.
 *
 * Placeholders with no matching value are left untouched, so a partially applied message
 * still shows what it's missing instead of collapsing to an empty string.
 */
export function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;

  return template.replace(PLACEHOLDER_PATTERN, (placeholder, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : placeholder,
  );
}

export interface Translator {
  /** The language these translations are in. */
  locale: Locale;
  /** Look up a message and fill in its placeholders. */
  t: (key: MessageKey, values?: TranslationValues) => string;
  /**
   * The message with its `{placeholders}` intact.
   *
   * Use this when a value has to render as an element rather than text — split the template
   * on the placeholder and render the pieces around it.
   */
  raw: (key: MessageKey) => string;
  /**
   * Look up the plural form matching `count`.
   *
   * Pass the base key — `tPlural('history.entryCount', 2)` resolves `history.entryCount.other`.
   * `{count}` is filled in with the count unless `values` supplies its own.
   */
  tPlural: (key: PluralBaseKey, count: number, values?: TranslationValues) => string;
}

function lookup(messages: Messages, key: MessageKey): string {
  return messages[key] ?? en[key] ?? key;
}

export function createTranslator(locale: Locale, messages: Messages): Translator {
  const pluralRules = new Intl.PluralRules(locale);

  function t(key: MessageKey, values?: TranslationValues): string {
    return interpolate(lookup(messages, key), values);
  }

  function raw(key: MessageKey): string {
    return lookup(messages, key);
  }

  function tPlural(key: PluralBaseKey, count: number, values?: TranslationValues): string {
    const category = pluralRules.select(count);
    const categoryKey = `${key}.${category}` as MessageKey;
    const messageKey = categoryKey in messages ? categoryKey : (`${key}.other` as MessageKey);
    return interpolate(lookup(messages, messageKey), { count, ...values });
  }

  return { locale, t, raw, tPlural };
}
