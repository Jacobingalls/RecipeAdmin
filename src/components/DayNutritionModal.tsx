import { useEffect, useMemo, useRef } from 'react';

import {
  type NutritionInformationData,
  type NutritionInformation,
  Preparation,
  ServingSize,
} from '../domain';

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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return undefined;
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target === el) onClose();
    };
    el.addEventListener('mousedown', handleMouseDown);
    return () => el.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

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
    <>
      <div className="modal-backdrop fade show" />
      <div
        ref={modalRef}
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-label="Day nutrition modal"
      >
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <div className="text-secondary small">{dayLabel}</div>
                <h5 className="modal-title mb-0">Daily Nutrition</h5>
              </div>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="bg-body shadow-lg">
                <NutritionLabel
                  nutritionInfo={nutritionInfo}
                  servingSize={ServingSize.servings(1)}
                  prep={prep}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
