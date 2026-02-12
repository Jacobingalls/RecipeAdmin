import { useState, useMemo, useCallback } from 'react';

import type { ApiLogEntry } from '../api';
import { NutritionInformation } from '../domain';
import { ErrorState, ContentUnavailableView } from '../components/common';
import { useHistoryData } from '../hooks';
import LogModal from '../components/LogModal';
import DayNutritionModal from '../components/DayNutritionModal';
import HistoryEntryRow from '../components/HistoryEntryRow';
import { formatSignificant } from '../utils/formatters';
import { resolveEntryName } from '../utils/logEntryHelpers';

function formatDayHeading(dateStr: string): string {
  const today = new Date();
  const todayDate = today.toLocaleDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toLocaleDateString();

  if (dateStr === todayDate) return 'Today';
  if (dateStr === yesterdayDate) return 'Yesterday';
  return dateStr;
}

function groupByDay(entries: ApiLogEntry[]): Map<string, ApiLogEntry[]> {
  const groups = new Map<string, ApiLogEntry[]>();
  for (const entry of entries) {
    const dayKey = new Date(entry.timestamp * 1000).toLocaleDateString();
    const existing = groups.get(dayKey);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(dayKey, [entry]);
    }
  }
  return groups;
}

function formatDayLabelForModal(day: string): string {
  const dayHeading = formatDayHeading(day);
  if (dayHeading === day) return day;
  return `${dayHeading} (${day})`;
}

export default function HistoryPage() {
  const {
    logs,
    products,
    groups,
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
  } = useHistoryData();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const dayGroups = useMemo(() => {
    if (!logs) return new Map<string, ApiLogEntry[]>();
    return groupByDay(logs);
  }, [logs]);

  const dayNutritionByDay = useMemo(() => {
    const totalsByDay = new Map<string, NutritionInformation>();
    for (const [day, entries] of dayGroups.entries()) {
      let dayNutrition = NutritionInformation.zero();
      for (const entry of entries) {
        const nutrition = entryNutritionById.get(entry.id);
        if (nutrition) {
          dayNutrition = dayNutrition.add(nutrition);
        }
      }
      totalsByDay.set(day, dayNutrition);
    }
    return totalsByDay;
  }, [dayGroups, entryNutritionById]);

  const selectedDayNutrition = selectedDay ? (dayNutritionByDay.get(selectedDay) ?? null) : null;

  const handleDayModalClose = useCallback(() => {
    setSelectedDay(null);
  }, []);

  return (
    <>
      <h1 className="h2 mb-4">History</h1>
      {loading && (
        <div data-testid="history-placeholder">
          <div className="mb-4">
            <h5 className="text-body-secondary mb-3 placeholder-glow">
              <span className="placeholder col-2" />
            </h5>
            <div className="list-group placeholder-glow">
              {[1, 2, 3].map((i) => (
                <div key={i} className="list-group-item">
                  <div>
                    <div className="mb-1">
                      <span className="placeholder col-4" />
                    </div>
                    <small>
                      <span className="placeholder col-3" />
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && dayGroups.size === 0 && (
        <ContentUnavailableView icon="bi-clock-history" title="No History" />
      )}
      {!loading &&
        !error &&
        dayGroups.size > 0 &&
        Array.from(dayGroups.entries()).map(([day, entries]) => (
          <div key={day} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-body-secondary mb-0">{formatDayHeading(day)}</h5>

              <div className="d-flex align-items-center">
                <span className="text-body-secondary small fw-medium mb-0">
                  {formatSignificant(dayNutritionByDay.get(day)?.calories?.amount ?? 0)} kcal total,
                  &nbsp;
                </span>

                <button
                  type="button"
                  className="btn btn-link text-decoration-none small p-0"
                  onClick={() => setSelectedDay(day)}
                >
                  View full nutrition &rarr;
                </button>
              </div>
            </div>
            <div className="list-group">
              {entries.map((entry) => (
                <HistoryEntryRow
                  key={entry.id}
                  entry={entry}
                  name={resolveEntryName(entry, products!, groups!)}
                  calories={entryNutritionById.get(entry.id)?.calories?.amount ?? null}
                  onLogAgain={handleLogAgainClick}
                  logAgainLoading={logAgainLoading}
                  onEdit={handleEditClick}
                  editLoading={editLoading}
                  onDelete={handleDeleteClick}
                  deleteLoading={deleteLoading}
                />
              ))}
            </div>
          </div>
        ))}

      <LogModal target={logTarget} onClose={handleModalClose} onSaved={handleSaved} />
      {selectedDay && selectedDayNutrition && (
        <DayNutritionModal
          dayLabel={formatDayLabelForModal(selectedDay)}
          nutritionInfo={selectedDayNutrition}
          onClose={handleDayModalClose}
        />
      )}
    </>
  );
}
