import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { ServingSize } from '../domain';
import { createFavorite } from '../api';

import AddToFavoritesButton from './AddToFavoritesButton';

vi.mock('../api', () => ({
  createFavorite: vi.fn(),
}));

vi.mock('./common', () => ({
  Button: ({
    children,
    loading,
    disabled,
    onClick,
    variant,
    size,
  }: {
    children: unknown;
    loading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    variant?: string;
    size?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-loading={loading}
    >
      {children}
    </button>
  ),
}));

const mockCreateFavorite = vi.mocked(createFavorite);

describe('AddToFavoritesButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders idle state with "Favorite" text and star icon', () => {
    render(<AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />);
    const button = screen.getByRole('button', { name: /Favorite/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('calls createFavorite with correct params for a product', async () => {
    mockCreateFavorite.mockResolvedValue({
      id: 'fav-1',
      createdAt: 1700000000,
      lastUsedAt: 1700000000,
      item: { servingSize: { kind: 'servings', amount: 2 } },
      servingSize: { kind: 'servings', amount: 2 },
    });
    render(
      <AddToFavoritesButton
        productId="p1"
        preparationId="prep-1"
        servingSize={ServingSize.servings(2)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Favorite/i }));

    await waitFor(() => {
      expect(mockCreateFavorite).toHaveBeenCalledWith({
        kind: 'product',
        productID: 'p1',
        preparationID: 'prep-1',
        servingSize: { kind: 'servings', amount: 2 },
      });
    });
  });

  it('calls createFavorite with correct params for a group', async () => {
    mockCreateFavorite.mockResolvedValue({
      id: 'fav-2',
      createdAt: 1700000000,
      lastUsedAt: 1700000000,
      item: { servingSize: { kind: 'servings', amount: 1 } },
      servingSize: { kind: 'servings', amount: 1 },
    });
    render(<AddToFavoritesButton groupId="g1" servingSize={ServingSize.servings(1)} />);

    fireEvent.click(screen.getByRole('button', { name: /Favorite/i }));

    await waitFor(() => {
      expect(mockCreateFavorite).toHaveBeenCalledWith({
        kind: 'group',
        groupID: 'g1',
        servingSize: { kind: 'servings', amount: 1 },
      });
    });
  });

  it('shows loading state while request is in flight', async () => {
    let resolveCreate: (value: unknown) => void;
    mockCreateFavorite.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );

    render(<AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />);
    fireEvent.click(screen.getByRole('button', { name: /Favorite/i }));

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-loading', 'true');

    await act(async () => {
      resolveCreate!({
        id: 'fav-1',
        createdAt: 1700000000,
        lastUsedAt: 1700000000,
        item: { servingSize: { kind: 'servings', amount: 1 } },
        servingSize: { kind: 'servings', amount: 1 },
      });
    });
  });

  it('shows "Favorited!" on success then resets after delay', async () => {
    vi.useFakeTimers();
    mockCreateFavorite.mockImplementation(
      () =>
        new Promise((resolve) => {
          queueMicrotask(() =>
            resolve({
              id: 'fav-1',
              createdAt: 1700000000,
              lastUsedAt: 1700000000,
              item: { servingSize: { kind: 'servings', amount: 1 } },
              servingSize: { kind: 'servings', amount: 1 },
            }),
          );
        }),
    );

    render(<AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Favorite/i }));
      await Promise.resolve();
    });

    expect(screen.getByText(/Favorited/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline-success');

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByRole('button', { name: /Favorite/i })).not.toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline-secondary');
    vi.useRealTimers();
  });

  it('shows error message when create fails', async () => {
    mockCreateFavorite.mockRejectedValue(new Error('HTTP 500'));
    render(<AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />);

    fireEvent.click(screen.getByRole('button', { name: /Favorite/i }));

    await waitFor(() => {
      expect(screen.getByText('HTTP 500')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Favorite/i })).not.toBeDisabled();
  });

  it('clears error on next attempt', async () => {
    mockCreateFavorite.mockRejectedValueOnce(new Error('HTTP 500'));
    mockCreateFavorite.mockResolvedValueOnce({
      id: 'fav-1',
      createdAt: 1700000000,
      lastUsedAt: 1700000000,
      item: { servingSize: { kind: 'servings', amount: 1 } },
      servingSize: { kind: 'servings', amount: 1 },
    });
    render(<AddToFavoritesButton productId="p1" servingSize={ServingSize.servings(1)} />);

    fireEvent.click(screen.getByRole('button', { name: /Favorite/i }));
    await waitFor(() => {
      expect(screen.getByText('HTTP 500')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Favorite/i }));
    await waitFor(() => {
      expect(screen.queryByText('HTTP 500')).not.toBeInTheDocument();
    });
  });

  it('uses current servingSize prop value when creating', async () => {
    mockCreateFavorite.mockResolvedValue({
      id: 'fav-1',
      createdAt: 1700000000,
      lastUsedAt: 1700000000,
      item: { servingSize: { kind: 'servings', amount: 3 } },
      servingSize: { kind: 'servings', amount: 3 },
    });
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

    fireEvent.click(screen.getByRole('button', { name: /Favorite/i }));

    await waitFor(() => {
      expect(mockCreateFavorite).toHaveBeenCalledWith(
        expect.objectContaining({
          servingSize: { kind: 'servings', amount: 3 },
        }),
      );
    });
  });
});
