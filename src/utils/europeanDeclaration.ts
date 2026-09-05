import type { NutritionInformation, NutritionUnit, Preparation, ProductGroup } from '../domain';
import {
  NUTRIENT_REFERENCE_VALUES,
  REFERENCE_INTAKES,
  saltFromSodium,
} from '../config/euNutrition';
import type { MessageKey } from '../i18n';

import { formatSignificant } from './formatters';
import { nutritionForServing, referenceQuantity } from './referenceQuantity';
import type { ReferenceQuantity } from './referenceQuantity';

type PrepOrGroup = Preparation | ProductGroup;
type NutrientKey = keyof NutritionInformation;

/** One declared nutrient: its amount in each quantity column, and its share of an intake. */
export interface DeclarationRow {
  labelKey: MessageKey;
  /** Rendered indented, the way "of which saturates" sits under "Fat". */
  indent?: boolean;
  /** Formatted amounts, one per quantity column; `null` where the nutrient is undeclared. */
  amounts: (string | null)[];
  /** The serving's share of the adult reference intake, e.g. `14%`. */
  referenceIntake: string | null;
}

/** Energy in both units the regulation requires, for one quantity column. */
export interface DeclaredEnergy {
  kilojoules: number;
  kilocalories: number;
}

export interface Declaration {
  /** The per-100 quantity leading the table, absent when the product carries no mass or volume. */
  perHundred: ReferenceQuantity | null;
  /** Energy per quantity column, in the same order as every row's `amounts`. */
  energy: (DeclaredEnergy | null)[];
  energyReferenceIntake: string | null;
  /** Fat through salt, in the order Annex XV fixes. */
  rows: DeclarationRow[];
  /** Vitamins and minerals the product carries, as amount plus share of the EU reference value. */
  micronutrients: DeclarationRow[];
}

/** The mandatory declaration, plus the optional nutrients this app can source, in fixed order. */
const DECLARED: { key: NutrientKey; labelKey: MessageKey; indent?: boolean }[] = [
  { key: 'totalFat', labelKey: 'euLabel.fat' },
  { key: 'saturatedFat', labelKey: 'euLabel.saturates', indent: true },
  { key: 'monounsaturatedFat', labelKey: 'euLabel.monounsaturates', indent: true },
  { key: 'polyunsaturatedFat', labelKey: 'euLabel.polyunsaturates', indent: true },
  { key: 'totalCarbohydrate', labelKey: 'euLabel.carbohydrate' },
  { key: 'totalSugars', labelKey: 'euLabel.sugars', indent: true },
  { key: 'sugarAlcohol', labelKey: 'euLabel.polyols', indent: true },
  { key: 'dietaryFiber', labelKey: 'euLabel.fibre' },
  { key: 'protein', labelKey: 'euLabel.protein' },
];

/** Message keys for the vitamins and minerals the EU sets a reference value for. */
const MICRONUTRIENT_LABELS: Partial<Record<NutrientKey, MessageKey>> = {
  vitaminA: 'nutritionLabel.vitaminA',
  vitaminD: 'nutritionLabel.vitaminD',
  vitaminE: 'nutritionLabel.vitaminE',
  vitaminK: 'nutritionLabel.vitaminK',
  vitaminC: 'nutritionLabel.vitaminC',
  thiamin: 'nutritionLabel.thiamin',
  riboflavin: 'nutritionLabel.riboflavin',
  niacin: 'nutritionLabel.niacin',
  vitaminB6: 'nutritionLabel.vitaminB6',
  folate: 'nutritionLabel.folate',
  vitaminB12: 'nutritionLabel.vitaminB12',
  biotin: 'nutritionLabel.biotin',
  pantothenicAcid: 'nutritionLabel.pantothenicAcid',
  potassium: 'nutritionLabel.potassium',
  chloride: 'nutritionLabel.chloride',
  calcium: 'nutritionLabel.calcium',
  phosphorus: 'nutritionLabel.phosphorus',
  magnesium: 'nutritionLabel.magnesium',
  iron: 'nutritionLabel.iron',
  zinc: 'nutritionLabel.zinc',
  copper: 'nutritionLabel.copper',
  manganese: 'nutritionLabel.manganese',
  selenium: 'nutritionLabel.selenium',
  chromium: 'nutritionLabel.chromium',
  molybdenum: 'nutritionLabel.molybdenum',
  iodine: 'nutritionLabel.iodine',
};

/** The reference tables use the FDA's `mcg`; nutrition data carries the `μg` symbol. */
function toNutritionUnit(unit: string): string {
  return unit === 'mcg' ? 'μg' : unit;
}

