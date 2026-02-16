import type { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiFavorite } from '../../api';
import * as api from '../../api';

import FavoritesTile from './FavoritesTile';

const mockUseFavorites = vi.fn();

vi.mock('../../contexts/FavoritesContext', () => ({
  useFavorites: (...args: unknown[]) => mockUseFavorites(...args),
}));

vi.mock('../../api', async () => {
  const actual = await vi.importActual('../../api');
  return {
    ...actual,
    deleteFavorite: vi.fn(),
  };
});

vi.mock('../common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ContentUnavailableView: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="content-unavailable-view">
      <span>{title}</span>
      {description && <span>{description}</span>}
    </div>
  ),
}));

vi.mock('../FavoriteRow', () => ({
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

vi.mock('../LogModal', () => ({
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

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const sampleFavorites: ApiFavorite[] = [
  {
    id: 'fav1',
    createdAt: 1700000000,
    lastUsedAt: 1700001000,
    item: {
      product: {
        id: 'p1',
        name: 'Peanut Butter',
        brand: 'NutCo',
        preparations: [
          {
            id: 'prep1',
            nutritionalInformation: { calories: { amount: 190, unit: 'kcal' } },
          },
        ],
      },
      preparationID: 'prep1',
      servingSize: { kind: 'servings', amount: 2 },
    },
  },
  {
    id: 'fav2',
    createdAt: 1700000000,
    lastUsedAt: 1700001000,
    item: {
      group: {
        id: 'g1',
        name: 'Breakfast Bowl',
        items: [],
      },
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

describe('FavoritesTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFavorites.mockReturnValue(defaultContextValue);
  });

  it('renders loading state', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      loading: true,
    });
    renderWithRouter(<FavoritesTile />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      error: "Couldn't load favorites. Try again later.",
    });
    renderWithRouter(<FavoritesTile />);
    expect(screen.getByText("Couldn't load favorites")).toBeInTheDocument();
    expect(screen.getByText('Try again later.')).toBeInTheDocument();
  });

  it('renders empty state when no favorites', () => {
    renderWithRouter(<FavoritesTile />);
    expect(screen.getByText('No favorites')).toBeInTheDocument();
    expect(screen.getByText('Add favorites from product or group pages.')).toBeInTheDocument();
  });

  it('renders the tile with "Favorites" title', () => {
    renderWithRouter(<FavoritesTile />);
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('renders "View all" link', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesTile />);
    const link = screen.getByText(/View all/);
    expect(link).toHaveAttribute('href', '/favorites');
  });

  it('renders FavoriteRow for each favorite', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesTile />);
    expect(screen.getByTestId('favorite-row-fav1')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-row-fav2')).toBeInTheDocument();
  });

  it('limits display to 6 favorites', () => {
    const manyFavorites = Array.from({ length: 8 }, (_, i) => ({
      ...sampleFavorites[0],
      id: `fav-${i}`,
    }));
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: manyFavorites,
    });
    renderWithRouter(<FavoritesTile />);
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`favorite-row-fav-${i}`)).toBeInTheDocument();
    }
    expect(screen.queryByTestId('favorite-row-fav-6')).not.toBeInTheDocument();
    expect(screen.queryByTestId('favorite-row-fav-7')).not.toBeInTheDocument();
  });

  it('opens log modal when log button is clicked', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesTile />);

    fireEvent.click(screen.getByTestId('log-fav1'));

    expect(screen.getByTestId('log-modal')).toBeInTheDocument();
  });

  it('refetches after saving from modal', async () => {
    const refetch = vi.fn();
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
      refetch,
    });

    renderWithRouter(<FavoritesTile />);

    fireEvent.click(screen.getByTestId('log-fav1'));
    fireEvent.click(screen.getByTestId('modal-saved'));

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('calls onItemLogged after saving from modal', async () => {
    const onItemLogged = vi.fn();
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });

    renderWithRouter(<FavoritesTile onItemLogged={onItemLogged} />);

    fireEvent.click(screen.getByTestId('log-fav1'));
    fireEvent.click(screen.getByTestId('modal-saved'));

    await waitFor(() => {
      expect(onItemLogged).toHaveBeenCalled();
    });
  });

  it('closes modal when onClose is triggered', async () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesTile />);

    fireEvent.click(screen.getByTestId('log-fav1'));
    expect(screen.getByTestId('log-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close'));
    await waitFor(() => {
      expect(screen.queryByTestId('log-modal')).not.toBeInTheDocument();
    });
  });

  it('calls deleteFavorite and refetches when Remove is clicked', async () => {
    const refetch = vi.fn();
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
      refetch,
    });
    mockDeleteFavorite.mockResolvedValue(undefined);

    renderWithRouter(<FavoritesTile />);

    fireEvent.click(screen.getByTestId('remove-fav1'));

    await waitFor(() => {
      expect(mockDeleteFavorite).toHaveBeenCalledWith('fav1');
    });
    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
  });
});
