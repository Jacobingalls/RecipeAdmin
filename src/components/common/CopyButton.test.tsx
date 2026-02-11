import { render, screen, fireEvent, act } from '@testing-library/react';

import CopyButton from './CopyButton';

const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: mockWriteText },
  });
  vi.clearAllMocks();
});

describe('CopyButton', () => {
  it('renders with default label', () => {
    render(<CopyButton text="abc123" />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<CopyButton text="abc" label="Copy Key" />);
    expect(screen.getByRole('button', { name: 'Copy Key' })).toBeInTheDocument();
  });

  it('copies text to clipboard on click', async () => {
    render(<CopyButton text="secret-key-123" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(mockWriteText).toHaveBeenCalledWith('secret-key-123');
  });

  it('shows copiedLabel after click then resets', async () => {
    vi.useFakeTimers();
    render(<CopyButton text="abc" copiedLabel="Done!" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(screen.getByRole('button', { name: 'Done!' })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('applies custom className', () => {
    render(<CopyButton text="abc" className="btn btn-outline-success btn-sm" />);
    const button = screen.getByRole('button');
    expect(button.className).toBe('btn btn-outline-success btn-sm');
  });
});
