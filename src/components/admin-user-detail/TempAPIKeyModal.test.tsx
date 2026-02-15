import { render, screen, fireEvent } from '@testing-library/react';

import type { AdminTempAPIKeyResponse } from '../../api';

import TempAPIKeyModal from './TempAPIKeyModal';

vi.mock('../common', async () => {
  const actual = await vi.importActual('../common');
  return {
    ...actual,
    CopyButton: ({ text }: { text: string }) => (
      <button data-testid="copy-button" data-text={text}>
        Copy
      </button>
    ),
  };
});

const tempKey: AdminTempAPIKeyResponse = {
  id: 'tk1',
  key: 'temp-key-abc123',
  expiresAt: 1700100000,
};

const onClose = vi.fn();

describe('TempAPIKeyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <TempAPIKeyModal isOpen={false} tempKey={tempKey} onClose={onClose} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with title when open', () => {
    render(<TempAPIKeyModal isOpen tempKey={tempKey} onClose={onClose} />);
    expect(screen.getByText('Temporary API Key')).toBeInTheDocument();
  });

  it('displays the key value in a readonly input', () => {
    render(<TempAPIKeyModal isOpen tempKey={tempKey} onClose={onClose} />);
    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    expect(input.value).toBe('temp-key-abc123');
    expect(input).toHaveAttribute('readonly');
  });

  it('renders CopyButton with the key text', () => {
    render(<TempAPIKeyModal isOpen tempKey={tempKey} onClose={onClose} />);
    const copyBtn = screen.getByTestId('copy-button');
    expect(copyBtn).toHaveAttribute('data-text', 'temp-key-abc123');
  });

  it('displays expiry date', () => {
    render(<TempAPIKeyModal isOpen tempKey={tempKey} onClose={onClose} />);
    expect(screen.getByText(/Expires/)).toBeInTheDocument();
  });

  it('shows loading spinner when tempKey is null', () => {
    render(<TempAPIKeyModal isOpen tempKey={null} onClose={onClose} />);
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(screen.queryByLabelText('API Key')).not.toBeInTheDocument();
  });

  it('calls onClose when Done button is clicked', () => {
    render(<TempAPIKeyModal isOpen tempKey={tempKey} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when header close button is clicked', () => {
    render(<TempAPIKeyModal isOpen tempKey={tempKey} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label on the modal', () => {
    render(<TempAPIKeyModal isOpen tempKey={tempKey} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Temporary API key');
  });
});
