import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { ServingSize } from '../domain';

import AddToFavoritesButton from './AddToFavoritesButton';

const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
const mockFindFavorite = vi.fn();

vi.mock('../contexts/FavoritesContext', () => ({
  useFavorites: () => ({
    findFavorite: mockFindFavorite,
    isFavorited: (opts: unknown) => mockFindFavorite(opts) !== null,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
    favorites: [],
    loading: false,
    refetch: vi.fn(),
  }),
}));

describe('AddToFavoritesButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFavorite.mockReturnValue(null);
    mockAddFavorite.mockResolvedValue(undefined);
    mockRemoveFavorite.mockResolvedValue(undefined);
  });

  it('renders a circular button matching MoreButton style', () => {
    render(<AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />);
    const button = screen.getByLabelText('Add to favorites');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('rounded-circle', 'border-0');
    expect(button).toHaveStyle({ width: '2rem', height: '2rem' });
  });

  it('renders empty star with aria-label "Add to favorites" when not favorited', () => {
    render(<AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />);
    const button = screen.getByLabelText('Add to favorites');
    expect(button.querySelector('.bi-star')).toBeInTheDocument();
  });

  it('renders filled yellow star with aria-label "Remove from favorites" when favorited', () => {
    mockFindFavorite.mockReturnValue({ id: 'fav-1' });
    render(<AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />);
    const button = screen.getByLabelText('Remove from favorites');
    expect(button.querySelector('.bi-star-fill.text-warning')).toBeInTheDocument();
  });

  it('calls addFavorite with product params when not favorited', async () => {
    render(
      <AddToFavoritesButton
        productId="p1"
        preparationId="prep-1"
        servingSize={ServingSize.servings(2)}
      />,
    );

    fireEvent.click(screen.getByLabelText('Add to favorites'));

    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalledWith({
        kind: 'product',
        productID: 'p1',
        preparationID: 'prep-1',
        servingSize: { kind: 'servings', amount: 2 },
      });
    });
  });

  it('calls addFavorite with group params when not favorited', async () => {
    render(<AddToFavoritesButton groupId="g1" servingSize={ServingSize.servings(1)} />);

    fireEvent.click(screen.getByLabelText('Add to favorites'));

    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalledWith({
        kind: 'group',
        groupID: 'g1',
        servingSize: { kind: 'servings', amount: 1 },
      });
    });
  });

  it('calls removeFavorite when already favorited', async () => {
    mockFindFavorite.mockReturnValue({ id: 'fav-1' });
    render(
      <AddToFavoritesButton
        productId="p1"
        preparationId="prep-1"
        servingSize={ServingSize.servings(1)}
      />,
    );

    fireEvent.click(screen.getByLabelText('Remove from favorites'));

    await waitFor(() => {
      expect(mockRemoveFavorite).toHaveBeenCalledWith('fav-1');
    });
  });

  it('shows spinner while saving', async () => {
    let resolveAdd: () => void;
    mockAddFavorite.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveAdd = resolve;
      }),
    );

    render(<AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Add to favorites'));
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    await act(async () => {
      resolveAdd!();
    });
  });

  it('uses current servingSize prop value', async () => {
    const { rerender } = render(
      <AddToFavoritesButton
        productId="p1"
        preparationId="prep-1"
        servingSize={ServingSize.servings(1)}
      />,
    );

    rerender(
      <AddToFavoritesButton
        productId="p1"
        preparationId="prep-1"
        servingSize={ServingSize.servings(3)}
      />,
    );

    fireEvent.click(screen.getByLabelText('Add to favorites'));

    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalledWith(
        expect.objectContaining({
          servingSize: { kind: 'servings', amount: 3 },
        }),
      );
    });
  });

  it('stops event propagation on click', async () => {
    const outerClick = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div onClick={outerClick}>
        <AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />
      </div>,
    );

    fireEvent.click(screen.getByLabelText('Add to favorites'));

    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalled();
    });
    expect(outerClick).not.toHaveBeenCalled();
  });
});
