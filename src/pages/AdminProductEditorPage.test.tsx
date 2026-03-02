import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiProduct } from '../api';
import { useApiQuery } from '../hooks';
import * as api from '../api';

import AdminProductEditorPage from './AdminProductEditorPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../api', () => ({
  getProduct: vi.fn(),
  adminUpsertProducts: vi.fn(),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
  SectionHeader: ({ title, children }: { title: string; children?: ReactNode }) => (
    <div data-testid={`section-header-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {title}
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    loading,
    ...rest
  }: {
    children: ReactNode;
    onClick?: () => void;
    loading?: boolean;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} aria-busy={loading || undefined} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock('../components/admin-product-editor', () => ({
  ProductProfileForm: ({
    product,
    onChange,
  }: {
    product: ApiProduct;
    onChange: (p: ApiProduct) => void;
  }) => (
    <div data-testid="product-profile-form">
      <button
        data-testid="edit-name-btn"
        onClick={() => onChange({ ...product, name: 'Edited Name' })}
      >
        Edit name
      </button>
    </div>
  ),
  ProductDangerZone: () => <div data-testid="product-danger-zone" />,
  PreparationCardBody: ({
    preparationId,
    onChange,
    product,
  }: {
    preparationId: string;
    onChange: (p: ApiProduct) => void;
    product: ApiProduct;
  }) => (
    <div data-testid="preparation-card-body">
      {preparationId}
      <button
        data-testid="edit-prep-btn"
        onClick={() =>
          onChange({
            ...product,
            preparations: product.preparations.map((p) =>
              p.id === preparationId ? { ...p, name: 'Edited Prep' } : p,
            ),
          })
        }
      >
        Edit prep
      </button>
    </div>
  ),
  BarcodesSection: ({
    product,
    onChange,
  }: {
    product: ApiProduct;
    onChange: (p: ApiProduct) => void;
  }) => (
    <div data-testid="barcodes-section">
      <button
        data-testid="add-barcode-btn"
        onClick={() =>
          onChange({ ...product, barcodes: [...product.barcodes, { code: 'NEW-BC' }] })
        }
      >
        Add barcode
      </button>
    </div>
  ),
  AddPreparationModal: ({
    product,
    onChange,
    onClose,
  }: {
    product: ApiProduct;
    onChange: (p: ApiProduct) => void;
    onClose: () => void;
  }) => (
    <div data-testid="add-preparation-modal">
      <button
        data-testid="create-prep-btn"
        onClick={() => {
          onChange({
            ...product,
            preparations: [
              ...product.preparations,
              { id: 'new-prep', name: 'New Prep', categories: [], customSizes: [] },
            ],
          });
          onClose();
        }}
      >
        Create
      </button>
    </div>
  ),
}));

vi.mock('../components/NotesDisplay', () => ({
  __esModule: true,
  default: () => <div data-testid="notes-display" />,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockUpsert = vi.mocked(api.adminUpsertProducts);

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/products/:id" element={<AdminProductEditorPage />} />
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
  barcodes: [],
  preparations: [
    { id: 'prep-1', name: 'Default' },
    { id: 'prep-2', name: 'Melted' },
  ],
  defaultPreparationID: 'prep-1',
  notes: [],
};

describe('AdminProductEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockQuery({ loading: true });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQuery({ error: 'Server error' });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('renders not found when product is null', () => {
    mockQuery({ data: null });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
    expect(screen.getByText('Product not found')).toBeInTheDocument();
  });

  it('renders product name and brand', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByText('Peanut Butter')).toBeInTheDocument();
    expect(screen.getByText('NutCo')).toBeInTheDocument();
  });

  it('does not render brand when absent', () => {
    mockQuery({ data: { ...sampleProduct, brand: '' } });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByText('Peanut Butter')).toBeInTheDocument();
    expect(screen.queryByText('NutCo')).not.toBeInTheDocument();
  });

  it('renders child section components', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByTestId('product-profile-form')).toBeInTheDocument();
    expect(screen.getByTestId('preparation-card-body')).toBeInTheDocument();
    expect(screen.getByTestId('barcodes-section')).toBeInTheDocument();
    expect(screen.getByTestId('product-danger-zone')).toBeInTheDocument();
  });

  it('renders preparation tabs', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByRole('button', { name: 'Default' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Melted' })).toBeInTheDocument();
  });

  it('switches active preparation on tab click', async () => {
    const user = userEvent.setup();
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');

    // Initially shows prep-1
    expect(screen.getByTestId('preparation-card-body')).toHaveTextContent('prep-1');

    // Click Melted tab
    await user.click(screen.getByRole('button', { name: 'Melted' }));
    expect(screen.getByTestId('preparation-card-body')).toHaveTextContent('prep-2');
  });

  it('renders section headers for preparations, notes', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByTestId('section-header-preparations')).toBeInTheDocument();
    expect(screen.getByTestId('section-header-notes')).toBeInTheDocument();
  });

  it('hides tab strip when only one preparation', () => {
    const single = {
      ...sampleProduct,
      preparations: [{ id: 'prep-1', name: 'Default' }],
    };
    mockQuery({ data: single });
    renderWithRoute('/admin/products/p1');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByTestId('preparation-card-body')).toBeInTheDocument();
  });

  it('shows empty message when no preparations', () => {
    mockQuery({ data: { ...sampleProduct, preparations: [] } });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByText('No preparations')).toBeInTheDocument();
  });

  it('shows notes section with empty message when no notes', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByText('No notes')).toBeInTheDocument();
  });

  it('renders notes display when product has notes', () => {
    mockQuery({
      data: {
        ...sampleProduct,
        notes: [{ source: 'test', information: ['Some note'] }],
      },
    });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByTestId('notes-display')).toBeInTheDocument();
  });

  it('renders add preparation button', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');
    const prepHeader = screen.getByTestId('section-header-preparations');
    expect(within(prepHeader).getByText('Add')).toBeInTheDocument();
  });

  // --- Save / Discard / Dirty ---

  it('does not show Save/Discard when draft matches fetched data', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
  });

  it('shows Save/Discard when draft is dirty', async () => {
    const user = userEvent.setup();
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');

    // Simulate an edit via mock child
    await user.click(screen.getByTestId('edit-name-btn'));

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('Discard resets draft to fetched data', async () => {
    const user = userEvent.setup();
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');

    await user.click(screen.getByTestId('edit-name-btn'));
    expect(screen.getByText('Edited Name')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(screen.getByText('Peanut Butter')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('Save calls adminUpsertProducts and refetch', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockUpsert.mockResolvedValue([sampleProduct]);
    mockQuery({ data: sampleProduct, refetch });
    renderWithRoute('/admin/products/p1');

    await user.click(screen.getByTestId('edit-name-btn'));

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p1', name: 'Edited Name' }),
    );
    expect(refetch).toHaveBeenCalled();
  });

  it('displays save error when adminUpsertProducts fails', async () => {
    const user = userEvent.setup();
    mockUpsert.mockRejectedValue(new Error('Server error'));
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');

    await user.click(screen.getByTestId('edit-name-btn'));

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Server error');
  });

  it('clears save error on Discard', async () => {
    const user = userEvent.setup();
    mockUpsert.mockRejectedValue(new Error('Server error'));
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');

    await user.click(screen.getByTestId('edit-name-btn'));
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('auto-detects new preparation and switches active tab', async () => {
    const user = userEvent.setup();
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');

    // Open add prep modal and create
    const prepHeader = screen.getByTestId('section-header-preparations');
    await user.click(within(prepHeader).getByText('Add'));
    await user.click(screen.getByTestId('create-prep-btn'));

    // Active tab should now be the new prep
    expect(screen.getByTestId('preparation-card-body')).toHaveTextContent('new-prep');
  });
});
