import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

import type { ApiFavorite, CreateFavoriteRequest, ServingSizeData } from '../api';
import { listFavorites, createFavorite, deleteFavorite } from '../api';
import { ServingSize } from '../domain';

interface FindFavoriteOptions {
  productId?: string;
  preparationId?: string;
  groupId?: string;
  servingSize?: ServingSizeData;
}

interface FavoritesContextValue {
  favorites: ApiFavorite[];
  loading: boolean;
  findFavorite: (opts: FindFavoriteOptions) => ApiFavorite | null;
  isFavorited: (opts: FindFavoriteOptions) => boolean;
  addFavorite: (request: CreateFavoriteRequest) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  refetch: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function normalizeServingSize(data: ServingSizeData): string {
  const parsed = ServingSize.fromObject(data);
  return parsed ? JSON.stringify(parsed.toObject()) : JSON.stringify(data);
}

function servingSizesEqual(a: ServingSizeData, b: ServingSizeData): boolean {
  return normalizeServingSize(a) === normalizeServingSize(b);
}

function matchesFavorite(fav: ApiFavorite, opts: FindFavoriteOptions): boolean {
  if (opts.productId) {
    if (!fav.item.product || fav.item.product.id !== opts.productId) return false;
    if (opts.preparationId && fav.item.preparationID !== opts.preparationId) return false;
  } else if (opts.groupId) {
    if (!fav.item.group || fav.item.group.id !== opts.groupId) return false;
  } else {
    return false;
  }

  if (opts.servingSize) {
    return servingSizesEqual(fav.item.servingSize, opts.servingSize);
  }

  return true;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<ApiFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listFavorites()
      .then((data) => {
        if (!cancelled) {
          setFavorites(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFavorites([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const refetch = useCallback(() => {
    setLoading(true);
    setFetchKey((k) => k + 1);
  }, []);

  const findFavorite = useCallback(
    (opts: FindFavoriteOptions): ApiFavorite | null =>
      favorites.find((fav) => matchesFavorite(fav, opts)) ?? null,
    [favorites],
  );

  const isFavorited = useCallback(
    (opts: FindFavoriteOptions): boolean => findFavorite(opts) !== null,
    [findFavorite],
  );

  const addFav = useCallback(
    async (request: CreateFavoriteRequest): Promise<void> => {
      await createFavorite(request);
      refetch();
    },
    [refetch],
  );

  const removeFav = useCallback(
    async (id: string): Promise<void> => {
      await deleteFavorite(id);
      refetch();
    },
    [refetch],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      loading,
      findFavorite,
      isFavorited,
      addFavorite: addFav,
      removeFavorite: removeFav,
      refetch,
    }),
    [favorites, loading, findFavorite, isFavorited, addFav, removeFav, refetch],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
