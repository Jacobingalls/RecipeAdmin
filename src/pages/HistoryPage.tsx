import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { ApiLogEntry } from '../api';
import { getLogs, listProducts, listGroups } from '../api';
import { BackButton, LoadingState, ErrorState, EmptyState } from '../components/common';
import { useApiQuery } from '../hooks';
import {
  formatRelativeTime,
  resolveEntryName,
  entryDetailPath,
  formatServingSizeDescription,
} from '../utils/logEntryHelpers';

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

export default function HistoryPage() {
  const { data: logs, loading: logsLoading, error: logsError } = useApiQuery(getLogs, []);
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
  } = useApiQuery(listProducts, []);
  const { data: groups, loading: groupsLoading, error: groupsError } = useApiQuery(listGroups, []);

  const loading = logsLoading || productsLoading || groupsLoading;
  const error = logsError || productsError || groupsError;

  const dayGroups = useMemo(() => {
    if (!logs) return new Map<string, ApiLogEntry[]>();
    return groupByDay(logs);
  }, [logs]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <>
      <BackButton to="/" />
      <h2 className="mb-4">History</h2>
      {dayGroups.size === 0 ? (
        <EmptyState message="No log entries" />
      ) : (
        Array.from(dayGroups.entries()).map(([day, entries]) => (
          <div key={day} className="mb-4">
            <h5 className="text-body-secondary mb-3">{formatDayHeading(day)}</h5>
            <div className="list-group">
              {entries.map((entry) => (
                <Link
                  key={entry.id}
                  to={entryDetailPath(entry)}
                  className="list-group-item list-group-item-action"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-medium">{resolveEntryName(entry, products!, groups!)}</div>
                      <small className="text-body-secondary">
                        {formatServingSizeDescription(entry)}
                      </small>
                    </div>
                    <small className="text-body-secondary text-nowrap ms-2">
                      {formatRelativeTime(entry.timestamp)}
                    </small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
