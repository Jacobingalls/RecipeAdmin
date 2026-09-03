import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import i18n, {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  getActiveLocale,
  getLocalePreference,
  isLocale,
  isLocalePreference,
  setLocalePreference,
} from './index';

describe('isLocale', () => {
  it('accepts shipped languages', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('nl')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isLocale('de')).toBe(false);
    expect(isLocale('nl-NL')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe('isLocalePreference', () => {
  it('accepts "system" alongside the shipped languages', () => {
    expect(isLocalePreference('system')).toBe(true);
    expect(isLocalePreference('nl')).toBe(true);
    expect(isLocalePreference('auto')).toBe(false);
  });
});

describe('translations', () => {
  afterEach(async () => {
    await i18n.changeLanguage(DEFAULT_LOCALE);
  });

  it('reads messages in the active language', async () => {
    expect(i18n.t('common.save')).toBe('Save');
    await i18n.changeLanguage('nl');
    expect(i18n.t('common.save')).toBe('Opslaan');
  });

  it('treats dots in keys as part of the key, not a path', () => {
    expect(i18n.t('settings.error.passkeys')).toBe("Couldn't load passkeys.");
  });

  it('interpolates values', () => {
    expect(i18n.t('credential.created', { time: '3d ago' })).toBe('Created 3d ago');
  });

  it('picks the singular form for one', async () => {
    expect(i18n.t('format.servings', { count: 1, amount: 1 })).toBe('1 serving');
    await i18n.changeLanguage('nl');
    expect(i18n.t('format.servings', { count: 1, amount: 1 })).toBe('1 portie');
  });

  it('picks the plural form for everything else', async () => {
    expect(i18n.t('format.servings', { count: 0, amount: 0 })).toBe('0 servings');
    expect(i18n.t('format.servings', { count: 2.5, amount: 2.5 })).toBe('2.5 servings');
    await i18n.changeLanguage('nl');
    expect(i18n.t('format.servings', { count: 3, amount: 3 })).toBe('3 porties');
  });

  it('shows the caller-formatted number while still selecting on the real count', () => {
    expect(i18n.t('format.servings', { count: 1200, amount: '1,200' })).toBe('1,200 servings');
  });

  it('falls back to English when a translation is missing', async () => {
    await i18n.changeLanguage('de');
    expect(i18n.t('common.save')).toBe('Save');
  });
});

describe('getActiveLocale', () => {
  afterEach(async () => {
    await i18n.changeLanguage(DEFAULT_LOCALE);
  });

  it('reports the language currently being rendered', async () => {
    expect(getActiveLocale()).toBe('en');
    await i18n.changeLanguage('nl');
    expect(getActiveLocale()).toBe('nl');
  });

  it('resolves a regional language to the catalog it uses', async () => {
    await i18n.changeLanguage('nl-BE');
    expect(getActiveLocale()).toBe('nl');
  });

  it('falls back to the default for a language the app does not ship', async () => {
    await i18n.changeLanguage('de');
    expect(getActiveLocale()).toBe(DEFAULT_LOCALE);
  });
});

describe('language preference', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(async () => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    await i18n.changeLanguage(DEFAULT_LOCALE);
  });

  it('defaults to following the browser', () => {
    expect(getLocalePreference()).toBe('system');
  });

  it('round-trips an explicit language and switches the app to it', async () => {
    await setLocalePreference('nl');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('nl');
    expect(getLocalePreference()).toBe('nl');
    expect(i18n.t('common.save')).toBe('Opslaan');
  });

  it('clears the stored value and follows the browser again', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
    await setLocalePreference('nl');
    await setLocalePreference('system');

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
    expect(getLocalePreference()).toBe('system');
    expect(getActiveLocale()).toBe('en');
  });

  it('follows a Dutch browser when no language is pinned', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['nl-NL', 'en']);
    await setLocalePreference('system');
    expect(getActiveLocale()).toBe('nl');
  });

  it('falls back to the default when the browser asks for a language we do not ship', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-DE']);
    await setLocalePreference('system');
    expect(getActiveLocale()).toBe(DEFAULT_LOCALE);
  });

  it('ignores a stored value that is no longer supported', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'de');
    expect(getLocalePreference()).toBe('system');
  });

  it('falls back to following the browser when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(getLocalePreference()).toBe('system');
  });

  it('still applies a preference it cannot save', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    await expect(setLocalePreference('nl')).resolves.toBeUndefined();
    expect(getActiveLocale()).toBe('nl');
  });
});

describe('SUPPORTED_LOCALES', () => {
  it('lists English first so it reads as the source language', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'nl']);
  });
});
