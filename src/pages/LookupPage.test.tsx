import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiSearchResult } from '../api';
import { useApiQuery } from '../hooks';

import LookupPage from './LookupPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
}));

vi.mock('../components/SearchResultRow', () => ({
  default: () => <div data-testid="search-result-row" />,
}));

vi.mock('../components/LogModal', () => ({
  default: ({ target }: { target: unknown }) => (
    <div data-testid="log-modal">{target ? 'open' : 'closed'}</div>
  ),
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/lookup/:barcode?" element={<LookupPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockQuery(overrides: Partial<UseApiQueryResult<ApiSearchResult[]>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ApiSearchResult[]>);
}

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

describe('LookupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders prompt when no barcode is provided', () => {
    mockQuery({});
    renderWithRoute('/lookup');
    expect(screen.getByText('Enter a barcode in the search box above')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockQuery({ loading: true });
    renderWithRoute('/lookup/123456');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQuery({ error: 'Not found' });
    renderWithRoute('/lookup/123456');
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Not found')).toBeInTheDocument();
  });

  it('renders empty state when results are empty', () => {
    mockQuery({ data: [] });
    renderWithRoute('/lookup/123456');
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('displays the barcode in results text', () => {
    mockQuery({ data: sampleResults });
    renderWithRoute('/lookup/123456');
    expect(screen.getByText(/Results for:/)).toBeInTheDocument();
    const resultsText = screen.getByText(/Results for:/).closest('p');
    expect(resultsText).toHaveTextContent('123456');
  });

  it('renders result items in a list-group', () => {
    mockQuery({ data: sampleResults });
    renderWithRoute('/lookup/123456');
    const items = screen.getAllByTestId('search-result-row');
    expect(items).toHaveLength(2);
  });

  it('renders the heading', () => {
    mockQuery({});
    renderWithRoute('/lookup');
    expect(screen.getByText('Lookup')).toBeInTheDocument();
  });

  it('passes barcode to useApiQuery with enabled flag', () => {
    mockQuery({});
    renderWithRoute('/lookup/999');
    expect(mockUseApiQuery).toHaveBeenCalledWith(expect.any(Function), ['999'], {
      enabled: true,
      errorMessage: "Couldn't look up this barcode. Try again later.",
    });
  });

  it('disables query when no barcode', () => {
    mockQuery({});
    renderWithRoute('/lookup');
    expect(mockUseApiQuery).toHaveBeenCalledWith(expect.any(Function), [undefined], {
      enabled: false,
      errorMessage: "Couldn't look up this barcode. Try again later.",
    });
  });

  it('renders LogModal in closed state', () => {
    mockQuery({ data: sampleResults });
    renderWithRoute('/lookup/123456');
    expect(screen.getByTestId('log-modal')).toHaveTextContent('closed');
  });

  it('renders single result without redirecting', () => {
    mockQuery({
      data: [
        {
          item: { product: { id: 'p1', name: 'Apple' } },
          servingSize: { kind: 'servings', amount: 1 },
          relevance: 1.0,
        },
      ],
    });
    renderWithRoute('/lookup/123456');
    expect(screen.getByTestId('search-result-row')).toBeInTheDocument();
  });
});
