import type { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiFavorite } from '../api';
import * as api from '../api';
import { useApiQuery } from '../hooks/useApiQuery';

import FavoritesPage from './FavoritesPage';

vi.mock('../hooks/useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    logEntry: vi.fn(),
    deleteFavorite: vi.fn(),
    touchFavoriteLastUsed: vi.fn(),
  };
});

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ContentUnavailableView: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="content-unavailable-view">
      <span>{title}</span>
      {description && <span>{description}</span>}
    </div>
  ),
}));

vi.mock('../components/FavoriteRow', () => ({
  default: ({
    favorite,
    logState,
    onLog,
    onLogWithSize,
    onRemove,
    removeLoading,
  }: {
    favorite: ApiFavorite;
    logState: string;
    onLog: (fav: ApiFavorite) => void;
    onLogWithSize: (fav: ApiFavorite) => void;
    onRemove: (fav: ApiFavorite) => void;
    removeLoading: boolean;
  }) => (
    <div
      data-testid={`favorite-row-${favorite.id}`}
      data-log-state={logState}
      data-remove-loading={removeLoading}
      data-name={favorite.item.product?.name ?? favorite.item.group?.name}
    >
      <button data-testid={`log-${favorite.id}`} onClick={() => onLog(favorite)}>
        Log
      </button>
      <button data-testid={`log-with-size-${favorite.id}`} onClick={() => onLogWithSize(favorite)}>
        Log with size
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

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockLogEntry = vi.mocked(api.logEntry);
const mockDeleteFavorite = vi.mocked(api.deleteFavorite);
const mockTouchLastUsed = vi.mocked(api.touchFavoriteLastUsed);

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

const defaultResult = {
  data: null,
  loading: false,
  error: null,
  refetch: vi.fn(),
};

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: [],
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Favorites');
  });

  it('renders loading state', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      loading: true,
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      error: "Couldn't load favorites. Try again later.",
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByText("Couldn't load favorites")).toBeInTheDocument();
  });

  it('renders empty state when no favorites', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: [],
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByText('No favorites')).toBeInTheDocument();
    expect(screen.getByText('Add favorites from product or group pages.')).toBeInTheDocument();
  });

  it('renders search inputs', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All brands')).toBeInTheDocument();
  });

  it('renders FavoriteRow for each favorite', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);
    expect(screen.getByTestId('favorite-row-fav1')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-row-fav2')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-row-fav3')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-row-fav4')).toBeInTheDocument();
  });

  it('filters by name', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
    } as UseApiQueryResult<unknown>);
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
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'DairyCo' } });

    expect(screen.queryByTestId('favorite-row-fav1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('favorite-row-fav2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('favorite-row-fav3')).not.toBeInTheDocument();
    expect(screen.getByTestId('favorite-row-fav4')).toBeInTheDocument();
  });

  it('shows filtered empty state when filters match nothing', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);

    fireEvent.change(screen.getByPlaceholderText('Search by name...'), {
      target: { value: 'nonexistent' },
    });

    expect(screen.getByText('No favorites')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
  });

  it('populates brand filter dropdown', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));
    const optionTexts = options.map((opt) => opt.textContent);

    expect(optionTexts).toContain('All brands');
    expect(optionTexts).toContain('DairyCo');
    expect(optionTexts).toContain('NutCo');
  });

  it('calls logEntry on direct log click', async () => {
    const refetch = vi.fn();
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
      refetch,
    } as UseApiQueryResult<unknown>);
    mockLogEntry.mockResolvedValue({ id: 'log1' });
    mockTouchLastUsed.mockResolvedValue(sampleFavorites[0]);

    renderWithRouter(<FavoritesPage />);

    fireEvent.click(screen.getByTestId('log-fav1'));

    await waitFor(() => {
      expect(mockLogEntry).toHaveBeenCalledWith({
        productId: 'p1',
        preparationId: 'prep1',
        servingSize: { kind: 'servings', amount: 2 },
      });
    });
  });

  it('opens log modal when "Log with size" is clicked', () => {
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);

    fireEvent.click(screen.getByTestId('log-with-size-fav1'));

    expect(screen.getByTestId('log-modal')).toBeInTheDocument();
  });

  it('calls deleteFavorite and refetches on remove', async () => {
    const refetch = vi.fn();
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
      refetch,
    } as UseApiQueryResult<unknown>);
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
    mockUseApiQuery.mockReturnValue({
      ...defaultResult,
      data: sampleFavorites,
    } as UseApiQueryResult<unknown>);
    renderWithRouter(<FavoritesPage />);

    fireEvent.click(screen.getByTestId('log-with-size-fav1'));
    expect(screen.getByTestId('log-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close'));
    await waitFor(() => {
      expect(screen.queryByTestId('log-modal')).not.toBeInTheDocument();
    });
  });
});
