import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiCategorySearchResult, ApiSearchResult } from '../api';
import { searchCategories, searchItems } from '../api';

import type { UseApiQueryResult } from './useApiQuery';
import { useApiQuery } from './useApiQuery';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export interface UseSearchResult {
  results: ApiSearchResult[] | null;
  categories: ApiCategorySearchResult[] | null;
  loading: boolean;
  error: string | null;
}

interface SearchData {
  results: ApiSearchResult[];
  categories: ApiCategorySearchResult[];
}

/**
 * Category matches are a supplement to item results, so a failed category search shows the
 * items alone rather than an error.
 */
async function searchEverything(query: string): Promise<SearchData> {
  const [results, categories] = await Promise.all([
    searchItems(query),
    searchCategories(query).catch(() => []),
  ]);
  return { results, categories };
}

/**
 * Debounced search hook for products, groups and categories. Queries the search API after a
 * short delay once the query reaches the minimum length.
 */
export function useSearch(query: string): UseSearchResult {
  const { t } = useTranslation();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const trimmed = query.trim();
    const next = trimmed.length >= MIN_QUERY_LENGTH ? trimmed : '';
    const delay = next ? DEBOUNCE_MS : 0;
    const timer = setTimeout(() => setDebouncedQuery(next), delay);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, loading, error }: UseApiQueryResult<SearchData> = useApiQuery(
    () => searchEverything(debouncedQuery),
    [debouncedQuery],
    {
      enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
      errorMessage: t('search.error'),
    },
  );

  return {
    results: data?.results ?? null,
    categories: data?.categories ?? null,
    loading,
    error,
  };
}
