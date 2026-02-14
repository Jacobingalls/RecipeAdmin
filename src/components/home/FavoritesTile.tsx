import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import type { ApiFavorite } from '../../api';
import {
  listFavorites,
  logEntry,
  deleteFavorite as deleteFavoriteApi,
  touchFavoriteLastUsed,
} from '../../api';
import { useApiQuery } from '../../hooks';
import { buildFavoriteLogParams, buildFavoriteLogTarget } from '../../utils/favoriteHelpers';
import { LoadingState, ContentUnavailableView } from '../common';
import type { LogTarget } from '../LogModal';
import LogModal from '../LogModal';
import type { FavoriteLogState } from '../FavoriteRow';
import FavoriteRow from '../FavoriteRow';

import Tile from './Tile';

const MAX_DISPLAY = 6;

export default function FavoritesTile() {
  const {
    data: favorites,
    loading,
    error,
    refetch,
  } = useApiQuery(listFavorites, [], {
    errorMessage: "Couldn't load favorites. Try again later.",
  });

  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [logStates, setLogStates] = useState<Map<string, FavoriteLogState>>(new Map());
  const [removeLoading, setRemoveLoading] = useState(false);

  const getLogState = (id: string): FavoriteLogState => logStates.get(id) ?? 'idle';

  const setLogStateForId = useCallback((id: string, state: FavoriteLogState) => {
    setLogStates((prev) => new Map(prev).set(id, state));
  }, []);

  const handleLog = useCallback(
    async (favorite: ApiFavorite) => {
      const params = buildFavoriteLogParams(favorite);
      if (!params) return;

      setLogStateForId(favorite.id, 'logging');
      try {
        await logEntry(params);
        setLogStateForId(favorite.id, 'success');
        try {
          await touchFavoriteLastUsed(favorite.id);
        } catch {
          // Best-effort touch
        }
        refetch();
        setTimeout(() => {
          setLogStateForId(favorite.id, 'idle');
        }, 1500);
      } catch {
        setLogStateForId(favorite.id, 'idle');
      }
    },
    [setLogStateForId, refetch],
  );

  const handleLogWithSize = useCallback((favorite: ApiFavorite) => {
    const target = buildFavoriteLogTarget(favorite);
    if (target) {
      setLogTarget(target);
    }
  }, []);

  const handleModalSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleModalClose = useCallback(() => {
    setLogTarget(null);
  }, []);

  const handleRemove = useCallback(
    async (favorite: ApiFavorite) => {
      setRemoveLoading(true);
      try {
        await deleteFavoriteApi(favorite.id);
        refetch();
      } finally {
        setRemoveLoading(false);
      }
    },
    [refetch],
  );

  const centeredWrapper = (child: ReactNode) => (
    <div className="d-flex align-items-center justify-content-center flex-grow-1">{child}</div>
  );

  let content;
  if (loading) {
    content = centeredWrapper(<LoadingState />);
  } else if (error) {
    content = centeredWrapper(
      <ContentUnavailableView
        icon="bi-star"
        title="Couldn't load favorites"
        description="Try again later."
      />,
    );
  } else if (!favorites || favorites.length === 0) {
    content = centeredWrapper(
      <ContentUnavailableView
        icon="bi-star"
        title="No favorites"
        description="Add favorites from product or group pages."
      />,
    );
  } else {
    const displayed = favorites.slice(0, MAX_DISPLAY);
    content = (
      <div className="list-group list-group-flush">
        {displayed.map((fav) => (
          <FavoriteRow
            key={fav.id}
            favorite={fav}
            logState={getLogState(fav.id)}
            onLog={handleLog}
            onLogWithSize={handleLogWithSize}
            onRemove={handleRemove}
            removeLoading={removeLoading}
          />
        ))}
      </div>
    );
  }

  const viewAllLink = (
    <Link to="/favorites" className="text-decoration-none small">
      View all &rarr;
    </Link>
  );

  return (
    <Tile title="Favorites" titleRight={viewAllLink}>
      <div style={{ minHeight: '10rem' }} className="d-flex flex-column">
        {content}
      </div>
      <LogModal target={logTarget} onClose={handleModalClose} onSaved={handleModalSaved} />
    </Tile>
  );
}
