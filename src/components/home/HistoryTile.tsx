import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useHistoryData } from '../../hooks';
import { resolveEntryName, resolveEntryBrand } from '../../utils/logEntryHelpers';
import { LoadingState, ContentUnavailableView } from '../common';
import LogModal from '../LogModal';
import HistoryEntryRow from '../HistoryEntryRow';

import Tile from './Tile';

export default function HistoryTile() {
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
  } = useHistoryData({ limit: 6 });

  const centeredWrapper = (child: ReactNode) => (
    <div className="card-body d-flex align-items-center justify-content-center">{child}</div>
  );

  let content;
  if (loading) {
    content = centeredWrapper(<LoadingState />);
  } else if (error) {
    content = centeredWrapper(
      <ContentUnavailableView
        icon="bi-clock-history"
        title="Couldn't load history"
        description={error}
      />,
    );
  } else if (!logs || logs.length === 0) {
    content = centeredWrapper(
      <ContentUnavailableView icon="bi-clock-history" title="No recent history" />,
    );
  } else {
    content = (
      <div className="list-group list-group-flush">
        {logs.map((entry) => (
          <HistoryEntryRow
            key={entry.id}
            entry={entry}
            name={resolveEntryName(entry, products!, groups!)}
            brand={resolveEntryBrand(entry, products!)}
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
    );
  }

  const historyLink = (
    <Link to="/history" className="text-decoration-none small">
      View all &rarr;
    </Link>
  );

  return (
    <Tile title="Recent history" titleRight={historyLink} minHeight="20rem">
      {content}
      <LogModal target={logTarget} onClose={handleModalClose} onSaved={handleSaved} />
    </Tile>
  );
}
