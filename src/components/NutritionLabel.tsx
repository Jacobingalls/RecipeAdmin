import convert from 'convert';
import type { Unit } from 'convert';

import type {
  NutritionInformation,
  NutritionInformationData,
  NutritionUnit,
  Preparation,
  ProductGroup,
  ServingSize,
} from '../domain';
import { DAILY_VALUES } from '../config/constants';
import { formatSignificant, formatServingSize } from '../utils/formatters';

type NutrientKey = keyof NutritionInformationData;

interface NutrientData {
  formatted: string | null;
  percentDV: number | null;
  dvFormatted: string | null;
}

interface NutritionLabelProps {
  nutritionInfo: NutritionInformation | null;
  servingSize: ServingSize;
  prep: Preparation | ProductGroup;
}

interface NutritionRowProps {
  label: string;
  nutrient: NutrientData;
  bold?: boolean;
  indent?: boolean;
  doubleIndent?: boolean;
  thick?: boolean;
}

export default function NutritionLabel({ nutritionInfo, servingSize, prep }: NutritionLabelProps) {
  if (!nutritionInfo) return null;

  const { primary: servingPrimary, resolved: servingResolved } = formatServingSize(
    servingSize,
    prep,
  );

  // Helper to get nutrient data with formatted amount and %DV
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

    return {
      formatted,
      percentDV,
      dvFormatted,
    };
  };

  // Get calories
  const calories = nutritionInfo.calories?.amount ?? null;
  const caloriesFromFat = nutritionInfo.caloriesFromFat?.amount ?? null;

  return (
    <div
      className="nutrition-label border border-dark p-3"
      style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
    >
      <style>{`
                .nutrition-row {
                    position: relative;
                    transition: border-bottom-color 0.1s ease;
                    isolation: isolate;
                }
                .nutrition-row::after {
                    content: '';
                    position: absolute;
                    top: -1px;
                    bottom: -1px;
                    left: -8px;
                    right: -8px;
                    border-radius: 6px;
                    background-color: transparent;
                    pointer-events: none;
                    transition: background-color 0.1s ease;
                    z-index: -1;
                }
                .nutrition-row:hover::after {
                    background-color: var(--bs-border-color);
                }
                .nutrition-row:hover,
                .nutrition-row:has(+ .nutrition-row:hover) {
                    border-bottom-color: transparent !important;
                }
            `}</style>
      <div className="fw-bold fs-3 border-bottom border-dark" style={{ letterSpacing: '-1px' }}>
        Nutrition Facts
      </div>
      <div
        className="border-bottom border-dark py-1"
        style={{ borderBottomWidth: '8px !important' }}
      >
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
      <div className="border-bottom border-dark border-4 py-1">
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
      <div className="d-flex py-1 border-bottom small fw-bold">
        <span style={{ flex: 1 }} />
        <span style={{ width: 100, textAlign: 'right' }}>Amount</span>
        <span style={{ width: 100, textAlign: 'right' }}>% DV*</span>
      </div>

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
      <NutritionRow label="Total Carbohydrate" nutrient={getNutrient('totalCarbohydrate')} bold />
      <NutritionRow label="Dietary Fiber" nutrient={getNutrient('dietaryFiber')} indent />
      <NutritionRow label="Soluble Fiber" nutrient={getNutrient('solubleFiber')} doubleIndent />
      <NutritionRow label="Insoluble Fiber" nutrient={getNutrient('insolubleFiber')} doubleIndent />
      <NutritionRow label="Total Sugars" nutrient={getNutrient('totalSugars')} indent />
      <NutritionRow
        label="Includes Added Sugars"
        nutrient={getNutrient('addedSugars')}
        doubleIndent
      />
      <NutritionRow label="Sugar Alcohol" nutrient={getNutrient('sugarAlcohol')} indent />

      {/* Protein */}
      <NutritionRow label="Protein" nutrient={getNutrient('protein')} bold thick />

      {/* Vitamins & Minerals */}
      <div className="border-bottom border-dark border-4" />
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

      <div className="small pt-2" style={{ fontSize: '0.7rem' }}>
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a
        daily diet.
      </div>
    </div>
  );
}

function getIndentPadding(doubleIndent?: boolean, indent?: boolean): number {
  if (doubleIndent) return 24;
  if (indent) return 12;
  return 0;
}

function NutritionRow({ label, nutrient, bold, indent, doubleIndent, thick }: NutritionRowProps) {
  if (!nutrient || !nutrient.formatted) return null;

  const { formatted, percentDV, dvFormatted } = nutrient;

  return (
    <div
      className={`nutrition-row d-flex py-1 border-bottom ${thick ? 'border-dark border-4' : ''}`}
    >
      <span
        className={bold ? 'fw-bold' : ''}
        style={{ flex: 1, paddingLeft: getIndentPadding(doubleIndent, indent) }}
      >
        {label}
      </span>
      <span style={{ width: 100, textAlign: 'right' }}>{formatted}</span>
      <span
        className="fw-bold"
        style={{ width: 100, textAlign: 'right' }}
        title={percentDV !== null ? `${percentDV}% of ${dvFormatted}` : undefined}
      >
        {percentDV !== null ? `${percentDV}%` : ''}
      </span>
    </div>
  );
}
