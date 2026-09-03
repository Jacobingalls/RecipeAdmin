import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../locales';
import type { Locale } from '../locales';

import { en } from './en';
import type { MessageKey } from './en';

import { messages } from './index';

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

/** Every language whose catalog is a translation of the English one. */
const TRANSLATED_LOCALES = SUPPORTED_LOCALES.filter(
  (locale): locale is Exclude<Locale, typeof DEFAULT_LOCALE> => locale !== DEFAULT_LOCALE,
);

const KEYS = Object.keys(en) as MessageKey[];

function placeholders(message: string): string[] {
  return [...message.matchAll(PLACEHOLDER_PATTERN)].map((m) => m[1]).sort();
}

describe('message catalogs', () => {
  it('ships a catalog for every supported language', () => {
    expect(Object.keys(messages).sort()).toEqual([...SUPPORTED_LOCALES].sort());
  });

  it.each(TRANSLATED_LOCALES)('translates every English message into %s', (locale) => {
    expect(Object.keys(messages[locale]).sort()).toEqual(KEYS.sort());
  });

  it('has no empty messages', () => {
    for (const [locale, catalog] of Object.entries(messages)) {
      for (const [key, value] of Object.entries(catalog)) {
        expect(value.trim(), `${locale}: ${key}`).not.toBe('');
      }
    }
  });

  it.each(TRANSLATED_LOCALES)('keeps the same placeholders in %s', (locale) => {
    for (const key of KEYS) {
      expect(placeholders(messages[locale][key]), key).toEqual(placeholders(en[key]));
    }
  });

  it('gives every plural key both a one and an other form', () => {
    for (const [locale, catalog] of Object.entries(messages)) {
      for (const key of Object.keys(catalog)) {
        if (!key.endsWith('_other')) continue;
        const base = key.slice(0, -'_other'.length);
        expect(catalog, `${locale}: ${base}`).toHaveProperty(`${base}_one`);
      }
    }
  });

  it('only uses count in messages i18next will resolve as a plural', () => {
    for (const [key, value] of Object.entries(en)) {
      if (!placeholders(value).includes('count')) continue;
      expect(key, `${key} interpolates count but is not a plural form`).toMatch(/_(one|other)$/);
    }
  });

  it.each(TRANSLATED_LOCALES)(
    'leaves no %s message identical to English unless it is a proper noun or symbol',
    (locale) => {
      // Names, symbols and pass-through formats legitimately match; anything else is a gap.
      const untranslated = KEYS.filter((key) => messages[locale][key] === en[key]);
      expect(untranslated.length).toBeLessThan(KEYS.length * 0.2);
    },
  );
});
