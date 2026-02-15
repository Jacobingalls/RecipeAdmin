import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiSearchResult } from '../../api';

import SearchResults from './SearchResults';

vi.mock('../common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
}));

vi.mock('../SearchResultRow', () => ({
  default: ({
    result,
    onLog,
  }: {
    result: ApiSearchResult;
    onLog?: (result: ApiSearchResult) => void;
  }) => (
    <button type="button" data-testid="search-result-row" onClick={() => onLog?.(result)}>
      {result.item.product?.name ?? result.item.group?.name}
    </button>
  ),
}));

const sampleResults: ApiSearchResult[] = [
  {
    item: { product: { id: 'p1', name: 'Apple' } },
    servingSize: { kind: 'servings', amount: 1 },
    relevance: 1.0,
  },
  {
    item: { group: { id: 'g1', name: 'Fruit Mix' } },
    servingSize: { kind: 'servings', amount: 1 },
    relevance: 0.9,
  },
];

function renderSearchResults(props: Partial<Parameters<typeof SearchResults>[0]> = {}) {
  const defaultProps = {
    results: null,
    loading: false,
    error: null,
    query: '',
    ...props,
  };
  return render(
    <MemoryRouter>
      <SearchResults {...defaultProps} />
    </MemoryRouter>,
  );
}

describe('SearchResults', () => {
  it('renders loading state', () => {
    renderSearchResults({ loading: true });
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    renderSearchResults({ error: 'Something went wrong' });
    expect(screen.getByTestId('error-state')).toHaveTextContent('Something went wrong');
  });

  it('renders nothing when query is too short', () => {
    const { container } = renderSearchResults({ query: 'a' });
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when query is empty', () => {
    const { container } = renderSearchResults({ query: '' });
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when query is only whitespace', () => {
    const { container } = renderSearchResults({ query: '   ' });
    expect(container.innerHTML).toBe('');
  });

  it('renders empty state when results are empty', () => {
    renderSearchResults({ results: [], query: 'apple' });
    expect(screen.getByTestId('content-unavailable-view')).toHaveTextContent('No results');
  });

  it('renders result items', () => {
    renderSearchResults({ results: sampleResults, query: 'fruit' });
    const items = screen.getAllByTestId('search-result-row');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Apple');
    expect(items[1]).toHaveTextContent('Fruit Mix');
  });

  it('renders nothing when results is null with a valid query', () => {
    const { container } = renderSearchResults({ results: null, query: 'apple' });
    expect(container.innerHTML).toBe('');
  });

  it('wraps results in a list-group with aria-label', () => {
    renderSearchResults({ results: sampleResults, query: 'fruit' });
    expect(screen.getByRole('region', { name: 'Search results' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Search results' })).toHaveClass('list-group');
  });

  it('passes onLog to result items', () => {
    const onLog = vi.fn();
    renderSearchResults({ results: sampleResults, query: 'fruit', onLog });
    screen.getAllByTestId('search-result-row')[0].click();
    expect(onLog).toHaveBeenCalledWith(sampleResults[0]);
  });
});
