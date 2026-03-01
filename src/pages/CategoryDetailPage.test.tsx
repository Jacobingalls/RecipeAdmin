import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { ApiCategory, ApiLookupItem } from '../api';
import type { UseApiQueryResult } from '../hooks/useApiQuery';
import { useApiQuery } from '../hooks';

import CategoryDetailPage from './CategoryDetailPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
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
  CategoryPaths: ({ categoryIds }: { categoryIds: string[] }) => (
    <div data-testid="category-paths">{categoryIds.join(',')}</div>
  ),
  SubsectionTitle: ({ children }: { children: ReactNode }) => (
    <h2 data-testid="subsection-title">{children}</h2>
  ),
  CategoryGrid: ({ categories }: { categories: { id: string; displayName: string }[] }) => (
    <div data-testid="category-grid">
      {categories.map((c) => (
        <a key={c.id} href={`/categories/${c.id}`}>
          {c.displayName}
        </a>
      ))}
    </div>
  ),
}));

vi.mock('../components/group', () => ({
  GroupItemRow: ({ item }: { item: ApiLookupItem }) => (
    <div data-testid="group-item-row">{item.product?.name ?? item.group?.name}</div>
  ),
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

const sampleCategory: ApiCategory = {
  id: 'cat1',
  slug: 'dairy',
  displayName: 'Dairy',
  description: null,
  parents: [],
};

const sampleDescendants: ApiCategory[] = [
  { id: 'cat2', slug: 'cheese', displayName: 'Cheese', description: null, parents: ['cat1'] },
  { id: 'cat3', slug: 'yogurt', displayName: 'Yogurt', description: null, parents: ['cat1'] },
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

// The component calls useApiQuery 3 times in order:
// 1. getCategory(id)
// 2. getCategoryChildren(id)
// 3. getCategoryItems(id, { includeDescendants })
function mockQueries(
  overrides: {
    category?: Partial<UseApiQueryResult<ApiCategory>>;
    descendants?: Partial<UseApiQueryResult<ApiCategory[]>>;
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
    { ...defaults, data: sampleCategory, ...overrides.category },
    { ...defaults, data: sampleDescendants, ...overrides.descendants },
    { ...defaults, data: sampleItems, ...overrides.items },
  ];
  let callIndex = 0;
  mockUseApiQuery.mockImplementation(() => {
    const result = callResults[callIndex % callResults.length];
    callIndex++;
    return result as UseApiQueryResult<unknown>;
  });
}

function renderPage(route = '/categories/cat1') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/categories/:id" element={<CategoryDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CategoryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockQueries({ category: { loading: true, data: null } });
    renderPage();
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQueries({ category: { error: "Couldn't load this category. Try again later." } });
    renderPage();
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText("Couldn't load this category. Try again later.")).toBeInTheDocument();
  });

  it('renders not-found state when category is null', () => {
    mockQueries({ category: { data: null } });
    renderPage();
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
    expect(screen.getByTestId('cuv-title')).toHaveTextContent('Category not found');
  });

  it('renders category name and breadcrumbs', () => {
    mockQueries();
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dairy');
    expect(screen.getByTestId('category-paths')).toHaveTextContent('cat1');
  });

  it('renders subcategory cards with links', () => {
    mockQueries();
    renderPage();
    expect(screen.getByText('Cheese')).toBeInTheDocument();
    expect(screen.getByText('Yogurt')).toBeInTheDocument();

    const cheeseLink = screen.getByText('Cheese').closest('a');
    expect(cheeseLink).toHaveAttribute('href', '/categories/cat2');
    const yogurtLink = screen.getByText('Yogurt').closest('a');
    expect(yogurtLink).toHaveAttribute('href', '/categories/cat3');
  });

  it('does not render subcategories section when no descendants', () => {
    mockQueries({ descendants: { data: [] } });
    renderPage();
    expect(screen.queryByText('Subcategories')).not.toBeInTheDocument();
  });

  it('renders items via GroupItemRow', () => {
    mockQueries();
    renderPage();
    const rows = screen.getAllByTestId('group-item-row');
    expect(rows).toHaveLength(2);
    expect(screen.getByText('Cheddar')).toBeInTheDocument();
    expect(screen.getByText('Mac and Cheese')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    mockQueries({ items: { data: [] } });
    renderPage();
    expect(screen.getByTestId('cuv-title')).toHaveTextContent('No items');
    expect(screen.getByTestId('cuv-description')).toHaveTextContent(
      "Nothing's been added to this category or its subcategories.",
    );
  });

  it('filters items by name', async () => {
    const user = userEvent.setup();
    mockQueries();
    renderPage();

    const filterInput = screen.getByPlaceholderText('Filter items...');
    await user.type(filterInput, 'cheddar');

    expect(screen.getByText('Cheddar')).toBeInTheDocument();
    expect(screen.queryByText('Mac and Cheese')).not.toBeInTheDocument();
  });

  it('shows adjusted empty description when filter has no matches', async () => {
    const user = userEvent.setup();
    mockQueries();
    renderPage();

    const filterInput = screen.getByPlaceholderText('Filter items...');
    await user.type(filterInput, 'zzzznothing');

    expect(screen.getByTestId('cuv-title')).toHaveTextContent('No items');
    expect(screen.getByTestId('cuv-description')).toHaveTextContent('Try adjusting your search.');
  });

  it('toggles include descendants checkbox', async () => {
    const user = userEvent.setup();
    mockQueries();
    renderPage();

    const checkbox = screen.getByLabelText('Include descendants');
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('re-fetches items when include descendants changes', async () => {
    const user = userEvent.setup();
    mockQueries();
    renderPage();

    const initialCallCount = mockUseApiQuery.mock.calls.length;

    await user.click(screen.getByLabelText('Include descendants'));

    // Component should re-render, triggering new useApiQuery calls
    expect(mockUseApiQuery.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('shows items loading state', () => {
    mockQueries({ items: { loading: true, data: null } });
    renderPage();
    // Category is loaded, items are loading — should show items loading indicator
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dairy');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('shows different empty description when include descendants is off', async () => {
    const user = userEvent.setup();
    mockQueries({ items: { data: [] } });
    renderPage();

    await user.click(screen.getByLabelText('Include descendants'));

    expect(screen.getByTestId('cuv-description')).toHaveTextContent(
      "Nothing's been added to this category.",
    );
  });

  it('renders subsection titles', () => {
    mockQueries();
    renderPage();
    expect(screen.getByText('Subcategories')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
  });
});
