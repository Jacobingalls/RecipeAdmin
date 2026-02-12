import { render, screen, fireEvent, act } from '@testing-library/react';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { PasskeyInfo, APIKeyInfo, SessionInfo } from '../api';
import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useApiQuery } from '../hooks';

import SettingsPage from './SettingsPage';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockUpdateUser = vi.fn();
const mockRefreshSession = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: {
      id: '1',
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
      hasPasskeys: true,
    },
    isLoading: false,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: mockLogout,
    updateUser: mockUpdateUser,
    refreshSession: mockRefreshSession,
  })),
}));

vi.mock('../api', () => ({
  settingsListPasskeys: vi.fn(),
  settingsAddPasskeyBegin: vi.fn(),
  settingsAddPasskeyFinish: vi.fn(),
  settingsDeletePasskey: vi.fn(),
  settingsListAPIKeys: vi.fn(),
  settingsCreateAPIKey: vi.fn(),
  settingsRevokeAPIKey: vi.fn(),
  settingsUpdateProfile: vi.fn(),
  settingsRevokeSessions: vi.fn(),
  settingsListSessions: vi.fn(),
  settingsRevokeSession: vi.fn(),
}));

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration: vi.fn().mockResolvedValue({ id: 'cred-1' }),
}));

vi.mock('../components/common', async () => {
  const actual = await vi.importActual('../components/common');
  return {
    ...actual,
    LoadingState: () => <div data-testid="loading-state" />,
    ErrorState: ({ message }: { message: string }) => (
      <div data-testid="error-state">{message}</div>
    ),
  };
});

const mockUseAuth = vi.mocked(useAuth);
const mockUseApiQuery = vi.mocked(useApiQuery);
const mockDeletePasskey = vi.mocked(api.settingsDeletePasskey);
const mockCreateAPIKey = vi.mocked(api.settingsCreateAPIKey);
const mockRevokeAPIKey = vi.mocked(api.settingsRevokeAPIKey);
const mockBegin = vi.mocked(api.settingsAddPasskeyBegin);
const mockFinish = vi.mocked(api.settingsAddPasskeyFinish);
const mockUpdateProfile = vi.mocked(api.settingsUpdateProfile);
const mockRevokeSessions = vi.mocked(api.settingsRevokeSessions);
const mockRevokeSession = vi.mocked(api.settingsRevokeSession);

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

const sampleSessions: SessionInfo[] = [
  {
    familyID: 'fam-1',
    deviceName: 'Chrome on macOS',
    sessionCreatedAt: 1700000000,
    lastRefreshedAt: 1700050000,
    expiresAt: 1702592000,
  },
];

const refetchPasskeys = vi.fn();
const refetchApiKeys = vi.fn();
const refetchSessions = vi.fn();

