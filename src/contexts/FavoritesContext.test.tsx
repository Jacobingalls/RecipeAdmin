import { render, screen, waitFor, act } from '@testing-library/react';

import type { ApiFavorite, CreateFavoriteRequest } from '../api';
import { listFavorites, createFavorite, deleteFavorite } from '../api';

import { FavoritesProvider, useFavorites } from './FavoritesContext';

vi.mock('../api', () => ({
  listFavorites: vi.fn(),
  createFavorite: vi.fn(),
  deleteFavorite: vi.fn(),
}));

const mockListFavorites = vi.mocked(listFavorites);
const mockCreateFavorite = vi.mocked(createFavorite);
const mockDeleteFavorite = vi.mocked(deleteFavorite);

const productFavorite: ApiFavorite = {
  id: 'fav-1',
  lastUsedAt: 1700000000,
  item: {
    kind: 'product',
    productID: 'p1',
    preparationID: 'prep-1',
    servingSize: { kind: 'servings', amount: 2 },
  },
};

const groupFavorite: ApiFavorite = {
  id: 'fav-2',
  lastUsedAt: 1700000000,
  item: {
    kind: 'group',
    groupID: 'g1',
    servingSize: { kind: 'mass', amount: { amount: 100, unit: 'g' } },
  },
};

function TestConsumer() {
  const {
    favorites,
    loading,
    error,
    findFavorite,
    isFavorited,
    addFavorite,
    removeFavorite,
    refetch,
  } = useFavorites();

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error ?? 'null'}</div>
      <div data-testid="count">{favorites.length}</div>
      <div data-testid="find-product">
        {String(
          findFavorite({
            productId: 'p1',
            preparationId: 'prep-1',
            servingSize: { kind: 'servings', amount: 2 },
          })?.id ?? 'null',
        )}
      </div>
      <div data-testid="is-favorited-product">
        {String(
          isFavorited({
            productId: 'p1',
            preparationId: 'prep-1',
            servingSize: { kind: 'servings', amount: 2 },
          }),
        )}
      </div>
      <div data-testid="is-favorited-group">
        {String(
          isFavorited({
            groupId: 'g1',
            servingSize: { kind: 'mass', amount: { amount: 100, unit: 'g' } },
          }),
        )}
      </div>
      <div data-testid="is-favorited-wrong-size">
        {String(
          isFavorited({
            productId: 'p1',
            preparationId: 'prep-1',
            servingSize: { kind: 'servings', amount: 5 },
          }),
        )}
      </div>
      <button
        data-testid="add"
        onClick={() =>
          addFavorite({
            productID: 'p1',
            preparationID: 'prep-1',
            servingSize: { kind: 'servings', amount: 1 },
          } as CreateFavoriteRequest)
        }
      >
        Add
      </button>
      <button data-testid="remove" onClick={() => removeFavorite('fav-1')}>
        Remove
      </button>
      <button data-testid="refetch" onClick={refetch}>
        Refetch
      </button>
    </div>
  );
}

describe('FavoritesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListFavorites.mockResolvedValue([productFavorite, groupFavorite]);
    mockCreateFavorite.mockResolvedValue(undefined);
    mockDeleteFavorite.mockResolvedValue(undefined);
  });

  it('loads favorites on mount', async () => {
    render(
      <FavoritesProvider>
        <TestConsumer />
      </FavoritesProvider>,
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('finds a product favorite by id, preparationId, and servingSize', async () => {
    render(
      <FavoritesProvider>
        <TestConsumer />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('find-product')).toHaveTextContent('fav-1');
    expect(screen.getByTestId('is-favorited-product')).toHaveTextContent('true');
  });

  it('finds a group favorite by groupId and servingSize', async () => {
    render(
      <FavoritesProvider>
        <TestConsumer />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-favorited-group')).toHaveTextContent('true');
  });

  it('returns false for matching item with different serving size', async () => {
    render(
      <FavoritesProvider>
        <TestConsumer />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-favorited-wrong-size')).toHaveTextContent('false');
  });

  it('addFavorite calls API and refetches', async () => {
    render(
      <FavoritesProvider>
        <TestConsumer />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByTestId('add').click();
    });

    expect(mockCreateFavorite).toHaveBeenCalledWith({
      productID: 'p1',
      preparationID: 'prep-1',
      servingSize: { kind: 'servings', amount: 1 },
    });

    await waitFor(() => {
      expect(mockListFavorites).toHaveBeenCalledTimes(2);
    });
  });

  it('removeFavorite calls API and refetches', async () => {
    render(
      <FavoritesProvider>
        <TestConsumer />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByTestId('remove').click();
    });

    expect(mockDeleteFavorite).toHaveBeenCalledWith('fav-1');

    await waitFor(() => {
      expect(mockListFavorites).toHaveBeenCalledTimes(2);
    });
  });

  it('refetch re-fetches favorites', async () => {
    render(
      <FavoritesProvider>
        <TestConsumer />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(mockListFavorites).toHaveBeenCalledTimes(1);

    await act(async () => {
      screen.getByTestId('refetch').click();
    });

    await waitFor(() => {
      expect(mockListFavorites).toHaveBeenCalledTimes(2);
    });
  });

  it('handles fetch failure gracefully', async () => {
    mockListFavorites.mockRejectedValue(new Error('Network error'));

    render(
      <FavoritesProvider>
        <TestConsumer />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('error')).toHaveTextContent(
      "Couldn't load favorites. Try again later.",
    );
  });

  it('clears error on successful refetch', async () => {
    mockListFavorites.mockRejectedValueOnce(new Error('Network error'));

    render(
      <FavoritesProvider>
        <TestConsumer />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('error')).not.toHaveTextContent('null');

    mockListFavorites.mockResolvedValue([productFavorite]);

    await act(async () => {
      screen.getByTestId('refetch').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('error')).toHaveTextContent('null');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('throws when useFavorites is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useFavorites must be used within a FavoritesProvider',
    );
    consoleSpy.mockRestore();
  });

  it('matches serving sizes across API and legacy formats', async () => {
    const apiFavorite: ApiFavorite = {
      id: 'fav-api',
      lastUsedAt: 1700000000,
      item: {
        productID: 'p-api',
        preparationID: 'prep-api',
        servingSize: { servings: 3 },
      },
    };
    mockListFavorites.mockResolvedValue([apiFavorite]);

    render(
      <FavoritesProvider>
        <TestConsumerApiFormat />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('match-legacy')).toHaveTextContent('true');
  });

  it('finds a product favorite without servingSize filter', async () => {
    render(
      <FavoritesProvider>
        <TestConsumerNoSize />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('find-any')).toHaveTextContent('true');
  });
});

function TestConsumerNoSize() {
  const { loading, isFavorited } = useFavorites();

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="find-any">
        {String(isFavorited({ productId: 'p1', preparationId: 'prep-1' }))}
      </div>
    </div>
  );
}

function TestConsumerApiFormat() {
  const { loading, isFavorited } = useFavorites();

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="match-legacy">
        {String(
          isFavorited({
            productId: 'p-api',
            preparationId: 'prep-api',
            servingSize: { kind: 'servings', amount: 3 },
          }),
        )}
      </div>
    </div>
  );
}
