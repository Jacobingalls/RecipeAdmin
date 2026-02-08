import { useState, useMemo, useCallback } from 'react';

import type { ApiLogEntry, ApiProduct } from '../api';
import { getLogs, listProducts, listGroups, getProduct, getGroup, deleteLog } from '../api';
import type { ProductGroupData } from '../domain';
import { BackButton, LoadingState, ErrorState, ContentUnavailableView } from '../components/common';
import { useApiQuery } from '../hooks';
import LogModal from '../components/LogModal';
import type { LogTarget } from '../components/LogModal';
import HistoryEntryRow from '../components/HistoryEntryRow';
import { resolveEntryName, buildLogTarget } from '../utils/logEntryHelpers';

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
  const {
    data: logs,
    loading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useApiQuery(getLogs, []);
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
  } = useApiQuery(listProducts, []);
  const { data: groups, loading: groupsLoading, error: groupsError } = useApiQuery(listGroups, []);

  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [logAgainLoading, setLogAgainLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loading = logsLoading || productsLoading || groupsLoading;
  const error = logsError || productsError || groupsError;

  const dayGroups = useMemo(() => {
    if (!logs) return new Map<string, ApiLogEntry[]>();
    return groupByDay(logs);
  }, [logs]);

  const handleLogAgainClick = useCallback(async (entry: ApiLogEntry) => {
    setLogAgainLoading(true);
    try {
      let product: ApiProduct | null = null;
      let groupData: ProductGroupData | null = null;

      if (entry.item.kind === 'product' && entry.item.productID) {
        product = await getProduct(entry.item.productID);
      } else if (entry.item.kind === 'group' && entry.item.groupID) {
        groupData = await getGroup(entry.item.groupID);
      }

      const target = buildLogTarget(entry, product, groupData);
      if (target) {
        const { editEntryId: _, ...createTarget } = target;
        setLogTarget(createTarget);
      }
    } finally {
      setLogAgainLoading(false);
    }
  }, []);

  const handleEditClick = useCallback(async (entry: ApiLogEntry) => {
    setEditLoading(true);
    try {
      let product: ApiProduct | null = null;
      let groupData: ProductGroupData | null = null;

      if (entry.item.kind === 'product' && entry.item.productID) {
        product = await getProduct(entry.item.productID);
      } else if (entry.item.kind === 'group' && entry.item.groupID) {
        groupData = await getGroup(entry.item.groupID);
      }

      const target = buildLogTarget(entry, product, groupData);
      if (target) {
        setLogTarget(target);
      }
    } finally {
      setEditLoading(false);
    }
  }, []);

  const handleDeleteClick = useCallback(
    async (entry: ApiLogEntry) => {
      setDeleteLoading(true);
      try {
        await deleteLog(entry.id);
        refetchLogs();
      } finally {
        setDeleteLoading(false);
      }
    },
    [refetchLogs],
  );

  const handleSaved = useCallback(() => {
    refetchLogs();
  }, [refetchLogs]);

  const handleModalClose = useCallback(() => {
    setLogTarget(null);
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <>
      <BackButton to="/" />
      <h2 className="mb-4">History</h2>
      {dayGroups.size === 0 ? (
        <ContentUnavailableView icon="bi-clock-history" title="No History" />
      ) : (
        Array.from(dayGroups.entries()).map(([day, entries]) => (
          <div key={day} className="mb-4">
            <h5 className="text-body-secondary mb-3">{formatDayHeading(day)}</h5>
            <div className="list-group">
              {entries.map((entry) => (
                <HistoryEntryRow
                  key={entry.id}
                  entry={entry}
                  name={resolveEntryName(entry, products!, groups!)}
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
        ))
      )}

      <LogModal target={logTarget} onClose={handleModalClose} onSaved={handleSaved} />
    </>
  );
}
