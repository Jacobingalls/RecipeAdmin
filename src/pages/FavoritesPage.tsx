import { useState, useMemo, useCallback, useEffect } from 'react';

import type { ApiFavorite, ApiProduct } from '../api';
import { deleteFavorite as deleteFavoriteApi, getProduct, getGroup } from '../api';
import type { ProductGroupData } from '../domain';
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

  const brands = useMemo(() => {
    const uniqueBrands = [
      ...new Set(
        favorites
          .map((fav) => favoriteBrand(fav, products, groups))
          .filter((b): b is string => Boolean(b)),
      ),
    ];
    return uniqueBrands.sort((a, b) => a.localeCompare(b));
  }, [favorites, products, groups]);

  const filteredFavorites = useMemo(
    () =>
      favorites.filter((fav) => {
        const name = favoriteName(fav, products, groups).toLowerCase();
        const brand = favoriteBrand(fav, products, groups)?.toLowerCase();
        const matchesName = !nameFilter || name.includes(nameFilter.toLowerCase());
        const matchesBrand = !brandFilter || brand === brandFilter.toLowerCase();
        return matchesName && matchesBrand;
      }),
    [favorites, products, groups, nameFilter, brandFilter],
  );

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
              products={products}
              groups={groups}
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
