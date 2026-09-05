import { afterEach, describe, expect, it, vi } from 'vitest';

import i18n, { DEFAULT_LOCALE } from '../i18n';

import {
  ENERGY_DISPLAY_STORAGE_KEY,
  energyAmount,
  energyUnit,
  formatEnergy,
  getEnergyDisplay,
  getEnergyDisplayPreference,
  isEnergyDisplay,
  isEnergyDisplayPreference,
  setEnergyDisplayPreference,
  subscribeEnergyDisplay,
} from './energyDisplay';

describe('energy display', () => {
  afterEach(async () => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    await i18n.changeLanguage(DEFAULT_LOCALE);
  });

  describe('the stored preference', () => {
    it('follows the language until the user picks a measure', () => {
      expect(getEnergyDisplayPreference()).toBe('system');
    });

    it('remembers the measure the user picked', () => {
      setEnergyDisplayPreference('kilojoules');
      expect(window.localStorage.getItem(ENERGY_DISPLAY_STORAGE_KEY)).toBe('kilojoules');
      expect(getEnergyDisplayPreference()).toBe('kilojoules');
    });

    it('clears the stored measure when the user goes back to following their language', () => {
      setEnergyDisplayPreference('calories');
      setEnergyDisplayPreference('system');
      expect(window.localStorage.getItem(ENERGY_DISPLAY_STORAGE_KEY)).toBeNull();
      expect(getEnergyDisplayPreference()).toBe('system');
    });

    it('ignores a stored value it does not recognise', () => {
      window.localStorage.setItem(ENERGY_DISPLAY_STORAGE_KEY, 'joules');
      expect(getEnergyDisplayPreference()).toBe('system');
    });

    it('falls back to following the language when storage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied');
      });
      expect(getEnergyDisplayPreference()).toBe('system');
    });

    it('keeps working when storage refuses to save', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('denied');
      });
      expect(() => setEnergyDisplayPreference('kilojoules')).not.toThrow();
    });
  });

  describe('the measure being shown', () => {
    it('counts calories for English readers', async () => {
      await i18n.changeLanguage('en');
      expect(getEnergyDisplay()).toBe('calories');
    });

    it.each(['da', 'es', 'nl', 'sv'])('measures kilojoules for %s readers', async (locale) => {
      await i18n.changeLanguage(locale);
      expect(getEnergyDisplay()).toBe('kilojoules');
    });

    it('lets an explicit choice override the language', async () => {
      await i18n.changeLanguage('sv');
      setEnergyDisplayPreference('calories');
      expect(getEnergyDisplay()).toBe('calories');
    });
  });

  describe('converting and formatting', () => {
    it('names the unit each measure is written in', () => {
      expect(energyUnit('calories')).toBe('kcal');
      expect(energyUnit('kilojoules')).toBe('kJ');
    });

    it('leaves calories alone', () => {
      expect(energyAmount(250, 'calories')).toBe(250);
    });

    it('converts calories to kilojoules', () => {
      expect(energyAmount(250, 'kilojoules')).toBeCloseTo(1046, 5);
    });

    it('writes an amount with its unit', () => {
      expect(formatEnergy(250, 'calories')).toBe('250 kcal');
      expect(formatEnergy(250, 'kilojoules')).toBe('1,046 kJ');
    });

    it('rounds the way every other nutrient does', () => {
      expect(formatEnergy(0, 'calories')).toBe('0 kcal');
      expect(formatEnergy(12.345, 'calories')).toBe('12.3 kcal');
    });
  });

  describe('subscribers', () => {
    it('hears about a new preference', () => {
      const listener = vi.fn();
      const unsubscribe = subscribeEnergyDisplay(listener);

      setEnergyDisplayPreference('kilojoules');

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('hears about a language that reads energy differently', async () => {
      const listener = vi.fn();
      const unsubscribe = subscribeEnergyDisplay(listener);

      await i18n.changeLanguage('nl');

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('stops hearing anything once unsubscribed', async () => {
      const listener = vi.fn();
      subscribeEnergyDisplay(listener)();

      setEnergyDisplayPreference('kilojoules');
      await i18n.changeLanguage('nl');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('type guards', () => {
    it('recognises the measures the app shows', () => {
      expect(isEnergyDisplay('calories')).toBe(true);
      expect(isEnergyDisplay('kilojoules')).toBe(true);
      expect(isEnergyDisplay('system')).toBe(false);
      expect(isEnergyDisplay(null)).toBe(false);
    });

    it('recognises following the language as a preference', () => {
      expect(isEnergyDisplayPreference('system')).toBe(true);
      expect(isEnergyDisplayPreference('kilojoules')).toBe(true);
      expect(isEnergyDisplayPreference('joules')).toBe(false);
    });
  });
});
