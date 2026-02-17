import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { UseHistoryDataResult } from '../../hooks/useHistoryData';
import type { ApiLogEntry } from '../../api';
import { NutritionInformation } from '../../domain';

import TodayTile from './TodayTile';

vi.mock('../../hooks', () => ({
  useHistoryData: vi.fn(),
}));

vi.mock('../common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ContentUnavailableView: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="content-unavailable-view" data-description={description}>
      {title}
    </div>
  ),
}));

vi.mock('./SparklineCard', () => ({
  default: ({
    label,
    unit,
    currentAmount,
    goal,
  }: {
    label: string;
    unit: string;
    currentAmount: number;
    goal: string;
  }) => (
    <div
      data-testid={`sparkline-card-${label.toLowerCase()}`}
      data-unit={unit}
      data-amount={currentAmount}
      data-goal={goal}
    >
      {label}
    </div>
  ),
}));

vi.mock('../HistoryEntryRow', () => ({
  default: ({
    entry,
    name,
    timeDisplay,
  }: {
    entry: ApiLogEntry;
    name: string;
    timeDisplay?: string;
  }) => (
    <div data-testid={`entry-row-${entry.id}`} data-name={name} data-time-display={timeDisplay}>
      {name}
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

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const { useHistoryData } = vi.mocked(await import('../../hooks'));

const sampleProductDetails: Record<string, { id: string; name: string; brand?: string }> = {
  p1: { id: 'p1', name: 'Oats' },
  p2: { id: 'p2', name: 'Milk' },
};

const sampleGroupDetails: Record<string, { id: string; name: string }> = {
  g1: { id: 'g1', name: 'Breakfast Bowl' },
};

// Use timestamps relative to the start of today so they're always "today"
// regardless of what time the tests run.
const todayNoon = new Date();
todayNoon.setHours(12, 0, 0, 0);
const todayNoonEpoch = todayNoon.getTime() / 1000;

const sampleLogs: ApiLogEntry[] = [
  {
    id: 'log1',
    timestamp: todayNoonEpoch,
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
    timestamp: todayNoonEpoch - 3600,
    userID: 'u1',
    item: {
      kind: 'group',
      groupID: 'g1',
      servingSize: { kind: 'servings', amount: 1 },
    },
  },
];

const defaultResult: UseHistoryDataResult = {
  logs: null,
  productDetails: {},
  groupDetails: {},
  loading: false,
  error: null,
  refetchLogs: vi.fn(),
  entryNutritionById: new Map(),
  logTarget: null,
  logAgainLoadingId: null,
  editLoadingId: null,
  deleteLoadingId: null,
  handleLogAgainClick: vi.fn(),
  handleEditClick: vi.fn(),
  handleDeleteClick: vi.fn(),
  handleSaved: vi.fn(),
  handleModalClose: vi.fn(),
};

function mockHistoryData(overrides: Partial<UseHistoryDataResult>) {
  useHistoryData.mockReturnValue({ ...defaultResult, ...overrides });
}

function renderTile() {
  return render(
    <MemoryRouter>
      <TodayTile />
    </MemoryRouter>,
  );
}

describe('TodayTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockHistoryData({ loading: true });
    renderTile();
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockHistoryData({ error: "Couldn't load history. Try again later." });
    renderTile();
    const view = screen.getByTestId('content-unavailable-view');
    expect(view).toHaveTextContent("Couldn't load today's nutrition");
  });

  it('renders empty state when no logs', () => {
    mockHistoryData({ logs: [] });
    renderTile();
    const view = screen.getByTestId('content-unavailable-view');
    expect(view).toHaveTextContent('Nothing logged today');
    expect(view).toHaveAttribute(
      'data-description',
      'Log something to see your daily nutrition here.',
    );
  });

  it('renders empty state when logs is null', () => {
    mockHistoryData({ logs: null });
    renderTile();
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders the tile with "Today" title', () => {
    mockHistoryData({ logs: [] });
    renderTile();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders 7 sparkline cards in populated state', () => {
    const nutrition = new NutritionInformation({
      calories: { amount: 1500, unit: 'kcal' },
      protein: { amount: 45, unit: 'g' },
      totalFat: { amount: 60, unit: 'g' },
      totalCarbohydrate: { amount: 200, unit: 'g' },
      dietaryFiber: { amount: 20, unit: 'g' },
      totalSugars: { amount: 40, unit: 'g' },
      sodium: { amount: 1800, unit: 'mg' },
    });

    mockHistoryData({
      logs: [sampleLogs[0]],
      productDetails: sampleProductDetails,
      groupDetails: sampleGroupDetails,
      entryNutritionById: new Map([['log1', nutrition]]),
    });

    renderTile();

    expect(screen.getByTestId('sparkline-card-calories')).toBeInTheDocument();
    expect(screen.getByTestId('sparkline-card-protein')).toBeInTheDocument();
    expect(screen.getByTestId('sparkline-card-fat')).toBeInTheDocument();
    expect(screen.getByTestId('sparkline-card-carbs')).toBeInTheDocument();
    expect(screen.getByTestId('sparkline-card-fiber')).toBeInTheDocument();
    expect(screen.getByTestId('sparkline-card-sugar')).toBeInTheDocument();
    expect(screen.getByTestId('sparkline-card-sodium')).toBeInTheDocument();
  });

  it('passes correct amounts from aggregated nutrition', () => {
    const nutrition1 = new NutritionInformation({
      calories: { amount: 500, unit: 'kcal' },
      protein: { amount: 20, unit: 'g' },
    });
    const nutrition2 = new NutritionInformation({
      calories: { amount: 700, unit: 'kcal' },
      protein: { amount: 30, unit: 'g' },
    });

    mockHistoryData({
      logs: [sampleLogs[0], { ...sampleLogs[0], id: 'log2' }],
      productDetails: sampleProductDetails,
      groupDetails: sampleGroupDetails,
      entryNutritionById: new Map([
        ['log1', nutrition1],
        ['log2', nutrition2],
      ]),
    });

    renderTile();

    // 500 + 700 = 1200
    const caloriesCard = screen.getByTestId('sparkline-card-calories');
    expect(caloriesCard).toHaveAttribute('data-amount', '1200');

    // 20 + 30 = 50
    const proteinCard = screen.getByTestId('sparkline-card-protein');
    expect(proteinCard).toHaveAttribute('data-amount', '50');
  });

  it('calls useHistoryData with limitDays: 1', () => {
    mockHistoryData({ logs: [] });
    renderTile();
    expect(useHistoryData).toHaveBeenCalledWith({ limitDays: 1 });
  });

  it('renders a "History" link to /history', () => {
    mockHistoryData({ logs: [] });
    renderTile();
    const historyLink = screen.getByRole('link', { name: /History/ });
    expect(historyLink).toHaveAttribute('href', '/history');
  });

  it('renders history entry rows in populated state', () => {
    mockHistoryData({
      logs: sampleLogs,
      productDetails: sampleProductDetails,
      groupDetails: sampleGroupDetails,
    });
    renderTile();
    expect(screen.getByTestId('entry-row-log1')).toBeInTheDocument();
    expect(screen.getByTestId('entry-row-log2')).toBeInTheDocument();
  });

  it('passes resolved names to HistoryEntryRow', () => {
    mockHistoryData({
      logs: sampleLogs,
      productDetails: sampleProductDetails,
      groupDetails: sampleGroupDetails,
    });
    renderTile();
    expect(screen.getByTestId('entry-row-log1')).toHaveAttribute('data-name', 'Oats');
    expect(screen.getByTestId('entry-row-log2')).toHaveAttribute('data-name', 'Breakfast Bowl');
  });

  it('passes timeDisplay="time" to HistoryEntryRow', () => {
    mockHistoryData({
      logs: [sampleLogs[0]],
      productDetails: sampleProductDetails,
      groupDetails: sampleGroupDetails,
    });
    renderTile();
    expect(screen.getByTestId('entry-row-log1')).toHaveAttribute('data-time-display', 'time');
  });

  it('renders LogModal with logTarget from hook', () => {
    const mockTarget = { product: { id: 'p1' } };
    mockHistoryData({
      logs: [sampleLogs[0]],
      productDetails: sampleProductDetails,
      groupDetails: sampleGroupDetails,
      logTarget: mockTarget as UseHistoryDataResult['logTarget'],
    });
    renderTile();
    expect(screen.getByTestId('log-modal')).toBeInTheDocument();
  });

  it('does not render LogModal when logTarget is null', () => {
    mockHistoryData({
      logs: [sampleLogs[0]],
      productDetails: sampleProductDetails,
      groupDetails: sampleGroupDetails,
      logTarget: null,
    });
    renderTile();
    expect(screen.queryByTestId('log-modal')).not.toBeInTheDocument();
  });

  it('calls refetchLogs when refreshSignal changes', () => {
    const refetchLogs = vi.fn();
    mockHistoryData({ logs: [], refetchLogs });

    const { rerender } = render(
      <MemoryRouter>
        <TodayTile refreshSignal={0} />
      </MemoryRouter>,
    );

    expect(refetchLogs).not.toHaveBeenCalled();

    rerender(
      <MemoryRouter>
        <TodayTile refreshSignal={1} />
      </MemoryRouter>,
    );

    expect(refetchLogs).toHaveBeenCalledTimes(1);
  });

  it('does not call refetchLogs on initial render with refreshSignal', () => {
    const refetchLogs = vi.fn();
    mockHistoryData({ logs: [], refetchLogs });

    render(
      <MemoryRouter>
        <TodayTile refreshSignal={0} />
      </MemoryRouter>,
    );

    expect(refetchLogs).not.toHaveBeenCalled();
  });

  it('renders history rows newest to oldest', () => {
    mockHistoryData({
      logs: sampleLogs,
      productDetails: sampleProductDetails,
      groupDetails: sampleGroupDetails,
    });
    renderTile();

    const rows = screen.getAllByTestId(/^entry-row-/);
    // log1 is at noon, log2 is one hour earlier — newest first
    expect(rows[0]).toHaveAttribute('data-name', 'Oats');
    expect(rows[1]).toHaveAttribute('data-name', 'Breakfast Bowl');
  });

  it('shows empty state when backend returns only yesterday logs', () => {
    const yesterdayTimestamp = Date.now() / 1000 - 24 * 3600;
    const yesterdayLogs: ApiLogEntry[] = [
      {
        id: 'yesterday1',
        timestamp: yesterdayTimestamp,
        userID: 'u1',
        item: {
          kind: 'product',
          productID: 'p1',
          preparationID: 'prep1',
          servingSize: { kind: 'servings', amount: 1 },
        },
      },
    ];

    mockHistoryData({
      logs: yesterdayLogs,
      productDetails: sampleProductDetails,
      groupDetails: sampleGroupDetails,
    });

    renderTile();
    const view = screen.getByTestId('content-unavailable-view');
    expect(view).toHaveTextContent('Nothing logged today');
  });
});
