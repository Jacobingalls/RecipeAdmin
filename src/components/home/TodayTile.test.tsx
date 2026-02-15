import { render, screen } from '@testing-library/react';

import type { UseHistoryDataResult } from '../../hooks/useHistoryData';
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

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const { useHistoryData } = vi.mocked(await import('../../hooks'));

const defaultResult: UseHistoryDataResult = {
  logs: null,
  products: null,
  groups: null,
  loading: false,
  error: null,
  refetchLogs: vi.fn(),
  entryNutritionById: new Map(),
  logTarget: null,
  logAgainLoading: false,
  editLoading: false,
  deleteLoading: false,
  handleLogAgainClick: vi.fn(),
  handleEditClick: vi.fn(),
  handleDeleteClick: vi.fn(),
  handleSaved: vi.fn(),
  handleModalClose: vi.fn(),
};

function mockHistoryData(overrides: Partial<UseHistoryDataResult>) {
  useHistoryData.mockReturnValue({ ...defaultResult, ...overrides });
}

describe('TodayTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockHistoryData({ loading: true });
    render(<TodayTile />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockHistoryData({ error: "Couldn't load history. Try again later." });
    render(<TodayTile />);
    const view = screen.getByTestId('content-unavailable-view');
    expect(view).toHaveTextContent("Couldn't load today's nutrition");
  });

  it('renders empty state when no logs', () => {
    mockHistoryData({ logs: [] });
    render(<TodayTile />);
    const view = screen.getByTestId('content-unavailable-view');
    expect(view).toHaveTextContent('Nothing logged today');
    expect(view).toHaveAttribute(
      'data-description',
      'Log something to see your daily nutrition here.',
    );
  });

  it('renders empty state when logs is null', () => {
    mockHistoryData({ logs: null });
    render(<TodayTile />);
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders the tile with "Today" title', () => {
    mockHistoryData({ logs: [] });
    render(<TodayTile />);
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
      logs: [
        {
          id: 'log1',
          timestamp: Date.now() / 1000,
          userID: 'u1',
          item: {
            kind: 'product',
            productID: 'p1',
            servingSize: { kind: 'servings', amount: 1 },
          },
        },
      ],
      entryNutritionById: new Map([['log1', nutrition]]),
    });

    render(<TodayTile />);

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
      logs: [
        {
          id: 'log1',
          timestamp: Date.now() / 1000,
          userID: 'u1',
          item: {
            kind: 'product',
            productID: 'p1',
            servingSize: { kind: 'servings', amount: 1 },
          },
        },
        {
          id: 'log2',
          timestamp: Date.now() / 1000,
          userID: 'u1',
          item: {
            kind: 'product',
            productID: 'p2',
            servingSize: { kind: 'servings', amount: 1 },
          },
        },
      ],
      entryNutritionById: new Map([
        ['log1', nutrition1],
        ['log2', nutrition2],
      ]),
    });

    render(<TodayTile />);

    // 500 + 700 = 1200
    const caloriesCard = screen.getByTestId('sparkline-card-calories');
    expect(caloriesCard).toHaveAttribute('data-amount', '1200');

    // 20 + 30 = 50
    const proteinCard = screen.getByTestId('sparkline-card-protein');
    expect(proteinCard).toHaveAttribute('data-amount', '50');
  });

  it('calls useHistoryData with limitDays: 1', () => {
    mockHistoryData({ logs: [] });
    render(<TodayTile />);
    expect(useHistoryData).toHaveBeenCalledWith({ limitDays: 1 });
  });
});
