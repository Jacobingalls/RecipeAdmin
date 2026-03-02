import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiCategory } from '../api';
import { useCategories } from '../contexts/CategoriesContext';

import CategoriesPage from './CategoriesPage';

vi.mock('../contexts/CategoriesContext', () => ({
  useCategories: vi.fn(),
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

const mockUseCategories = vi.mocked(useCategories);

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function mockContext(overrides: Partial<ReturnType<typeof useCategories>> = {}) {
  const lookup = new Map<string, ApiCategory>();
  const cats = overrides.allCategories ?? [];
  for (const c of cats) {
    lookup.set(c.id, c);
  }
  mockUseCategories.mockReturnValue({
    allCategories: [],
    lookup: new Map(),
    loading: false,
    error: null,
    addCategories: vi.fn(),
    refresh: vi.fn(),
    expiresAt: Date.now() + 300_000,
    ...overrides,
    // Ensure lookup matches allCategories if not explicitly overridden
    ...(overrides.lookup === undefined && overrides.allCategories ? { lookup } : {}),
  });
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
    mockContext({ loading: true });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockContext({ error: 'Server error' });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('renders empty state when no categories', () => {
    mockContext({ allCategories: [] });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders a section for each top-level category', () => {
    mockContext({ allCategories: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Produce')).toBeInTheDocument();
  });

  it('renders children as cards with slug-path links', () => {
    mockContext({ allCategories: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByText('Cheese')).toBeInTheDocument();
    const cheeseLink = screen.getByText('Cheese').closest('a');
    expect(cheeseLink).toHaveAttribute('href', '/categories/dairy.cheese');
  });

  it('passes parentPath to CategoryGrid with root slug', () => {
    mockContext({ allCategories: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    const grids = screen.getAllByTestId('category-grid');
    // Dairy section grid should have parentPath="dairy"
    expect(grids[0]).toHaveAttribute('data-parent-path', 'dairy');
  });

  it('renders section headings for top-level categories', () => {
    mockContext({ allCategories: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    const dairyHeading = screen.getByRole('heading', { name: 'Dairy' });
    expect(dairyHeading.tagName).toBe('H2');
  });

  it('shows fallback text when a top-level category has no children', () => {
    mockContext({ allCategories: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByText('No subcategories')).toBeInTheDocument();
  });

  it('renders the heading', () => {
    mockContext({ allCategories: sampleCategories });
    renderWithRouter(<CategoriesPage />);
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });
});
