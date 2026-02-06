import type { DependencyList } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiQueryOptions {
  enabled?: boolean;
}

export interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for data fetching with automatic cleanup and request cancellation.
 */
export function useApiQuery<T = unknown>(
  fetchFn: (signal?: AbortSignal) => Promise<T>,
  deps: DependencyList = [],
  options: UseApiQueryOptions = {},
): UseApiQueryResult<T> {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchFnRef = useRef(fetchFn);

  // Keep ref updated with latest fetchFn
  fetchFnRef.current = fetchFn;

  const execute = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFnRef.current(signal);
      if (!signal?.aborted) {
        setData(result);
      }
    } catch (err) {
      if (!signal?.aborted) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        } else if (!(err instanceof Error)) {
          setError(String(err));
        }
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    execute(abortController.signal);

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, execute, ...deps]);

  const refetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    execute(abortController.signal);
  }, [execute]);

  return { data, loading, error, refetch };
}
