import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import type { ApiLogEntry, ApiProduct } from '../../api';
import type { NutritionInformation, ProductGroupData } from '../../domain';

import HistoryDayGroup from './HistoryDayGroup';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../HistoryEntryRow', () => ({
  default: ({
    entry,
    name,
    calories,
  }: {
    entry: ApiLogEntry;
    name: string;
    calories: number | null;
  }) => (
    <div data-testid={`entry-row-${entry.id}`} data-name={name} data-calories={calories}>
      {name}
    </div>
  ),
}));

vi.mock('../common', async () => {
  const actual = await vi.importActual('../common');
  return {
    ...actual,
    SubsectionTitle: ({
      children,
      ...props
    }: { children: ReactElement } & Record<string, unknown>) => (
      <h5 data-testid="subsection-title" {...props}>
        {children}
      </h5>
    ),
  };
});

function renderWithRouter(ui: ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/test']}>
      <Routes>
        <Route path="/test" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

function makeEntry(id: string, productID = 'p1'): ApiLogEntry {
  return {
    id,
    timestamp: Date.now() / 1000 - 5 * 60,
    item: {
      kind: 'product',
      productID,
      servingSize: { kind: 'servings', amount: 1 },
    },
  };
}

const defaultProductDetails: Record<string, ApiProduct> = {
  p1: {
    id: 'p1',
    name: 'Oats',
    brand: 'BrandA',
    preparations: [
      { id: 'prep-1', nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } } },
    ],
  },
};

const defaultGroupDetails: Record<string, ProductGroupData> = {};

const defaultNutritionById = new Map<string, NutritionInformation>();

const defaultDayNutrition: NutritionInformation = {
  calories: { amount: 450, unit: 'kcal' },
};

describe('HistoryDayGroup', () => {
  const entries = [makeEntry('e1'), makeEntry('e2')];
  const defaultProps = {
    dayHeading: 'Today',
    dayNutrition: defaultDayNutrition,
    entries,
    productDetails: defaultProductDetails,
    groupDetails: defaultGroupDetails,
    entryNutritionById: defaultNutritionById,
    onViewFullNutrition: vi.fn(),
    onLogAgain: vi.fn(),
    logAgainLoadingId: null,
    onEdit: vi.fn(),
    editLoadingId: null,
    onDelete: vi.fn(),
    deleteLoadingId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the day heading', () => {
    renderWithRouter(<HistoryDayGroup {...defaultProps} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders calorie total', () => {
    renderWithRouter(<HistoryDayGroup {...defaultProps} />);
    expect(screen.getByText(/450 kcal total/)).toBeInTheDocument();
  });

  it('renders 0 kcal when dayNutrition is undefined', () => {
    renderWithRouter(<HistoryDayGroup {...defaultProps} dayNutrition={undefined} />);
    expect(screen.getByText(/0 kcal total/)).toBeInTheDocument();
  });

  it('renders an entry row for each entry', () => {
    renderWithRouter(<HistoryDayGroup {...defaultProps} />);
    expect(screen.getByTestId('entry-row-e1')).toBeInTheDocument();
    expect(screen.getByTestId('entry-row-e2')).toBeInTheDocument();
  });

  it('renders the "View full nutrition" button', () => {
    renderWithRouter(<HistoryDayGroup {...defaultProps} />);
    const btn = screen.getByRole('button', { name: /View full nutrition/ });
    expect(btn).toBeInTheDocument();
  });

  it('calls onViewFullNutrition when the button is clicked', () => {
    const onViewFullNutrition = vi.fn();
    renderWithRouter(
      <HistoryDayGroup {...defaultProps} onViewFullNutrition={onViewFullNutrition} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /View full nutrition/ }));
    expect(onViewFullNutrition).toHaveBeenCalledTimes(1);
  });

  it('renders a list-group container for entries', () => {
    const { container } = renderWithRouter(<HistoryDayGroup {...defaultProps} />);
    expect(container.querySelector('.list-group')).toBeInTheDocument();
  });

  it('renders no entry rows when entries array is empty', () => {
    renderWithRouter(<HistoryDayGroup {...defaultProps} entries={[]} />);
    expect(screen.queryByTestId(/entry-row-/)).not.toBeInTheDocument();
  });
});