function nutrientAt(
  nutrition: NutritionInformation | null,
  key: NutrientKey,
): NutritionUnit | null {
  return (nutrition?.[key] as NutritionUnit | null | undefined) ?? null;
}

function formatAmount(nutrient: NutritionUnit | null): string | null {
  return nutrient ? `${formatSignificant(nutrient.amount)} ${nutrient.unit}` : null;
}

function percentOfIntake(amount: number | null, key: string): string | null {
  const intake = REFERENCE_INTAKES[key];
  if (!intake || amount == null) return null;
  return `${Math.round((amount / intake.amount) * 100)}%`;
}

/**
 * Build a European nutrition declaration for a serving.
 *
 * The columns are the per-100 quantity followed by the serving, or the serving alone when the
 * product carries neither a mass nor a volume to declare against. Reference-intake percentages
 * always describe the serving, which is what they mean on a pack.
 */
export function buildDeclaration(
  nutritionInfo: NutritionInformation,
  prep: PrepOrGroup,
): Declaration {
  const perHundred = referenceQuantity(prep);
  const perHundredNutrition = perHundred ? nutritionForServing(prep, perHundred.servingSize) : null;
  const columns = perHundredNutrition ? [perHundredNutrition, nutritionInfo] : [nutritionInfo];

  const servingCalories = nutrientAt(nutritionInfo, 'calories');

  const rows: DeclarationRow[] = DECLARED.map(
    ({ key, labelKey, indent }): DeclarationRow | null => {
      const amounts = columns.map((column) => formatAmount(nutrientAt(column, key)));
      if (amounts.every((amount) => amount === null)) return null;
      return {
        labelKey,
        indent,
        amounts,
        referenceIntake: percentOfIntake(nutrientAt(nutritionInfo, key)?.amount ?? null, key),
      };
    },
  ).filter((row): row is DeclarationRow => row !== null);

  const saltAmounts = columns.map((column) => {
    const sodium = nutrientAt(column, 'sodium');
    return sodium ? `${formatSignificant(saltFromSodium(sodium.converted('mg').amount))} g` : null;
  });
  if (saltAmounts.some((amount) => amount !== null)) {
    const servingSodium = nutrientAt(nutritionInfo, 'sodium');
    rows.push({
      labelKey: 'euLabel.salt',
      amounts: saltAmounts,
      referenceIntake: percentOfIntake(
        servingSodium ? saltFromSodium(servingSodium.converted('mg').amount) : null,
        'salt',
      ),
    });
  }

  const micronutrients: DeclarationRow[] = (Object.keys(MICRONUTRIENT_LABELS) as NutrientKey[])
    .map((key): DeclarationRow | null => {
      const micronutrientLabel = MICRONUTRIENT_LABELS[key];
      if (!micronutrientLabel) return null;

      const amounts = columns.map((column) => formatAmount(nutrientAt(column, key)));
      if (amounts.every((amount) => amount === null)) return null;

      const nrv = NUTRIENT_REFERENCE_VALUES[key as string];
      const shareOfNrv = (nutrient: NutritionUnit | null) =>
        nutrient ? (nutrient.converted(toNutritionUnit(nrv.unit)).amount / nrv.amount) * 100 : null;

      // A pack may name a vitamin only where a serving carries a significant amount of it. This
      // shows every figure the product has instead: the rule exists to keep trace amounts off a
      // printed label, and hiding data someone entered would serve them worse than a small number.
      const servingShare = shareOfNrv(nutrientAt(nutritionInfo, key));

      return {
        labelKey: micronutrientLabel,
        amounts,
        referenceIntake: servingShare == null ? null : `${Math.round(servingShare)}%`,
      };
    })
    .filter((row): row is DeclarationRow => row !== null);

  return {
    perHundred,
    energy: columns.map((column) => {
      const calories = nutrientAt(column, 'calories');
      if (!calories) return null;
      return {
        kilocalories: calories.amount,
        kilojoules: calories.converted('kJ').amount,
      };
    }),
    energyReferenceIntake: percentOfIntake(servingCalories?.amount ?? null, 'calories'),
    rows,
    micronutrients,
  };
}

/**
 * The adult reference intake as the regulation states it in the label's footnote.
 *
 * Both figures are fixed by Annex XIII rather than converted from one another — 2 000 kcal is
 * 8 368 kJ, and the regulation rounds it to 8 400.
 */
export function referenceIntakeEnergy(): DeclaredEnergy {
  return { kilojoules: 8400, kilocalories: 2000 };
}
