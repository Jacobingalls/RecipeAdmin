import { afterEach, describe, expect, it, vi } from 'vitest';

import i18n, { DEFAULT_LOCALE } from '../i18n';

import {
  LABEL_STYLE_STORAGE_KEY,
  energyAmount,
  energyUnit,
  formatEnergy,
  getLabelStyle,
  getLabelStylePreference,
  isLabelStyle,
  isLabelStylePreference,
  setLabelStylePreference,
  subscribeLabelStyle,
} from './nutritionLabelStyle';

describe('nutrition label style', () => {
  afterEach(async () => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    await i18n.changeLanguage(DEFAULT_LOCALE);
  });

  describe('the stored preference', () => {
    it('follows the language until the user picks a measure', () => {
      expect(getLabelStylePreference()).toBe('system');
    });

    it('remembers the measure the user picked', () => {
      setLabelStylePreference('european');
      expect(window.localStorage.getItem(LABEL_STYLE_STORAGE_KEY)).toBe('european');
      expect(getLabelStylePreference()).toBe('european');
    });

    it('clears the stored measure when the user goes back to following their language', () => {
      setLabelStylePreference('us');
      setLabelStylePreference('system');
      expect(window.localStorage.getItem(LABEL_STYLE_STORAGE_KEY)).toBeNull();
      expect(getLabelStylePreference()).toBe('system');
    });

    it('ignores a stored value it does not recognise', () => {
      window.localStorage.setItem(LABEL_STYLE_STORAGE_KEY, 'joules');
      expect(getLabelStylePreference()).toBe('system');
    });

    it('falls back to following the language when storage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied');
      });
      expect(getLabelStylePreference()).toBe('system');
    });

    it('keeps working when storage refuses to save', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('denied');
      });
      expect(() => setLabelStylePreference('european')).not.toThrow();
    });
  });

  describe('the measure being shown', () => {
    it('counts calories for English readers', async () => {
      await i18n.changeLanguage('en');
      expect(getLabelStyle()).toBe('us');
    });

    it.each(['da', 'es', 'nl', 'sv'])('measures kilojoules for %s readers', async (locale) => {
      await i18n.changeLanguage(locale);
      expect(getLabelStyle()).toBe('european');
    });

    it('lets an explicit choice override the language', async () => {
      await i18n.changeLanguage('sv');
      setLabelStylePreference('us');
      expect(getLabelStyle()).toBe('us');
    });
  });

  describe('converting and formatting', () => {
    it('names the unit each measure is written in', () => {
      expect(energyUnit('us')).toBe('kcal');
      expect(energyUnit('european')).toBe('kJ');
    });

    it('leaves calories alone', () => {
      expect(energyAmount(250, 'us')).toBe(250);
    });

    it('converts calories to kilojoules', () => {
      expect(energyAmount(250, 'european')).toBeCloseTo(1046, 5);
    });

    it('writes an amount with its unit', () => {
      expect(formatEnergy(250, 'us')).toBe('250 kcal');
      expect(formatEnergy(250, 'european')).toBe('1,046 kJ');
    });

    it('rounds the way every other nutrient does', () => {
      expect(formatEnergy(0, 'us')).toBe('0 kcal');
      expect(formatEnergy(12.345, 'us')).toBe('12.3 kcal');
    });
  });

  describe('subscribers', () => {
    it('hears about a new preference', () => {
      const listener = vi.fn();
      const unsubscribe = subscribeLabelStyle(listener);

      setLabelStylePreference('european');

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('hears about a language that reads energy differently', async () => {
      const listener = vi.fn();
      const unsubscribe = subscribeLabelStyle(listener);

      await i18n.changeLanguage('nl');

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('stops hearing anything once unsubscribed', async () => {
      const listener = vi.fn();
      subscribeLabelStyle(listener)();

      setLabelStylePreference('european');
      await i18n.changeLanguage('nl');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('type guards', () => {
    it('recognises the measures the app shows', () => {
      expect(isLabelStyle('us')).toBe(true);
      expect(isLabelStyle('european')).toBe(true);
      expect(isLabelStyle('system')).toBe(false);
      expect(isLabelStyle(null)).toBe(false);
    });

    it('recognises following the language as a preference', () => {
      expect(isLabelStylePreference('system')).toBe(true);
      expect(isLabelStylePreference('european')).toBe(true);
      expect(isLabelStylePreference('joules')).toBe(false);
    });
  });
});
