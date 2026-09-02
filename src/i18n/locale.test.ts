import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  browserLanguages,
  getActiveLocale,
  isLocale,
  isLocalePreference,
  matchLocale,
  readStoredPreference,
  resolveLocale,
  setActiveLocale,
  storePreference,
} from './locale';

describe('isLocale', () => {
  it('accepts shipped languages', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('nl')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isLocale('de')).toBe(false);
    expect(isLocale('nl-NL')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(7)).toBe(false);
  });
});

describe('isLocalePreference', () => {
  it('accepts "system" and shipped languages', () => {
    expect(isLocalePreference('system')).toBe(true);
    expect(isLocalePreference('nl')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isLocalePreference('auto')).toBe(false);
    expect(isLocalePreference(undefined)).toBe(false);
  });
});

describe('matchLocale', () => {
  it('ignores region subtags', () => {
    expect(matchLocale(['nl-BE'])).toBe('nl');
    expect(matchLocale(['EN-GB'])).toBe('en');
  });

  it('takes the first supported language in the list', () => {
    expect(matchLocale(['de', 'fr', 'nl', 'en'])).toBe('nl');
  });

  it('returns null when nothing matches', () => {
    expect(matchLocale(['de', 'fr'])).toBeNull();
    expect(matchLocale([])).toBeNull();
    expect(matchLocale(undefined)).toBeNull();
  });
});

describe('resolveLocale', () => {
  it('uses an explicit preference as-is', () => {
    expect(resolveLocale('nl', ['en'])).toBe('nl');
    expect(resolveLocale('en', ['nl'])).toBe('en');
  });

  it('follows the browser when the preference is "system"', () => {
    expect(resolveLocale('system', ['nl-NL'])).toBe('nl');
  });

  it('falls back to the default language for unsupported browsers', () => {
    expect(resolveLocale('system', ['de-DE'])).toBe(DEFAULT_LOCALE);
  });
});

describe('browserLanguages', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefers the full list the browser reports', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['nl-NL', 'en']);
    expect(browserLanguages()).toEqual(['nl-NL', 'en']);
  });

  it('falls back to the single language when no list is available', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([]);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('nl');
    expect(browserLanguages()).toEqual(['nl']);
  });

  it('returns nothing when the browser reports no language', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([]);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('');
    expect(browserLanguages()).toEqual([]);
  });
});

describe('stored preference', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips an explicit language', () => {
    storePreference('nl');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('nl');
    expect(readStoredPreference()).toBe('nl');
  });

  it('clears the stored value when following the browser', () => {
    storePreference('nl');
    storePreference('system');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
    expect(readStoredPreference()).toBe('system');
  });

  it('ignores a stored value that is no longer supported', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'de');
    expect(readStoredPreference()).toBe('system');
  });

  it('falls back to following the browser when storage throws', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readStoredPreference()).toBe('system');
    getItem.mockRestore();
  });

  it('applies a preference it cannot save', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => storePreference('nl')).not.toThrow();
    setItem.mockRestore();
  });
});

describe('active locale', () => {
  it('starts at the default language and can be changed', () => {
    expect(getActiveLocale()).toBe(DEFAULT_LOCALE);
    setActiveLocale('nl');
    expect(getActiveLocale()).toBe('nl');
    setActiveLocale(DEFAULT_LOCALE);
  });
});

describe('SUPPORTED_LOCALES', () => {
  it('lists English first so it reads as the source language', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'nl']);
  });
});
