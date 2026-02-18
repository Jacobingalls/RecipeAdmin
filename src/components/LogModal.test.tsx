import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { Preparation, ServingSize } from '../domain';
import { logEntry, updateLogEntry } from '../api';

import type { LogTarget } from './LogModal';
import LogModal, { epochToDatetimeLocal, datetimeLocalToEpoch } from './LogModal';

vi.mock('../api', () => ({
  logEntry: vi.fn(),
  updateLogEntry: vi.fn(),
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

vi.mock('./time-picker', () => ({
  TimePicker: ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div data-testid="time-picker" data-value={value}>
      <button data-testid="change-time" onClick={() => onChange(value + 60)}>
        Change time
      </button>
    </div>
  ),
}));

const mockLogEntry = vi.mocked(logEntry);
const mockUpdateLogEntry = vi.mocked(updateLogEntry);

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

describe('epochToDatetimeLocal', () => {
  it('converts epoch seconds to datetime-local format', () => {
    const epoch = new Date(2025, 0, 15, 14, 30).getTime() / 1000;
    expect(epochToDatetimeLocal(epoch)).toBe('2025-01-15T14:30');
  });

  it('zero-pads single-digit months and hours', () => {
    const epoch = new Date(2025, 2, 5, 8, 5).getTime() / 1000;
    expect(epochToDatetimeLocal(epoch)).toBe('2025-03-05T08:05');
  });
});

describe('datetimeLocalToEpoch', () => {
  it('converts datetime-local string to epoch seconds', () => {
    const expected = new Date(2025, 0, 15, 14, 30).getTime() / 1000;
    expect(datetimeLocalToEpoch('2025-01-15T14:30')).toBe(expected);
  });

  it('round-trips with epochToDatetimeLocal', () => {
    const epoch = new Date(2025, 5, 1, 9, 0).getTime() / 1000;
    expect(datetimeLocalToEpoch(epochToDatetimeLocal(epoch))).toBe(epoch);
  });
});

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
    const titleWrapper = screen.getByText('Test Product').parentElement!;
    expect(titleWrapper.querySelector('.text-secondary.small')).not.toBeInTheDocument();
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
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside the modal content', () => {
    const onClose = vi.fn();
    render(<LogModal target={makeTarget()} onClose={onClose} />);
    fireEvent.mouseDown(screen.getByText('Test Product'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders time picker with When label', () => {
    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    expect(screen.getByText('When')).toBeInTheDocument();
    expect(screen.getByTestId('time-picker')).toBeInTheDocument();
  });

  it('defaults timestamp to current time when no initialTimestamp', () => {
    const fixedNow = new Date(2025, 5, 15, 12, 0).getTime();
    const spy = vi.spyOn(Date, 'now').mockReturnValue(fixedNow);
    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    const picker = screen.getByTestId('time-picker');
    expect(picker).toHaveAttribute('data-value', String(Math.floor(fixedNow / 1000)));
    spy.mockRestore();
  });

  it('uses initialTimestamp when provided', () => {
    const ts = new Date(2025, 0, 10, 8, 30).getTime() / 1000;
    render(<LogModal target={makeTarget({ initialTimestamp: ts })} onClose={vi.fn()} />);
    const picker = screen.getByTestId('time-picker');
    expect(picker).toHaveAttribute('data-value', String(ts));
  });

  it('sends timestamp on create', async () => {
    const fixedNow = new Date(2025, 5, 15, 12, 0).getTime();
    const spy = vi.spyOn(Date, 'now').mockReturnValue(fixedNow);
    mockLogEntry.mockResolvedValue(undefined);
    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    spy.mockRestore();

    fireEvent.click(screen.getByText('Add to Log'));

    await waitFor(() => {
      expect(screen.getByText('Logged!')).toBeInTheDocument();
    });

    expect(mockLogEntry).toHaveBeenCalledWith({
      productId: 'prod-1',
      groupId: undefined,
      preparationId: 'prep-1',
      servingSize: { kind: 'servings', amount: 1 },
      timestamp: Math.floor(fixedNow / 1000),
    });
  });

  it('calls onClose after success delay', async () => {
    vi.useFakeTimers();
    mockLogEntry.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          queueMicrotask(() => resolve());
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

  it('fires onSaved callback on successful create', async () => {
    mockLogEntry.mockResolvedValue(undefined);
    const onSaved = vi.fn();
    render(<LogModal target={makeTarget()} onClose={vi.fn()} onSaved={onSaved} />);

    fireEvent.click(screen.getByText('Add to Log'));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled();
    });
  });

  it('disables Log button while logging', async () => {
    let resolveLog: () => void;
    mockLogEntry.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLog = resolve;
      }),
    );

    render(<LogModal target={makeTarget()} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Add to Log'));

    expect(screen.getByText('Logging...')).toBeDisabled();

    await act(async () => {
      resolveLog!();
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

  describe('edit mode', () => {
    const editTimestamp = new Date(2025, 0, 10, 8, 30).getTime() / 1000;

    it('shows Save button when editEntryId is set', () => {
      render(
        <LogModal
          target={makeTarget({ editEntryId: 'entry-1', initialTimestamp: editTimestamp })}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.queryByText('Add to Log')).not.toBeInTheDocument();
    });

    it('calls updateLogEntry with item and timestamp on save', async () => {
      mockUpdateLogEntry.mockResolvedValue({
        id: 'entry-1',
        timestamp: editTimestamp,
        item: {
          kind: 'product',
          productID: 'prod-1',
          servingSize: { kind: 'servings', amount: 1 },
        },
      });
      render(
        <LogModal
          target={makeTarget({ editEntryId: 'entry-1', initialTimestamp: editTimestamp })}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Saved!')).toBeInTheDocument();
      });

      expect(mockUpdateLogEntry).toHaveBeenCalledWith(
        'entry-1',
        {
          kind: 'product',
          productID: 'prod-1',
          preparationID: 'prep-1',
          servingSize: { kind: 'servings', amount: 1 },
        },
        editTimestamp,
      );
      expect(mockLogEntry).not.toHaveBeenCalled();
    });

    it('sends group item when editing a group entry', async () => {
      mockUpdateLogEntry.mockResolvedValue({
        id: 'entry-2',
        timestamp: editTimestamp,
        item: {
          kind: 'group',
          groupID: 'group-1',
          servingSize: { kind: 'servings', amount: 1 },
        },
      });
      render(
        <LogModal
          target={makeTarget({
            editEntryId: 'entry-2',
            initialTimestamp: editTimestamp,
            groupId: 'group-1',
            productId: undefined,
            preparationId: undefined,
          })}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Saved!')).toBeInTheDocument();
      });

      expect(mockUpdateLogEntry).toHaveBeenCalledWith(
        'entry-2',
        {
          kind: 'group',
          groupID: 'group-1',
          servingSize: { kind: 'servings', amount: 1 },
        },
        editTimestamp,
      );
    });

    it('shows Saving... while update is in progress', async () => {
      let resolveUpdate: (value: unknown) => void;
      mockUpdateLogEntry.mockReturnValue(
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
      );

      render(
        <LogModal
          target={makeTarget({ editEntryId: 'entry-1', initialTimestamp: editTimestamp })}
          onClose={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByText('Save'));

      expect(screen.getByText('Saving...')).toBeDisabled();

      await act(async () => {
        resolveUpdate!({
          id: 'entry-1',
          timestamp: editTimestamp,
          item: {
            kind: 'product',
            productID: 'prod-1',
            servingSize: { kind: 'servings', amount: 1 },
          },
        });
      });
    });

    it('fires onSaved callback on successful edit', async () => {
      mockUpdateLogEntry.mockResolvedValue({
        id: 'entry-1',
        timestamp: editTimestamp,
        item: {
          kind: 'product',
          productID: 'prod-1',
          servingSize: { kind: 'servings', amount: 1 },
        },
      });
      const onSaved = vi.fn();
      render(
        <LogModal
          target={makeTarget({ editEntryId: 'entry-1', initialTimestamp: editTimestamp })}
          onClose={vi.fn()}
          onSaved={onSaved}
        />,
      );

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(onSaved).toHaveBeenCalled();
      });
    });

    it('shows error when update fails', async () => {
      mockUpdateLogEntry.mockRejectedValue(new Error('HTTP 500'));
      render(
        <LogModal
          target={makeTarget({ editEntryId: 'entry-1', initialTimestamp: editTimestamp })}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('HTTP 500')).toBeInTheDocument();
      });

      expect(screen.getByText('Save')).not.toBeDisabled();
    });
  });
});
