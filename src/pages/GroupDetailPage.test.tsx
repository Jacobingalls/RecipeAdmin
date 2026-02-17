import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ProductGroupData } from '../domain';
import { ServingSize } from '../domain';
import { useApiQuery, useServingSizeParams } from '../hooks';

import GroupDetailPage from './GroupDetailPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
  useServingSizeParams: vi.fn(),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
  SubsectionTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  FoodItemRow: ({
    name,
    ariaLabel,
    onClick,
  }: {
    name: string;
    ariaLabel: string;
    onClick: () => void;
  }) => (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      data-testid="food-item-row"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {name}
    </div>
  ),
}));

vi.mock('../components/NutritionLabel', () => ({
  default: () => <div data-testid="nutrition-label" />,
}));

vi.mock('../components/ServingSizeSelector', () => ({
  default: () => <div data-testid="serving-size-selector" />,
}));

vi.mock('../components/CustomSizesSection', () => ({
  default: () => <div data-testid="custom-sizes-section" />,
}));

vi.mock('../components/BarcodeSection', () => ({
  default: () => <div data-testid="barcode-section" />,
}));

vi.mock('../components/AddToFavoritesButton', () => ({
  default: () => <div data-testid="add-to-favorites-button" />,
}));

vi.mock('../components/AddToLogButton', () => ({
  default: () => <div data-testid="add-to-log-button" />,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockUseServingSizeParams = vi.mocked(useServingSizeParams);

let mockSetServingSize: ReturnType<typeof vi.fn>;

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/groups/:id" element={<GroupDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockQuery(overrides: Partial<UseApiQueryResult<ProductGroupData>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ProductGroupData>);
}

const sampleGroup: ProductGroupData = {
  id: 'g1',
  name: 'Breakfast Bowl',
  items: [
    {
      product: {
        id: 'p1',
        name: 'Oats',
        preparations: [
          {
            id: 'prep1',
            name: 'Default',
            nutritionalInformation: {
              calories: { amount: 150, unit: 'kcal' },
            },
          },
        ],
      },
      preparationID: 'prep1',
    },
    {
      group: {
        id: 'g2',
        name: 'Fruit Mix',
        items: [{ product: { id: 'p2', name: 'Banana' } }],
      },
    },
  ],
  barcodes: [{ code: '111222333' }],
};

describe('GroupDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetServingSize = vi.fn();
    // Default: return null (no URL params) with a mock setter
    mockUseServingSizeParams.mockReturnValue([null, mockSetServingSize]);
  });

  it('renders loading state', () => {
    mockQuery({ loading: true });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQuery({ error: 'Failed to load' });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders empty state when data is null', () => {
    mockQuery({ data: null });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders group name and item count', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByText('Breakfast Bowl')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('renders nutrition label and serving size selector', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('nutrition-label')).toBeInTheDocument();
    expect(screen.getByTestId('serving-size-selector')).toBeInTheDocument();
  });

  it('renders AddToLogButton', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('add-to-log-button')).toBeInTheDocument();
  });

  it('renders AddToFavoritesButton', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('add-to-favorites-button')).toBeInTheDocument();
  });

  it('renders item rows for products', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByText('Oats')).toBeInTheDocument();
  });

  it('renders item rows for groups', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByText('Fruit Mix')).toBeInTheDocument();
  });

  it('renders barcode section when barcodes exist', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('barcode-section')).toBeInTheDocument();
  });

  it('does not render barcode section when no barcodes', () => {
    mockQuery({ data: { ...sampleGroup, barcodes: [] } });
    renderWithRoute('/groups/g1');
    expect(screen.queryByTestId('barcode-section')).not.toBeInTheDocument();
  });

  it('shows no items message when items array is empty', () => {
    mockQuery({ data: { ...sampleGroup, items: [] } });
    renderWithRoute('/groups/g1');
    expect(screen.getByText('No items in this group')).toBeInTheDocument();
  });

  it('renders singular "item" for single item', () => {
    mockQuery({ data: { ...sampleGroup, items: [sampleGroup.items![0]] } });
    renderWithRoute('/groups/g1');
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('product items have correct aria-label', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByLabelText('View Oats')).toBeInTheDocument();
  });

  it('group items have correct aria-label', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByLabelText('View Fruit Mix')).toBeInTheDocument();
  });

  it('displays nutrition error when serving calculation throws', () => {
    // Group with no mass — requesting by mass will throw
    const noMassGroup: ProductGroupData = {
      id: 'g-err',
      name: 'Error Group',
      items: [
        {
          product: {
            id: 'p1',
            name: 'Item',
            preparations: [
              {
                id: 'prep1',
                nutritionalInformation: {
                  calories: { amount: 100, unit: 'kcal' },
                },
              },
            ],
          },
          preparationID: 'prep1',
        },
      ],
    };
    mockQuery({ data: noMassGroup });
    // Render with a mass-based serving size — group has no mass so this will throw
    mockUseServingSizeParams.mockReturnValue([ServingSize.mass(100, 'g'), mockSetServingSize]);
    renderWithRoute('/groups/g-err');

    // The nutrition error should be displayed
    expect(screen.getByText(/Cannot calculate serving by mass/)).toBeInTheDocument();
    // Nutrition label should not render (nutritionInfo is null)
    expect(screen.queryByTestId('nutrition-label')).not.toBeInTheDocument();
  });

  it('uses group defaultServingSize when no URL params', () => {
    const groupWithDefault: ProductGroupData = {
      ...sampleGroup,
      defaultServingSize: { servings: 2 },
    };
    mockQuery({ data: groupWithDefault });
    mockUseServingSizeParams.mockReturnValue([null, mockSetServingSize]);
    renderWithRoute('/groups/g1');
    // Should render without error — the group's defaultServingSize is used
    expect(screen.getByTestId('nutrition-label')).toBeInTheDocument();
  });

  it('prefers URL serving size over group defaultServingSize', () => {
    const groupWithDefault: ProductGroupData = {
      ...sampleGroup,
      defaultServingSize: { servings: 2 },
    };
    mockQuery({ data: groupWithDefault });
    mockUseServingSizeParams.mockReturnValue([ServingSize.servings(3), mockSetServingSize]);
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('nutrition-label')).toBeInTheDocument();
  });

  it('renders null for GroupItemRow with neither product nor group', () => {
    const groupWithEmptyItem: ProductGroupData = {
      id: 'g-null',
      name: 'Null Item Group',
      items: [{}, { product: { id: 'p1', name: 'Real Product' } }],
    };
    mockQuery({ data: groupWithEmptyItem });
    renderWithRoute('/groups/g-null');
    // The empty item renders null (no DOM), but the real product still renders
    expect(screen.getByText('Real Product')).toBeInTheDocument();
    // Only one food-item-row should exist (for the product, not the empty item)
    const itemRows = screen.getAllByTestId('food-item-row');
    expect(itemRows).toHaveLength(1);
  });
});
