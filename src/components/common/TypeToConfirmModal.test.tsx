import { render, screen, fireEvent } from '@testing-library/react';

import TypeToConfirmModal from './TypeToConfirmModal';

const defaultProps = {
  isOpen: true,
  title: 'Delete Passkey',
  message: 'This will permanently delete this passkey.',
  itemName: 'My Passkey',
  confirmButtonText: 'Delete passkey',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('TypeToConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<TypeToConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal with title and message', () => {
    render(<TypeToConfirmModal {...defaultProps} />);
    expect(screen.getByText('Delete Passkey')).toBeInTheDocument();
    expect(screen.getByText('This will permanently delete this passkey.')).toBeInTheDocument();
  });

  it('renders a label asking user to type the item name', () => {
    render(<TypeToConfirmModal {...defaultProps} />);
    expect(screen.getByLabelText(/Type .* to confirm/)).toBeInTheDocument();
  });

  it('disables confirm button when input does not match', () => {
    render(<TypeToConfirmModal {...defaultProps} />);
    const confirmBtn = screen.getByRole('button', { name: 'Delete passkey' });
    expect(confirmBtn).toBeDisabled();
  });

  it('enables confirm button when input matches item name', () => {
    render(<TypeToConfirmModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'My Passkey' },
    });
    const confirmBtn = screen.getByRole('button', { name: 'Delete passkey' });
    expect(confirmBtn).toBeEnabled();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<TypeToConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'My Passkey' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Delete passkey' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<TypeToConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when close button clicked', () => {
    const onCancel = vi.fn();
    render(<TypeToConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('resets confirm text when reopened', () => {
    const { rerender } = render(<TypeToConfirmModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'My Passkey' },
    });
    rerender(<TypeToConfirmModal {...defaultProps} isOpen={false} />);
    rerender(<TypeToConfirmModal {...defaultProps} isOpen />);
    const input = screen.getByLabelText(/Type .* to confirm/) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('shows spinner and disables confirm button when isLoading is true', () => {
    const { container } = render(<TypeToConfirmModal {...defaultProps} isLoading />);
    const buttons = screen.getAllByRole('button');
    // Cancel, Close, and the confirm button
    const confirmBtn = buttons.find((b) => b.getAttribute('aria-busy') === 'true')!;
    expect(confirmBtn).toBeDisabled();
    expect(container.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('supports ReactNode message', () => {
    render(
      <TypeToConfirmModal
        {...defaultProps}
        message={
          <>
            This will delete <strong>important data</strong>.
          </>
        }
      />,
    );
    expect(screen.getByText('important data')).toBeInTheDocument();
  });
});
