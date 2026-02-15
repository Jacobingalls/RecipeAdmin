import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import type { ApiLogEntry } from '../api';
import { NutritionInformation } from '../domain';
import { ErrorState, ContentUnavailableView, SubsectionTitle } from '../components/common';
import { HistoryDayGroup } from '../components/history';
import { useInfiniteHistoryData } from '../hooks';
import LogModal from '../components/LogModal';
import DayNutritionModal from '../components/DayNutritionModal';

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
    productDetails,
    groupDetails,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
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
  } = useInfiniteHistoryData();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll: observe sentinel to trigger loading more entries
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, loadMore]);

  const dayGroups = useMemo(() => {
    if (logs.length === 0) return new Map<string, ApiLogEntry[]>();
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
      <h1 className="mb-4">History</h1>
      {loading && (
        <div data-testid="history-placeholder">
          <div className="mb-4">
            <SubsectionTitle as="h5" className="mb-3 placeholder-glow">
              <span className="placeholder col-2" />
            </SubsectionTitle>
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
        <ContentUnavailableView
          icon="bi-clock-history"
          title="No history"
          description="Log something to see it here."
        />
      )}
      {!loading &&
        !error &&
        dayGroups.size > 0 &&
        Array.from(dayGroups.entries()).map(([day, entries]) => (
          <HistoryDayGroup
            key={day}
            dayHeading={formatDayHeading(day)}
            dayNutrition={dayNutritionByDay.get(day)}
            entries={entries}
            productDetails={productDetails}
            groupDetails={groupDetails}
            entryNutritionById={entryNutritionById}
            onViewFullNutrition={() => setSelectedDay(day)}
            onLogAgain={handleLogAgainClick}
            logAgainLoading={logAgainLoading}
            onEdit={handleEditClick}
            editLoading={editLoading}
            onDelete={handleDeleteClick}
            deleteLoading={deleteLoading}
          />
        ))}

      <div ref={sentinelRef} aria-hidden="true" />
      {loadingMore && (
        <div className="text-center py-3" data-testid="loading-more">
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Loading more entries</span>
          </div>
        </div>
      )}
      {!loading && !loadingMore && !hasMore && logs.length > 0 && (
        <p className="text-center text-body-secondary py-3" data-testid="end-of-list">
          You&rsquo;re all caught up.
        </p>
      )}

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
