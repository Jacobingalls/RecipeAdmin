import type { ReactNode } from 'react';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import type { ApiCategory } from '../api';
import { listCategoriesWithMeta } from '../api';

const DEFAULT_MAX_AGE = 300; // 5 minutes fallback when server omits Cache-Control

interface CategoriesContextValue {
  lookup: Map<string, ApiCategory>;
  allCategories: ApiCategory[];
  loading: boolean;
  error: string | null;
  addCategories: (cats: ApiCategory[]) => void;
  refresh: () => void;
  /** Epoch ms when the cache expires. 0 means not yet populated. */
  expiresAt: number;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Map<string, ApiCategory>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    listCategoriesWithMeta({ depth: 1 })
      .then(({ data, meta }) => {
        if (cancelled) return;
        const map = new Map<string, ApiCategory>();
        for (const cat of data) {
          map.set(cat.id, cat);
        }
        setCategories(map);
        const maxAge = meta.maxAge ?? DEFAULT_MAX_AGE;
        setExpiresAt(Date.now() + maxAge * 1000);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCategories(new Map());
        setError("Couldn't load categories. Try again later.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setFetchKey((k) => k + 1);
  }, []);

  const addCategories = useCallback((cats: ApiCategory[]) => {
    setCategories((prev) => {
      const next = new Map(prev);
      for (const cat of cats) {
        next.set(cat.id, cat);
      }
      return next;
    });
  }, []);

  const allCategories = useMemo(() => Array.from(categories.values()), [categories]);

  const value = useMemo<CategoriesContextValue>(
    () => ({
      lookup: categories,
      allCategories,
      loading,
      error,
      addCategories,
      refresh,
      expiresAt,
    }),
    [categories, allCategories, loading, error, addCategories, refresh, expiresAt],
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories(): CategoriesContextValue {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }

  const { expiresAt, loading, refresh } = context;
  const refreshTriggered = useRef(false);

  // Trigger refresh when cache is stale (once per stale window)
  useEffect(() => {
    if (expiresAt > 0 && !loading && Date.now() > expiresAt && !refreshTriggered.current) {
      refreshTriggered.current = true;
      refresh();
    }
    // Reset the guard after a successful fetch (expiresAt changes)
    if (expiresAt > 0 && Date.now() <= expiresAt) {
      refreshTriggered.current = false;
    }
  }, [expiresAt, loading, refresh]);

  return context;
}
