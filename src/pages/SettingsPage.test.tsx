import { render, screen, fireEvent, act } from '@testing-library/react';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { PasskeyInfo, APIKeyInfo } from '../api';
import * as api from '../api';
import { useApiQuery } from '../hooks';

import SettingsPage from './SettingsPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: { id: '1', username: 'testuser', isAdmin: false, hasPasskeys: true },
    isLoading: false,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('../api', () => ({
  authListPasskeys: vi.fn(),
  authAddPasskeyBegin: vi.fn(),
  authAddPasskeyFinish: vi.fn(),
  authDeletePasskey: vi.fn(),
  authListAPIKeys: vi.fn(),
  authCreateAPIKey: vi.fn(),
  authRevokeAPIKey: vi.fn(),
}));

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration: vi.fn().mockResolvedValue({ id: 'cred-1' }),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockDeletePasskey = vi.mocked(api.authDeletePasskey);
const mockCreateAPIKey = vi.mocked(api.authCreateAPIKey);
const mockRevokeAPIKey = vi.mocked(api.authRevokeAPIKey);
const mockBegin = vi.mocked(api.authAddPasskeyBegin);
const mockFinish = vi.mocked(api.authAddPasskeyFinish);

const samplePasskeys: PasskeyInfo[] = [
  { id: 'pk1', name: 'My Passkey', createdAt: 1700000000, lastUsedAt: null },
];

const sampleAPIKeys: APIKeyInfo[] = [
  {
    id: 'ak1',
    name: 'My Key',
    keyPrefix: 'rk_abc',
    isTemporary: false,
    createdAt: 1700000000,
    lastUsedAt: null,
    expiresAt: null,
  },
];

const refetchPasskeys = vi.fn();
const refetchApiKeys = vi.fn();

function setupMocks(
  passkeys: PasskeyInfo[] | null,
  apiKeys: APIKeyInfo[] | null,
  loading = false,
  error: string | null = null,
) {
  let callIndex = 0;
  mockUseApiQuery.mockImplementation(() => {
    const idx = callIndex++;
    if (idx === 0) {
      return {
        data: passkeys,
        loading,
        error,
        refetch: refetchPasskeys,
      } as UseApiQueryResult<PasskeyInfo[]>;
    }
    return {
      data: apiKeys,
      loading: false,
      error: null,
      refetch: refetchApiKeys,
    } as UseApiQueryResult<APIKeyInfo[]>;
  });
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    setupMocks(null, null, true);
    render(<SettingsPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    setupMocks(null, null, false, 'Server error');
    render(<SettingsPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('renders settings heading and username', () => {
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('renders passkeys', () => {
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    expect(screen.getByText('My Passkey')).toBeInTheDocument();
  });

  it('renders API keys', () => {
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    expect(screen.getByText('My Key')).toBeInTheDocument();
    expect(screen.getByText('rk_abc...')).toBeInTheDocument();
  });

  it('deletes passkey and refetches', async () => {
    mockDeletePasskey.mockResolvedValue(undefined);
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    await act(async () => {
      fireEvent.click(screen.getAllByText('Delete')[0]);
    });
    expect(mockDeletePasskey).toHaveBeenCalledWith('pk1');
    expect(refetchPasskeys).toHaveBeenCalled();
  });

  it('revokes API key and refetches', async () => {
    mockRevokeAPIKey.mockResolvedValue(undefined);
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    await act(async () => {
      fireEvent.click(screen.getByText('Revoke'));
    });
    expect(mockRevokeAPIKey).toHaveBeenCalledWith('ak1');
    expect(refetchApiKeys).toHaveBeenCalled();
  });

  it('creates API key and shows key', async () => {
    mockCreateAPIKey.mockResolvedValue({
      id: 'new-ak',
      name: 'New Key',
      key: 'new-key-abc',
      keyPrefix: 'rk_new',
      expiresAt: null,
    });
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Create API Key'));
    fireEvent.change(screen.getByLabelText('Key Name'), { target: { value: 'New Key' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });
    expect(mockCreateAPIKey).toHaveBeenCalledWith('New Key');
    expect(screen.getByText('new-key-abc')).toBeInTheDocument();
  });

  it('adds passkey and refetches', async () => {
    mockBegin.mockResolvedValue({ options: { challenge: 'abc' }, sessionID: 'sess-1' });
    mockFinish.mockResolvedValue({
      id: 'pk2',
      name: 'New Passkey',
      createdAt: null,
      lastUsedAt: null,
    });
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    await act(async () => {
      fireEvent.click(screen.getByText('Add Passkey'));
    });
    expect(mockBegin).toHaveBeenCalled();
    expect(mockFinish).toHaveBeenCalled();
    expect(refetchPasskeys).toHaveBeenCalled();
  });

  it('shows empty state when no passkeys', () => {
    setupMocks([], sampleAPIKeys);
    render(<SettingsPage />);
    expect(screen.getByText('No passkeys registered.')).toBeInTheDocument();
  });

  it('shows empty state when no API keys', () => {
    setupMocks(samplePasskeys, []);
    render(<SettingsPage />);
    expect(screen.getByText('No API keys.')).toBeInTheDocument();
  });
});
