import type { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiProduct } from '../api';
import { useApiQuery } from '../hooks';

import ProductDetailPage from './ProductDetailPage';

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

vi.mock('../components/product', () => ({
  PreparationDetails: ({
    prep,
    actionSlot,
  }: {
    prep: { name?: string };
    actionSlot?: ReactNode;
  }) => (
    <div data-testid="preparation-details">
      {prep.name}
      {actionSlot && <div data-testid="action-slot">{actionSlot}</div>}
    </div>
  ),
}));

vi.mock('../components/BarcodeSection', () => ({
  default: () => <div data-testid="barcode-section" />,
}));

vi.mock('../components/NotesDisplay', () => ({
  default: ({ notes }: { notes: unknown[] }) => (
    <div data-testid="notes-display">{notes.length} notes</div>
  ),
}));

vi.mock('../components/AddToLogButton', () => ({
  default: () => <div data-testid="add-to-log-button" />,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockQuery(overrides: Partial<UseApiQueryResult<ApiProduct>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ApiProduct>);
}

const sampleProduct: ApiProduct = {
  id: 'p1',
  name: 'Peanut Butter',
  brand: 'NutCo',
  preparations: [
    {
      id: 'prep1',
      name: 'Standard',
      nutritionalInformation: {
        calories: { amount: 190, unit: 'kcal' },
      },
      mass: { amount: 32, unit: 'g' },
    },
    {
      id: 'prep2',
      name: 'Low Fat',
      nutritionalInformation: {
        calories: { amount: 150, unit: 'kcal' },
      },
    },
  ],
  defaultPreparationID: 'prep1',
  barcodes: [{ code: '123456789' }],
  notes: [{ information: { text: 'Some note' } }],
};

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state with back button', () => {
    mockQuery({ loading: true });
    renderWithRoute('/products/p1');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByTestId('back-button')).toHaveAttribute('href', '/products');
  });

  it('renders error state with back button', () => {
    mockQuery({ error: 'Server error' });
    renderWithRoute('/products/p1');
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
    expect(screen.getByTestId('back-button')).toHaveAttribute('href', '/products');
  });

  it('renders empty state when product is null', () => {
    mockQuery({ data: null });
    renderWithRoute('/products/p1');
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders product name and brand', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    expect(screen.getByText('Peanut Butter')).toBeInTheDocument();
    expect(screen.getByText('NutCo')).toBeInTheDocument();
  });

  it('renders back button to products', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    expect(screen.getByTestId('back-button')).toHaveAttribute('href', '/products');
  });

  it('renders preparation details for default prep', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    const details = screen.getByTestId('preparation-details');
    expect(details).toBeInTheDocument();
    expect(details).toHaveTextContent('Standard');
  });

  it('renders tab buttons when multiple preparations exist', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    expect(screen.getByRole('button', { name: /Standard/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Low Fat/ })).toBeInTheDocument();
  });

  it('switches preparation on tab click', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    const lowFatTab = screen.getByText('Low Fat');
    fireEvent.click(lowFatTab);
    // After clicking, the prep details should show Low Fat
    expect(screen.getByTestId('preparation-details')).toHaveTextContent('Low Fat');
  });

  it('renders default badge on default preparation', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('does not render tabs for single preparation', () => {
    const singlePrep: ApiProduct = {
      ...sampleProduct,
      preparations: [sampleProduct.preparations![0]],
    };
    mockQuery({ data: singlePrep });
    renderWithRoute('/products/p1');
    // No tab buttons should exist
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByTestId('preparation-details')).toBeInTheDocument();
  });

  it('renders barcode section when barcodes exist', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    expect(screen.getByTestId('barcode-section')).toBeInTheDocument();
  });

  it('does not render barcode section when no barcodes', () => {
    mockQuery({ data: { ...sampleProduct, barcodes: [] } });
    renderWithRoute('/products/p1');
    expect(screen.queryByTestId('barcode-section')).not.toBeInTheDocument();
  });

  it('renders notes when present', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    expect(screen.getByTestId('notes-display')).toBeInTheDocument();
  });

  it('does not render notes when empty', () => {
    mockQuery({ data: { ...sampleProduct, notes: [] } });
    renderWithRoute('/products/p1');
    expect(screen.queryByTestId('notes-display')).not.toBeInTheDocument();
  });

  it('renders heading with singular Preparation for single prep', () => {
    const singlePrep: ApiProduct = {
      ...sampleProduct,
      preparations: [sampleProduct.preparations![0]],
    };
    mockQuery({ data: singlePrep });
    renderWithRoute('/products/p1');
    expect(screen.getByText('Preparation')).toBeInTheDocument();
  });

  it('renders heading with plural Preparations for multiple preps', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    expect(screen.getByText('Preparations')).toBeInTheDocument();
  });

  it('handles product with undefined preparations', () => {
    const noPreps: ApiProduct = {
      id: 'p-noprep',
      name: 'No Preps Product',
      brand: 'Test',
    };
    mockQuery({ data: noPreps });
    renderWithRoute('/products/p-noprep');
    expect(screen.getByText('No Preps Product')).toBeInTheDocument();
    // Should not render preparation details or tabs
    expect(screen.queryByTestId('preparation-details')).not.toBeInTheDocument();
  });

  it('renders AddToLogButton inside PreparationDetails', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/products/p1');
    expect(screen.getByTestId('add-to-log-button')).toBeInTheDocument();
    // Verify it's inside the action slot
    expect(screen.getByTestId('action-slot')).toBeInTheDocument();
  });

  it('handles clicking a prep tab with null id', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [
        { id: undefined, name: 'No ID Prep', nutritionalInformation: {} },
        sampleProduct.preparations![1],
      ],
    };
    mockQuery({ data: product });
    renderWithRoute('/products/p1');
    // Click the tab with undefined id
    const noIdTab = screen.getByText('No ID Prep');
    fireEvent.click(noIdTab);
    // Should not crash — setSelectedPrep(null) is called
    expect(screen.getByText('No ID Prep')).toBeInTheDocument();
  });
});
