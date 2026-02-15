import { useMemo } from 'react';

import {
  type NutritionInformationData,
  type NutritionInformation,
  Preparation,
  ServingSize,
} from '../domain';

import { ModalBase, ModalHeader, ModalBody } from './common';
import NutritionLabel from './NutritionLabel';

interface DayNutritionModalProps {
  dayLabel: string;
  nutritionInfo: NutritionInformation;
  onClose: () => void;
}

type NutrientKey = keyof NutritionInformationData;

const NUTRIENT_KEYS: NutrientKey[] = [
  'calories',
  'caloriesFromFat',
  'totalFat',
  'saturatedFat',
  'transFat',
  'polyunsaturatedFat',
  'monounsaturatedFat',
  'cholesterol',
  'sodium',
  'totalCarbohydrate',
  'dietaryFiber',
  'solubleFiber',
  'insolubleFiber',
  'totalSugars',
  'addedSugars',
  'sugarAlcohol',
  'protein',
  'vitaminA',
  'vitaminC',
  'vitaminD',
  'vitaminE',
  'vitaminK',
  'thiamin',
  'riboflavin',
  'niacin',
  'vitaminB6',
  'folate',
  'vitaminB12',
  'biotin',
  'pantothenicAcid',
  'choline',
  'calcium',
  'iron',
  'phosphorus',
  'iodine',
  'magnesium',
  'zinc',
  'selenium',
  'copper',
  'manganese',
  'chromium',
  'molybdenum',
  'chloride',
  'potassium',
];

function toNutritionInformationData(nutritionInfo: NutritionInformation): NutritionInformationData {
  const data: NutritionInformationData = {};
  for (const key of NUTRIENT_KEYS) {
    const nutrient = nutritionInfo[key];
    data[key] = nutrient ? { amount: nutrient.amount, unit: nutrient.unit } : null;
  }
  return data;
}

export default function DayNutritionModal({
  dayLabel,
  nutritionInfo,
  onClose,
}: DayNutritionModalProps) {
  const prep = useMemo(
    () =>
      new Preparation({
        name: `Daily total (${dayLabel})`,
        servingSizeDescription: `Total nutrition consumed on ${dayLabel}`,
        nutritionalInformation: toNutritionInformationData(nutritionInfo),
      }),
    [dayLabel, nutritionInfo],
  );

  return (
    <ModalBase onClose={onClose} ariaLabelledBy="day-nutrition-title" scrollable>
      <ModalHeader onClose={onClose} titleId="day-nutrition-title">
        <span className="text-secondary small d-block fw-normal">{dayLabel}</span>
        Daily nutrition
      </ModalHeader>
      <ModalBody>
        <div className="bg-body shadow-lg">
          <NutritionLabel
            nutritionInfo={nutritionInfo}
            servingSize={ServingSize.servings(1)}
            prep={prep}
          />
        </div>
      </ModalBody>
    </ModalBase>
  );
}
