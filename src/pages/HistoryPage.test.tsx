import type { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiLogEntry, ApiProductSummary, ApiGroupSummary } from '../api';
import * as api from '../api';
import { useApiQuery } from '../hooks';

import HistoryPage from './HistoryPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    getProduct: vi.fn(),
    getGroup: vi.fn(),
    deleteLog: vi.fn(),
  };
});

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

vi.mock('../components/HistoryEntryRow', () => ({
  default: ({
    entry,
    name,
    onEdit,
    editLoading,
    onDelete,
    deleteLoading,
  }: {
    entry: ApiLogEntry;
    name: string;
    onEdit: (entry: ApiLogEntry) => void;
    editLoading: boolean;
    onDelete: (entry: ApiLogEntry) => void;
    deleteLoading: boolean;
  }) => (
    <div
      data-testid={`entry-row-${entry.id}`}
      data-name={name}
      data-edit-loading={editLoading}
      data-delete-loading={deleteLoading}
    >
      <span>{name}</span>
      <button data-testid={`edit-${entry.id}`} onClick={() => onEdit(entry)}>
        Edit
      </button>
      <button data-testid={`delete-${entry.id}`} onClick={() => onDelete(entry)}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock('../components/LogModal', () => ({
  default: ({
    target,
    onClose,
    onSaved,
  }: {
    target: unknown;
    onClose: () => void;
    onSaved?: () => void;
  }) =>
    target ? (
      <div data-testid="log-modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {onSaved && (
          <button data-testid="modal-saved" onClick={onSaved}>
            Saved
          </button>
        )}
      </div>
    ) : null,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockGetProduct = vi.mocked(api.getProduct);
const mockGetGroup = vi.mocked(api.getGroup);
const mockDeleteLog = vi.mocked(api.deleteLog);

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
    expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
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

  it('passes resolved name to HistoryEntryRow', () => {
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
    expect(screen.getByTestId('entry-row-log1')).toHaveAttribute('data-name', 'Oats');
  });

  it('passes group name to HistoryEntryRow for group entries', () => {
    const today = new Date();
    const groupEntry = makeEntry({
      id: 'log2',
      timestamp: today.getTime() / 1000,
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    });
    mockQueries({
      logs: { data: [groupEntry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryPage />);
    expect(screen.getByTestId('entry-row-log2')).toHaveAttribute('data-name', 'Breakfast Bowl');
  });

  it('opens edit modal after clicking Edit on a product entry', async () => {
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
      item: {
        kind: 'product',
        productID: 'p1',
        preparationID: 'prep-1',
        servingSize: { kind: 'servings', amount: 2 },
      },
    });
    mockQueries({
      logs: { data: [entry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    mockGetProduct.mockResolvedValue({
      id: 'p1',
      name: 'Oats',
      preparations: [
        {
          id: 'prep-1',
          nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
          mass: { amount: 40, unit: 'g' },
          customSizes: [],
        },
      ],
    });

    renderWithRouter(<HistoryPage />);

    fireEvent.click(screen.getByTestId('edit-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    expect(mockGetProduct).toHaveBeenCalledWith('p1');
  });

  it('opens edit modal after clicking Edit on a group entry', async () => {
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
      item: {
        kind: 'group',
        groupID: 'g1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    });
    mockQueries({
      logs: { data: [entry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    mockGetGroup.mockResolvedValue({
      id: 'g1',
      name: 'Breakfast Bowl',
      items: [],
    });

    renderWithRouter(<HistoryPage />);

    fireEvent.click(screen.getByTestId('edit-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    expect(mockGetGroup).toHaveBeenCalledWith('g1');
  });

  it('calls refetch when onSaved is triggered', async () => {
    const refetchLogs = vi.fn();
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
      item: {
        kind: 'product',
        productID: 'p1',
        preparationID: 'prep-1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    });
    mockUseApiQuery.mockImplementation((fetchFn) => {
      const fnName = fetchFn.name || fetchFn.toString();
      if (fnName.includes('getLogs') || fnName === 'getLogs') {
        return {
          data: [entry],
          loading: false,
          error: null,
          refetch: refetchLogs,
        } as UseApiQueryResult<unknown>;
      }
      if (fnName.includes('listProducts') || fnName === 'listProducts') {
        return {
          data: sampleProducts,
          loading: false,
          error: null,
          refetch: vi.fn(),
        } as UseApiQueryResult<unknown>;
      }
      if (fnName.includes('listGroups') || fnName === 'listGroups') {
        return {
          data: sampleGroups,
          loading: false,
          error: null,
          refetch: vi.fn(),
        } as UseApiQueryResult<unknown>;
      }
      return defaultResult as UseApiQueryResult<unknown>;
    });
    mockGetProduct.mockResolvedValue({
      id: 'p1',
      name: 'Oats',
      preparations: [
        {
          id: 'prep-1',
          nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
          mass: { amount: 40, unit: 'g' },
          customSizes: [],
        },
      ],
    });

    renderWithRouter(<HistoryPage />);

    fireEvent.click(screen.getByTestId('edit-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('modal-saved'));
    expect(refetchLogs).toHaveBeenCalled();
  });

  it('calls deleteLog and refetches when Delete is clicked', async () => {
    const refetchLogs = vi.fn();
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
    });
    mockUseApiQuery.mockImplementation((fetchFn) => {
      const fnName = fetchFn.name || fetchFn.toString();
      if (fnName.includes('getLogs') || fnName === 'getLogs') {
        return {
          data: [entry],
          loading: false,
          error: null,
          refetch: refetchLogs,
        } as UseApiQueryResult<unknown>;
      }
      if (fnName.includes('listProducts') || fnName === 'listProducts') {
        return {
          data: sampleProducts,
          loading: false,
          error: null,
          refetch: vi.fn(),
        } as UseApiQueryResult<unknown>;
      }
      if (fnName.includes('listGroups') || fnName === 'listGroups') {
        return {
          data: sampleGroups,
          loading: false,
          error: null,
          refetch: vi.fn(),
        } as UseApiQueryResult<unknown>;
      }
      return defaultResult as UseApiQueryResult<unknown>;
    });
    mockDeleteLog.mockResolvedValue(undefined);

    renderWithRouter(<HistoryPage />);

    fireEvent.click(screen.getByTestId('delete-log1'));

    await waitFor(() => {
      expect(mockDeleteLog).toHaveBeenCalledWith('log1');
    });
    await waitFor(() => {
      expect(refetchLogs).toHaveBeenCalled();
    });
  });

  it('closes modal when onClose is triggered', async () => {
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
      item: {
        kind: 'product',
        productID: 'p1',
        preparationID: 'prep-1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    });
    mockQueries({
      logs: { data: [entry] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    mockGetProduct.mockResolvedValue({
      id: 'p1',
      name: 'Oats',
      preparations: [
        {
          id: 'prep-1',
          nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
          mass: { amount: 40, unit: 'g' },
          customSizes: [],
        },
      ],
    });

    renderWithRouter(<HistoryPage />);

    fireEvent.click(screen.getByTestId('edit-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('modal-close'));

    await waitFor(() => {
      expect(screen.queryByTestId('log-modal')).not.toBeInTheDocument();
    });
  });
});
