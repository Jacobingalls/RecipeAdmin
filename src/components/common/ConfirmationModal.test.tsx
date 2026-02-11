import { render, screen, fireEvent } from '@testing-library/react';

import ConfirmationModal from './ConfirmationModal';

const defaultProps = {
  isOpen: true,
  title: 'Delete Passkey',
  message: 'This will permanently delete this passkey.',
  itemName: 'My Passkey',
  confirmButtonText: 'Delete passkey',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal with title and message', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Delete Passkey')).toBeInTheDocument();
    expect(screen.getByText('This will permanently delete this passkey.')).toBeInTheDocument();
  });

  it('renders a label asking user to type the item name', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByLabelText(/Type .* to confirm/)).toBeInTheDocument();
  });

  it('disables confirm button when input does not match', () => {
    render(<ConfirmationModal {...defaultProps} />);
    const confirmBtn = screen.getByRole('button', { name: 'Delete passkey' });
    expect(confirmBtn).toBeDisabled();
  });

  it('enables confirm button when input matches item name', () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'My Passkey' },
    });
    const confirmBtn = screen.getByRole('button', { name: 'Delete passkey' });
    expect(confirmBtn).toBeEnabled();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'My Passkey' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Delete passkey' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when close button clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('resets confirm text when reopened', () => {
    const { rerender } = render(<ConfirmationModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'My Passkey' },
    });
    rerender(<ConfirmationModal {...defaultProps} isOpen={false} />);
    rerender(<ConfirmationModal {...defaultProps} isOpen />);
    const input = screen.getByLabelText(/Type .* to confirm/) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('shows loading text when isLoading is true', () => {
    render(<ConfirmationModal {...defaultProps} isLoading />);
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled();
  });

  it('supports ReactNode message', () => {
    render(
      <ConfirmationModal
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
