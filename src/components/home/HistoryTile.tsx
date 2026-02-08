import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import type { ApiLogEntry, ApiProduct } from '../../api';
import { getLogs, listProducts, listGroups, getProduct, getGroup, deleteLog } from '../../api';
import type { ProductGroupData } from '../../domain';
import { useApiQuery } from '../../hooks';
import { resolveEntryName, buildLogTarget } from '../../utils/logEntryHelpers';
import { LoadingState, ContentUnavailableView } from '../common';
import LogModal from '../LogModal';
import type { LogTarget } from '../LogModal';
import HistoryEntryRow from '../HistoryEntryRow';

import Tile from './Tile';

export default function HistoryTile() {
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

  const centeredWrapper = (child: ReactNode) => (
    <div className="d-flex align-items-center justify-content-center flex-grow-1">{child}</div>
  );

  let content;
  if (loading) {
    content = centeredWrapper(<LoadingState />);
  } else if (error) {
    content = centeredWrapper(
      <ContentUnavailableView
        icon="bi-clock-history"
        title="Unable to load history"
        description={error}
      />,
    );
  } else if (!logs || logs.length === 0) {
    content = centeredWrapper(
      <ContentUnavailableView icon="bi-clock-history" title="No Recent History" />,
    );
  } else {
    content = (
      <div className="list-group list-group-flush">
        {logs.map((entry) => (
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
    );
  }

  const historyLink = (
    <Link to="/history" className="text-decoration-none small">
      View all &rarr;
    </Link>
  );

  return (
    <Tile title="History" titleRight={historyLink}>
      <div style={{ minHeight: '20rem' }} className="d-flex flex-column">
        {content}
      </div>
      <LogModal target={logTarget} onClose={handleModalClose} onSaved={handleSaved} />
    </Tile>
  );
}
