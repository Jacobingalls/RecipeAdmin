import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiCategory } from '../api';
import { useApiQuery } from '../hooks';

import AdminCategoriesPage from './AdminCategoriesPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../components/common', async () => {
  const actual = await vi.importActual('../components/common');
  return {
    ...actual,
    LoadingState: () => <div data-testid="loading-state" />,
    ErrorState: ({ message }: { message: string }) => (
      <div data-testid="error-state">{message}</div>
    ),
    ContentUnavailableView: ({ title }: { title: string }) => (
      <div data-testid="content-unavailable-view">{title}</div>
    ),
  };
});

const mockUseApiQuery = vi.mocked(useApiQuery);

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function mockQuery(overrides: Partial<UseApiQueryResult<ApiCategory[]>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ApiCategory[]>);
}

const sampleCategories: ApiCategory[] = [
  {
    id: 'cat-1',
    slug: 'fruit',
    displayName: 'Fruit',
    description: null,
    parents: [],
    children: ['cat-3', 'cat-4'],
    notes: [],
  },
  {
    id: 'cat-2',
    slug: 'dairy',
    displayName: 'Dairy',
    description: 'Milk products',
    parents: ['cat-5'],
    children: [],
    notes: [],
  },
  {
    id: 'cat-3',
    slug: 'citrus',
    displayName: 'Citrus',
    description: null,
    parents: ['cat-1'],
    children: [],
    notes: [],
  },
];

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state with page chrome', () => {
    mockQuery({ loading: true });
    renderWithRouter(<AdminCategoriesPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
  });

  it('renders error state with page chrome', () => {
    mockQuery({ error: 'Server error' });
    renderWithRouter(<AdminCategoriesPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('renders empty state when no categories', () => {
    mockQuery({ data: [] });
    renderWithRouter(<AdminCategoriesPage />);
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
    expect(screen.getByText('No categories')).toBeInTheDocument();
  });

  it('renders all categories (not just top-level)', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<AdminCategoriesPage />);
    expect(screen.getByText('Fruit')).toBeInTheDocument();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Citrus')).toBeInTheDocument();
  });

  it('renders links to /admin/categories/ with slug paths sorted alphabetically', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<AdminCategoriesPage />);
    const links = screen.getAllByRole('link');
    // Sorted: Citrus (fruit.citrus), Dairy (dairy — parent cat-5 not in set, so just slug), Fruit (fruit)
    expect(links[0]).toHaveAttribute('href', '/admin/categories/fruit.citrus');
    expect(links[1]).toHaveAttribute('href', '/admin/categories/dairy');
    expect(links[2]).toHaveAttribute('href', '/admin/categories/fruit');
  });

  it('shows parent and children counts in subtitle', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<AdminCategoriesPage />);
    expect(screen.getByText('0 parents · 2 children')).toBeInTheDocument();
    expect(screen.getAllByText('1 parent · 0 children')).toHaveLength(2);
  });

  it('filters by name (case-insensitive)', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<AdminCategoriesPage />);
    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(input, { target: { value: 'dairy' } });
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.queryByText('Fruit')).not.toBeInTheDocument();
    expect(screen.queryByText('Citrus')).not.toBeInTheDocument();
  });

  it('shows empty state when filter matches nothing', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<AdminCategoriesPage />);
    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(input, { target: { value: 'zzzzz' } });
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });
});
