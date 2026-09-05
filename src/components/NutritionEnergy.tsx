import { useTranslation } from 'react-i18next';

import { useEnergyDisplay } from '../hooks';
import { formatEnergy, formatSignificant } from '../utils';

interface NutritionEnergyProps {
  /** Energy in one serving, in kilocalories. */
  calories: number | null;
  /** Energy from fat in one serving, in kilocalories. */
  caloriesFromFat: number | null;
}

/**
 * The headline energy block at the top of a nutrition label.
 *
 * US labels show a bare calorie count. European ones lead with kilojoules and give the
 * calorie equivalent underneath, the way packaging in the EU does.
 */
export default function NutritionEnergy({ calories, caloriesFromFat }: NutritionEnergyProps) {
  const { t } = useTranslation();
  const display = useEnergyDisplay();
  const showsKilojoules = display === 'kilojoules';

  let headline = '—';
  if (calories !== null) {
    headline = showsKilojoules ? formatEnergy(calories, display) : formatSignificant(calories);
  }

  let fromFat: string | null = null;
  if (caloriesFromFat !== null) {
    fromFat = showsKilojoules
      ? t('nutritionLabel.energyFromFat', { amount: formatEnergy(caloriesFromFat, display) })
      : t('nutritionLabel.caloriesFromFat', { amount: formatSignificant(caloriesFromFat) });
  }

  return (
    <div className="border-bottom border-4 py-1">
      <div className="d-flex justify-content-between align-items-end">
        <span className="fw-bold fs-5">
          {showsKilojoules ? t('nutritionLabel.energy') : t('nutritionLabel.calories')}
        </span>
        <span className="fw-bold" style={{ fontSize: '2rem' }} data-testid="nutrition-energy">
          {headline}
        </span>
      </div>
      {showsKilojoules && calories !== null && (
        <div className="small text-end" data-testid="nutrition-energy-alternate">
          {formatEnergy(calories, 'calories')}
        </div>
      )}
      {fromFat && <div className="small text-end">{fromFat}</div>}
    </div>
  );
}
