import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiProduct } from '../api';
import { useApiQuery } from '../hooks';

import AdminProductEditorPage from './AdminProductEditorPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

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
  preparations: [],
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

  it('renders product name and brand with coming soon placeholder', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByText('Peanut Butter')).toBeInTheDocument();
    expect(screen.getByText('NutCo')).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('links to the viewer page', () => {
    mockQuery({ data: sampleProduct });
    renderWithRoute('/admin/products/p1');
    const link = screen.getByRole('link', { name: 'View product' });
    expect(link).toHaveAttribute('href', '/products/p1');
  });

  it('does not render brand when absent', () => {
    mockQuery({ data: { ...sampleProduct, brand: undefined } });
    renderWithRoute('/admin/products/p1');
    expect(screen.getByText('Peanut Butter')).toBeInTheDocument();
    expect(screen.queryByText('NutCo')).not.toBeInTheDocument();
  });
});
