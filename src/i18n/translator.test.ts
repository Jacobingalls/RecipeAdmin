import { describe, expect, it } from 'vitest';

import { en } from './messages/en';
import { nl } from './messages/nl';
import { createTranslator, interpolate } from './translator';

describe('interpolate', () => {
  it('substitutes named values', () => {
    expect(interpolate('Hello {name}', { name: 'Alice' })).toBe('Hello Alice');
  });

  it('substitutes a placeholder everywhere it appears', () => {
    expect(interpolate('{a} and {a}', { a: 'x' })).toBe('x and x');
  });

  it('formats numbers as text', () => {
    expect(interpolate('{count} items', { count: 3 })).toBe('3 items');
  });

  it('leaves unmatched placeholders in place so the gap is visible', () => {
    expect(interpolate('Hello {name}', { other: 'x' })).toBe('Hello {name}');
    expect(interpolate('Hello {name}')).toBe('Hello {name}');
  });
});

describe('createTranslator', () => {
  const english = createTranslator('en', en);
  const dutch = createTranslator('nl', nl);

  it('exposes the language it translates into', () => {
    expect(english.locale).toBe('en');
    expect(dutch.locale).toBe('nl');
  });

  it('looks up messages in its own language', () => {
    expect(english.t('common.save')).toBe('Save');
    expect(dutch.t('common.save')).toBe('Opslaan');
  });

  it('fills in placeholders', () => {
    expect(english.t('credential.created', { time: '3d ago' })).toBe('Created 3d ago');
  });

  it('returns the message with placeholders intact via raw', () => {
    expect(english.raw('credential.created')).toBe('Created {time}');
  });

  it('falls back to English when a translation is missing', () => {
    const partial = { ...nl, 'common.save': undefined } as unknown as typeof nl;
    expect(createTranslator('nl', partial).t('common.save')).toBe('Save');
  });

  it('picks the singular form for one', () => {
    expect(english.tPlural('format.servings', 1)).toBe('1 serving');
    expect(dutch.tPlural('format.servings', 1)).toBe('1 portie');
  });

  it('picks the plural form for everything else', () => {
    expect(english.tPlural('format.servings', 0)).toBe('0 servings');
    expect(english.tPlural('format.servings', 2.5)).toBe('2.5 servings');
    expect(dutch.tPlural('format.servings', 3)).toBe('3 porties');
  });

  it('lets the caller override the formatted count', () => {
    expect(english.tPlural('format.servings', 1200, { count: '1,200' })).toBe('1,200 servings');
  });

  it('passes extra values through to the plural message', () => {
    expect(english.tPlural('format.customSize', 2, { count: 2, name: 'cookie' })).toBe('2 cookies');
  });
});
