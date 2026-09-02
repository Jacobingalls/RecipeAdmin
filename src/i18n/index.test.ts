import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, setActiveLocale } from './locale';

import { getTranslator, translatorFor } from './index';

describe('translatorFor', () => {
  it('returns a translator for the requested language', () => {
    expect(translatorFor('nl').t('common.save')).toBe('Opslaan');
    expect(translatorFor('en').t('common.save')).toBe('Save');
  });

  it('reuses the same instance so it is cheap to call while rendering', () => {
    expect(translatorFor('nl')).toBe(translatorFor('nl'));
  });
});

describe('getTranslator', () => {
  afterEach(() => {
    setActiveLocale(DEFAULT_LOCALE);
  });

  it('follows the language currently being rendered', () => {
    expect(getTranslator().t('common.save')).toBe('Save');
    setActiveLocale('nl');
    expect(getTranslator().t('common.save')).toBe('Opslaan');
  });
});
