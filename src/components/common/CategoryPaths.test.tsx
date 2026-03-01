import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiCategory } from '../../api';
import type { UseApiQueryResult } from '../../hooks/useApiQuery';
import { useApiQuery } from '../../hooks';

import CategoryPaths from './CategoryPaths';

vi.mock('../../hooks', () => ({
  useApiQuery: vi.fn(),
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

const sampleCategories: ApiCategory[] = [
  {
    id: 'root',
    slug: 'food',
    displayName: 'Food',
    description: null,
    parents: [],
    children: ['mid'],
    notes: [],
  },
  {
    id: 'mid',
    slug: 'dairy',
    displayName: 'Dairy',
    description: null,
    parents: ['root'],
    children: ['leaf'],
    notes: [],
  },
  {
    id: 'leaf',
    slug: 'cheese',
    displayName: 'Cheese',
    description: null,
    parents: ['mid'],
    children: [],
    notes: [],
  },
  {
    id: 'standalone',
    slug: 'snacks',
    displayName: 'Snacks',
    description: null,
    parents: [],
    children: [],
    notes: [],
  },
];

function mockQuery(overrides: Partial<UseApiQueryResult<ApiCategory[]>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ApiCategory[]>);
}

function renderWithPath(path: string) {
  return render(
    <MemoryRouter>
      <CategoryPaths path={path} />
    </MemoryRouter>,
  );
}

function renderWithIds(categoryIds: string[]) {
  return render(
    <MemoryRouter>
      <CategoryPaths categoryIds={categoryIds} />
    </MemoryRouter>,
  );
}

describe('CategoryPaths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('path mode', () => {
    it('returns null when categories have not loaded', () => {
      mockQuery({ data: null, loading: true });
      const { container } = renderWithPath('food.dairy.cheese');
      expect(container.innerHTML).toBe('');
    });

    it('renders full ancestor path for a slug path', () => {
      mockQuery({ data: sampleCategories });
      renderWithPath('food.dairy.cheese');
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
      expect(screen.getByText('Cheese')).toBeInTheDocument();
    });

    it('renders clickable links with cumulative slug paths', () => {
      mockQuery({ data: sampleCategories });
      renderWithPath('food.dairy.cheese');
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(4);
      expect(links[0]).toHaveAttribute('href', '/categories');
      expect(links[1]).toHaveAttribute('href', '/categories/food');
      expect(links[2]).toHaveAttribute('href', '/categories/food.dairy');
      expect(links[3]).toHaveAttribute('href', '/categories/food.dairy.cheese');
    });

    it('renders a single breadcrumb for a root slug', () => {
      mockQuery({ data: sampleCategories });
      renderWithPath('snacks');
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Snacks')).toBeInTheDocument();
      expect(screen.queryByText('Food')).not.toBeInTheDocument();
    });

    it('marks the leaf breadcrumb item as active', () => {
      mockQuery({ data: sampleCategories });
      renderWithPath('food.dairy.cheese');
      const items = screen.getAllByRole('listitem');
      const lastItem = items[items.length - 1];
      expect(lastItem).toHaveClass('active');
      expect(lastItem).toHaveAttribute('aria-current', 'page');
    });

    it('returns null for unknown slug path', () => {
      mockQuery({ data: sampleCategories });
      const { container } = renderWithPath('nonexistent');
      expect(container.innerHTML).toBe('');
    });
  });

  describe('categoryIds mode', () => {
    it('returns null when categoryIds is empty', () => {
      mockQuery({ data: sampleCategories });
      const { container } = renderWithIds([]);
      expect(container.innerHTML).toBe('');
    });

    it('returns null when categories have not loaded', () => {
      mockQuery({ data: null, loading: true });
      const { container } = renderWithIds(['leaf']);
      expect(container.innerHTML).toBe('');
    });

    it('renders full ancestor path for a leaf category ID', () => {
      mockQuery({ data: sampleCategories });
      renderWithIds(['leaf']);
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
      expect(screen.getByText('Cheese')).toBeInTheDocument();
    });

    it('renders slug-based links for category IDs', () => {
      mockQuery({ data: sampleCategories });
      renderWithIds(['leaf']);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(4);
      expect(links[0]).toHaveAttribute('href', '/categories');
      expect(links[1]).toHaveAttribute('href', '/categories/food');
      expect(links[2]).toHaveAttribute('href', '/categories/food.dairy');
      expect(links[3]).toHaveAttribute('href', '/categories/food.dairy.cheese');
    });

    it('renders multiple breadcrumb navs for multiple category IDs', () => {
      mockQuery({ data: sampleCategories });
      renderWithIds(['leaf', 'standalone']);
      const navs = screen.getAllByRole('navigation');
      expect(navs).toHaveLength(2);
    });

    it('skips unknown category IDs', () => {
      mockQuery({ data: sampleCategories });
      const { container } = renderWithIds(['nonexistent']);
      expect(container.innerHTML).toBe('');
    });

    it('renders root Categories link for each breadcrumb trail', () => {
      mockQuery({ data: sampleCategories });
      renderWithIds(['leaf', 'standalone']);
      const categoriesLinks = screen.getAllByText('Categories');
      expect(categoriesLinks).toHaveLength(2);
      categoriesLinks.forEach((link) => {
        expect(link.closest('a')).toHaveAttribute('href', '/categories');
      });
    });
  });
});
