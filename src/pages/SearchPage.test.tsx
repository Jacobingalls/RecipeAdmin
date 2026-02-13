import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import type { UseSearchResult } from '../hooks/useSearch';
import { useSearch } from '../hooks';

import SearchPage from './SearchPage';

vi.mock('../hooks', async () => {
  const actual = await vi.importActual('../hooks');
  return {
    ...actual,
    useSearch: vi.fn(),
  };
});

vi.mock('../components/common', () => ({
  ContentUnavailableView: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="content-unavailable-view">
      <span>{title}</span>
      {description && <span>{description}</span>}
    </div>
  ),
}));

vi.mock('../components/search', () => ({
  SearchResults: ({
    query,
    loading,
    error,
    results,
  }: {
    query: string;
    loading: boolean;
    error: string | null;
    results: unknown;
  }) => (
    <div data-testid="search-results" data-query={query} data-loading={loading} data-error={error}>
      {results ? 'has results' : 'no results'}
    </div>
  ),
}));

vi.mock('../components/LogModal', () => ({
  default: ({ target }: { target: unknown }) => (
    <div data-testid="log-modal">{target ? 'open' : 'closed'}</div>
  ),
}));

const mockUseSearch = vi.mocked(useSearch);

function mockSearch(overrides: Partial<UseSearchResult> = {}) {
  mockUseSearch.mockReturnValue({
    results: null,
    loading: false,
    error: null,
    ...overrides,
  });
}

function renderSearchPage(route = '/search') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch();
  });

  it('shows empty state when no query is provided', () => {
    renderSearchPage();
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
    expect(screen.getByText('Search products and groups')).toBeInTheDocument();
  });

  it('renders SearchResults when query is provided', () => {
    renderSearchPage('/search?q=apple');
    expect(screen.getByTestId('search-results')).toBeInTheDocument();
    expect(screen.queryByTestId('content-unavailable-view')).not.toBeInTheDocument();
  });

  it('passes query from URL to useSearch', () => {
    renderSearchPage('/search?q=apple');
    expect(mockUseSearch).toHaveBeenCalledWith('apple');
  });

  it('passes empty query when no search param', () => {
    renderSearchPage();
    expect(mockUseSearch).toHaveBeenCalledWith('');
  });

  it('passes search state to SearchResults', () => {
    mockSearch({ loading: true, error: null, results: null });
    renderSearchPage('/search?q=test');
    const results = screen.getByTestId('search-results');
    expect(results).toHaveAttribute('data-loading', 'true');
  });

  it('passes query to SearchResults', () => {
    renderSearchPage('/search?q=banana');
    const results = screen.getByTestId('search-results');
    expect(results).toHaveAttribute('data-query', 'banana');
  });

  it('renders LogModal in closed state when query exists', () => {
    renderSearchPage('/search?q=test');
    expect(screen.getByTestId('log-modal')).toHaveTextContent('closed');
  });
});
