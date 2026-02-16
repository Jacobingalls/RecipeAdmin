import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import type { ApiFavorite } from '../../api';
import { deleteFavorite as deleteFavoriteApi } from '../../api';
import { useFavorites } from '../../contexts/FavoritesContext';
import { buildFavoriteLogTarget } from '../../utils';
import { LoadingState, ContentUnavailableView } from '../common';
import type { LogTarget } from '../LogModal';
import LogModal from '../LogModal';
import FavoriteRow from '../FavoriteRow';

import Tile from './Tile';

const MAX_DISPLAY = 6;

interface FavoritesTileProps {
  onItemLogged?: () => void;
}

export default function FavoritesTile({ onItemLogged }: FavoritesTileProps) {
  const { favorites, loading, error, refetch } = useFavorites();

  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const handleLog = useCallback((favorite: ApiFavorite) => {
    const target = buildFavoriteLogTarget(favorite);
    if (target) {
      setLogTarget(target);
    }
  }, []);

  const handleModalSaved = useCallback(() => {
    refetch();
    onItemLogged?.();
  }, [refetch, onItemLogged]);

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
    <div className="card-body d-flex align-items-center justify-content-center">{child}</div>
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
  } else if (favorites.length === 0) {
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
            onLog={handleLog}
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
    <Tile title="Favorites" titleRight={viewAllLink} minHeight="10rem">
      {content}
      <LogModal target={logTarget} onClose={handleModalClose} onSaved={handleModalSaved} />
    </Tile>
  );
}
