import { useTranslation } from 'react-i18next';

import type { NutritionInformation, Preparation, ProductGroup, ServingSize } from '../domain';
import { formatServingSize, formatSignificant } from '../utils';
import { buildDeclaration, referenceIntakeEnergy } from '../utils/europeanDeclaration';
import type { DeclaredEnergy } from '../utils/europeanDeclaration';

import EuropeanNutritionRow from './EuropeanNutritionRow';

interface EuropeanNutritionLabelProps {
  nutritionInfo: NutritionInformation | null;
  servingSize: ServingSize;
  prep: Preparation | ProductGroup;
}

/** Packaging stacks the two units rather than running them together, and it reads narrower. */
function StackedEnergy({ kilojoules, kilocalories }: DeclaredEnergy) {
  return (
    <>
      <div className="text-nowrap">{`${formatSignificant(kilojoules)} kJ`}</div>
      <div className="text-nowrap">{`${formatSignificant(kilocalories)} kcal`}</div>
    </>
  );
}

function bothUnits({ kilojoules, kilocalories }: DeclaredEnergy): string {
  return `${formatSignificant(kilojoules)} kJ / ${formatSignificant(kilocalories)} kcal`;
}

/**
 * A nutrition declaration in the European format, as Regulation (EU) No 1169/2011 lays it out.
 *
 * It leads with energy in both kilojoules and kilocalories, declares amounts per 100 g or
 * 100 ml with the serving beside them, reports salt rather than sodium, and rates the serving
 * against adult reference intakes. Trans fat and cholesterol are absent because a European
 * label may not declare them.
 */
export default function EuropeanNutritionLabel({
  nutritionInfo,
  servingSize,
  prep,
}: EuropeanNutritionLabelProps) {
  const { t } = useTranslation();

  if (!nutritionInfo) return null;

  const declaration = buildDeclaration(nutritionInfo, prep);
  const { primary: servingPrimary } = formatServingSize(servingSize, prep);
  const { perHundred } = declaration;

  const columnHeadings = [
    ...(perHundred ? [perHundred.unit === 'g' ? t('euLabel.per100g') : t('euLabel.per100ml')] : []),
    t('euLabel.perServing', { amount: servingPrimary ?? '' }),
  ];
  const showReferenceIntake = declaration.rows.some((row) => row.referenceIntake !== null);

  return (
    <section className="nutrition-label border p-3" aria-label={t('euLabel.title')}>
      <h2 className="fw-bold fs-5 mb-3">{t('euLabel.title')}</h2>
      {'servingSizeDescription' in prep && prep.servingSizeDescription && (
        <p className="small text-body-secondary mb-2">{prep.servingSizeDescription}</p>
      )}
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-2">
          <thead>
            <tr className="small">
              <th className="fw-normal text-body-secondary">{t('euLabel.typicalValues')}</th>
              {columnHeadings.map((heading) => (
                <th key={heading} className="text-end">
                  {heading}
                </th>
              ))}
              {showReferenceIntake && <th className="text-end">{t('euLabel.percentRI')}</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="fw-semibold">
                {t('euLabel.energy')}
              </th>
              {declaration.energy.map((energy, index) => (
                <td
                  key={declaration.energy.length === 1 ? 'serving' : `column-${index}`}
                  className="text-end"
                >
                  {energy ? <StackedEnergy {...energy} /> : '—'}
                </td>
              ))}
              {showReferenceIntake && (
                <td className="text-end">{declaration.energyReferenceIntake ?? '—'}</td>
              )}
            </tr>
            {declaration.rows.map((row) => (
              <EuropeanNutritionRow
                key={row.labelKey}
                row={row}
                showReferenceIntake={showReferenceIntake}
              />
            ))}
            {declaration.micronutrients.length > 0 && (
              <tr>
                <th
                  scope="row"
                  colSpan={columnHeadings.length + (showReferenceIntake ? 2 : 1)}
                  className="fw-semibold pt-3"
                >
                  {t('euLabel.vitaminsAndMinerals')}
                </th>
              </tr>
            )}
            {declaration.micronutrients.map((row) => (
              <EuropeanNutritionRow
                key={row.labelKey}
                row={row}
                showReferenceIntake={showReferenceIntake}
              />
            ))}
          </tbody>
        </table>
      </div>
      {showReferenceIntake && (
        <p className="small text-body-secondary mb-1" style={{ fontSize: '0.75rem' }}>
          {t('euLabel.referenceIntakeFootnote', { energy: bothUnits(referenceIntakeEnergy()) })}
        </p>
      )}
      {declaration.micronutrients.length > 0 && (
        <p className="small text-body-secondary mb-1" style={{ fontSize: '0.75rem' }}>
          {t('euLabel.nrvFootnote')}
        </p>
      )}
      <p className="small text-body-secondary mb-0" style={{ fontSize: '0.75rem' }}>
        {t('euLabel.saltFootnote')}
      </p>
    </section>
  );
}
