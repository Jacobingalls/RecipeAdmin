import { renderHook, waitFor, act } from '@testing-library/react';

import { useApiQuery } from './useApiQuery';

describe('useApiQuery', () => {
  it('returns loading=true initially', () => {
    const fetchFn = () => new Promise<string>(() => {}); // never resolves
    const { result } = renderHook(() => useApiQuery(fetchFn));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets data on successful fetch', async () => {
    const fetchFn = () => Promise.resolve({ id: 1, name: 'Test' });
    const { result } = renderHook(() => useApiQuery(fetchFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, name: 'Test' });
    expect(result.current.error).toBeNull();
  });

  it('sets error on failed fetch', async () => {
    const fetchFn = () => Promise.reject(new Error('Network error'));
    const { result } = renderHook(() => useApiQuery(fetchFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('does not set error for AbortError', async () => {
    const fetchFn = () => {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    };
    const { result } = renderHook(() => useApiQuery(fetchFn));

    // AbortError should not set the error state, but loading should still resolve
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it('refetch re-executes the fetch function', async () => {
    let callCount = 0;
    const fetchFn = () => {
      callCount += 1;
      return Promise.resolve(`call-${callCount}`);
    };

    const { result } = renderHook(() => useApiQuery(fetchFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('call-1');

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toBe('call-2');
    });
  });

  it('does not fetch when enabled=false', async () => {
    let called = false;
    const fetchFn = () => {
      called = true;
      return Promise.resolve('data');
    };

    const { result } = renderHook(() => useApiQuery(fetchFn, [], { enabled: false }));

    // Give it a tick to ensure no fetch is triggered
    await new Promise((r) => setTimeout(r, 50));

    expect(called).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('re-fetches when dependencies change', async () => {
    let callCount = 0;
    const fetchFn = () => {
      callCount += 1;
      return Promise.resolve(`call-${callCount}`);
    };

    const { result, rerender } = renderHook(
      ({ dep }: { dep: number }) => useApiQuery(fetchFn, [dep]),
      { initialProps: { dep: 1 } },
    );

    await waitFor(() => {
      expect(result.current.data).toBe('call-1');
    });

    rerender({ dep: 2 });

    await waitFor(() => {
      expect(result.current.data).toBe('call-2');
    });
  });

  it('starts fetching when enabled changes from false to true', async () => {
    const fetchFn = () => Promise.resolve('loaded');

    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useApiQuery(fetchFn, [], { enabled }),
      { initialProps: { enabled: false } },
    );

    expect(result.current.data).toBeNull();

    rerender({ enabled: true });

    await waitFor(() => {
      expect(result.current.data).toBe('loaded');
    });
  });
});
