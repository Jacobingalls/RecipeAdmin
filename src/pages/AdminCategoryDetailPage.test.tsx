import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiCategory } from '../api';
import { useApiQuery } from '../hooks';
import { useCategories } from '../contexts/CategoriesContext';

import AdminCategoryDetailPage from './AdminCategoryDetailPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

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
  };
});

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockUseCategories = vi.mocked(useCategories);

function renderWithRoute(ui: ReactElement, path = '/admin/categories/food.fruit') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/categories/:path" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

const fruitCategory: ApiCategory = {
  id: 'cat-1',
  slug: 'fruit',
  displayName: 'Fruit',
  description: 'Fresh fruit',
  parents: ['cat-root'],
  children: ['cat-citrus', 'cat-berries'],
  notes: [],
};

const rootCategory: ApiCategory = {
  id: 'cat-root',
  slug: 'food',
  displayName: 'Food',
  description: null,
  parents: [],
  children: ['cat-1'],
  notes: [],
};

const citrusCategory: ApiCategory = {
  id: 'cat-citrus',
  slug: 'citrus',
  displayName: 'Citrus',
  description: null,
  parents: ['cat-1'],
  children: [],
  notes: [],
};

const berriesCategory: ApiCategory = {
  id: 'cat-berries',
  slug: 'berries',
  displayName: 'Berries',
  description: null,
  parents: ['cat-1'],
  children: [],
  notes: [],
};

const allCategories: ApiCategory[] = [fruitCategory, rootCategory, citrusCategory, berriesCategory];

function mockCategoriesContext(categories: ApiCategory[] = allCategories) {
  const lookup = new Map(categories.map((c) => [c.id, c]));
  mockUseCategories.mockReturnValue({
    allCategories: categories,
    lookup,
    loading: false,
    error: null,
    addCategories: vi.fn(),
    refresh: vi.fn(),
    expiresAt: Date.now() + 300_000,
  });
}

function mockApiQuery(overrides: Partial<UseApiQueryResult<ApiCategory>> = {}) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ApiCategory>);
}

describe('AdminCategoryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when not in cache and fetching', () => {
    mockCategoriesContext([]);
    mockApiQuery({ loading: true });
    renderWithRoute(<AdminCategoryDetailPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockCategoriesContext([]);
    mockApiQuery({ error: 'Server error' });
    renderWithRoute(<AdminCategoryDetailPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('renders not-found state when category is null', () => {
    mockCategoriesContext([]);
    mockApiQuery({ data: null });
    renderWithRoute(<AdminCategoryDetailPage />);
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
    expect(screen.getByText('Category not found')).toBeInTheDocument();
  });

  it('displays category displayName, path, and description from cache', () => {
    mockCategoriesContext(allCategories);
    mockApiQuery(); // Will be called with enabled:false
    renderWithRoute(<AdminCategoryDetailPage />);
    expect(screen.getByText('Fruit')).toBeInTheDocument();
    expect(screen.getByText('food.fruit')).toBeInTheDocument();
    expect(screen.getByText('Fresh fruit')).toBeInTheDocument();
  });

  it('renders parent categories with canonical slug-path links', () => {
    mockCategoriesContext(allCategories);
    mockApiQuery();
    renderWithRoute(<AdminCategoryDetailPage />);
    const links = screen.getAllByRole('link');
    const parentLink = links.find((l) => l.textContent?.includes('Food'));
    expect(parentLink).toHaveAttribute('href', '/admin/categories/food');
  });

  it('renders children categories with extended slug-path links sorted alphabetically', () => {
    mockCategoriesContext(allCategories);
    mockApiQuery();
    renderWithRoute(<AdminCategoryDetailPage />);
    const links = screen.getAllByRole('link');
    const childLinks = links.filter(
      (l) => l.textContent?.includes('Berries') || l.textContent?.includes('Citrus'),
    );
    expect(childLinks).toHaveLength(2);
    // Sorted: Berries before Citrus
    expect(childLinks[0]).toHaveAttribute('href', '/admin/categories/food.fruit.berries');
    expect(childLinks[1]).toHaveAttribute('href', '/admin/categories/food.fruit.citrus');
  });

  it('renders multiple paths for a category with multiple parents', () => {
    const altRoot: ApiCategory = {
      id: 'cat-alt',
      slug: 'grocery',
      displayName: 'Grocery',
      description: null,
      parents: [],
      children: ['cat-1'],
      notes: [],
    };
    const multiParentFruit: ApiCategory = {
      ...fruitCategory,
      parents: ['cat-root', 'cat-alt'],
    };
    const cats = [multiParentFruit, rootCategory, citrusCategory, berriesCategory, altRoot];
    mockCategoriesContext(cats);
    mockApiQuery();
    renderWithRoute(<AdminCategoryDetailPage />);
    expect(screen.getByText('food.fruit')).toBeInTheDocument();
    expect(screen.getByText('grocery.fruit')).toBeInTheDocument();
  });

  it('shows "No parents" for root categories', () => {
    mockCategoriesContext(allCategories);
    mockApiQuery();
    renderWithRoute(<AdminCategoryDetailPage />, '/admin/categories/food');
    expect(screen.getByText('No parents')).toBeInTheDocument();
  });

  it('shows "No children" for leaf categories', () => {
    mockCategoriesContext(allCategories);
    mockApiQuery();
    renderWithRoute(<AdminCategoryDetailPage />, '/admin/categories/food.fruit.citrus');
    expect(screen.getByText('No children')).toBeInTheDocument();
  });
});
