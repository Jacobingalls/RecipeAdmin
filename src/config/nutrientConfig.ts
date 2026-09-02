import type { NutritionInformationData } from '../domain/NutritionInformation';
import type { MessageKey } from '../i18n';

export interface NutrientDef {
  key: keyof NutritionInformationData;
  /** Message key for the nutrient's display name. */
  labelKey: MessageKey;
  indent?: 1 | 2;
  /** Message key for the heading this nutrient sits under. */
  groupKey: MessageKey;
  defaultUnit: string;
}

const NUTRIENT_ORDER: NutrientDef[] = [
  // Energy
  {
    key: 'calories',
    labelKey: 'nutrient.calories',
    groupKey: 'nutrientGroup.energy',
    defaultUnit: 'kcal',
  },
  {
    key: 'caloriesFromFat',
    labelKey: 'nutrient.caloriesFromFat',
    groupKey: 'nutrientGroup.energy',
    defaultUnit: 'kcal',
  },
  // Fats
  {
    key: 'totalFat',
    labelKey: 'nutrient.totalFat',
    groupKey: 'nutrientGroup.fats',
    defaultUnit: 'g',
  },
  {
    key: 'saturatedFat',
    labelKey: 'nutrient.saturatedFat',
    indent: 1,
    groupKey: 'nutrientGroup.fats',
    defaultUnit: 'g',
  },
  {
    key: 'transFat',
    labelKey: 'nutrient.transFat',
    indent: 1,
    groupKey: 'nutrientGroup.fats',
    defaultUnit: 'g',
  },
  {
    key: 'polyunsaturatedFat',
    labelKey: 'nutrient.polyunsaturatedFat',
    indent: 1,
    groupKey: 'nutrientGroup.fats',
    defaultUnit: 'g',
  },
  {
    key: 'monounsaturatedFat',
    labelKey: 'nutrient.monounsaturatedFat',
    indent: 1,
    groupKey: 'nutrientGroup.fats',
    defaultUnit: 'g',
  },
  // Cholesterol & Sodium
  {
    key: 'cholesterol',
    labelKey: 'nutrient.cholesterol',
    groupKey: 'nutrientGroup.otherNutrients',
    defaultUnit: 'mg',
  },
  {
    key: 'sodium',
    labelKey: 'nutrient.sodium',
    groupKey: 'nutrientGroup.otherNutrients',
    defaultUnit: 'mg',
  },
  // Carbohydrates
  {
    key: 'totalCarbohydrate',
    labelKey: 'nutrient.totalCarbohydrate',
    groupKey: 'nutrientGroup.carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'dietaryFiber',
    labelKey: 'nutrient.dietaryFiber',
    indent: 1,
    groupKey: 'nutrientGroup.carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'solubleFiber',
    labelKey: 'nutrient.solubleFiber',
    indent: 2,
    groupKey: 'nutrientGroup.carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'insolubleFiber',
    labelKey: 'nutrient.insolubleFiber',
    indent: 2,
    groupKey: 'nutrientGroup.carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'totalSugars',
    labelKey: 'nutrient.totalSugars',
    indent: 1,
    groupKey: 'nutrientGroup.carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'addedSugars',
    labelKey: 'nutrient.addedSugars',
    indent: 2,
    groupKey: 'nutrientGroup.carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'sugarAlcohol',
    labelKey: 'nutrient.sugarAlcohol',
    indent: 1,
    groupKey: 'nutrientGroup.carbohydrates',
    defaultUnit: 'g',
  },
  // Protein
  {
    key: 'protein',
    labelKey: 'nutrient.protein',
    groupKey: 'nutrientGroup.protein',
    defaultUnit: 'g',
  },
  // Vitamins
  {
    key: 'vitaminA',
    labelKey: 'nutrient.vitaminA',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'μg',
  },
  {
    key: 'vitaminC',
    labelKey: 'nutrient.vitaminC',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'mg',
  },
  {
    key: 'vitaminD',
    labelKey: 'nutrient.vitaminD',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'μg',
  },
  {
    key: 'vitaminE',
    labelKey: 'nutrient.vitaminE',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'mg',
  },
  {
    key: 'vitaminK',
    labelKey: 'nutrient.vitaminK',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'μg',
  },
  {
    key: 'thiamin',
    labelKey: 'nutrient.thiamin',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'mg',
  },
  {
    key: 'riboflavin',
    labelKey: 'nutrient.riboflavin',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'mg',
  },
  {
    key: 'niacin',
    labelKey: 'nutrient.niacin',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'mg',
  },
  {
    key: 'vitaminB6',
    labelKey: 'nutrient.vitaminB6',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'mg',
  },
  {
    key: 'folate',
    labelKey: 'nutrient.folate',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'μg',
  },
  {
    key: 'vitaminB12',
    labelKey: 'nutrient.vitaminB12',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'μg',
  },
  {
    key: 'biotin',
    labelKey: 'nutrient.biotin',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'μg',
  },
  {
    key: 'pantothenicAcid',
    labelKey: 'nutrient.pantothenicAcid',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'mg',
  },
  {
    key: 'choline',
    labelKey: 'nutrient.choline',
    groupKey: 'nutrientGroup.vitamins',
    defaultUnit: 'mg',
  },
  // Minerals
  {
    key: 'calcium',
    labelKey: 'nutrient.calcium',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'mg',
  },
  { key: 'iron', labelKey: 'nutrient.iron', groupKey: 'nutrientGroup.minerals', defaultUnit: 'mg' },
  {
    key: 'phosphorus',
    labelKey: 'nutrient.phosphorus',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'mg',
  },
  {
    key: 'iodine',
    labelKey: 'nutrient.iodine',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'μg',
  },
  {
    key: 'magnesium',
    labelKey: 'nutrient.magnesium',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'mg',
  },
  { key: 'zinc', labelKey: 'nutrient.zinc', groupKey: 'nutrientGroup.minerals', defaultUnit: 'mg' },
  {
    key: 'selenium',
    labelKey: 'nutrient.selenium',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'μg',
  },
  {
    key: 'copper',
    labelKey: 'nutrient.copper',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'mg',
  },
  {
    key: 'manganese',
    labelKey: 'nutrient.manganese',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'mg',
  },
  {
    key: 'chromium',
    labelKey: 'nutrient.chromium',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'μg',
  },
  {
    key: 'molybdenum',
    labelKey: 'nutrient.molybdenum',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'μg',
  },
  {
    key: 'chloride',
    labelKey: 'nutrient.chloride',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'mg',
  },
  {
    key: 'potassium',
    labelKey: 'nutrient.potassium',
    groupKey: 'nutrientGroup.minerals',
    defaultUnit: 'mg',
  },
];

export default NUTRIENT_ORDER;
