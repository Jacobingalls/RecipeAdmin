import { render, screen, fireEvent, act } from '@testing-library/react';
import { startRegistration } from '@simplewebauthn/browser';

import type { PasskeyInfo, APIKeyInfo } from '../../api';
import * as api from '../../api';

import CredentialsSection from './CredentialsSection';

vi.mock('../../api', () => ({
  settingsAddPasskeyBegin: vi.fn(),
  settingsAddPasskeyFinish: vi.fn(),
  settingsDeletePasskey: vi.fn(),
  settingsRevokeAPIKey: vi.fn(),
}));

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration: vi.fn().mockResolvedValue({ id: 'cred-1' }),
}));

vi.mock('./CreateAPIKeyModal', () => ({
  default: ({
    isOpen,
    onClose,
    onCreated,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
  }) =>
    isOpen ? (
      <div data-testid="create-key-modal">
        <button onClick={onClose}>Close modal</button>
        <button
          onClick={() => {
            onCreated();
            onClose();
          }}
        >
          Create and close
        </button>
      </div>
    ) : null,
}));

const mockBegin = vi.mocked(api.settingsAddPasskeyBegin);
const mockFinish = vi.mocked(api.settingsAddPasskeyFinish);
const mockDeletePasskey = vi.mocked(api.settingsDeletePasskey);
const mockRevokeAPIKey = vi.mocked(api.settingsRevokeAPIKey);
const mockStartRegistration = vi.mocked(startRegistration);

const samplePasskeys: PasskeyInfo[] = [
  { id: 'pk1', name: 'MacBook', createdAt: 1700000000, lastUsedAt: null },
  { id: 'pk2', name: 'iPhone', createdAt: 1700100000, lastUsedAt: null },
];

const sampleApiKeys: APIKeyInfo[] = [
  {
    id: 'ak1',
    name: 'CI Key',
    keyPrefix: 'rk_ci',
    isTemporary: false,
    createdAt: 1700000000,
    lastUsedAt: null,
    expiresAt: null,
  },
  {
    id: 'ak2',
    name: 'Temp Key',
    keyPrefix: 'rk_tmp',
    isTemporary: true,
    createdAt: 1700000000,
    lastUsedAt: null,
    expiresAt: 1700200000,
  },
];

const refetchPasskeys = vi.fn();
const refetchApiKeys = vi.fn();

function renderSection({
  passkeys = samplePasskeys,
  apiKeys = sampleApiKeys,
}: { passkeys?: PasskeyInfo[] | null; apiKeys?: APIKeyInfo[] | null } = {}) {
  return render(
    <CredentialsSection
      passkeys={passkeys}
      apiKeys={apiKeys}
      refetchPasskeys={refetchPasskeys}
      refetchApiKeys={refetchApiKeys}
    />,
  );
}

