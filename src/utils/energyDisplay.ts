import { NutritionUnit } from '../domain/NutritionUnit';
import i18n, { getActiveLocale } from '../i18n';
import type { Locale } from '../i18n';

import { formatSignificant } from './formatters';

/**
 * How energy is written on a nutrition label.
 *
 * US labels count calories; European ones measure energy in kilojoules and give calories
 * alongside them.
 */
export type EnergyDisplay = 'calories' | 'kilojoules';

/** What the user chose in settings — a measure, or `system` to follow the language. */
export type EnergyDisplayPreference = 'system' | EnergyDisplay;

export const ENERGY_DISPLAY_STORAGE_KEY = 'recipeadmin.energyDisplay';

/** Unit symbols are data rather than interface text, so they read the same in every language. */
const DISPLAY_UNITS: Record<EnergyDisplay, string> = {
  calories: 'kcal',
  kilojoules: 'kJ',
};

/** The measure speakers of each language expect to read, used until they pick one. */
const LOCALE_DEFAULTS: Record<Locale, EnergyDisplay> = {
  en: 'calories',
  da: 'kilojoules',
  es: 'kilojoules',
  nl: 'kilojoules',
  sv: 'kilojoules',
};

const listeners = new Set<() => void>();

export function isEnergyDisplay(value: unknown): value is EnergyDisplay {
  return value === 'calories' || value === 'kilojoules';
}

export function isEnergyDisplayPreference(value: unknown): value is EnergyDisplayPreference {
  return value === 'system' || isEnergyDisplay(value);
}

/** What the user chose — a measure, or `system` to follow the language. */
export function getEnergyDisplayPreference(): EnergyDisplayPreference {
  try {
    const stored = window.localStorage.getItem(ENERGY_DISPLAY_STORAGE_KEY);
    return isEnergyDisplayPreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/**
 * Save the energy preference and re-render everything showing energy.
 *
 * `system` clears the saved value, so the app follows the language again.
 */
export function setEnergyDisplayPreference(preference: EnergyDisplayPreference): void {
  try {
    if (preference === 'system') {
      window.localStorage.removeItem(ENERGY_DISPLAY_STORAGE_KEY);
    } else {
      window.localStorage.setItem(ENERGY_DISPLAY_STORAGE_KEY, preference);
    }
  } catch {
    // Storage the browser refuses leaves the app on its language's measure.
  }

  for (const listener of listeners) listener();
}

/** The measure to render right now: what the user picked, or what their language expects. */
export function getEnergyDisplay(): EnergyDisplay {
  const preference = getEnergyDisplayPreference();
  return preference === 'system' ? LOCALE_DEFAULTS[getActiveLocale()] : preference;
}

/**
 * Called back whenever the rendered measure changes, whether the user picked a new one or
 * switched to a language that reads energy differently.
 */
export function subscribeEnergyDisplay(listener: () => void): () => void {
  listeners.add(listener);
  i18n.on('languageChanged', listener);

  return () => {
    listeners.delete(listener);
    i18n.off('languageChanged', listener);
  };
}

/** The unit symbol a measure is written in: `kcal` or `kJ`. */
export function energyUnit(display: EnergyDisplay): string {
  return DISPLAY_UNITS[display];
}

/** Convert kilocalories, the unit nutrition data carries, into the measure being shown. */
export function energyAmount(kilocalories: number, display: EnergyDisplay): number {
  return new NutritionUnit(kilocalories, 'kcal').converted(DISPLAY_UNITS[display]).amount;
}

/** Write kilocalories in the measure being shown, with its unit: `250 kcal`, `1,046 kJ`. */
export function formatEnergy(kilocalories: number, display: EnergyDisplay): string {
  return `${formatSignificant(energyAmount(kilocalories, display))} ${energyUnit(display)}`;
}
