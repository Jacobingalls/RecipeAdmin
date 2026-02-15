import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useHistoryData } from '../../hooks';
import { NutritionInformation } from '../../domain';
import { DAILY_VALUES } from '../../config/constants';
import { resolveEntryName, resolveEntryBrand } from '../../utils/logEntryHelpers';
import { LoadingState, ContentUnavailableView } from '../common';
import LogModal from '../LogModal';
import HistoryEntryRow from '../HistoryEntryRow';

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
  const {
    logs,
    productDetails,
    groupDetails,
    loading,
    error,
    entryNutritionById,
    logTarget,
    logAgainLoading,
    editLoading,
    deleteLoading,
    handleLogAgainClick,
    handleEditClick,
    handleDeleteClick,
    handleSaved,
    handleModalClose,
  } = useHistoryData({ limitDays: 1 });

  // Filter logs to only include entries from today in the user's local timezone.
  // The backend returns the most recent day with data, which may be yesterday
  // if nothing has been logged today yet.
  const todayLogs = useMemo(() => {
    if (!logs) return null;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    const tomorrowStart =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() / 1000;
    return logs.filter((entry) => entry.timestamp >= todayStart && entry.timestamp < tomorrowStart);
  }, [logs]);

  const totalNutrition = useMemo(() => {
    if (!todayLogs) return NutritionInformation.zero();
    let total = NutritionInformation.zero();
    for (const entry of todayLogs) {
      const nutrition = entryNutritionById.get(entry.id);
      if (nutrition) total = total.add(nutrition);
    }
    return total;
  }, [todayLogs, entryNutritionById]);

  const sparklineData = useMemo(() => {
    if (!todayLogs || todayLogs.length === 0) return null;

    const sorted = [...todayLogs].sort((a, b) => a.timestamp - b.timestamp);
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
  }, [todayLogs, entryNutritionById]);

  const currentHour = useMemo(() => {
    const n = new Date();
    return n.getHours() + n.getMinutes() / 60;
  }, []);

  const centeredWrapper = (child: ReactNode) => (
    <div className="card-body d-flex align-items-center justify-content-center">{child}</div>
  );

  const historyLink = (
    <Link to="/history" className="text-decoration-none small">
      History &rarr;
    </Link>
  );

  if (loading) {
    return (
      <Tile title="Today" titleRight={historyLink} minHeight="12rem">
        {centeredWrapper(<LoadingState />)}
      </Tile>
    );
  }

  if (error) {
    return (
      <Tile title="Today" titleRight={historyLink} minHeight="12rem">
        {centeredWrapper(
          <ContentUnavailableView
            icon="bi-journal-x"
            title="Couldn't load today's nutrition"
            description={error}
          />,
        )}
      </Tile>
    );
  }

  if (!todayLogs || todayLogs.length === 0) {
    return (
      <Tile title="Today" titleRight={historyLink} minHeight="12rem">
        {centeredWrapper(
          <ContentUnavailableView
            icon="bi-journal-x"
            title="Nothing logged today"
            description="Log something to see your daily nutrition here."
          />,
        )}
      </Tile>
    );
  }

  return (
    <Tile title="Today" titleRight={historyLink}>
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
      <div className="list-group list-group-flush bg-body-secondary">
        {todayLogs.map((entry) => (
          <HistoryEntryRow
            key={entry.id}
            entry={entry}
            name={resolveEntryName(entry, productDetails, groupDetails)}
            brand={resolveEntryBrand(entry, productDetails, groupDetails)}
            calories={entryNutritionById.get(entry.id)?.calories?.amount ?? null}
            timeDisplay="time"
            onLogAgain={handleLogAgainClick}
            logAgainLoading={logAgainLoading}
            onEdit={handleEditClick}
            editLoading={editLoading}
            onDelete={handleDeleteClick}
            deleteLoading={deleteLoading}
          />
        ))}
      </div>
      <LogModal target={logTarget} onClose={handleModalClose} onSaved={handleSaved} />
    </Tile>
  );
}
