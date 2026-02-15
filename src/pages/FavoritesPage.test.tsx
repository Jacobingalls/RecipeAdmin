import type { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    <div
      data-testid={`favorite-row-${favorite.id}`}
      data-remove-loading={removeLoading}
      data-name={favorite.item.product?.name ?? favorite.item.group?.name}
    >
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
  {
    id: 'fav3',
    createdAt: 1700000000,
    lastUsedAt: 1700001000,
    item: {
      product: {
        id: 'p2',
        name: 'Almond Butter',
        brand: 'NutCo',
        preparations: [
          {
            id: 'prep2',
            nutritionalInformation: { calories: { amount: 200, unit: 'kcal' } },
          },
        ],
      },
      preparationID: 'prep2',
      servingSize: { kind: 'servings', amount: 1 },
    },
  },
  {
    id: 'fav4',
    createdAt: 1700000000,
    lastUsedAt: 1700001000,
    item: {
      product: {
        id: 'p3',
        name: 'Greek Yogurt',
        brand: 'DairyCo',
        preparations: [
          {
            id: 'prep3',
            nutritionalInformation: { calories: { amount: 120, unit: 'kcal' } },
          },
        ],
      },
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

  it('filters by name', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesPage />);

    fireEvent.change(screen.getByPlaceholderText('Search by name...'), {
      target: { value: 'peanut' },
    });

    expect(screen.getByTestId('favorite-row-fav1')).toBeInTheDocument();
    expect(screen.queryByTestId('favorite-row-fav2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('favorite-row-fav3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('favorite-row-fav4')).not.toBeInTheDocument();
  });

  it('filters by brand', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesPage />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'DairyCo' } });

    expect(screen.queryByTestId('favorite-row-fav1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('favorite-row-fav2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('favorite-row-fav3')).not.toBeInTheDocument();
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

  it('populates brand filter dropdown', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesPage />);

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));
    const optionTexts = options.map((opt) => opt.textContent);

    expect(optionTexts).toContain('All brands');
    expect(optionTexts).toContain('DairyCo');
    expect(optionTexts).toContain('NutCo');
  });

  it('opens log modal when log button is clicked', () => {
    mockUseFavorites.mockReturnValue({
      ...defaultContextValue,
      favorites: sampleFavorites,
    });
    renderWithRouter(<FavoritesPage />);

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

    fireEvent.click(screen.getByTestId('log-fav1'));
    expect(screen.getByTestId('log-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close'));
    await waitFor(() => {
      expect(screen.queryByTestId('log-modal')).not.toBeInTheDocument();
    });
  });
});
