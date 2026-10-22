import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiCategorySearchResult, ApiSearchResult } from '../../api';

import SearchResults from './SearchResults';

vi.mock('../common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
  SubsectionTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('./CategorySearchResults', () => ({
  default: ({ categories }: { categories: ApiCategorySearchResult[] }) => (
    <ul data-testid="category-search-results">
      {categories.map(({ category }) => (
        <li key={category.id}>{category.displayName}</li>
      ))}
    </ul>
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
    item: { product: { id: 'p1', name: 'Apple', preparations: [] } },
    servingSize: { kind: 'servings', amount: 1 },
    relevance: 1.0,
  },
  {
    item: { group: { id: 'g1', name: 'Fruit Mix' } },
    servingSize: { kind: 'servings', amount: 1 },
    relevance: 0.9,
  },
];

const sampleCategories: ApiCategorySearchResult[] = [
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
    relevance: 1,
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

  it('labels the results region', () => {
    renderSearchResults({ results: sampleResults, query: 'fruit' });
    expect(screen.getByRole('region', { name: 'Search results' })).toBeInTheDocument();
  });

  it('shows items without section headings when no category matches', () => {
    renderSearchResults({ results: sampleResults, categories: [], query: 'fruit' });
    expect(screen.queryByTestId('category-search-results')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('shows matching categories above items, each under a heading', () => {
    renderSearchResults({ results: sampleResults, categories: sampleCategories, query: 'fruit' });
    expect(screen.getByTestId('category-search-results')).toHaveTextContent('Fruit');
    expect(screen.getByRole('heading', { name: 'Products and groups' })).toBeInTheDocument();
    expect(
      screen
        .getByTestId('category-search-results')
        .compareDocumentPosition(screen.getAllByTestId('search-result-row')[0]),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('shows categories alone when no item matches', () => {
    renderSearchResults({ results: [], categories: sampleCategories, query: 'fruit' });
    expect(screen.getByTestId('category-search-results')).toBeInTheDocument();
    expect(screen.queryByTestId('content-unavailable-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('search-result-row')).not.toBeInTheDocument();
  });

  it('passes onLog to result items', () => {
    const onLog = vi.fn();
    renderSearchResults({ results: sampleResults, query: 'fruit', onLog });
    screen.getAllByTestId('search-result-row')[0].click();
    expect(onLog).toHaveBeenCalledWith(sampleResults[0]);
  });
});
