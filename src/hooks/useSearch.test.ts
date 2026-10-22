import { renderHook, act } from '@testing-library/react';

import type { ApiCategorySearchResult, ApiSearchResult } from '../api';
import { searchCategories, searchItems } from '../api';

import type { UseApiQueryResult } from './useApiQuery';
import { useApiQuery } from './useApiQuery';
import { useSearch } from './useSearch';

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../api', () => ({
  searchItems: vi.fn(),
  searchCategories: vi.fn(),
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

interface SearchData {
  results: ApiSearchResult[];
  categories: ApiCategorySearchResult[];
}

const items: ApiSearchResult[] = [
  {
    item: { product: { id: 'p1', name: 'Apple', preparations: [] } },
    servingSize: { kind: 'servings', amount: 1 },
    relevance: 1.0,
  },
];

const categories: ApiCategorySearchResult[] = [
  {
    category: {
      id: 'c1',
      slug: 'fruit',
      displayName: 'Fruit',
      description: null,
      parents: [],
      children: [],
      notes: [],
    },
    slugPath: 'fruit',
    path: 'Fruit',
    relevance: 0.9,
  },
];

function lastFetcher(): () => Promise<SearchData> {
  return mockUseApiQuery.mock.lastCall![0] as () => Promise<SearchData>;
}

function mockQuery(overrides: Partial<UseApiQueryResult<SearchData>> = {}) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<unknown>);
}

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockQuery();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null results for an empty query', () => {
    const { result } = renderHook(() => useSearch(''));
    expect(result.current.results).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does not enable the query for short input', () => {
    renderHook(() => useSearch('a'));
    act(() => vi.advanceTimersByTime(300));

    expect(mockUseApiQuery).toHaveBeenCalledWith(
      expect.any(Function),
      [''],
      expect.objectContaining({ enabled: false }),
    );
  });

  it('debounces the query before enabling', () => {
    const { rerender } = renderHook(({ q }) => useSearch(q), {
      initialProps: { q: 'ap' },
    });

    // Before debounce fires, the debounced query should still be empty
    expect(mockUseApiQuery).toHaveBeenLastCalledWith(
      expect.any(Function),
      [''],
      expect.objectContaining({ enabled: false }),
    );

    // Advance past the debounce timer
    act(() => vi.advanceTimersByTime(300));
    rerender({ q: 'ap' });

    expect(mockUseApiQuery).toHaveBeenLastCalledWith(
      expect.any(Function),
      ['ap'],
      expect.objectContaining({ enabled: true }),
    );
  });

  it('trims the query before debouncing', () => {
    renderHook(() => useSearch('  apple  '));
    act(() => vi.advanceTimersByTime(300));

    expect(mockUseApiQuery).toHaveBeenLastCalledWith(
      expect.any(Function),
      ['apple'],
      expect.objectContaining({ enabled: true }),
    );
  });

  it('resets debounced query when input drops below minimum length', () => {
    const { rerender } = renderHook(({ q }) => useSearch(q), {
      initialProps: { q: 'apple' },
    });

    act(() => vi.advanceTimersByTime(300));

    rerender({ q: 'a' });
    // Resets via a 0ms timeout to satisfy the set-state-in-effect lint rule
    act(() => vi.advanceTimersByTime(0));
    expect(mockUseApiQuery).toHaveBeenLastCalledWith(
      expect.any(Function),
      [''],
      expect.objectContaining({ enabled: false }),
    );
  });

  it('passes loading state from useApiQuery', () => {
    mockQuery({ loading: true });
    const { result } = renderHook(() => useSearch('apple'));
    expect(result.current.loading).toBe(true);
  });

  it('passes error state from useApiQuery', () => {
    mockQuery({ error: 'Network error' });
    const { result } = renderHook(() => useSearch('apple'));
    expect(result.current.error).toBe('Network error');
  });

  it('passes item and category results from useApiQuery', () => {
    mockQuery({ data: { results: items, categories } });
    const { result } = renderHook(() => useSearch('apple'));
    expect(result.current.results).toEqual(items);
    expect(result.current.categories).toEqual(categories);
  });

  it('returns null categories before results arrive', () => {
    const { result } = renderHook(() => useSearch('apple'));
    expect(result.current.categories).toBeNull();
  });

  it('searches items and categories with the same query', async () => {
    vi.mocked(searchItems).mockResolvedValue(items);
    vi.mocked(searchCategories).mockResolvedValue(categories);
    renderHook(() => useSearch('apple'));
    act(() => vi.advanceTimersByTime(300));

    await expect(lastFetcher()()).resolves.toEqual({ results: items, categories });
    expect(searchItems).toHaveBeenCalledWith('apple');
    expect(searchCategories).toHaveBeenCalledWith('apple');
  });

  it('shows items alone when the category search fails', async () => {
    vi.mocked(searchItems).mockResolvedValue(items);
    vi.mocked(searchCategories).mockRejectedValue(new Error('Not found'));
    renderHook(() => useSearch('apple'));
    act(() => vi.advanceTimersByTime(300));

    await expect(lastFetcher()()).resolves.toEqual({ results: items, categories: [] });
  });

  it('fails when the item search fails', async () => {
    vi.mocked(searchItems).mockRejectedValue(new Error('Network error'));
    vi.mocked(searchCategories).mockResolvedValue(categories);
    renderHook(() => useSearch('apple'));
    act(() => vi.advanceTimersByTime(300));

    await expect(lastFetcher()()).rejects.toThrow('Network error');
  });

  it('provides a user-friendly error message', () => {
    renderHook(() => useSearch('apple'));
    act(() => vi.advanceTimersByTime(300));

    expect(mockUseApiQuery).toHaveBeenLastCalledWith(
      expect.any(Function),
      expect.any(Array),
      expect.objectContaining({
        errorMessage: "Couldn't load search results. Try again.",
      }),
    );
  });
});
