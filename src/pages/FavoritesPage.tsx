import { useState, useMemo, useCallback } from 'react';

import type { ApiFavorite } from '../api';
import { listFavorites, deleteFavorite as deleteFavoriteApi } from '../api';
import { useFavorites } from '../contexts/FavoritesContext';
import { useApiQuery } from '../hooks';
import { buildFavoriteLogTarget, favoriteName, favoriteBrand } from '../utils/favoriteHelpers';
import { LoadingState, ContentUnavailableView } from '../components/common';
import type { LogTarget } from '../components/LogModal';
import LogModal from '../components/LogModal';
import FavoriteRow from '../components/FavoriteRow';

export default function FavoritesPage() {
  const {
    data: favorites,
    loading,
    error,
    refetch,
  } = useApiQuery(listFavorites, [], {
    errorMessage: "Couldn't load favorites. Try again later.",
  });
  const { refetch: refetchFavoritesCache } = useFavorites();

  const [nameFilter, setNameFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const brands = useMemo(() => {
    if (!favorites) return [];
    const uniqueBrands = [
      ...new Set(favorites.map((fav) => favoriteBrand(fav)).filter((b): b is string => Boolean(b))),
    ];
    return uniqueBrands.sort((a, b) => a.localeCompare(b));
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    if (!favorites) return [];
    return favorites.filter((fav) => {
      const name = favoriteName(fav).toLowerCase();
      const brand = favoriteBrand(fav)?.toLowerCase();
      const matchesName = !nameFilter || name.includes(nameFilter.toLowerCase());
      const matchesBrand = !brandFilter || brand === brandFilter.toLowerCase();
      return matchesName && matchesBrand;
    });
  }, [favorites, nameFilter, brandFilter]);

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
        refetchFavoritesCache();
      } finally {
        setRemoveLoading(false);
      }
    },
    [refetch, refetchFavoritesCache],
  );

  return (
    <>
      <h1 className="mb-4">Favorites</h1>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label htmlFor="favorite-name-filter" className="visually-hidden">
            Filter by name
          </label>
          <input
            type="text"
            className="form-control"
            id="favorite-name-filter"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="favorite-brand-filter" className="visually-hidden">
            Filter by brand
          </label>
          <select
            className="form-select"
            id="favorite-brand-filter"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>
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
