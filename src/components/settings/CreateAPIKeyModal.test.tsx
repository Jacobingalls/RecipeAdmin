import { render, screen, fireEvent, act } from '@testing-library/react';

import type { CreateAPIKeyResponse } from '../../api';
import * as api from '../../api';

import CreateAPIKeyModal from './CreateAPIKeyModal';

vi.mock('../../api', () => ({
  settingsCreateAPIKey: vi.fn(),
}));

vi.mock('../../utils', async () => {
  const actual = await vi.importActual('../../utils');
  return {
    ...actual,
    generateName: () => 'random-name',
  };
});

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

const mockCreateAPIKey = vi.mocked(api.settingsCreateAPIKey);

const onClose = vi.fn();
const onCreated = vi.fn();

const sampleResponse: CreateAPIKeyResponse = {
  id: 'new-ak',
  name: 'My Key',
  key: 'rk_secret_abc123',
  keyPrefix: 'rk_sec',
  expiresAt: null,
};

function renderModal(isOpen = true) {
  return render(<CreateAPIKeyModal isOpen={isOpen} onClose={onClose} onCreated={onCreated} />);
}

describe('CreateAPIKeyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when isOpen is false', () => {
    const { container } = renderModal(false);
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with title when open', () => {
    renderModal();
    expect(screen.getByText('Create API Key')).toBeInTheDocument();
  });

  it('renders Key Name input with generated placeholder', () => {
    renderModal();
    const input = screen.getByLabelText('Key Name') as HTMLInputElement;
    expect(input.placeholder).toBe('random-name');
  });

  it('renders Set expiration checkbox unchecked by default', () => {
    renderModal();
    expect(screen.getByLabelText('Set expiration')).not.toBeChecked();
  });

  it('does not show expiry field by default', () => {
    renderModal();
    expect(screen.queryByLabelText('Expires at')).not.toBeInTheDocument();
  });

  it('shows expiry field when Set expiration is checked', () => {
    renderModal();
    fireEvent.click(screen.getByLabelText('Set expiration'));
    expect(screen.getByLabelText('Expires at')).toBeInTheDocument();
  });

  it('hides expiry field when Set expiration is unchecked', () => {
    renderModal();
    fireEvent.click(screen.getByLabelText('Set expiration'));
    expect(screen.getByLabelText('Expires at')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Set expiration'));
    expect(screen.queryByLabelText('Expires at')).not.toBeInTheDocument();
  });

  it('renders Create and Cancel buttons', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when header close button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('creates key with custom name and no expiry', async () => {
    mockCreateAPIKey.mockResolvedValue(sampleResponse);
    renderModal();

    fireEvent.change(screen.getByLabelText('Key Name'), { target: { value: 'My Key' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    expect(mockCreateAPIKey).toHaveBeenCalledWith('My Key', undefined);
  });

  it('uses default name when name field is empty', async () => {
    mockCreateAPIKey.mockResolvedValue(sampleResponse);
    renderModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    expect(mockCreateAPIKey).toHaveBeenCalledWith('random-name', undefined);
  });

  it('creates key with expiry timestamp', async () => {
    mockCreateAPIKey.mockResolvedValue({ ...sampleResponse, expiresAt: 1705320000 });
    renderModal();

    fireEvent.change(screen.getByLabelText('Key Name'), { target: { value: 'Exp Key' } });
    fireEvent.click(screen.getByLabelText('Set expiration'));
    fireEvent.change(screen.getByLabelText('Expires at'), {
      target: { value: '2025-01-15T12:00' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    const expectedTs = Math.floor(new Date('2025-01-15T12:00').getTime() / 1000);
    expect(mockCreateAPIKey).toHaveBeenCalledWith('Exp Key', expectedTs);
  });

  it('shows created key in readonly input after creation', async () => {
    mockCreateAPIKey.mockResolvedValue(sampleResponse);
    renderModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    const keyInput = screen.getByLabelText('API Key') as HTMLInputElement;
    expect(keyInput.value).toBe('rk_secret_abc123');
    expect(keyInput).toHaveAttribute('readonly');
  });

  it('shows CopyButton with created key', async () => {
    mockCreateAPIKey.mockResolvedValue(sampleResponse);
    renderModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    expect(screen.getByTestId('copy-button')).toHaveAttribute('data-text', 'rk_secret_abc123');
  });

  it('shows Done button after key is created', async () => {
    mockCreateAPIKey.mockResolvedValue(sampleResponse);
    renderModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('calls onCreated and onClose when Done is clicked after key creation', async () => {
    mockCreateAPIKey.mockResolvedValue(sampleResponse);
    renderModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onCreated when Cancel is clicked without creating', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCreated).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows error alert when creation fails', async () => {
    mockCreateAPIKey.mockRejectedValue(new Error('Server error'));
    renderModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't create the API key. Try again.");
  });

  it('stays on form view when creation fails', async () => {
    mockCreateAPIKey.mockRejectedValue(new Error('Server error'));
    renderModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByLabelText('Key Name')).toBeInTheDocument();
  });

  it('shows expiry info when created key has expiresAt', async () => {
    mockCreateAPIKey.mockResolvedValue({ ...sampleResponse, expiresAt: 1700100000 });
    renderModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    expect(screen.getByText(/Expires/)).toBeInTheDocument();
  });

  it('does not show expiry info when created key has no expiresAt', async () => {
    mockCreateAPIKey.mockResolvedValue({ ...sampleResponse, expiresAt: null });
    renderModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    expect(screen.queryByText(/Expires/)).not.toBeInTheDocument();
  });

  it('resets form state when closed and reopened', async () => {
    mockCreateAPIKey.mockResolvedValue(sampleResponse);
    const { rerender } = render(
      <CreateAPIKeyModal isOpen onClose={onClose} onCreated={onCreated} />,
    );

    fireEvent.change(screen.getByLabelText('Key Name'), { target: { value: 'Custom' } });
    fireEvent.click(screen.getByLabelText('Set expiration'));

    // Close via cancel (which calls handleClose internally)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    rerender(<CreateAPIKeyModal isOpen onClose={onClose} onCreated={onCreated} />);

    const nameInput = screen.getByLabelText('Key Name') as HTMLInputElement;
    expect(nameInput.value).toBe('');
    expect(screen.getByLabelText('Set expiration')).not.toBeChecked();
  });

  it('has correct aria-labelledby on the modal', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'create-api-key-title');
  });
});
