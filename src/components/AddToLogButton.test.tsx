import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { ServingSize } from '../domain';
import { logEntry } from '../api';

import AddToLogButton from './AddToLogButton';

vi.mock('../api', () => ({
  logEntry: vi.fn(),
}));

const mockLogEntry = vi.mocked(logEntry);

describe('AddToLogButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders idle state with "Add to Log" text', () => {
    render(<AddToLogButton productId="p1" servingSize={ServingSize.servings(1)} />);
    const button = screen.getByRole('button', { name: 'Add to Log' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('calls logEntry with correct params for a product', async () => {
    mockLogEntry.mockResolvedValue(undefined);
    render(
      <AddToLogButton
        productId="p1"
        preparationId="prep-1"
        servingSize={ServingSize.servings(2)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));

    await waitFor(() => {
      expect(mockLogEntry).toHaveBeenCalledWith({
        productId: 'p1',
        groupId: undefined,
        preparationId: 'prep-1',
        servingSize: { kind: 'servings', amount: 2 },
      });
    });
  });

  it('calls logEntry with correct params for a group', async () => {
    mockLogEntry.mockResolvedValue(undefined);
    render(<AddToLogButton groupId="g1" servingSize={ServingSize.servings(1)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));

    await waitFor(() => {
      expect(mockLogEntry).toHaveBeenCalledWith({
        productId: undefined,
        groupId: 'g1',
        preparationId: undefined,
        servingSize: { kind: 'servings', amount: 1 },
      });
    });
  });

  it('shows "Logging..." while request is in flight', async () => {
    let resolveLog: () => void;
    mockLogEntry.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLog = resolve;
      }),
    );

    render(<AddToLogButton productId="p1" servingSize={ServingSize.servings(1)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));

    expect(screen.getByText('Logging...')).toBeDisabled();

    await act(async () => {
      resolveLog!();
    });
  });

  it('shows "Logged!" on success then resets after delay', async () => {
    vi.useFakeTimers();
    mockLogEntry.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          queueMicrotask(() => resolve());
        }),
    );

    render(<AddToLogButton productId="p1" servingSize={ServingSize.servings(1)} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));
      await Promise.resolve();
    });

    expect(screen.getByText('Logged!')).toBeInTheDocument();
    expect(screen.getByText('Logged!')).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByRole('button', { name: 'Add to Log' })).not.toBeDisabled();
    vi.useRealTimers();
  });

  it('shows error message when log fails', async () => {
    mockLogEntry.mockRejectedValue(new Error('HTTP 500'));
    render(<AddToLogButton productId="p1" servingSize={ServingSize.servings(1)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));

    await waitFor(() => {
      expect(screen.getByText('HTTP 500')).toBeInTheDocument();
    });

    // Button should be re-enabled
    expect(screen.getByRole('button', { name: 'Add to Log' })).not.toBeDisabled();
  });

  it('clears error on next attempt', async () => {
    mockLogEntry.mockRejectedValueOnce(new Error('HTTP 500'));
    mockLogEntry.mockResolvedValueOnce(undefined);
    render(<AddToLogButton productId="p1" servingSize={ServingSize.servings(1)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));
    await waitFor(() => {
      expect(screen.getByText('HTTP 500')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));
    await waitFor(() => {
      expect(screen.queryByText('HTTP 500')).not.toBeInTheDocument();
    });
  });

  it('uses current servingSize prop value when logging', async () => {
    mockLogEntry.mockResolvedValue(undefined);
    const { rerender } = render(
      <AddToLogButton productId="p1" servingSize={ServingSize.servings(1)} />,
    );

    // Rerender with different serving size before clicking
    rerender(<AddToLogButton productId="p1" servingSize={ServingSize.servings(3)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));

    await waitFor(() => {
      expect(mockLogEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          servingSize: { kind: 'servings', amount: 3 },
        }),
      );
    });
  });
});