function setupMocks(
  passkeys: PasskeyInfo[] | null,
  apiKeys: APIKeyInfo[] | null,
  loading = false,
  error: string | null = null,
  sessions: SessionInfo[] | null = sampleSessions,
) {
  const results = [
    {
      data: passkeys,
      loading,
      error,
      refetch: refetchPasskeys,
    } as UseApiQueryResult<PasskeyInfo[]>,
    {
      data: apiKeys,
      loading: false,
      error: null,
      refetch: refetchApiKeys,
    } as UseApiQueryResult<APIKeyInfo[]>,
    {
      data: sessions,
      loading: false,
      error: null,
      refetch: refetchSessions,
    } as UseApiQueryResult<SessionInfo[]>,
  ];
  let callIndex = 0;
  mockUseApiQuery.mockImplementation(() => {
    const idx = callIndex % results.length;
    callIndex++;
    return results[idx];
  });
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        hasPasskeys: true,
      },
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: mockLogout,
      updateUser: mockUpdateUser,
      refreshSession: mockRefreshSession,
    });
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

  it('renders settings heading and user info', () => {
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
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

  it('deletes passkey after typing name to confirm', async () => {
    mockDeletePasskey.mockResolvedValue(undefined);
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete passkey My Passkey' }));
    expect(screen.getByText('Delete Passkey')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete passkey' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'My Passkey' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete passkey' }));
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(mockDeletePasskey).toHaveBeenCalledWith('pk1');
    expect(refetchPasskeys).toHaveBeenCalled();
  });

  it('revokes API key after typing name to confirm', async () => {
    mockRevokeAPIKey.mockResolvedValue(undefined);
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Revoke API key My Key' }));
    expect(screen.getByText('Revoke API Key')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revoke key' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'My Key' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Revoke key' }));
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(mockRevokeAPIKey).toHaveBeenCalledWith('ak1');
    expect(refetchApiKeys).toHaveBeenCalled();
  });

  it('creates API key via modal and shows key', async () => {
    mockCreateAPIKey.mockResolvedValue({
      id: 'new-ak',
      name: 'New Key',
      key: 'new-key-abc',
      keyPrefix: 'rk_new',
      expiresAt: null,
    });
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /API Key/ }));
    expect(screen.getByText('Create API Key', { selector: '.modal-title' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Key Name'), { target: { value: 'New Key' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });
    expect(mockCreateAPIKey).toHaveBeenCalledWith('New Key', undefined);
    expect(screen.getByDisplayValue('new-key-abc')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('creates API key with expiry', async () => {
    mockCreateAPIKey.mockResolvedValue({
      id: 'new-ak',
      name: 'Expiring Key',
      key: 'exp-key-abc',
      keyPrefix: 'rk_exp',
      expiresAt: 1700100000,
    });
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /API Key/ }));
    fireEvent.change(screen.getByLabelText('Key Name'), { target: { value: 'Expiring Key' } });
    fireEvent.click(screen.getByLabelText('Set expiration'));
    expect(screen.getByLabelText('Expires at')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Expires at'), {
      target: { value: '2025-01-15T12:00' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });
    const expectedTimestamp = Math.floor(new Date('2025-01-15T12:00').getTime() / 1000);
    expect(mockCreateAPIKey).toHaveBeenCalledWith('Expiring Key', expectedTimestamp);
  });

  it('closes modal via cancel button', () => {
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /API Key/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal via close button', () => {
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /API Key/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles expiry field visibility with checkbox', () => {
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /API Key/ }));
    expect(screen.queryByLabelText('Expires at')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Set expiration'));
    expect(screen.getByLabelText('Expires at')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Set expiration'));
    expect(screen.queryByLabelText('Expires at')).not.toBeInTheDocument();
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
      fireEvent.click(screen.getByRole('button', { name: 'Passkey' }));
    });
    expect(mockBegin).toHaveBeenCalled();
    expect(mockFinish).toHaveBeenCalled();
    expect(refetchPasskeys).toHaveBeenCalled();
  });

  it('shows empty state when no credentials', () => {
    setupMocks([], []);
    render(<SettingsPage />);
    expect(screen.getByText('No credentials')).toBeInTheDocument();
  });

  it('edits display name, refreshes session, and shows success message', async () => {
    const updatedUser = {
      id: '1',
      username: 'testuser',
      displayName: 'New Name',
      email: 'test@example.com',
      isAdmin: false,
      hasPasskeys: true,
    };
    mockUpdateProfile.mockResolvedValue(updatedUser);
    mockRefreshSession.mockResolvedValue(undefined);
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    const input = screen.getByDisplayValue('Test User');
    fireEvent.change(input, { target: { value: 'New Name' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(mockUpdateProfile).toHaveBeenCalledWith({ displayName: 'New Name' });
    expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
    expect(mockRefreshSession).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Display name updated.');
  });

  it('cancels display name edit', () => {
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByDisplayValue('Test User')).not.toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('calls logout and navigates to login on sign out', async () => {
    mockLogout.mockResolvedValue(undefined);
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    });
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('revokes all sessions and navigates to login', async () => {
    mockRevokeSessions.mockResolvedValue(undefined);
    mockLogout.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign out everywhere' }));
    });
    expect(mockRevokeSessions).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('cancels revoke sessions when confirm is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign out everywhere' }));
    });
    expect(mockRevokeSessions).not.toHaveBeenCalled();
  });

  it('renders sessions section with active sessions', () => {
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Chrome on macOS')).toBeInTheDocument();
  });

  it('revokes a session and refetches', async () => {
    mockRevokeSession.mockResolvedValue(undefined);
    setupMocks(samplePasskeys, sampleAPIKeys);
    render(<SettingsPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Revoke session Chrome on macOS' }));
    });
    expect(mockRevokeSession).toHaveBeenCalledWith('fam-1');
    expect(refetchSessions).toHaveBeenCalled();
  });

  it('shows empty state when no sessions', () => {
    setupMocks(samplePasskeys, sampleAPIKeys, false, null, []);
    render(<SettingsPage />);
    expect(screen.getByText('No active sessions')).toBeInTheDocument();
  });
});
