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

function renderComponent(categoryIds: string[]) {
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

  it('returns null when categoryIds is empty', () => {
    mockQuery({ data: sampleCategories });
    const { container } = renderComponent([]);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when categories have not loaded', () => {
    mockQuery({ data: null, loading: true });
    const { container } = renderComponent(['leaf']);
    expect(container.innerHTML).toBe('');
  });

  it('renders full ancestor path for a leaf category', () => {
    mockQuery({ data: sampleCategories });
    renderComponent(['leaf']);
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Cheese')).toBeInTheDocument();
  });

  it('renders a single breadcrumb for a root category', () => {
    mockQuery({ data: sampleCategories });
    renderComponent(['standalone']);
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Snacks')).toBeInTheDocument();
    expect(screen.queryByText('Food')).not.toBeInTheDocument();
  });

  it('renders clickable links with root Categories link first', () => {
    mockQuery({ data: sampleCategories });
    renderComponent(['leaf']);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute('href', '/categories');
    expect(links[1]).toHaveAttribute('href', '/categories/root');
    expect(links[2]).toHaveAttribute('href', '/categories/mid');
    expect(links[3]).toHaveAttribute('href', '/categories/leaf');
  });

  it('renders multiple breadcrumb navs for multiple category IDs', () => {
    mockQuery({ data: sampleCategories });
    renderComponent(['leaf', 'standalone']);
    const navs = screen.getAllByRole('navigation');
    expect(navs).toHaveLength(2);
  });

  it('skips unknown category IDs', () => {
    mockQuery({ data: sampleCategories });
    const { container } = renderComponent(['nonexistent']);
    // The unknown ID produces an empty path, so null is returned for that entry
    // but the wrapper div still renders
    expect(container.querySelectorAll('nav')).toHaveLength(0);
  });

  it('marks the leaf breadcrumb item as active', () => {
    mockQuery({ data: sampleCategories });
    renderComponent(['leaf']);
    const items = screen.getAllByRole('listitem');
    const lastItem = items[items.length - 1];
    expect(lastItem).toHaveClass('active');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders root Categories link for each breadcrumb trail', () => {
    mockQuery({ data: sampleCategories });
    renderComponent(['leaf', 'standalone']);
    const categoriesLinks = screen.getAllByText('Categories');
    expect(categoriesLinks).toHaveLength(2);
    categoriesLinks.forEach((link) => {
      expect(link.closest('a')).toHaveAttribute('href', '/categories');
    });
  });
});
