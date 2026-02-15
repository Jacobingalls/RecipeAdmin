import { render, screen, fireEvent, act } from '@testing-library/react';

import type { PasskeyInfo, AdminAPIKeyInfo } from '../../api';
import * as api from '../../api';

import AdminCredentialsSection from './AdminCredentialsSection';

vi.mock('../../api', () => ({
  adminDeleteUserPasskey: vi.fn(),
  adminDeleteUserAPIKey: vi.fn(),
  adminCreateUserAPIKey: vi.fn(),
}));

vi.mock('./TempAPIKeyModal', () => ({
  default: ({
    isOpen,
    tempKey,
    onClose,
  }: {
    isOpen: boolean;
    tempKey: { key: string; expiresAt: number } | null;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="temp-key-modal">
        {tempKey && <span data-testid="temp-key-value">{tempKey.key}</span>}
        <button onClick={onClose}>Close modal</button>
      </div>
    ) : null,
}));

const mockDeletePasskey = vi.mocked(api.adminDeleteUserPasskey);
const mockDeleteAPIKey = vi.mocked(api.adminDeleteUserAPIKey);
const mockCreateAPIKey = vi.mocked(api.adminCreateUserAPIKey);

const samplePasskeys: PasskeyInfo[] = [
  { id: 'pk1', name: 'MacBook', createdAt: 1700000000, lastUsedAt: null },
  { id: 'pk2', name: 'iPhone', createdAt: 1700100000, lastUsedAt: null },
];

const sampleApiKeys: AdminAPIKeyInfo[] = [
  {
    id: 'ak1',
    name: 'CI Key',
    isTemporary: false,
    createdAt: 1700000000,
    lastUsedAt: null,
    expiresAt: null,
  },
  {
    id: 'ak2',
    name: 'Temp Key',
    isTemporary: true,
    createdAt: 1700000000,
    lastUsedAt: null,
    expiresAt: 1700200000,
  },
];

const onChanged = vi.fn();

function renderSection({
  passkeys = samplePasskeys,
  apiKeys = sampleApiKeys,
}: { passkeys?: PasskeyInfo[]; apiKeys?: AdminAPIKeyInfo[] } = {}) {
  return render(
    <AdminCredentialsSection
      userId="u1"
      passkeys={passkeys}
      apiKeys={apiKeys}
      onChanged={onChanged}
    />,
  );
}

describe('AdminCredentialsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section header with title', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Credentials' })).toBeInTheDocument();
  });

  it('renders Generate Temporary API Key button', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Generate Temporary API Key' })).toBeInTheDocument();
  });

  it('renders passkey credentials', () => {
    renderSection();
    expect(screen.getByText('MacBook')).toBeInTheDocument();
    expect(screen.getByText('iPhone')).toBeInTheDocument();
  });

  it('renders API key credentials', () => {
    renderSection();
    expect(screen.getByText('CI Key')).toBeInTheDocument();
    expect(screen.getByText('Temp Key')).toBeInTheDocument();
  });

  it('renders empty state when no credentials', () => {
    renderSection({ passkeys: [], apiKeys: [] });
    expect(screen.getByText('No credentials.')).toBeInTheDocument();
  });

  it('renders credential list when only passkeys exist', () => {
    renderSection({ passkeys: samplePasskeys, apiKeys: [] });
    expect(screen.getByText('MacBook')).toBeInTheDocument();
    expect(screen.queryByText('No credentials.')).not.toBeInTheDocument();
  });

  it('renders credential list when only API keys exist', () => {
    renderSection({ passkeys: [], apiKeys: sampleApiKeys });
    expect(screen.getByText('CI Key')).toBeInTheDocument();
    expect(screen.queryByText('No credentials.')).not.toBeInTheDocument();
  });

  describe('delete passkey', () => {
    it('opens confirmation modal when delete button clicked', () => {
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

      expect(mockDeletePasskey).toHaveBeenCalledWith('u1', 'pk1');
      expect(onChanged).toHaveBeenCalled();
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
      expect(screen.getByText('Revoke API key')).toBeInTheDocument();
    });

    it('revokes API key after confirmation', async () => {
      mockDeleteAPIKey.mockResolvedValue(undefined);
      renderSection();

      fireEvent.click(screen.getByRole('button', { name: 'Revoke API key CI Key' }));
      fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
        target: { value: 'CI Key' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Revoke key' }));
      });

      expect(mockDeleteAPIKey).toHaveBeenCalledWith('u1', 'ak1');
      expect(onChanged).toHaveBeenCalled();
    });

    it('immediately deletes expired API key without confirmation', async () => {
      mockDeleteAPIKey.mockResolvedValue(undefined);
      const expiredKey: AdminAPIKeyInfo = {
        id: 'ak-expired',
        name: 'Old Key',
        isTemporary: true,
        createdAt: 1600000000,
        lastUsedAt: null,
        expiresAt: 1600100000, // well in the past
      };
      renderSection({ passkeys: [], apiKeys: [expiredKey] });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Revoke API key Old Key' }));
      });

      expect(mockDeleteAPIKey).toHaveBeenCalledWith('u1', 'ak-expired');
      expect(onChanged).toHaveBeenCalled();
      // No confirmation modal should appear
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('generate temporary API key', () => {
    it('opens temp key modal and generates key', async () => {
      mockCreateAPIKey.mockResolvedValue({
        id: 'tk1',
        key: 'temp-key-xyz',
        expiresAt: 1700300000,
      });
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Generate Temporary API Key' }));
      });

      expect(screen.getByTestId('temp-key-modal')).toBeInTheDocument();
      expect(screen.getByTestId('temp-key-value')).toHaveTextContent('temp-key-xyz');
      expect(mockCreateAPIKey).toHaveBeenCalledWith('u1');
      expect(onChanged).toHaveBeenCalled();
    });

    it('closes temp key modal', async () => {
      mockCreateAPIKey.mockResolvedValue({
        id: 'tk1',
        key: 'temp-key-xyz',
        expiresAt: 1700300000,
      });
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Generate Temporary API Key' }));
      });
      expect(screen.getByTestId('temp-key-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close modal'));
      expect(screen.queryByTestId('temp-key-modal')).not.toBeInTheDocument();
    });
  });
});
