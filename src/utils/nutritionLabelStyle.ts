import { NutritionUnit } from '../domain/NutritionUnit';
import i18n, { getActiveLocale } from '../i18n';
import type { Locale } from '../i18n';

import { formatSignificant } from './formatters';

/**
 * Which nutrition labelling convention to render.
 *
 * The two differ in more than units. US labels count calories per serving and rate nutrients
 * against FDA daily values. European ones lead with kilojoules, declare amounts per 100 g or
 * 100 ml, report salt rather than sodium, and rate against EU reference intakes.
 */
export type LabelStyle = 'us' | 'european';

/** What the user chose in settings — a convention, or `system` to follow the language. */
export type LabelStylePreference = 'system' | LabelStyle;

export const LABEL_STYLE_STORAGE_KEY = 'recipeadmin.nutritionLabel';

/** Unit symbols are data rather than interface text, so they read the same in every language. */
const ENERGY_UNITS: Record<LabelStyle, string> = {
  us: 'kcal',
  european: 'kJ',
};

/** The convention speakers of each language expect to read, used until they pick one. */
const LOCALE_DEFAULTS: Record<Locale, LabelStyle> = {
  en: 'us',
  da: 'european',
  es: 'european',
  nl: 'european',
  sv: 'european',
};

const listeners = new Set<() => void>();

export function isLabelStyle(value: unknown): value is LabelStyle {
  return value === 'us' || value === 'european';
}

export function isLabelStylePreference(value: unknown): value is LabelStylePreference {
  return value === 'system' || isLabelStyle(value);
}

/** What the user chose — a convention, or `system` to follow the language. */
export function getLabelStylePreference(): LabelStylePreference {
  try {
    const stored = window.localStorage.getItem(LABEL_STYLE_STORAGE_KEY);
    return isLabelStylePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/**
 * Save the labelling preference and re-render every label.
 *
 * `system` clears the saved value, so the app follows the language again.
 */
export function setLabelStylePreference(preference: LabelStylePreference): void {
  try {
    if (preference === 'system') {
      window.localStorage.removeItem(LABEL_STYLE_STORAGE_KEY);
    } else {
      window.localStorage.setItem(LABEL_STYLE_STORAGE_KEY, preference);
    }
  } catch {
    // Storage the browser refuses leaves the app on its language's convention.
  }

  for (const listener of listeners) listener();
}

/** The convention to render right now: what the user picked, or what their language expects. */
export function getLabelStyle(): LabelStyle {
  const preference = getLabelStylePreference();
  return preference === 'system' ? LOCALE_DEFAULTS[getActiveLocale()] : preference;
}

/**
 * Called back whenever the rendered convention changes, whether the user picked a new one or
 * switched to a language that labels food differently.
 */
export function subscribeLabelStyle(listener: () => void): () => void {
  listeners.add(listener);
  i18n.on('languageChanged', listener);

  return () => {
    listeners.delete(listener);
    i18n.off('languageChanged', listener);
  };
}

/** The unit energy is written in under a convention: `kcal` or `kJ`. */
export function energyUnit(style: LabelStyle): string {
  return ENERGY_UNITS[style];
}

/** Convert kilocalories, the unit nutrition data carries, into the unit being shown. */
export function energyAmount(kilocalories: number, style: LabelStyle): number {
  return new NutritionUnit(kilocalories, 'kcal').converted(ENERGY_UNITS[style]).amount;
}

/** Write kilocalories in the unit being shown, with its symbol: `250 kcal`, `1,046 kJ`. */
export function formatEnergy(kilocalories: number, style: LabelStyle): string {
  return `${formatSignificant(energyAmount(kilocalories, style))} ${energyUnit(style)}`;
}