describe('CredentialsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section header with title', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Credentials' })).toBeInTheDocument();
  });

  it('renders Add dropdown button', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders passkey and API Key options in dropdown', () => {
    renderSection();
    expect(screen.getByRole('button', { name: /Passkey/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /API Key/ })).toBeInTheDocument();
  });

  it('renders passkey credentials', () => {
    renderSection();
    expect(screen.getByText('MacBook')).toBeInTheDocument();
    expect(screen.getByText('iPhone')).toBeInTheDocument();
  });

  it('renders API key credentials with prefix', () => {
    renderSection();
    expect(screen.getByText('CI Key')).toBeInTheDocument();
    expect(screen.getByText('rk_ci...')).toBeInTheDocument();
  });

  it('renders empty state when no credentials', () => {
    renderSection({ passkeys: [], apiKeys: [] });
    expect(screen.getByText('No credentials')).toBeInTheDocument();
  });

  it('renders empty state when both are null', () => {
    renderSection({ passkeys: null, apiKeys: null });
    expect(screen.getByText('No credentials')).toBeInTheDocument();
  });

  it('renders credential list when only passkeys exist', () => {
    renderSection({ passkeys: samplePasskeys, apiKeys: [] });
    expect(screen.getByText('MacBook')).toBeInTheDocument();
    expect(screen.queryByText('No credentials')).not.toBeInTheDocument();
  });

  describe('add passkey', () => {
    it('registers a passkey and refetches', async () => {
      mockBegin.mockResolvedValue({
        options: { challenge: 'abc' },
        sessionID: 'sess-1',
      });
      mockFinish.mockResolvedValue({
        id: 'pk-new',
        name: 'New Passkey',
        createdAt: null,
        lastUsedAt: null,
      });
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Passkey/ }));
      });

      expect(mockBegin).toHaveBeenCalled();
      expect(mockStartRegistration).toHaveBeenCalledWith({
        optionsJSON: { challenge: 'abc' },
      });
      expect(mockFinish).toHaveBeenCalled();
      expect(refetchPasskeys).toHaveBeenCalled();
    });

    it('shows error alert when passkey registration fails', async () => {
      mockBegin.mockRejectedValue(new Error('WebAuthn not supported'));
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Passkey/ }));
      });

      expect(screen.getByRole('alert')).toHaveTextContent('WebAuthn not supported');
    });

    it('shows fallback error for non-Error rejections', async () => {
      mockBegin.mockRejectedValue('unknown');
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Passkey/ }));
      });

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Something went wrong registering your passkey. Try again.',
      );
    });

    it('dismisses passkey error alert', async () => {
      mockBegin.mockRejectedValue(new Error('Failed'));
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Passkey/ }));
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('delete passkey', () => {
    it('opens confirmation modal when delete button is clicked', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: 'Delete passkey MacBook' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Delete passkey' })).toBeInTheDocument();
    });

    it('deletes passkey after confirmation', async () => {
      mockDeletePasskey.mockResolvedValue(undefined);
      renderSection();

      fireEvent.click(screen.getByRole('button', { name: 'Delete passkey MacBook' }));
      fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
        target: { value: 'MacBook' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Delete passkey' }));
      });

      expect(mockDeletePasskey).toHaveBeenCalledWith('pk1');
      expect(refetchPasskeys).toHaveBeenCalled();
    });

    it('closes modal on cancel', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: 'Delete passkey MacBook' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('revoke API key', () => {
    it('opens confirmation modal for non-expired API key', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: 'Revoke API key CI Key' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Revoke API key' })).toBeInTheDocument();
    });

    it('revokes API key after confirmation', async () => {
      mockRevokeAPIKey.mockResolvedValue(undefined);
      renderSection();

      fireEvent.click(screen.getByRole('button', { name: 'Revoke API key CI Key' }));
      fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
        target: { value: 'CI Key' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Revoke key' }));
      });

      expect(mockRevokeAPIKey).toHaveBeenCalledWith('ak1');
      expect(refetchApiKeys).toHaveBeenCalled();
    });

    it('immediately revokes expired API key without confirmation', async () => {
      mockRevokeAPIKey.mockResolvedValue(undefined);
      const expiredKey: APIKeyInfo = {
        id: 'ak-expired',
        name: 'Old Key',
        keyPrefix: 'rk_old',
        isTemporary: true,
        createdAt: 1600000000,
        lastUsedAt: null,
        expiresAt: 1600100000,
      };
      renderSection({ passkeys: [], apiKeys: [expiredKey] });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Revoke API key Old Key' }));
      });

      expect(mockRevokeAPIKey).toHaveBeenCalledWith('ak-expired');
      expect(refetchApiKeys).toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('create API key modal', () => {
    it('opens create key modal when API Key dropdown item is clicked', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: /API Key/ }));
      expect(screen.getByTestId('create-key-modal')).toBeInTheDocument();
    });

    it('closes create key modal', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: /API Key/ }));
      expect(screen.getByTestId('create-key-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close modal'));
      expect(screen.queryByTestId('create-key-modal')).not.toBeInTheDocument();
    });

    it('calls refetchApiKeys when key is created', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: /API Key/ }));

      fireEvent.click(screen.getByText('Create and close'));
      expect(refetchApiKeys).toHaveBeenCalled();
    });
  });
});
