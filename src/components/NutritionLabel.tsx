import convert from 'convert';
import type { Unit } from 'convert';

import type {
  NutritionInformation,
  NutritionUnit,
  Preparation,
  ProductGroup,
  ServingSize,
} from '../domain';
import { DAILY_VALUES } from '../config/constants';
import { formatSignificant, formatServingSize } from '../utils';

import NutritionRow from './NutritionRow';
import type { NutrientData, NutrientKey } from './NutritionRow';

interface NutritionLabelProps {
  nutritionInfo: NutritionInformation | null;
  servingSize: ServingSize;
  prep: Preparation | ProductGroup;
}

export default function NutritionLabel({ nutritionInfo, servingSize, prep }: NutritionLabelProps) {
  if (!nutritionInfo) return null;

  const { primary: servingPrimary, resolved: servingResolved } = formatServingSize(
    servingSize,
    prep,
  );

  const getNutrient = (nutrientKey: NutrientKey): NutrientData => {
    const nutrient = nutritionInfo[nutrientKey] as NutritionUnit | null;
    let formatted: string | null = null;
    if (nutrient != null) {
      formatted = `${formatSignificant(nutrient.amount)}${nutrient.unit}`;
    }

    const dv = DAILY_VALUES[nutrientKey];
    let percentDV: number | null = null;
    let dvFormatted: string | null = null;
    if (nutrient != null && dv != null) {
      const dvInNutrientUnit = convert(dv.amount, dv.unit as Unit).to(nutrient.unit as Unit);
      percentDV = Math.round((nutrient.amount / dvInNutrientUnit) * 100);
      dvFormatted = `${dv.amount}${dv.unit}`;
    }

    return { formatted, percentDV, dvFormatted };
  };

  const calories = nutritionInfo.calories?.amount ?? null;
  const caloriesFromFat = nutritionInfo.caloriesFromFat?.amount ?? null;

  return (
    <div
      className="nutrition-label border p-3"
      style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
    >
      <style>{`
        .nutrition-row { position: relative; isolation: isolate; }
        .nutrition-row::after {
          content: ''; position: absolute;
          top: -1px; bottom: -1px; left: -8px; right: -8px;
          border-radius: 6px; background-color: transparent;
          pointer-events: none; transition: background-color 0.1s ease; z-index: -1;
        }
        .nutrition-row:hover::after { background-color: var(--bs-border-color); }
        .nutrition-row:hover td,
        .nutrition-row:hover th,
        .nutrition-row:has(+ .nutrition-row:hover) td,
        .nutrition-row:has(+ .nutrition-row:hover) th { border-bottom-color: transparent !important; }
        .nutrition-label table { border-collapse: collapse; width: 100%; }
        .nutrition-label th, .nutrition-label td { padding: 0.25rem 0; }
      `}</style>
      <div className="fw-bold fs-3 border-bottom" style={{ letterSpacing: '-1px' }}>
        Nutrition Facts
      </div>
      <div className="border-bottom py-1" style={{ borderBottomWidth: '8px !important' }}>
        <div className="d-flex justify-content-between align-items-center">
          <span>
            <span className="small">Serving size</span>{' '}
            <span className="fw-bold">{servingPrimary || '—'}</span>
          </span>
          {servingResolved && <span className="small">{servingResolved}</span>}
        </div>
        {'servingSizeDescription' in prep && prep.servingSizeDescription && (
          <div className="small text-secondary">{prep.servingSizeDescription}</div>
        )}
      </div>
      <div className="border-bottom border-4 py-1">
        <div className="d-flex justify-content-between align-items-end">
          <span className="fw-bold fs-5">Calories</span>
          <span className="fw-bold" style={{ fontSize: '2rem' }}>
            {calories !== null ? formatSignificant(calories) : '—'}
          </span>
        </div>
        {caloriesFromFat !== null && (
          <div className="small text-end">
            Calories from Fat {formatSignificant(caloriesFromFat)}
          </div>
        )}
      </div>
      <table>
        <thead>
          <tr className="small fw-bold">
            <th className="border-bottom fw-bold" />
            <th className="border-bottom fw-bold text-end" style={{ width: 100 }}>
              Amount
            </th>
            <th className="border-bottom fw-bold text-end" style={{ width: 100 }}>
              % DV*
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Fats */}
          <NutritionRow label="Total Fat" nutrient={getNutrient('totalFat')} bold />
          <NutritionRow label="Saturated Fat" nutrient={getNutrient('saturatedFat')} indent />
          <NutritionRow label="Trans Fat" nutrient={getNutrient('transFat')} indent />
          <NutritionRow
            label="Polyunsaturated Fat"
            nutrient={getNutrient('polyunsaturatedFat')}
            indent
          />
          <NutritionRow
            label="Monounsaturated Fat"
            nutrient={getNutrient('monounsaturatedFat')}
            indent
          />
          {/* Cholesterol & Sodium */}
          <NutritionRow label="Cholesterol" nutrient={getNutrient('cholesterol')} bold />
          <NutritionRow label="Sodium" nutrient={getNutrient('sodium')} bold />
          {/* Carbohydrates */}
          <NutritionRow
            label="Total Carbohydrate"
            nutrient={getNutrient('totalCarbohydrate')}
            bold
          />
          <NutritionRow label="Dietary Fiber" nutrient={getNutrient('dietaryFiber')} indent />
          <NutritionRow label="Soluble Fiber" nutrient={getNutrient('solubleFiber')} doubleIndent />
          <NutritionRow
            label="Insoluble Fiber"
            nutrient={getNutrient('insolubleFiber')}
            doubleIndent
          />
          <NutritionRow label="Total Sugars" nutrient={getNutrient('totalSugars')} indent />
          <NutritionRow
            label="Includes Added Sugars"
            nutrient={getNutrient('addedSugars')}
            doubleIndent
          />
          <NutritionRow label="Sugar Alcohol" nutrient={getNutrient('sugarAlcohol')} indent />
          {/* Protein */}
          <NutritionRow label="Protein" nutrient={getNutrient('protein')} bold hideBottomBorder />
          {/* Vitamins & Minerals separator */}
          <tr>
            <td colSpan={3} style={{ borderBottom: '8px solid var(--bs-border-color)', padding: 0 }} />
          </tr>
          {/* Vitamins */}
          <NutritionRow label="Vitamin A" nutrient={getNutrient('vitaminA')} />
          <NutritionRow label="Vitamin C" nutrient={getNutrient('vitaminC')} />
          <NutritionRow label="Vitamin D" nutrient={getNutrient('vitaminD')} />
          <NutritionRow label="Vitamin E" nutrient={getNutrient('vitaminE')} />
          <NutritionRow label="Vitamin K" nutrient={getNutrient('vitaminK')} />
          <NutritionRow label="Thiamin (B1)" nutrient={getNutrient('thiamin')} />
          <NutritionRow label="Riboflavin (B2)" nutrient={getNutrient('riboflavin')} />
          <NutritionRow label="Niacin (B3)" nutrient={getNutrient('niacin')} />
          <NutritionRow label="Vitamin B6" nutrient={getNutrient('vitaminB6')} />
          <NutritionRow label="Folate" nutrient={getNutrient('folate')} />
          <NutritionRow label="Vitamin B12" nutrient={getNutrient('vitaminB12')} />
          <NutritionRow label="Biotin" nutrient={getNutrient('biotin')} />
          <NutritionRow label="Pantothenic Acid" nutrient={getNutrient('pantothenicAcid')} />
          <NutritionRow label="Choline" nutrient={getNutrient('choline')} />
          {/* Minerals */}
          <NutritionRow label="Calcium" nutrient={getNutrient('calcium')} />
          <NutritionRow label="Iron" nutrient={getNutrient('iron')} />
          <NutritionRow label="Phosphorus" nutrient={getNutrient('phosphorus')} />
          <NutritionRow label="Iodine" nutrient={getNutrient('iodine')} />
          <NutritionRow label="Magnesium" nutrient={getNutrient('magnesium')} />
          <NutritionRow label="Zinc" nutrient={getNutrient('zinc')} />
          <NutritionRow label="Selenium" nutrient={getNutrient('selenium')} />
          <NutritionRow label="Copper" nutrient={getNutrient('copper')} />
          <NutritionRow label="Manganese" nutrient={getNutrient('manganese')} />
          <NutritionRow label="Chromium" nutrient={getNutrient('chromium')} />
          <NutritionRow label="Molybdenum" nutrient={getNutrient('molybdenum')} />
          <NutritionRow label="Chloride" nutrient={getNutrient('chloride')} />
          <NutritionRow label="Potassium" nutrient={getNutrient('potassium')} />
        </tbody>
      </table>
      <div className="small pt-2" style={{ fontSize: '0.7rem' }}>
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a
        daily diet.
      </div>
    </div>
  );
}
