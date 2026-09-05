import { useTranslation } from 'react-i18next';

import { formatSignificant } from '../utils';

interface NutritionEnergyProps {
  /** Energy in one serving, in kilocalories. */
  calories: number | null;
  /** Energy from fat in one serving, in kilocalories. */
  caloriesFromFat: number | null;
}

/**
 * The headline calorie block of the FDA facts panel.
 *
 * European labels declare energy differently enough — both units, per 100 g, in the table
 * itself — that `EuropeanNutritionLabel` writes its own rather than reusing this.
 */
export default function NutritionEnergy({ calories, caloriesFromFat }: NutritionEnergyProps) {
  const { t } = useTranslation();

  return (
    <div className="border-bottom border-4 py-1">
      <div className="d-flex justify-content-between align-items-end">
        <span className="fw-bold fs-5">{t('nutritionLabel.calories')}</span>
        <span className="fw-bold" style={{ fontSize: '2rem' }} data-testid="nutrition-energy">
          {calories !== null ? formatSignificant(calories) : '—'}
        </span>
      </div>
      {caloriesFromFat !== null && (
        <div className="small text-end">
          {t('nutritionLabel.caloriesFromFat', { amount: formatSignificant(caloriesFromFat) })}
        </div>
      )}
    </div>
  );
}
