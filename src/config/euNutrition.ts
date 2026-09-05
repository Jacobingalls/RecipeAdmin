// EU nutrition labelling values, from Regulation (EU) No 1169/2011.
// Reference: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011R1169
// Annex XIII Part B gives the reference intakes; Part A the nutrient reference values.

import type { DailyValue } from './constants';

/**
 * Reference intakes of an average adult (Annex XIII Part B).
 *
 * These replace the FDA daily values on a European label, and differ from them: fat is 70 g
 * rather than 78 g, sugars carry an intake where the FDA sets none, and salt replaces sodium.
 */
export const REFERENCE_INTAKES: Record<string, DailyValue | null> = {
  calories: { amount: 2000, unit: 'kcal' }, // 8400 kJ
  totalFat: { amount: 70, unit: 'g' },
  saturatedFat: { amount: 20, unit: 'g' },
  totalCarbohydrate: { amount: 260, unit: 'g' },
  totalSugars: { amount: 90, unit: 'g' },
  protein: { amount: 50, unit: 'g' },
  salt: { amount: 6, unit: 'g' },
};

/**
 * Nutrient reference values for vitamins and minerals (Annex XIII Part A).
 *
 * A European label states a vitamin or mineral as a percentage of these. Nutrients the EU sets
 * no value for — choline among them — are absent, so they carry no percentage.
 */
export const NUTRIENT_REFERENCE_VALUES: Record<string, DailyValue> = {
  vitaminA: { amount: 800, unit: 'mcg' },
  vitaminD: { amount: 5, unit: 'mcg' },
  vitaminE: { amount: 12, unit: 'mg' },
  vitaminK: { amount: 75, unit: 'mcg' },
  vitaminC: { amount: 80, unit: 'mg' },
  thiamin: { amount: 1.1, unit: 'mg' },
  riboflavin: { amount: 1.4, unit: 'mg' },
  niacin: { amount: 16, unit: 'mg' },
  vitaminB6: { amount: 1.4, unit: 'mg' },
  folate: { amount: 200, unit: 'mcg' },
  vitaminB12: { amount: 2.5, unit: 'mcg' },
  biotin: { amount: 50, unit: 'mcg' },
  pantothenicAcid: { amount: 6, unit: 'mg' },
  potassium: { amount: 2000, unit: 'mg' },
  chloride: { amount: 800, unit: 'mg' },
  calcium: { amount: 800, unit: 'mg' },
  phosphorus: { amount: 700, unit: 'mg' },
  magnesium: { amount: 375, unit: 'mg' },
  iron: { amount: 14, unit: 'mg' },
  zinc: { amount: 10, unit: 'mg' },
  copper: { amount: 1, unit: 'mg' },
  manganese: { amount: 2, unit: 'mg' },
  selenium: { amount: 55, unit: 'mcg' },
  chromium: { amount: 40, unit: 'mcg' },
  molybdenum: { amount: 50, unit: 'mcg' },
  iodine: { amount: 150, unit: 'mcg' },
};

/**
 * A European label declares salt where a US one declares sodium.
 *
 * The regulation defines the salt equivalent as sodium × 2.5, which is what shoppers read on
 * the pack — it is not a measurement of added salt.
 */
export function saltFromSodium(sodiumMilligrams: number): number {
  return (sodiumMilligrams * 2.5) / 1000;
}
