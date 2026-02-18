import type { ReactNode } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

import type { ApiFavorite, ApiProduct } from '../../api';
import { deleteFavorite as deleteFavoriteApi, getProduct, getGroup } from '../../api';
import type { ProductGroupData } from '../../domain';
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
  const [products, setProducts] = useState<Record<string, ApiProduct>>({});
  const [groups, setGroups] = useState<Record<string, ProductGroupData>>({});

  useEffect(() => {
    const productIDs = [
      ...new Set(favorites.filter((f) => f.item.productID).map((f) => f.item.productID!)),
    ];
    const groupIDs = [
      ...new Set(favorites.filter((f) => f.item.groupID).map((f) => f.item.groupID!)),
    ];

    const fetchAll = async () => {
      const productResults: Record<string, ApiProduct> = {};
      const groupResults: Record<string, ProductGroupData> = {};

      await Promise.all([
        ...productIDs.map(async (id) => {
          try {
            productResults[id] = await getProduct(id);
          } catch {
            // Skip products that can't be fetched
          }
        }),
        ...groupIDs.map(async (id) => {
          try {
            groupResults[id] = await getGroup(id);
          } catch {
            // Skip groups that can't be fetched
          }
        }),
      ]);

      setProducts(productResults);
      setGroups(groupResults);
    };

    if (productIDs.length > 0 || groupIDs.length > 0) {
      fetchAll();
    }
  }, [favorites]);

  const handleLog = useCallback(
    (favorite: ApiFavorite) => {
      const target = buildFavoriteLogTarget(favorite, products, groups);
      if (target) {
        setLogTarget(target);
      }
    },
    [products, groups],
  );

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
            products={products}
            groups={groups}
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
