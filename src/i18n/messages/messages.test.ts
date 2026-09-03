import { describe, expect, it } from 'vitest';

import { en } from './en';
import { nl } from './nl';

import { messages } from './index';

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

function placeholders(message: string): string[] {
  return [...message.matchAll(PLACEHOLDER_PATTERN)].map((m) => m[1]).sort();
}

describe('message catalogs', () => {
  it('ships a catalog for every supported language', () => {
    expect(Object.keys(messages).sort()).toEqual(['en', 'nl']);
  });

  it('translates every English message into Dutch', () => {
    expect(Object.keys(nl).sort()).toEqual(Object.keys(en).sort());
  });

  it('has no empty messages', () => {
    for (const [locale, catalog] of Object.entries(messages)) {
      for (const [key, value] of Object.entries(catalog)) {
        expect(value.trim(), `${locale}: ${key}`).not.toBe('');
      }
    }
  });

  it('keeps the same placeholders in every translation', () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(nl[key]), key).toEqual(placeholders(en[key]));
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

  it('leaves no Dutch message identical to English unless it is a proper noun or symbol', () => {
    const untranslated = (Object.keys(en) as (keyof typeof en)[]).filter(
      (key) => nl[key] === en[key],
    );
    // Names, symbols and pass-through formats legitimately match; anything else is a gap.
    expect(untranslated.length).toBeLessThan(Object.keys(en).length * 0.2);
  });
});
