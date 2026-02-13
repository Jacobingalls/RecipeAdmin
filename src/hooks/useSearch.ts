import { useState, useEffect } from 'react';

import type { ApiSearchResult } from '../api';
import { searchItems } from '../api';

import type { UseApiQueryResult } from './useApiQuery';
import { useApiQuery } from './useApiQuery';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export interface UseSearchResult {
  results: ApiSearchResult[] | null;
  loading: boolean;
  error: string | null;
}

/**
 * Debounced search hook. Queries the search API after a short delay
 * once the query reaches the minimum length.
 */
export function useSearch(query: string): UseSearchResult {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const trimmed = query.trim();
    const next = trimmed.length >= MIN_QUERY_LENGTH ? trimmed : '';
    const delay = next ? DEBOUNCE_MS : 0;
    const timer = setTimeout(() => setDebouncedQuery(next), delay);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, loading, error }: UseApiQueryResult<ApiSearchResult[]> = useApiQuery(
    () => searchItems(debouncedQuery),
    [debouncedQuery],
    {
      enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
      errorMessage: "Couldn't load search results. Try again.",
    },
  );

  return { results: data, loading, error };
}
