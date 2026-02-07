import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { Preparation, ServingSize } from '../domain';
import { logEntry } from '../api';

import type { LogTarget } from './LogModal';
import LogModal from './LogModal';

vi.mock('../api', () => ({
  logEntry: vi.fn(),
}));

vi.mock('./NutritionLabel', () => ({
  default: () => <div data-testid="nutrition-label" />,
}));

vi.mock('./ServingSizeSelector', () => ({
  default: ({ onChange }: { onChange: (ss: unknown) => void }) => (
    <div data-testid="serving-size-selector">
      <button data-testid="change-serving" onClick={() => onChange(ServingSize.servings(5))}>
        Change
      </button>
    </div>
  ),
}));

const mockLogEntry = vi.mocked(logEntry);

function makeTarget(overrides: Partial<LogTarget> = {}): LogTarget {
  return {
    name: 'Test Product',
    prepOrGroup: new Preparation({
      id: 'prep-1',
      nutritionalInformation: {
        calories: { amount: 200, unit: 'kcal' },
      },
      mass: { amount: 50, unit: 'g' },
      customSizes: [],
    }),
    initialServingSize: ServingSize.servings(1),
    productId: 'prod-1',
    preparationId: 'prep-1',
    ...overrides,
  };
}

describe('LogModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.classList.remove('modal-open');
  });

  it('returns null when target is null', () => {
    const { container } = render(<LogModal target={null} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with target name', () => {
    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders serving size selector and nutrition label', () => {
    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    expect(screen.getByTestId('serving-size-selector')).toBeInTheDocument();
    expect(screen.getByTestId('nutrition-label')).toBeInTheDocument();
  });

  it('renders brand when provided', () => {
    render(<LogModal target={makeTarget({ brand: 'NutCo' })} onClose={vi.fn()} />);
    expect(screen.getByText('NutCo')).toBeInTheDocument();
  });

  it('does not render brand when not provided', () => {
    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    const header = screen.getByText('Test Product').closest('.modal-header');
    expect(header?.querySelector('.text-secondary.small')).not.toBeInTheDocument();
  });

  it('has modal-dialog-scrollable class', () => {
    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    const dialog = document.querySelector('.modal-dialog');
    expect(dialog).toHaveClass('modal-dialog-scrollable');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<LogModal target={makeTarget()} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking the backdrop', () => {
    const onClose = vi.fn();
    render(<LogModal target={makeTarget()} onClose={onClose} />);
    fireEvent.mouseDown(screen.getByLabelText('Log modal'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside the modal content', () => {
    const onClose = vi.fn();
    render(<LogModal target={makeTarget()} onClose={onClose} />);
    fireEvent.mouseDown(screen.getByText('Test Product'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('logs entry successfully and shows success state', async () => {
    mockLogEntry.mockResolvedValue({ id: 'log-1' });
    const onClose = vi.fn();
    render(<LogModal target={makeTarget()} onClose={onClose} />);

    fireEvent.click(screen.getByText('Add to Log'));

    await waitFor(() => {
      expect(screen.getByText('Logged!')).toBeInTheDocument();
    });

    expect(mockLogEntry).toHaveBeenCalledWith({
      productId: 'prod-1',
      groupId: undefined,
      preparationId: 'prep-1',
      servingSize: { kind: 'servings', amount: 1 },
    });
  });

  it('calls onClose after success delay', async () => {
    vi.useFakeTimers();
    mockLogEntry.mockImplementation(
      () =>
        new Promise((resolve) => {
          queueMicrotask(() => resolve({ id: 'log-1' }));
        }),
    );
    const onClose = vi.fn();
    render(<LogModal target={makeTarget()} onClose={onClose} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Add to Log'));
      // Flush the microtask for the mock resolution
      await Promise.resolve();
    });

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('shows error when log fails', async () => {
    mockLogEntry.mockRejectedValue(new Error('HTTP 500'));
    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('Add to Log'));

    await waitFor(() => {
      expect(screen.getByText('HTTP 500')).toBeInTheDocument();
    });

    // Button should be re-enabled
    expect(screen.getByText('Add to Log')).not.toBeDisabled();
  });

  it('disables Log button while logging', async () => {
    let resolveLog: (value: { id: string }) => void;
    mockLogEntry.mockReturnValue(
      new Promise((resolve) => {
        resolveLog = resolve;
      }),
    );

    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Add to Log'));

    expect(screen.getByText('Logging...')).toBeDisabled();

    await act(async () => {
      resolveLog!({ id: 'log-1' });
    });
  });

  it('adds modal-open class to body when open', () => {
    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    expect(document.body.classList.contains('modal-open')).toBe(true);
  });

  it('removes modal-open class when unmounted', () => {
    const { unmount } = render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    expect(document.body.classList.contains('modal-open')).toBe(true);
    unmount();
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });

  it('resets state when target changes', async () => {
    mockLogEntry.mockRejectedValue(new Error('fail'));
    const { rerender } = render(<LogModal target={makeTarget()} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('Add to Log'));
    await waitFor(() => {
      expect(screen.getByText('fail')).toBeInTheDocument();
    });

    // Change target (different name triggers key change and remount)
    const newTarget = makeTarget({ name: 'New Product' });
    rerender(<LogModal target={newTarget} onClose={vi.fn()} />);

    expect(screen.getByText('New Product')).toBeInTheDocument();
    expect(screen.queryByText('fail')).not.toBeInTheDocument();
    expect(screen.getByText('Add to Log')).not.toBeDisabled();
  });
});
