import { render, screen, act, waitFor } from '@testing-library/react';

import type { ApiCategory, ApiFetchMeta } from '../api';

import { CategoriesProvider, useCategories } from './CategoriesContext';

vi.mock('../api', () => ({
  listCategoriesWithMeta: vi.fn(),
}));

// Import after mock setup
const { listCategoriesWithMeta } = await import('../api');
const mockListCategoriesWithMeta = vi.mocked(listCategoriesWithMeta);

const sampleCategories: ApiCategory[] = [
  {
    id: 'root',
    slug: 'food',
    displayName: 'Food',
    description: null,
    parents: [],
    children: ['child'],
    notes: [],
  },
  {
    id: 'child',
    slug: 'dairy',
    displayName: 'Dairy',
    description: null,
    parents: ['root'],
    children: [],
    notes: [],
  },
];

function mockApiResponse(
  categories: ApiCategory[] = sampleCategories,
  meta: ApiFetchMeta = { maxAge: 300 },
) {
  mockListCategoriesWithMeta.mockResolvedValue({ data: categories, meta });
}

function mockApiError() {
  mockListCategoriesWithMeta.mockRejectedValue(new Error('Network error'));
}

function TestConsumer() {
  const { allCategories, lookup, loading, error } = useCategories();
  return (
    <div>
      {loading && <span data-testid="loading">Loading</span>}
      {error && <span data-testid="error">{error}</span>}
      <span data-testid="count">{allCategories.length}</span>
      <span data-testid="has-root">{lookup.has('root') ? 'yes' : 'no'}</span>
    </div>
  );
}

function AddCategoriesConsumer({ cats }: { cats: ApiCategory[] }) {
  const { addCategories, allCategories } = useCategories();
  return (
    <div>
      <span data-testid="count">{allCategories.length}</span>
      <button data-testid="add-btn" onClick={() => addCategories(cats)}>
        Add
      </button>
    </div>
  );
}

function RefreshConsumer() {
  const { refresh, loading } = useCategories();
  return (
    <div>
      {loading && <span data-testid="loading">Loading</span>}
      <button data-testid="refresh-btn" onClick={refresh}>
        Refresh
      </button>
    </div>
  );
}

describe('CategoriesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches categories on mount and provides them', async () => {
    mockApiResponse();
    render(
      <CategoriesProvider>
        <TestConsumer />
      </CategoriesProvider>,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });
    expect(screen.getByTestId('has-root')).toHaveTextContent('yes');
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('provides error state on fetch failure', async () => {
    mockApiError();
    render(
      <CategoriesProvider>
        <TestConsumer />
      </CategoriesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        "Couldn't load categories. Try again later.",
      );
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('calls listCategoriesWithMeta with depth: 1', async () => {
    mockApiResponse();
    render(
      <CategoriesProvider>
        <TestConsumer />
      </CategoriesProvider>,
    );

    await waitFor(() => {
      expect(mockListCategoriesWithMeta).toHaveBeenCalledWith({ depth: 1 });
    });
  });

  it('addCategories merges new categories into the cache', async () => {
    mockApiResponse();
    const newCat: ApiCategory = {
      id: 'new',
      slug: 'snacks',
      displayName: 'Snacks',
      description: null,
      parents: [],
      children: [],
      notes: [],
    };

    render(
      <CategoriesProvider>
        <AddCategoriesConsumer cats={[newCat]} />
      </CategoriesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });

    await act(async () => {
      screen.getByTestId('add-btn').click();
    });

    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });

  it('addCategories updates existing categories', async () => {
    mockApiResponse();
    const updated: ApiCategory = {
      ...sampleCategories[0],
      displayName: 'Updated Food',
    };

    render(
      <CategoriesProvider>
        <AddCategoriesConsumer cats={[updated]} />
      </CategoriesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });

    await act(async () => {
      screen.getByTestId('add-btn').click();
    });

    // Count stays 2 — it replaced, not added
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('refresh triggers a new fetch', async () => {
    mockApiResponse();
    render(
      <CategoriesProvider>
        <RefreshConsumer />
      </CategoriesProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(mockListCategoriesWithMeta).toHaveBeenCalledTimes(1);

    mockApiResponse([sampleCategories[0]], { maxAge: 600 });

    await act(async () => {
      screen.getByTestId('refresh-btn').click();
    });

    await waitFor(() => {
      expect(mockListCategoriesWithMeta).toHaveBeenCalledTimes(2);
    });
  });

  it('throws when useCategories is used outside provider', () => {
    // Suppress console.error for the expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useCategories must be used within a CategoriesProvider',
    );

    spy.mockRestore();
  });
});
