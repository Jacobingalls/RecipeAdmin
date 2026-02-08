import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiLogEntry, ApiProductSummary, ApiGroupSummary } from '../api';
import { useApiQuery } from '../hooks';

import HistoryPage from './HistoryPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../components/common', () => ({
  BackButton: ({ to }: { to: string }) => (
    <a data-testid="back-button" href={to}>
      Back
    </a>
  ),
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  EmptyState: ({ message }: { message: string }) => <div data-testid="empty-state">{message}</div>,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

function renderWithRouter(ui: ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/history']}>
      <Routes>
        <Route path="/history" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

const sampleProducts: ApiProductSummary[] = [
  { id: 'p1', name: 'Oats' },
  { id: 'p2', name: 'Milk' },
];

const sampleGroups: ApiGroupSummary[] = [{ id: 'g1', name: 'Breakfast Bowl', items: [] }];

function makeEntry(
  overrides: Partial<ApiLogEntry> & { id: string; timestamp: number },
): ApiLogEntry {
  return {
    userID: 'u1',
    item: {
      kind: 'product',
      productID: 'p1',
      servingSize: { kind: 'servings', amount: 1 },
    },
    ...overrides,
  };
}

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

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockQueries({ logs: { loading: true } });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQueries({ logs: { error: 'Network error' } });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders empty state when no logs', () => {
    mockQueries({
      logs: { data: [] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders back button pointing to home', () => {
    mockQueries({
      logs: { data: [] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByTestId('back-button')).toHaveAttribute('href', '/');
  });

  it('renders the History heading', () => {
    mockQueries({
      logs: { data: [] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('groups entries by day with "Today" heading', () => {
    const todayEntry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
    });
    mockQueries({
      logs: { data: [todayEntry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Oats')).toBeInTheDocument();
  });

  it('groups entries by day with "Yesterday" heading', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEntry = makeEntry({
      id: 'log1',
      timestamp: yesterday.getTime() / 1000,
    });
    mockQueries({
      logs: { data: [yesterdayEntry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('shows date string for older entries', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 5);
    const oldEntry = makeEntry({
      id: 'log1',
      timestamp: oldDate.getTime() / 1000,
    });
    mockQueries({
      logs: { data: [oldEntry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByText(oldDate.toLocaleDateString())).toBeInTheDocument();
  });

  it('renders entries under correct day groups', () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todayEntry = makeEntry({
      id: 'log1',
      timestamp: today.getTime() / 1000,
      item: { kind: 'product', productID: 'p1', servingSize: { kind: 'servings', amount: 2 } },
    });
    const yesterdayEntry = makeEntry({
      id: 'log2',
      timestamp: yesterday.getTime() / 1000,
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    });

    mockQueries({
      logs: { data: [todayEntry, yesterdayEntry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Oats')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('Breakfast Bowl')).toBeInTheDocument();
  });

  it('renders serving size descriptions', () => {
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
      item: { kind: 'product', productID: 'p1', servingSize: { kind: 'servings', amount: 3 } },
    });
    mockQueries({
      logs: { data: [entry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByText('3 servings')).toBeInTheDocument();
  });

  it('links entries to their detail pages', () => {
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
      item: { kind: 'product', productID: 'p1', servingSize: { kind: 'servings', amount: 1 } },
    });
    mockQueries({
      logs: { data: [entry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    const link = screen.getByRole('link', { name: /Oats/ });
    expect(link).toHaveAttribute('href', '/products/p1');
  });

  it('resolves group entry names and links', () => {
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    });
    mockQueries({
      logs: { data: [entry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    const link = screen.getByRole('link', { name: /Breakfast Bowl/ });
    expect(link).toHaveAttribute('href', '/groups/g1');
  });
});
