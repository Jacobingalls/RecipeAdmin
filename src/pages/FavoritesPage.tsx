import { useState, useMemo, useCallback } from 'react';

import type { ApiFavorite } from '../api';
import { deleteFavorite as deleteFavoriteApi } from '../api';
import { useFavorites } from '../contexts/FavoritesContext';
import { buildFavoriteLogTarget, favoriteName, favoriteBrand } from '../utils';
import { LoadingState, ContentUnavailableView, ListFilter } from '../components/common';
import type { LogTarget } from '../components/LogModal';
import LogModal from '../components/LogModal';
import FavoriteRow from '../components/FavoriteRow';

export default function FavoritesPage() {
  const { favorites, loading, error, refetch } = useFavorites();

  const [nameFilter, setNameFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const brands = useMemo(() => {
    const uniqueBrands = [
      ...new Set(favorites.map((fav) => favoriteBrand(fav)).filter((b): b is string => Boolean(b))),
    ];
    return uniqueBrands.sort((a, b) => a.localeCompare(b));
  }, [favorites]);

  const filteredFavorites = useMemo(
    () =>
      favorites.filter((fav) => {
        const name = favoriteName(fav).toLowerCase();
        const brand = favoriteBrand(fav)?.toLowerCase();
        const matchesName = !nameFilter || name.includes(nameFilter.toLowerCase());
        const matchesBrand = !brandFilter || brand === brandFilter.toLowerCase();
        return matchesName && matchesBrand;
      }),
    [favorites, nameFilter, brandFilter],
  );

  const handleLog = useCallback((favorite: ApiFavorite) => {
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

  return (
    <>
      <h1 className="mb-4">Favorites</h1>
      <ListFilter
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        dropdownFilter={brandFilter}
        onDropdownFilterChange={setBrandFilter}
        dropdownLabel="All brands"
        dropdownOptions={brands}
      />
      {loading && <LoadingState />}
      {error && !loading && (
        <ContentUnavailableView
          icon="bi-star"
          title="Couldn't load favorites"
          description="Try again later."
        />
      )}
      {!loading && !error && filteredFavorites.length === 0 && (
        <ContentUnavailableView
          icon="bi-star"
          title="No favorites"
          description={
            nameFilter || brandFilter
              ? 'Try adjusting your search or filters.'
              : 'Add favorites from product or group pages.'
          }
        />
      )}
      {!loading && !error && filteredFavorites.length > 0 && (
        <div className="list-group">
          {filteredFavorites.map((fav) => (
            <FavoriteRow
              key={fav.id}
              favorite={fav}
              onLog={handleLog}
              onRemove={handleRemove}
              removeLoading={removeLoading}
            />
          ))}
        </div>
      )}
      <LogModal target={logTarget} onClose={handleModalClose} onSaved={handleModalSaved} />
    </>
  );
}
