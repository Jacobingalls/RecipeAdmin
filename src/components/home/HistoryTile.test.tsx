import type { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { UseApiQueryResult } from '../../hooks/useApiQuery';
import type { ApiLogEntry, ApiProductSummary, ApiGroupSummary } from '../../api';
import * as api from '../../api';
import { useApiQuery } from '../../hooks';

import HistoryTile from './HistoryTile';

vi.mock('../../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../../api', async () => {
  const actual = await vi.importActual('../../api');
  return {
    ...actual,
    getProduct: vi.fn(),
    getGroup: vi.fn(),
    deleteLog: vi.fn(),
  };
});

vi.mock('../common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
}));

vi.mock('../HistoryEntryRow', () => ({
  default: ({
    entry,
    name,
    onLogAgain,
    logAgainLoading,
    onEdit,
    editLoading,
    onDelete,
    deleteLoading,
  }: {
    entry: ApiLogEntry;
    name: string;
    onLogAgain: (entry: ApiLogEntry) => void;
    logAgainLoading: boolean;
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
      data-log-again-loading={logAgainLoading}
    >
      <span>{name}</span>
      <button data-testid={`log-again-${entry.id}`} onClick={() => onLogAgain(entry)}>
        Log again
      </button>
      <button data-testid={`edit-${entry.id}`} onClick={() => onEdit(entry)}>
        Edit
      </button>
      <button data-testid={`delete-${entry.id}`} onClick={() => onDelete(entry)}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock('../LogModal', () => ({
  default: ({
    target,
    onClose,
    onSaved,
  }: {
    target: Record<string, unknown> | null;
    onClose: () => void;
    onSaved?: () => void;
  }) =>
    target ? (
      <div
        data-testid="log-modal"
        data-has-edit-entry-id={String('editEntryId' in target && !!target.editEntryId)}
      >
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
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders empty state when no logs', () => {
    mockQueries({
      logs: { data: [] },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
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

  it('renders HistoryEntryRow for each entry', () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    expect(screen.getByTestId('entry-row-log2')).toBeInTheDocument();
  });

  it('passes resolved names to HistoryEntryRow', () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    renderWithRouter(<HistoryTile />);
    expect(screen.getByTestId('entry-row-log1')).toHaveAttribute('data-name', 'Oats');
    expect(screen.getByTestId('entry-row-log2')).toHaveAttribute('data-name', 'Breakfast Bowl');
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

  it('opens edit modal after clicking Edit on a product entry', async () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    mockGetProduct.mockResolvedValue({
      id: 'p1',
      name: 'Oats',
      preparations: [
        {
          id: 'prep1',
          nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
          mass: { amount: 40, unit: 'g' },
          customSizes: [],
        },
      ],
    });

    renderWithRouter(<HistoryTile />);

    fireEvent.click(screen.getByTestId('edit-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    expect(mockGetProduct).toHaveBeenCalledWith('p1');
  });

  it('opens edit modal after clicking Edit on a group entry', async () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    mockGetGroup.mockResolvedValue({
      id: 'g1',
      name: 'Breakfast Bowl',
      items: [],
    });

    renderWithRouter(<HistoryTile />);

    fireEvent.click(screen.getByTestId('edit-log2'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    expect(mockGetGroup).toHaveBeenCalledWith('g1');
  });

  it('opens log-again modal without editEntryId on a product entry', async () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    mockGetProduct.mockResolvedValue({
      id: 'p1',
      name: 'Oats',
      preparations: [
        {
          id: 'prep1',
          nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
          mass: { amount: 40, unit: 'g' },
          customSizes: [],
        },
      ],
    });

    renderWithRouter(<HistoryTile />);

    fireEvent.click(screen.getByTestId('log-again-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    expect(screen.getByTestId('log-modal')).toHaveAttribute('data-has-edit-entry-id', 'false');
    expect(mockGetProduct).toHaveBeenCalledWith('p1');
  });

  it('opens log-again modal without editEntryId on a group entry', async () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    mockGetGroup.mockResolvedValue({
      id: 'g1',
      name: 'Breakfast Bowl',
      items: [],
    });

    renderWithRouter(<HistoryTile />);

    fireEvent.click(screen.getByTestId('log-again-log2'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    expect(screen.getByTestId('log-modal')).toHaveAttribute('data-has-edit-entry-id', 'false');
    expect(mockGetGroup).toHaveBeenCalledWith('g1');
  });

  it('calls refetch when onSaved is triggered', async () => {
    const refetchLogs = vi.fn();
    mockUseApiQuery.mockImplementation((fetchFn) => {
      const fnName = fetchFn.name || fetchFn.toString();
      if (fnName.includes('getLogs') || fnName === 'getLogs') {
        return {
          data: sampleLogs,
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
          id: 'prep1',
          nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
          mass: { amount: 40, unit: 'g' },
          customSizes: [],
        },
      ],
    });

    renderWithRouter(<HistoryTile />);

    fireEvent.click(screen.getByTestId('edit-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('modal-saved'));
    expect(refetchLogs).toHaveBeenCalled();
  });

  it('calls deleteLog and refetches when Delete is clicked', async () => {
    const refetchLogs = vi.fn();
    mockUseApiQuery.mockImplementation((fetchFn) => {
      const fnName = fetchFn.name || fetchFn.toString();
      if (fnName.includes('getLogs') || fnName === 'getLogs') {
        return {
          data: sampleLogs,
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

    renderWithRouter(<HistoryTile />);

    fireEvent.click(screen.getByTestId('delete-log1'));

    await waitFor(() => {
      expect(mockDeleteLog).toHaveBeenCalledWith('log1');
    });
    await waitFor(() => {
      expect(refetchLogs).toHaveBeenCalled();
    });
  });

  it('closes modal when onClose is triggered', async () => {
    mockQueries({
      logs: { data: sampleLogs },
      products: { data: sampleProducts },
      groups: { data: sampleGroups },
    });
    mockGetProduct.mockResolvedValue({
      id: 'p1',
      name: 'Oats',
      preparations: [
        {
          id: 'prep1',
          nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
          mass: { amount: 40, unit: 'g' },
          customSizes: [],
        },
      ],
    });

    renderWithRouter(<HistoryTile />);

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
