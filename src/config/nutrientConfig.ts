import type { NutritionInformationData } from '../domain/NutritionInformation';

export interface NutrientDef {
  key: keyof NutritionInformationData;
  label: string;
  indent?: 1 | 2;
  group: string;
  defaultUnit: string;
}

const NUTRIENT_ORDER: NutrientDef[] = [
  // Energy
  { key: 'calories', label: 'Calories', group: 'Energy', defaultUnit: 'kcal' },
  { key: 'caloriesFromFat', label: 'Calories from fat', group: 'Energy', defaultUnit: 'kcal' },
  // Fats
  { key: 'totalFat', label: 'Total fat', group: 'Fats', defaultUnit: 'g' },
  { key: 'saturatedFat', label: 'Saturated fat', indent: 1, group: 'Fats', defaultUnit: 'g' },
  { key: 'transFat', label: 'Trans fat', indent: 1, group: 'Fats', defaultUnit: 'g' },
  {
    key: 'polyunsaturatedFat',
    label: 'Polyunsaturated fat',
    indent: 1,
    group: 'Fats',
    defaultUnit: 'g',
  },
  {
    key: 'monounsaturatedFat',
    label: 'Monounsaturated fat',
    indent: 1,
    group: 'Fats',
    defaultUnit: 'g',
  },
  // Cholesterol & Sodium
  { key: 'cholesterol', label: 'Cholesterol', group: 'Other', defaultUnit: 'mg' },
  { key: 'sodium', label: 'Sodium', group: 'Other', defaultUnit: 'mg' },
  // Carbohydrates
  {
    key: 'totalCarbohydrate',
    label: 'Total carbohydrate',
    group: 'Carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'dietaryFiber',
    label: 'Dietary fiber',
    indent: 1,
    group: 'Carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'solubleFiber',
    label: 'Soluble fiber',
    indent: 2,
    group: 'Carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'insolubleFiber',
    label: 'Insoluble fiber',
    indent: 2,
    group: 'Carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'totalSugars',
    label: 'Total sugars',
    indent: 1,
    group: 'Carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'addedSugars',
    label: 'Added sugars',
    indent: 2,
    group: 'Carbohydrates',
    defaultUnit: 'g',
  },
  {
    key: 'sugarAlcohol',
    label: 'Sugar alcohol',
    indent: 1,
    group: 'Carbohydrates',
    defaultUnit: 'g',
  },
  // Protein
  { key: 'protein', label: 'Protein', group: 'Protein', defaultUnit: 'g' },
  // Vitamins
  { key: 'vitaminA', label: 'Vitamin A', group: 'Vitamins', defaultUnit: 'μg' },
  { key: 'vitaminC', label: 'Vitamin C', group: 'Vitamins', defaultUnit: 'mg' },
  { key: 'vitaminD', label: 'Vitamin D', group: 'Vitamins', defaultUnit: 'μg' },
  { key: 'vitaminE', label: 'Vitamin E', group: 'Vitamins', defaultUnit: 'mg' },
  { key: 'vitaminK', label: 'Vitamin K', group: 'Vitamins', defaultUnit: 'μg' },
  { key: 'thiamin', label: 'Thiamin (B1)', group: 'Vitamins', defaultUnit: 'mg' },
  { key: 'riboflavin', label: 'Riboflavin (B2)', group: 'Vitamins', defaultUnit: 'mg' },
  { key: 'niacin', label: 'Niacin (B3)', group: 'Vitamins', defaultUnit: 'mg' },
  { key: 'vitaminB6', label: 'Vitamin B6', group: 'Vitamins', defaultUnit: 'mg' },
  { key: 'folate', label: 'Folate', group: 'Vitamins', defaultUnit: 'μg' },
  { key: 'vitaminB12', label: 'Vitamin B12', group: 'Vitamins', defaultUnit: 'μg' },
  { key: 'biotin', label: 'Biotin', group: 'Vitamins', defaultUnit: 'μg' },
  { key: 'pantothenicAcid', label: 'Pantothenic acid', group: 'Vitamins', defaultUnit: 'mg' },
  { key: 'choline', label: 'Choline', group: 'Vitamins', defaultUnit: 'mg' },
  // Minerals
  { key: 'calcium', label: 'Calcium', group: 'Minerals', defaultUnit: 'mg' },
  { key: 'iron', label: 'Iron', group: 'Minerals', defaultUnit: 'mg' },
  { key: 'phosphorus', label: 'Phosphorus', group: 'Minerals', defaultUnit: 'mg' },
  { key: 'iodine', label: 'Iodine', group: 'Minerals', defaultUnit: 'μg' },
  { key: 'magnesium', label: 'Magnesium', group: 'Minerals', defaultUnit: 'mg' },
  { key: 'zinc', label: 'Zinc', group: 'Minerals', defaultUnit: 'mg' },
  { key: 'selenium', label: 'Selenium', group: 'Minerals', defaultUnit: 'μg' },
  { key: 'copper', label: 'Copper', group: 'Minerals', defaultUnit: 'mg' },
  { key: 'manganese', label: 'Manganese', group: 'Minerals', defaultUnit: 'mg' },
  { key: 'chromium', label: 'Chromium', group: 'Minerals', defaultUnit: 'μg' },
  { key: 'molybdenum', label: 'Molybdenum', group: 'Minerals', defaultUnit: 'μg' },
  { key: 'chloride', label: 'Chloride', group: 'Minerals', defaultUnit: 'mg' },
  { key: 'potassium', label: 'Potassium', group: 'Minerals', defaultUnit: 'mg' },
];

export default NUTRIENT_ORDER;
