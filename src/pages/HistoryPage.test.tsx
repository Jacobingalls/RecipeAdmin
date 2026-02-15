import type { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import type { ApiLogEntry } from '../api';
import * as api from '../api';

import HistoryPage from './HistoryPage';

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    getLogs: vi.fn(),
    getProduct: vi.fn(),
    getGroup: vi.fn(),
    deleteLog: vi.fn(),
  };
});

vi.mock('../components/common', () => ({
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
  SubsectionTitle: ({ children }: { children: ReactElement }) => <h2>{children}</h2>,
}));

vi.mock('../components/HistoryEntryRow', () => ({
  default: ({
    entry,
    name,
    calories,
    onLogAgain,
    logAgainLoading,
    onEdit,
    editLoading,
    onDelete,
    deleteLoading,
  }: {
    entry: ApiLogEntry;
    name: string;
    calories: number | null;
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
      data-calories={calories === null ? 'null' : String(calories)}
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

vi.mock('../components/LogModal', () => ({
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

vi.mock('../components/DayNutritionModal', () => ({
  default: ({ dayLabel, onClose }: { dayLabel: string; onClose: () => void }) => (
    <div data-testid="day-nutrition-modal" data-day-label={dayLabel}>
      <button data-testid="close-day-nutrition-modal" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

const mockGetLogs = vi.mocked(api.getLogs);
const mockGetProduct = vi.mocked(api.getProduct);
const mockGetGroup = vi.mocked(api.getGroup);
const mockDeleteLog = vi.mocked(api.deleteLog);

// IntersectionObserver mock — reset each test to avoid stale callbacks
let intersectionCallback: IntersectionObserverCallback = () => {};

function renderWithRouter(ui: ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/history']}>
      <Routes>
        <Route path="/history" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

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

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    intersectionCallback = () => {};

    // Set up IntersectionObserver mock
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        callback: IntersectionObserverCallback;
        constructor(callback: IntersectionObserverCallback) {
          this.callback = callback;
          intersectionCallback = callback;
        }
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
      },
    );
  });

  it('renders heading and placeholder content while loading', () => {
    mockGetLogs.mockReturnValue(new Promise(() => {}));

    renderWithRouter(<HistoryPage />);
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByTestId('history-placeholder')).toBeInTheDocument();
  });

  it('renders heading and error state when logs fail to load', async () => {
    mockGetLogs.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<HistoryPage />);
    expect(screen.getByText('History')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });

  it('renders empty state when no logs', async () => {
    mockGetLogs.mockResolvedValue([]);

    renderWithRouter(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
    });
  });

  it('renders the History heading', async () => {
    mockGetLogs.mockResolvedValue([]);

    renderWithRouter(<HistoryPage />);
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('groups entries by day with "Today" heading', async () => {
    const todayEntry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
    });
    mockGetLogs.mockResolvedValue([todayEntry]);

    renderWithRouter(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
    expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
  });

  it('groups entries by day with "Yesterday" heading', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEntry = makeEntry({
      id: 'log1',
      timestamp: yesterday.getTime() / 1000,
    });
    mockGetLogs.mockResolvedValue([yesterdayEntry]);

    renderWithRouter(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByText('Yesterday')).toBeInTheDocument();
    });
  });

  it('shows date string for older entries', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 5);
    const oldEntry = makeEntry({
      id: 'log1',
      timestamp: oldDate.getTime() / 1000,
    });
    mockGetLogs.mockResolvedValue([oldEntry]);

    renderWithRouter(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByText(oldDate.toLocaleDateString())).toBeInTheDocument();
    });
  });

  it('passes resolved name to HistoryEntryRow', async () => {
    const todayEntry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
    });
    mockGetLogs.mockResolvedValue([todayEntry]);
    mockGetProduct.mockResolvedValue({ id: 'p1', name: 'Oats', preparations: [] });

    renderWithRouter(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toHaveAttribute('data-name', 'Oats');
    });
  });

  it('shows per-entry kcal, day total kcal, and opens day nutrition modal', async () => {
    const todayEntry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
      item: {
        kind: 'product',
        productID: 'p1',
        preparationID: 'prep-1',
        servingSize: { kind: 'servings', amount: 2 },
      },
    });

    mockGetLogs.mockResolvedValue([todayEntry]);

    mockGetProduct.mockResolvedValue({
      id: 'p1',
      name: 'Oats',
      preparations: [
        {
          id: 'prep-1',
          nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
        },
      ],
    });

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/200 kcal total/)).toBeInTheDocument();
    });
    expect(screen.getByTestId('entry-row-log1')).toHaveAttribute('data-calories', '200');

    fireEvent.click(screen.getByRole('button', { name: /View full nutrition/i }));
    expect(screen.getByTestId('day-nutrition-modal')).toHaveAttribute(
      'data-day-label',
      expect.stringContaining('Today'),
    );
  });

  it('passes group name to HistoryEntryRow for group entries', async () => {
    const today = new Date();
    const groupEntry = makeEntry({
      id: 'log2',
      timestamp: today.getTime() / 1000,
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    });
    mockGetLogs.mockResolvedValue([groupEntry]);
    mockGetGroup.mockResolvedValue({ id: 'g1', name: 'Breakfast Bowl', items: [] });

    renderWithRouter(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log2')).toHaveAttribute('data-name', 'Breakfast Bowl');
    });
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
    mockGetLogs.mockResolvedValue([entry]);

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

    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    });

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
    mockGetLogs.mockResolvedValue([entry]);

    mockGetGroup.mockResolvedValue({
      id: 'g1',
      name: 'Breakfast Bowl',
      items: [],
    });

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    expect(mockGetGroup).toHaveBeenCalledWith('g1');
  });

  it('opens log-again modal without editEntryId on a product entry', async () => {
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
    mockGetLogs.mockResolvedValue([entry]);

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

    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('log-again-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    expect(screen.getByTestId('log-modal')).toHaveAttribute('data-has-edit-entry-id', 'false');
    expect(mockGetProduct).toHaveBeenCalledWith('p1');
  });

  it('opens log-again modal without editEntryId on a group entry', async () => {
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
      item: {
        kind: 'group',
        groupID: 'g1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    });
    mockGetLogs.mockResolvedValue([entry]);

    mockGetGroup.mockResolvedValue({
      id: 'g1',
      name: 'Breakfast Bowl',
      items: [],
    });

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('log-again-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    expect(screen.getByTestId('log-modal')).toHaveAttribute('data-has-edit-entry-id', 'false');
    expect(mockGetGroup).toHaveBeenCalledWith('g1');
  });

  it('reloads history when onSaved is triggered', async () => {
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
    mockGetLogs.mockResolvedValue([entry]);

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

    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    // getLogs was called once for the initial load
    expect(mockGetLogs).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('modal-saved'));

    // After save, getLogs is called again (reset + reload)
    await waitFor(() => {
      expect(mockGetLogs).toHaveBeenCalledTimes(2);
    });
  });

  it('calls deleteLog and removes entry when Delete is clicked', async () => {
    const entry = makeEntry({
      id: 'log1',
      timestamp: Date.now() / 1000,
    });
    mockGetLogs.mockResolvedValue([entry]);

    mockDeleteLog.mockResolvedValue(undefined);

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-log1'));

    await waitFor(() => {
      expect(mockDeleteLog).toHaveBeenCalledWith('log1');
    });
    await waitFor(() => {
      expect(screen.queryByTestId('entry-row-log1')).not.toBeInTheDocument();
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
    mockGetLogs.mockResolvedValue([entry]);

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

    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-log1'));

    await waitFor(() => {
      expect(screen.getByTestId('log-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('modal-close'));

    await waitFor(() => {
      expect(screen.queryByTestId('log-modal')).not.toBeInTheDocument();
    });
  });

  it('loads more entries when sentinel becomes visible', async () => {
    // First week has entries, second week has older entries
    mockGetLogs
      .mockResolvedValueOnce([makeEntry({ id: 'log1', timestamp: Date.now() / 1000 })])
      .mockResolvedValueOnce([
        makeEntry({ id: 'log-older', timestamp: Date.now() / 1000 - 86400 * 10 }),
      ]);

    renderWithRouter(<HistoryPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    });

    // Simulate sentinel becoming visible (triggers loadMore for next week)
    await act(async () => {
      intersectionCallback(
        [{ isIntersecting: true }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log-older')).toBeInTheDocument();
    });

    expect(mockGetLogs).toHaveBeenCalledTimes(2);
  });

  it('does not load more when previous week returned no entries', async () => {
    // First week has entries, second week is empty (signals end of history)
    mockGetLogs
      .mockResolvedValueOnce([makeEntry({ id: 'log1', timestamp: Date.now() / 1000 })])
      .mockResolvedValueOnce([]);

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    });

    // First loadMore fetches the empty week
    await act(async () => {
      intersectionCallback(
        [{ isIntersecting: true }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
    });

    await waitFor(() => {
      expect(mockGetLogs).toHaveBeenCalledTimes(2);
    });

    // Trigger again — should not load a third time since hasMore is false
    await act(async () => {
      intersectionCallback(
        [{ isIntersecting: true }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
    });

    expect(mockGetLogs).toHaveBeenCalledTimes(2);
  });
});
