import type { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiFavorite } from '../api';
import * as api from '../api';

import FavoritesPage from './FavoritesPage';

const mockUseFavorites = vi.fn();

vi.mock('../contexts/FavoritesContext', () => ({
  useFavorites: (...args: unknown[]) => mockUseFavorites(...args),
}));

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    deleteFavorite: vi.fn(),
    getProduct: vi.fn(),
    getGroup: vi.fn(),
  };
});

vi.mock('../components/common', async () => {
  const actual = await vi.importActual('../components/common');
  return {
    ...actual,
    LoadingState: () => <div data-testid="loading-state" />,
    ContentUnavailableView: ({ title, description }: { title: string; description?: string }) => (
      <div data-testid="content-unavailable-view">
        <span>{title}</span>
        {description && <span>{description}</span>}
      </div>
    ),
  };
});

vi.mock('../components/FavoriteRow', () => ({
  default: ({
    favorite,
    onLog,
    onRemove,
    removeLoading,
  }: {
    favorite: ApiFavorite;
    onLog: (fav: ApiFavorite) => void;
    onRemove: (fav: ApiFavorite) => void;
    removeLoading: boolean;
  }) => (
    <div data-testid={`favorite-row-${favorite.id}`} data-remove-loading={removeLoading}>
      <button data-testid={`log-${favorite.id}`} onClick={() => onLog(favorite)}>
        Log
      </button>
      <button data-testid={`remove-${favorite.id}`} onClick={() => onRemove(favorite)}>
        Remove
      </button>
    </div>
  ),
}));

vi.mock('../components/LogModal', () => ({
  default: ({
    target,
    onClose,
    onSaved,
  }: {
    target: Record<string, unknown> | null;
    onClose: () => void;
    onSaved?: () => void;
  }) =>
    target ? (
      <div data-testid="log-modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {onSaved && (
          <button data-testid="modal-saved" onClick={onSaved}>
            Saved
          </button>
        )}
      </div>
    ) : null,
}));

const mockDeleteFavorite = vi.mocked(api.deleteFavorite);
const mockGetProduct = vi.mocked(api.getProduct);
const mockGetGroup = vi.mocked(api.getGroup);

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const sampleFavorites: ApiFavorite[] = [
  {
    id: 'fav1',
    lastUsedAt: 1700001000,
    item: {
      kind: 'product',
      productID: 'p1',
      preparationID: 'prep1',
      servingSize: { kind: 'servings', amount: 2 },
    },
  },
  {
    id: 'fav2',
    lastUsedAt: 1700001000,
    item: {
      kind: 'group',
      groupID: 'g1',
      servingSize: { kind: 'servings', amount: 1 },
    },
  },
  {
    id: 'fav3',
    lastUsedAt: 1700001000,
    item: {
      kind: 'product',
      productID: 'p2',
      preparationID: 'prep2',
      servingSize: { kind: 'servings', amount: 1 },
    },
  },
  {
    id: 'fav4',
    lastUsedAt: 1700001000,
    item: {
      kind: 'product',
      productID: 'p3',
      preparationID: 'prep3',
      servingSize: { kind: 'servings', amount: 1 },
    },
  },
];

const defaultContextValue = {
  favorites: [] as ApiFavorite[],
  loading: false,
  error: null as string | null,
  findFavorite: () => null,
  isFavorited: () => false,
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  refetch: vi.fn(),
};

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFavorites.mockReturnValue(defaultContextValue);
    mockGetProduct.mockResolvedValue({
      id: 'p1',
      name: 'Peanut Butter',
      brand: 'NutCo',
      preparations: [{ id: 'prep1', nutritionalInformation: {} }],
    });
    mockGetGroup.mockResolvedValue({ id: 'g1', name: 'Breakfast Bowl', items: [] });
  });

  it('renders the page heading', () => {
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Favorites');
  });

  it('renders loading state', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      loading: true,
    });
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      error: "Couldn't load favorites. Try again later.",
    });
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByText("Couldn't load favorites")).toBeInTheDocument();
  });

  it('renders empty state when no favorites', () => {
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByText('No favorites')).toBeInTheDocument();
    expect(screen.getByText('Add favorites from product or group pages.')).toBeInTheDocument();
  });

  it('renders search inputs', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All brands')).toBeInTheDocument();
  });

  it('renders FavoriteRow for each favorite', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByTestId('favorite-row-fav1')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-row-fav2')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-row-fav3')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-row-fav4')).toBeInTheDocument();
  });

  it('shows filtered empty state when filters match nothing', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesPage />);

    fireEvent.change(screen.getByPlaceholderText('Search by name...'), {
      target: { value: 'nonexistent' },
    });

    expect(screen.getByText('No favorites')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
  });

  it('opens log modal when log button is clicked', async () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesPage />);

    // Wait for products/groups to be fetched so buildFavoriteLogTarget can resolve
    await act(async () => {});

    fireEvent.click(screen.getByTestId('log-fav1'));

    expect(screen.getByTestId('log-modal')).toBeInTheDocument();
  });

  it('calls deleteFavorite and refetches on remove', async () => {
    const refetch = vi.fn();
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
      refetch,
    });
    mockDeleteFavorite.mockResolvedValue(undefined);

    renderWithRouter(<FavoritesPage />);

    fireEvent.click(screen.getByTestId('remove-fav1'));

    await waitFor(() => {
      expect(mockDeleteFavorite).toHaveBeenCalledWith('fav1');
    });
    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('closes modal when onClose is triggered', async () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesPage />);

    // Wait for products/groups to be fetched so buildFavoriteLogTarget can resolve
    await act(async () => {});

    fireEvent.click(screen.getByTestId('log-fav1'));
    expect(screen.getByTestId('log-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close'));
    await waitFor(() => {
      expect(screen.queryByTestId('log-modal')).not.toBeInTheDocument();
    });
  });
});
