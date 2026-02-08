import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ProductGroupData } from '../domain';
import { ServingSize } from '../domain';
import { useApiQuery } from '../hooks';

import GroupDetailPage from './GroupDetailPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
  BackButton: ({ to }: { to: string }) => (
    <a data-testid="back-button" href={to}>
      Back
    </a>
  ),
}));

vi.mock('../components/NutritionLabel', () => ({
  default: () => <div data-testid="nutrition-label" />,
}));

const mockServingSizeSelectorOnChange = vi.fn();
vi.mock('../components/ServingSizeSelector', () => ({
  default: ({ onChange }: { onChange: (ss: unknown) => void }) => {
    mockServingSizeSelectorOnChange.mockImplementation(onChange);
    return <div data-testid="serving-size-selector" />;
  },
}));

vi.mock('../components/CustomSizesSection', () => ({
  default: () => <div data-testid="custom-sizes-section" />,
}));

vi.mock('../components/BarcodeSection', () => ({
  default: () => <div data-testid="barcode-section" />,
}));

vi.mock('../components/AddToLogButton', () => ({
  default: () => <div data-testid="add-to-log-button" />,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

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
  });

  it('renders loading state with back button', () => {
    mockQuery({ loading: true });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByTestId('back-button')).toHaveAttribute('href', '/groups');
  });

  it('renders error state with back button', () => {
    mockQuery({ error: 'Failed to load' });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByTestId('back-button')).toHaveAttribute('href', '/groups');
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

  it('renders back button to groups', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByTestId('back-button')).toHaveAttribute('href', '/groups');
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

  it('renders item rows with product badge', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByText('Oats')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('renders item rows with group badge', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    expect(screen.getByText('Fruit Mix')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
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

  it('links product items to product detail page', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    const productLink = screen.getByText('Oats').closest('a');
    expect(productLink).toHaveAttribute('href', '/products/p1');
  });

  it('links group items to group detail page', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/groups/g1');
    const groupLink = screen.getByText('Fruit Mix').closest('a');
    expect(groupLink).toHaveAttribute('href', '/groups/g2');
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
    renderWithRoute('/groups/g-err');
    // Initially renders with servings(1) — no error
    expect(screen.getByTestId('nutrition-label')).toBeInTheDocument();

    // Now trigger a mass-based serving size via the selector mock
    act(() => {
      mockServingSizeSelectorOnChange(ServingSize.mass(100, 'g'));
    });

    // The nutrition error should now be displayed
    expect(screen.getByText(/Cannot calculate serving by mass/)).toBeInTheDocument();
    // Nutrition label should no longer render (nutritionInfo is null)
    expect(screen.queryByTestId('nutrition-label')).not.toBeInTheDocument();
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
    // Only one list-group-item link should exist (for the product, not the empty item)
    const listItems = document.querySelectorAll('.list-group-item');
    expect(listItems).toHaveLength(1);
  });
});
