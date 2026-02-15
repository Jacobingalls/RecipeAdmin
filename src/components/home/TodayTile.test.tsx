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

  it('renders calories and macro bars with nutrition data', () => {
    const nutrition = new NutritionInformation({
      calories: { amount: 1500, unit: 'kcal' },
      protein: { amount: 45, unit: 'g' },
      totalFat: { amount: 60, unit: 'g' },
      totalCarbohydrate: { amount: 200, unit: 'g' },
      dietaryFiber: { amount: 20, unit: 'g' },
      sodium: { amount: 1800, unit: 'mg' },
    });

    const entryNutritionById = new Map([['log1', nutrition]]);

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
      entryNutritionById,
    });

    render(<TodayTile />);

    // Calories displayed prominently
    expect(screen.getByTestId('calories-value')).toHaveTextContent('1,500');
    expect(screen.getByText('of 2,000 kcal')).toBeInTheDocument();

    // Macro labels present
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('Fat')).toBeInTheDocument();
    expect(screen.getByText('Carbs')).toBeInTheDocument();
    expect(screen.getByText('Fiber')).toBeInTheDocument();
    expect(screen.getByText('Sodium')).toBeInTheDocument();
  });

  it('calculates correct %DV for each macro', () => {
    const nutrition = new NutritionInformation({
      calories: { amount: 1500, unit: 'kcal' },
      protein: { amount: 45, unit: 'g' }, // 45/50 = 90%
      totalFat: { amount: 60, unit: 'g' }, // 60/78 ≈ 77%
      totalCarbohydrate: { amount: 200, unit: 'g' }, // 200/275 ≈ 73%
      dietaryFiber: { amount: 20, unit: 'g' }, // 20/28 ≈ 71%
      sodium: { amount: 1800, unit: 'mg' }, // 1800/2300 ≈ 78%
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

    // Check %DV values
    const proteinRow = screen.getByTestId('macro-protein');
    expect(proteinRow).toHaveTextContent('90%');
    expect(proteinRow).toHaveTextContent('45g');

    const fatRow = screen.getByTestId('macro-totalFat');
    expect(fatRow).toHaveTextContent('77%');
    expect(fatRow).toHaveTextContent('60g');

    const carbsRow = screen.getByTestId('macro-totalCarbohydrate');
    expect(carbsRow).toHaveTextContent('73%');
    expect(carbsRow).toHaveTextContent('200g');

    const fiberRow = screen.getByTestId('macro-dietaryFiber');
    expect(fiberRow).toHaveTextContent('71%');
    expect(fiberRow).toHaveTextContent('20g');

    const sodiumRow = screen.getByTestId('macro-sodium');
    expect(sodiumRow).toHaveTextContent('78%');
    expect(sodiumRow).toHaveTextContent('1,800mg');
  });

  it('aggregates nutrition from multiple entries', () => {
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
    expect(screen.getByTestId('calories-value')).toHaveTextContent('1,200');

    // 20 + 30 = 50g protein → 50/50 = 100%
    const proteinRow = screen.getByTestId('macro-protein');
    expect(proteinRow).toHaveTextContent('50g');
    expect(proteinRow).toHaveTextContent('100%');
  });

  it('caps progress bar width at 100% for values exceeding DV', () => {
    const nutrition = new NutritionInformation({
      calories: { amount: 3000, unit: 'kcal' },
      sodium: { amount: 4600, unit: 'mg' }, // 200% DV
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

    // Text shows actual percentage
    const sodiumRow = screen.getByTestId('macro-sodium');
    expect(sodiumRow).toHaveTextContent('200%');

    // Progress bar capped at 100%
    const progressBar = sodiumRow.querySelector('.progress-bar') as HTMLElement;
    expect(progressBar.style.width).toBe('100%');
  });

  it('has accessible progress bars with aria attributes', () => {
    const nutrition = new NutritionInformation({
      calories: { amount: 1000, unit: 'kcal' },
      protein: { amount: 25, unit: 'g' },
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

    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBe(5);

    const proteinBar = screen.getByRole('progressbar', {
      name: 'Protein 50% of daily value',
    });
    expect(proteinBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('calls useHistoryData with limitDays: 1', () => {
    mockHistoryData({ logs: [] });
    render(<TodayTile />);
    expect(useHistoryData).toHaveBeenCalledWith({ limitDays: 1 });
  });
});
