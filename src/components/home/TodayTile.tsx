import { useMemo } from 'react';
import type { ReactNode } from 'react';

import { useHistoryData } from '../../hooks';
import { NutritionInformation } from '../../domain';
import { DAILY_VALUES } from '../../config/constants';
import { LoadingState, ContentUnavailableView } from '../common';

import Tile from './Tile';
import SparklineCard from './SparklineCard';
import type { SparklinePoint } from './SparklineCard';

const NUTRIENTS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', goal: 'target', size: 'large' },
  { key: 'protein', label: 'Protein', unit: 'g', goal: 'more', size: 'default' },
  { key: 'totalFat', label: 'Fat', unit: 'g', goal: 'less', size: 'default' },
  { key: 'totalCarbohydrate', label: 'Carbs', unit: 'g', goal: 'less', size: 'default' },
  { key: 'dietaryFiber', label: 'Fiber', unit: 'g', goal: 'more', size: 'default' },
  { key: 'totalSugars', label: 'Sugar', unit: 'g', goal: 'less', size: 'default' },
  { key: 'sodium', label: 'Sodium', unit: 'mg', goal: 'less', size: 'default' },
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

  const sparklineData = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    const sorted = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    const data: Record<string, SparklinePoint[]> = {};

    for (const { key } of NUTRIENTS) {
      const cumulative: SparklinePoint[] = [{ hour: 0, amount: 0 }];
      let runningTotal = 0;

      for (const entry of sorted) {
        const nutrition = entryNutritionById.get(entry.id);
        if (!nutrition) continue;

        const nutrient = nutrition[key as keyof NutritionInformation];
        if (nutrient && typeof nutrient === 'object' && 'amount' in nutrient) {
          runningTotal += nutrient.amount;
          const date = new Date(entry.timestamp * 1000);
          const hour = date.getHours() + date.getMinutes() / 60;
          cumulative.push({ hour, amount: runningTotal });
        }
      }

      data[key] = cumulative;
    }

    return data;
  }, [logs, entryNutritionById]);

  const currentHour = useMemo(() => {
    const n = new Date();
    return n.getHours() + n.getMinutes() / 60;
  }, []);

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

  return (
    <Tile title="Today">
      <div className="card-body">
        <div className="row g-3">
          {NUTRIENTS.map(({ key, label, unit, goal, size }) => {
            const nutrient = totalNutrition[key as keyof NutritionInformation];
            const nutrientUnit =
              nutrient && typeof nutrient === 'object' && 'unit' in nutrient ? nutrient.unit : unit;
            const nutrientAmount =
              nutrient && typeof nutrient === 'object' && 'amount' in nutrient
                ? nutrient.amount
                : 0;

            return (
              <div key={key} className={size === 'large' ? 'col-12' : 'col-6'}>
                <SparklineCard
                  label={label}
                  unit={nutrientUnit}
                  currentAmount={nutrientAmount}
                  dailyValue={DAILY_VALUES[key] ?? null}
                  points={sparklineData?.[key] ?? [{ hour: 0, amount: 0 }]}
                  currentHour={currentHour}
                  goal={goal}
                  size={size}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Tile>
  );
}
