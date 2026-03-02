import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { ApiCategory, ApiLookupItem } from '../api';
import type { UseApiQueryResult } from '../hooks/useApiQuery';
import { useApiQuery } from '../hooks';
import { useCategories } from '../contexts/CategoriesContext';

import CategoryDetailPage from './CategoryDetailPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../contexts/CategoriesContext', () => ({
  useCategories: vi.fn(),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="content-unavailable-view">
      <span data-testid="cuv-title">{title}</span>
      {description && <span data-testid="cuv-description">{description}</span>}
    </div>
  ),
  CategoryPaths: ({ path }: { path: string }) => <div data-testid="category-paths">{path}</div>,
  SubsectionTitle: ({ children }: { children: ReactNode }) => (
    <h2 data-testid="subsection-title">{children}</h2>
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
}));

vi.mock('../components/group', () => ({
  GroupItemRow: ({ item }: { item: ApiLookupItem }) => (
    <div data-testid="group-item-row">{item.product?.name ?? item.group?.name}</div>
  ),
}));

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockUseCategories = vi.mocked(useCategories);

const sampleCategory: ApiCategory = {
  id: 'cat1',
  slug: 'dairy',
  displayName: 'Dairy',
  description: null,
  parents: [],
  children: ['cat2', 'cat3'],
  notes: [],
};

const sampleChildren: ApiCategory[] = [
  {
    id: 'cat2',
    slug: 'cheese',
    displayName: 'Cheese',
    description: null,
    parents: ['cat1'],
    children: [],
    notes: [],
  },
  {
    id: 'cat3',
    slug: 'yogurt',
    displayName: 'Yogurt',
    description: null,
    parents: ['cat1'],
    children: [],
    notes: [],
  },
];

const sampleItems: ApiLookupItem[] = [
  {
    product: {
      id: 'p1',
      name: 'Cheddar',
      brand: 'Tillamook',
      barcodes: [],
      preparations: [],
      notes: [],
    },
  },
  { group: { id: 'g1', name: 'Mac and Cheese', items: [] } },
];

function mockCategoriesContext(categories: ApiCategory[] = [sampleCategory, ...sampleChildren]) {
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

// The component calls useApiQuery for:
// 1. getCategory(path) — with enabled: !cachedCategory
// 2. getCategoryChildren(path) — with enabled: !!category && !childrenCached
// 3. getCategoryItems(path, { includeDescendants })
function mockQueries(
  overrides: {
    category?: Partial<UseApiQueryResult<ApiCategory>>;
    children?: Partial<UseApiQueryResult<ApiCategory[]>>;
    items?: Partial<UseApiQueryResult<ApiLookupItem[]>>;
  } = {},
) {
  const defaults = {
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  };
  const callResults = [
    { ...defaults, ...overrides.category },
    { ...defaults, ...overrides.children },
    { ...defaults, data: sampleItems, ...overrides.items },
  ];
  let callIndex = 0;
  mockUseApiQuery.mockImplementation(() => {
    const result = callResults[callIndex % callResults.length];
    callIndex++;
    return result as UseApiQueryResult<unknown>;
  });
}

function renderPage(route = '/categories/dairy') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/categories/:path" element={<CategoryDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CategoryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when category not cached and fetching', () => {
    // Empty cache — category not found
    mockCategoriesContext([]);
    mockQueries({ category: { loading: true, data: null } });
    renderPage();
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state when category not cached and fetch fails', () => {
    mockCategoriesContext([]);
    mockQueries({ category: { error: "Couldn't load this category. Try again later." } });
    renderPage();
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText("Couldn't load this category. Try again later.")).toBeInTheDocument();
  });

  it('renders not-found state when category is null', () => {
    mockCategoriesContext([]);
    mockQueries({ category: { data: null } });
    renderPage();
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
    expect(screen.getByTestId('cuv-title')).toHaveTextContent('Category not found');
  });

  it('renders category from cache without needing API fetch', () => {
    mockCategoriesContext();
    mockQueries(); // useApiQuery still called but with enabled:false so returns defaults
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dairy');
    expect(screen.getByTestId('category-paths')).toHaveTextContent('dairy');
  });

  it('passes path as parentPath to CategoryGrid for subcategories', () => {
    mockCategoriesContext();
    mockQueries();
    renderPage();
    const grid = screen.getByTestId('category-grid');
    expect(grid).toHaveAttribute('data-parent-path', 'dairy');
  });

  it('renders subcategory links with slug paths', () => {
    mockCategoriesContext();
    mockQueries();
    renderPage();
    const cheeseLink = screen.getByText('Cheese').closest('a');
    expect(cheeseLink).toHaveAttribute('href', '/categories/dairy.cheese');
    const yogurtLink = screen.getByText('Yogurt').closest('a');
    expect(yogurtLink).toHaveAttribute('href', '/categories/dairy.yogurt');
  });

  it('does not render subcategories section when no children', () => {
    const catNoChildren = { ...sampleCategory, children: [] };
    mockCategoriesContext([catNoChildren]);
    mockQueries();
    renderPage();
    expect(screen.queryByText('Subcategories')).not.toBeInTheDocument();
  });

  it('renders items via GroupItemRow', () => {
    mockCategoriesContext();
    mockQueries();
    renderPage();
    const rows = screen.getAllByTestId('group-item-row');
    expect(rows).toHaveLength(2);
    expect(screen.getByText('Cheddar')).toBeInTheDocument();
    expect(screen.getByText('Mac and Cheese')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    mockCategoriesContext();
    mockQueries({ items: { data: [] } });
    renderPage();
    expect(screen.getByTestId('cuv-title')).toHaveTextContent('No items');
    expect(screen.getByTestId('cuv-description')).toHaveTextContent(
      "Nothing's been added to this category or its subcategories.",
    );
  });

  it('filters items by name', async () => {
    const user = userEvent.setup();
    mockCategoriesContext();
    mockQueries();
    renderPage();

    const filterInput = screen.getByPlaceholderText('Filter items...');
    await user.type(filterInput, 'cheddar');

    expect(screen.getByText('Cheddar')).toBeInTheDocument();
    expect(screen.queryByText('Mac and Cheese')).not.toBeInTheDocument();
  });

  it('shows adjusted empty description when filter has no matches', async () => {
    const user = userEvent.setup();
    mockCategoriesContext();
    mockQueries();
    renderPage();

    const filterInput = screen.getByPlaceholderText('Filter items...');
    await user.type(filterInput, 'zzzznothing');

    expect(screen.getByTestId('cuv-title')).toHaveTextContent('No items');
    expect(screen.getByTestId('cuv-description')).toHaveTextContent('Try adjusting your search.');
  });

  it('toggles include descendants checkbox', async () => {
    const user = userEvent.setup();
    mockCategoriesContext();
    mockQueries();
    renderPage();

    const checkbox = screen.getByLabelText('Include descendants');
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('shows items loading state', () => {
    mockCategoriesContext();
    mockQueries({ items: { loading: true, data: null } });
    renderPage();
    // Category is loaded from cache, items are loading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dairy');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('shows different empty description when include descendants is off', async () => {
    const user = userEvent.setup();
    mockCategoriesContext();
    mockQueries({ items: { data: [] } });
    renderPage();

    await user.click(screen.getByLabelText('Include descendants'));

    expect(screen.getByTestId('cuv-description')).toHaveTextContent(
      "Nothing's been added to this category.",
    );
  });

  it('renders subsection titles', () => {
    mockCategoriesContext();
    mockQueries();
    renderPage();
    expect(screen.getByText('Subcategories')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
  });
});
