import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiCategory } from '../api';
import { useApiQuery } from '../hooks';

import CategoriesPage from './CategoriesPage';

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
    CategoryGrid: ({
      categories,
      parentPath,
    }: {
      categories: { id: string; slug: string; displayName: string }[];
      parentPath?: string;
    }) => (
      <div data-testid="category-grid" data-parent-path={parentPath}>
        {categories.map((c) => {
          const slugPath = parentPath ? `${parentPath}.${c.slug}` : c.slug;
          return (
            <a key={c.id} href={`/categories/${slugPath}`}>
              {c.displayName}
            </a>
          );
        })}
      </div>
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
    id: 'root1',
    slug: 'dairy',
    displayName: 'Dairy',
    description: 'Milk and cheese products',
    parents: [],
    children: ['child1'],
    notes: [],
  },
  {
    id: 'root2',
    slug: 'produce',
    displayName: 'Produce',
    description: null,
    parents: [],
    children: [],
    notes: [],
  },
  {
    id: 'child1',
    slug: 'cheese',
    displayName: 'Cheese',
    description: 'All types of cheese',
    parents: ['root1'],
    children: [],
    notes: [],
  },
];

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockQuery({ loading: true });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQuery({ error: 'Server error' });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('renders empty state when no categories', () => {
    mockQuery({ data: [] });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders a section for each top-level category', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Produce')).toBeInTheDocument();
  });

  it('renders children as cards with slug-path links', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByText('Cheese')).toBeInTheDocument();
    const cheeseLink = screen.getByText('Cheese').closest('a');
    expect(cheeseLink).toHaveAttribute('href', '/categories/dairy.cheese');
  });

  it('passes parentPath to CategoryGrid with root slug', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    const grids = screen.getAllByTestId('category-grid');
    // Dairy section grid should have parentPath="dairy"
    expect(grids[0]).toHaveAttribute('data-parent-path', 'dairy');
  });

  it('renders section headings for top-level categories', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    const dairyHeading = screen.getByRole('heading', { name: 'Dairy' });
    expect(dairyHeading.tagName).toBe('H2');
  });

  it('shows fallback text when a top-level category has no children', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByText('No subcategories')).toBeInTheDocument();
  });

  it('renders the heading', () => {
    mockQuery({ data: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });
});
