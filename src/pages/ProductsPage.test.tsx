import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiProductSummary } from '../api';
import { useApiQuery } from '../hooks';

import ProductsPage from './ProductsPage';

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

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function mockQuery(overrides: Partial<UseApiQueryResult<ApiProductSummary[]>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ApiProductSummary[]>);
}

const sampleProducts: ApiProductSummary[] = [
  { id: 'p1', name: 'Apple', brand: 'FreshCo' },
  { id: 'p2', name: 'Banana', brand: 'FreshCo' },
  { id: 'p3', name: 'Cereal', brand: 'BreakfastInc' },
  { id: 'p4', name: 'Water' },
];

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockQuery({ loading: true });
    renderWithRouter(<ProductsPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQuery({ error: 'Server error' });
    renderWithRouter(<ProductsPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('renders empty state when no products', () => {
    mockQuery({ data: [] });
    renderWithRouter(<ProductsPage />);
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders product list with names and brands', () => {
    mockQuery({ data: sampleProducts });
    renderWithRouter(<ProductsPage />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cereal')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
  });

  it('renders product links with correct hrefs', () => {
    mockQuery({ data: sampleProducts });
    renderWithRouter(<ProductsPage />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/products/p1');
  });

  it('filters by name', () => {
    mockQuery({ data: sampleProducts });
    renderWithRouter(<ProductsPage />);
    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(input, { target: { value: 'apple' } });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('populates brand dropdown with sorted unique brands', () => {
    mockQuery({ data: sampleProducts });
    renderWithRouter(<ProductsPage />);
    const options = screen.getAllByRole('option');
    // "All brands" + "BreakfastInc" + "FreshCo" (sorted)
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('All brands');
    expect(options[1]).toHaveTextContent('BreakfastInc');
    expect(options[2]).toHaveTextContent('FreshCo');
  });

  it('filters by brand', () => {
    mockQuery({ data: sampleProducts });
    renderWithRouter(<ProductsPage />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'BreakfastInc' } });
    expect(screen.getByText('Cereal')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('combines name and brand filters', () => {
    mockQuery({ data: sampleProducts });
    renderWithRouter(<ProductsPage />);
    const input = screen.getByPlaceholderText('Search by name...');
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'FreshCo' } });
    fireEvent.change(input, { target: { value: 'apple' } });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('shows empty state when filters match nothing', () => {
    mockQuery({ data: sampleProducts });
    renderWithRouter(<ProductsPage />);
    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(input, { target: { value: 'zzzzz' } });
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders the heading', () => {
    mockQuery({ data: sampleProducts });
    renderWithRouter(<ProductsPage />);
    expect(screen.getByText('Products')).toBeInTheDocument();
  });
});
