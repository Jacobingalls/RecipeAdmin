import convert from 'convert';
import type { Unit } from 'convert';
import { useTranslation } from 'react-i18next';

import type {
  NutritionInformation,
  NutritionUnit,
  Preparation,
  ProductGroup,
  ServingSize,
} from '../domain';
import { DAILY_VALUES } from '../config/constants';
import { formatSignificant, formatServingSize } from '../utils';

import NutritionEnergy from './NutritionEnergy';
import NutritionRow from './NutritionRow';
import type { NutrientData, NutrientKey } from './NutritionRow';

interface NutritionLabelProps {
  nutritionInfo: NutritionInformation | null;
  servingSize: ServingSize;
  prep: Preparation | ProductGroup;
}

export default function NutritionLabel({ nutritionInfo, servingSize, prep }: NutritionLabelProps) {
  const { t } = useTranslation();

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
        .nutrition-row > th,
        .nutrition-row > td { position: relative; z-index: 1; }
        .nutrition-row > th::after {
          content: ''; position: absolute;
          top: -1px; bottom: -1px; left: -8px; right: -208px;
          border-radius: 6px; background-color: transparent;
          pointer-events: none; transition: background-color 0.1s ease; z-index: -1;
        }
        .nutrition-row:hover > th::after { background-color: var(--app-row-hover-bg); }
        .nutrition-row:hover td,
        .nutrition-row:hover th,
        .nutrition-row:has(+ .nutrition-row:hover) td,
        .nutrition-row:has(+ .nutrition-row:hover) th { border-bottom-color: transparent !important; }
        .nutrition-label table { border-collapse: collapse; width: 100%; }
        .nutrition-label th, .nutrition-label td { padding: 0.25rem 0; }
      `}</style>
      <div className="fw-bold fs-3 border-bottom" style={{ letterSpacing: '-1px' }}>
        {t('nutritionLabel.title')}
      </div>
      <div className="border-bottom py-1" style={{ borderBottomWidth: '8px !important' }}>
        <div className="d-flex justify-content-between align-items-center">
          <span>
            <span className="small">{t('nutritionLabel.servingSize')}</span>{' '}
            <span className="fw-bold">{servingPrimary || '—'}</span>
          </span>
          {servingResolved && <span className="small">{servingResolved}</span>}
        </div>
        {'servingSizeDescription' in prep && prep.servingSizeDescription && (
          <div className="small text-secondary">{prep.servingSizeDescription}</div>
        )}
      </div>
      <NutritionEnergy calories={calories} caloriesFromFat={caloriesFromFat} />
      <table>
        <thead>
          <tr className="small fw-bold">
            <th className="border-bottom fw-bold" />
            <th className="border-bottom fw-bold text-end" style={{ width: 100 }}>
              {t('nutritionLabel.amount')}
            </th>
            <th className="border-bottom fw-bold text-end" style={{ width: 100 }}>
              {t('nutritionLabel.percentDV')}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Fats */}
          <NutritionRow
            label={t('nutritionLabel.totalFat')}
            nutrient={getNutrient('totalFat')}
            bold
          />
          <NutritionRow
            label={t('nutritionLabel.saturatedFat')}
            nutrient={getNutrient('saturatedFat')}
            indent
          />
          <NutritionRow
            label={t('nutritionLabel.transFat')}
            nutrient={getNutrient('transFat')}
            indent
          />
          <NutritionRow
            label={t('nutritionLabel.polyunsaturatedFat')}
            nutrient={getNutrient('polyunsaturatedFat')}
            indent
          />
          <NutritionRow
            label={t('nutritionLabel.monounsaturatedFat')}
            nutrient={getNutrient('monounsaturatedFat')}
            indent
          />
          {/* Cholesterol & Sodium */}
          <NutritionRow
            label={t('nutritionLabel.cholesterol')}
            nutrient={getNutrient('cholesterol')}
            bold
          />
          <NutritionRow label={t('nutritionLabel.sodium')} nutrient={getNutrient('sodium')} bold />
          {/* Carbohydrates */}
          <NutritionRow
            label={t('nutritionLabel.totalCarbohydrate')}
            nutrient={getNutrient('totalCarbohydrate')}
            bold
          />
          <NutritionRow
            label={t('nutritionLabel.dietaryFiber')}
            nutrient={getNutrient('dietaryFiber')}
            indent
          />
          <NutritionRow
            label={t('nutritionLabel.solubleFiber')}
            nutrient={getNutrient('solubleFiber')}
            doubleIndent
          />
          <NutritionRow
            label={t('nutritionLabel.insolubleFiber')}
            nutrient={getNutrient('insolubleFiber')}
            doubleIndent
          />
          <NutritionRow
            label={t('nutritionLabel.totalSugars')}
            nutrient={getNutrient('totalSugars')}
            indent
          />
          <NutritionRow
            label={t('nutritionLabel.addedSugars')}
            nutrient={getNutrient('addedSugars')}
            doubleIndent
          />
          <NutritionRow
            label={t('nutritionLabel.sugarAlcohol')}
            nutrient={getNutrient('sugarAlcohol')}
            indent
          />
          {/* Protein */}
          <NutritionRow
            label={t('nutritionLabel.protein')}
            nutrient={getNutrient('protein')}
            bold
            hideBottomBorder
          />
          {/* Vitamins & Minerals separator */}
          <tr>
            <td
              colSpan={3}
              style={{ borderBottom: '8px solid var(--bs-border-color)', padding: 0 }}
            />
          </tr>
          {/* Vitamins */}
          <NutritionRow label={t('nutritionLabel.vitaminA')} nutrient={getNutrient('vitaminA')} />
          <NutritionRow label={t('nutritionLabel.vitaminC')} nutrient={getNutrient('vitaminC')} />
          <NutritionRow label={t('nutritionLabel.vitaminD')} nutrient={getNutrient('vitaminD')} />
          <NutritionRow label={t('nutritionLabel.vitaminE')} nutrient={getNutrient('vitaminE')} />
          <NutritionRow label={t('nutritionLabel.vitaminK')} nutrient={getNutrient('vitaminK')} />
          <NutritionRow label={t('nutritionLabel.thiamin')} nutrient={getNutrient('thiamin')} />
          <NutritionRow
            label={t('nutritionLabel.riboflavin')}
            nutrient={getNutrient('riboflavin')}
          />
          <NutritionRow label={t('nutritionLabel.niacin')} nutrient={getNutrient('niacin')} />
          <NutritionRow label={t('nutritionLabel.vitaminB6')} nutrient={getNutrient('vitaminB6')} />
          <NutritionRow label={t('nutritionLabel.folate')} nutrient={getNutrient('folate')} />
          <NutritionRow
            label={t('nutritionLabel.vitaminB12')}
            nutrient={getNutrient('vitaminB12')}
          />
          <NutritionRow label={t('nutritionLabel.biotin')} nutrient={getNutrient('biotin')} />
          <NutritionRow
            label={t('nutritionLabel.pantothenicAcid')}
            nutrient={getNutrient('pantothenicAcid')}
          />
          <NutritionRow label={t('nutritionLabel.choline')} nutrient={getNutrient('choline')} />
          {/* Minerals */}
          <NutritionRow label={t('nutritionLabel.calcium')} nutrient={getNutrient('calcium')} />
          <NutritionRow label={t('nutritionLabel.iron')} nutrient={getNutrient('iron')} />
          <NutritionRow
            label={t('nutritionLabel.phosphorus')}
            nutrient={getNutrient('phosphorus')}
          />
          <NutritionRow label={t('nutritionLabel.iodine')} nutrient={getNutrient('iodine')} />
          <NutritionRow label={t('nutritionLabel.magnesium')} nutrient={getNutrient('magnesium')} />
          <NutritionRow label={t('nutritionLabel.zinc')} nutrient={getNutrient('zinc')} />
          <NutritionRow label={t('nutritionLabel.selenium')} nutrient={getNutrient('selenium')} />
          <NutritionRow label={t('nutritionLabel.copper')} nutrient={getNutrient('copper')} />
          <NutritionRow label={t('nutritionLabel.manganese')} nutrient={getNutrient('manganese')} />
          <NutritionRow label={t('nutritionLabel.chromium')} nutrient={getNutrient('chromium')} />
          <NutritionRow
            label={t('nutritionLabel.molybdenum')}
            nutrient={getNutrient('molybdenum')}
          />
          <NutritionRow label={t('nutritionLabel.chloride')} nutrient={getNutrient('chloride')} />
          <NutritionRow label={t('nutritionLabel.potassium')} nutrient={getNutrient('potassium')} />
        </tbody>
      </table>
      <div className="small pt-2" style={{ fontSize: '0.7rem' }}>
        {t('nutritionLabel.footnote')}
      </div>
    </div>
  );
}
