import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { UseApiQueryResult } from '../../hooks/useApiQuery';
import type { ApiLogEntry, ApiProductSummary, ApiGroupSummary } from '../../api';
import { useApiQuery } from '../../hooks';

import HistoryTile from './HistoryTile';

vi.mock('../../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  EmptyState: ({ message }: { message: string }) => <div data-testid="empty-state">{message}</div>,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const sampleProducts: ApiProductSummary[] = [
  { id: 'p1', name: 'Oats' },
  { id: 'p2', name: 'Milk' },
];

const sampleGroups: ApiGroupSummary[] = [{ id: 'g1', name: 'Breakfast Bowl', items: [] }];

const sampleLogs: ApiLogEntry[] = [
  {
    id: 'log1',
    timestamp: Date.now() / 1000 - 5 * 60,
    userID: 'u1',
    item: {
      kind: 'product',
      productID: 'p1',
      preparationID: 'prep1',
      servingSize: { kind: 'servings', amount: 2 },
    },
  },
  {
    id: 'log2',
    timestamp: Date.now() / 1000 - 2 * 3600,
    userID: 'u1',
    item: {
      kind: 'group',
      groupID: 'g1',
      servingSize: { kind: 'servings', amount: 1 },
    },
  },
];

const defaultResult = {
  data: null,
  loading: false,
  error: null,
  refetch: vi.fn(),
};

function mockQueries(overrides: {
  logs?: Partial<UseApiQueryResult<ApiLogEntry[]>>;
  products?: Partial<UseApiQueryResult<ApiProductSummary[]>>;
  groups?: Partial<UseApiQueryResult<ApiGroupSummary[]>>;
}) {
  mockUseApiQuery.mockImplementation((fetchFn) => {
    const fnName = fetchFn.name || fetchFn.toString();
    if (fnName.includes('getLogs') || fnName === 'getLogs') {
      return { ...defaultResult, ...overrides.logs } as UseApiQueryResult<unknown>;
    }
    if (fnName.includes('listProducts') || fnName === 'listProducts') {
      return { ...defaultResult, ...overrides.products } as UseApiQueryResult<unknown>;
    }
    if (fnName.includes('listGroups') || fnName === 'listGroups') {
      return { ...defaultResult, ...overrides.groups } as UseApiQueryResult<unknown>;
    }
    return defaultResult as UseApiQueryResult<unknown>;
  });
}

describe('HistoryTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when logs are loading', () => {
    mockQueries({ logs: { loading: true } });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders loading state when products are loading', () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { loading: true },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state on logs error', () => {
    mockQueries({ logs: { error: 'Failed to fetch logs' } });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch logs')).toBeInTheDocument();
  });

  it('renders empty state when no logs', () => {
    mockQueries({
      logs: { data: [] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders log entries with resolved names', () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByText('Oats')).toBeInTheDocument();
    expect(screen.getByText('Breakfast Bowl')).toBeInTheDocument();
  });

  it('renders serving size descriptions', () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByText('2 servings')).toBeInTheDocument();
    expect(screen.getByText('1 serving')).toBeInTheDocument();
  });

  it('renders relative timestamps', () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByText('5m ago')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('links product entries to product detail page', () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/products/p1');
  });

  it('links group entries to group detail page', () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    const links = screen.getAllByRole('link');
    expect(links[1]).toHaveAttribute('href', '/groups/g1');
  });

  it('shows "Unknown Product" when product not found', () => {
    const logsWithUnknown: ApiLogEntry[] = [
      {
        id: 'log3',
        timestamp: Date.now() / 1000,
        userID: 'u1',
        item: {
          kind: 'product',
          productID: 'missing',
          servingSize: { kind: 'servings', amount: 1 },
        },
      },
    ];
    mockQueries({
      logs: { data: logsWithUnknown },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByText('Unknown Product')).toBeInTheDocument();
  });

  it('shows "Unknown Group" when group not found', () => {
    const logsWithUnknown: ApiLogEntry[] = [
      {
        id: 'log4',
        timestamp: Date.now() / 1000,
        userID: 'u1',
        item: {
          kind: 'group',
          groupID: 'missing',
          servingSize: { kind: 'servings', amount: 1 },
        },
      },
    ];
    mockQueries({
      logs: { data: logsWithUnknown },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByText('Unknown Group')).toBeInTheDocument();
  });

  it('renders the tile with "History" title', () => {
    mockQueries({
      logs: { data: [] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('renders a "View all" link to /history', () => {
    mockQueries({
      logs: { data: [] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    const viewAllLink = screen.getByRole('link', { name: /View all/ });
    expect(viewAllLink).toHaveAttribute('href', '/history');
  });
});
