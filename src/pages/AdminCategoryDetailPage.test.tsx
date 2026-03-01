import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiCategory } from '../api';
import { useApiQuery } from '../hooks';

import AdminCategoryDetailPage from './AdminCategoryDetailPage';

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

function mockQueries(
  categoryResult: Partial<UseApiQueryResult<ApiCategory>>,
  allCategoriesResult: Partial<UseApiQueryResult<ApiCategory[]>>,
) {
  mockUseApiQuery
    .mockReturnValueOnce({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      ...categoryResult,
    } as UseApiQueryResult<ApiCategory>)
    .mockReturnValueOnce({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
      ...allCategoriesResult,
    } as UseApiQueryResult<ApiCategory[]>);
}

describe('AdminCategoryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockQueries({ loading: true }, {});
    renderWithRoute(<AdminCategoryDetailPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQueries({ error: 'Server error' }, {});
    renderWithRoute(<AdminCategoryDetailPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('renders not-found state when category is null', () => {
    mockQueries({ data: null }, {});
    renderWithRoute(<AdminCategoryDetailPage />);
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
    expect(screen.getByText('Category not found')).toBeInTheDocument();
  });

  it('displays category displayName, slug, and description', () => {
    mockQueries({ data: fruitCategory }, { data: allCategories });
    renderWithRoute(<AdminCategoryDetailPage />);
    expect(screen.getByText('Fruit')).toBeInTheDocument();
    expect(screen.getByText('fruit')).toBeInTheDocument();
    expect(screen.getByText('Fresh fruit')).toBeInTheDocument();
  });

  it('renders parent categories with canonical slug-path links', () => {
    mockQueries({ data: fruitCategory }, { data: allCategories });
    renderWithRoute(<AdminCategoryDetailPage />);
    const links = screen.getAllByRole('link');
    const parentLink = links.find((l) => l.textContent?.includes('Food'));
    expect(parentLink).toHaveAttribute('href', '/admin/categories/food');
  });

  it('renders children categories with extended slug-path links sorted alphabetically', () => {
    mockQueries({ data: fruitCategory }, { data: allCategories });
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

  it('shows "No parents" for root categories', () => {
    mockQueries({ data: rootCategory }, { data: allCategories });
    renderWithRoute(<AdminCategoryDetailPage />, '/admin/categories/food');
    expect(screen.getByText('No parents')).toBeInTheDocument();
  });

  it('shows "No children" for leaf categories', () => {
    mockQueries({ data: citrusCategory }, { data: allCategories });
    renderWithRoute(<AdminCategoryDetailPage />, '/admin/categories/food.fruit.citrus');
    expect(screen.getByText('No children')).toBeInTheDocument();
  });
});
