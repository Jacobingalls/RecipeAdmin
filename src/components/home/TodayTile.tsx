import { useMemo } from 'react';
import type { ReactNode } from 'react';
import convert from 'convert';
import type { Unit } from 'convert';

import { useHistoryData } from '../../hooks';
import { NutritionInformation } from '../../domain';
import { DAILY_VALUES } from '../../config/constants';
import { formatSignificant } from '../../utils/formatters';
import { LoadingState, ContentUnavailableView } from '../common';

import Tile from './Tile';

const MACROS = [
  { key: 'protein', label: 'Protein' },
  { key: 'totalFat', label: 'Fat' },
  { key: 'totalCarbohydrate', label: 'Carbs' },
  { key: 'dietaryFiber', label: 'Fiber' },
  { key: 'sodium', label: 'Sodium' },
] as const;

export default function TodayTile() {
  const { logs, loading, error, entryNutritionById } = useHistoryData({ limitDays: 1 });

  const totalNutrition = useMemo(() => {
    let total = NutritionInformation.zero();
    for (const nutrition of entryNutritionById.values()) {
      total = total.add(nutrition);
    }
    return total;
  }, [entryNutritionById]);

  const centeredWrapper = (child: ReactNode) => (
    <div className="card-body d-flex align-items-center justify-content-center">{child}</div>
  );

  if (loading) {
    return (
      <Tile title="Today" minHeight="12rem">
        {centeredWrapper(<LoadingState />)}
      </Tile>
    );
  }

  if (error) {
    return (
      <Tile title="Today" minHeight="12rem">
        {centeredWrapper(
          <ContentUnavailableView
            icon="bi-calendar-day"
            title="Couldn't load today's nutrition"
            description={error}
          />,
        )}
      </Tile>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Tile title="Today" minHeight="12rem">
        {centeredWrapper(
          <ContentUnavailableView
            icon="bi-calendar-day"
            title="Nothing logged today"
            description="Log something to see your daily nutrition here."
          />,
        )}
      </Tile>
    );
  }

  const calories = totalNutrition.calories?.amount ?? 0;

  return (
    <Tile title="Today">
      <div className="card-body">
        <div className="text-center mb-3">
          <div className="display-4 fw-bold" data-testid="calories-value">
            {formatSignificant(calories)}
          </div>
          <div className="text-secondary small">of 2,000 kcal</div>
        </div>
        {MACROS.map(({ key, label }) => {
          const nutrient = totalNutrition[key];
          const dv = DAILY_VALUES[key];
          let amount = '0';
          let percent = 0;

          if (nutrient && dv) {
            const dvInNutrientUnit = convert(dv.amount, dv.unit as Unit).to(nutrient.unit as Unit);
            percent = Math.round((nutrient.amount / dvInNutrientUnit) * 100);
            amount = `${formatSignificant(nutrient.amount)}${nutrient.unit}`;
          }

          return (
            <div
              key={key}
              className="d-flex align-items-center gap-2 mb-2"
              data-testid={`macro-${key}`}
            >
              <span className="text-nowrap small" style={{ width: '3.5rem' }}>
                {label}
              </span>
              <span
                className="text-nowrap text-end text-secondary small"
                style={{ width: '4.5rem' }}
              >
                {amount}
              </span>
              <div
                className="progress flex-grow-1"
                style={{ height: '0.5rem' }}
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label} ${percent}% of daily value`}
              >
                <div className="progress-bar" style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
              <span className="text-nowrap text-end small fw-medium" style={{ width: '3rem' }}>
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </Tile>
  );
}
