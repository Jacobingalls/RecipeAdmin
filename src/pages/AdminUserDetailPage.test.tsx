import type { ReactElement } from 'react';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { AdminUserListItem, PasskeyInfo, APIKeyInfo } from '../api';
import * as api from '../api';
import { useApiQuery } from '../hooks';

import AdminUserDetailPage from './AdminUserDetailPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../api', () => ({
  adminListUsers: vi.fn(),
  adminUpdateUser: vi.fn(),
  adminDeleteUser: vi.fn(),
  adminListUserPasskeys: vi.fn(),
  adminDeleteUserPasskey: vi.fn(),
  adminListUserAPIKeys: vi.fn(),
  adminDeleteUserAPIKey: vi.fn(),
  adminCreateUserAPIKey: vi.fn(),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  BackButton: () => <button data-testid="back-button" type="button" />,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockDeletePasskey = vi.mocked(api.adminDeleteUserPasskey);
const mockDeleteAPIKey = vi.mocked(api.adminDeleteUserAPIKey);
const mockCreateAPIKey = vi.mocked(api.adminCreateUserAPIKey);

const sampleUsers: AdminUserListItem[] = [
  {
    id: 'u1',
    username: 'alice',
    isAdmin: true,
    createdAt: 1700000000,
    passkeyCount: 1,
    apiKeyCount: 1,
  },
];

const samplePasskeys: PasskeyInfo[] = [
  { id: 'pk1', name: 'My Key', createdAt: 1700000000, lastUsedAt: null },
];

const sampleAPIKeys: APIKeyInfo[] = [
  {
    id: 'ak1',
    name: 'Test Key',
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
  users: AdminUserListItem[] | null,
  passkeys: PasskeyInfo[] | null,
  apiKeys: APIKeyInfo[] | null,
  loading = false,
  error: string | null = null,
) {
  let callIndex = 0;
  mockUseApiQuery.mockImplementation(() => {
    const idx = callIndex++ % 3;
    if (idx === 0) {
      return {
        data: users,
        loading,
        error,
        refetch: vi.fn(),
      } as UseApiQueryResult<AdminUserListItem[]>;
    }
    if (idx === 1) {
      return {
        data: passkeys,
        loading: false,
        error: null,
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

function renderPage(ui: ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/admin/users/u1']}>
      <Routes>
        <Route path="/admin/users/:id" element={ui} />
        <Route path="/admin/users" element={<div data-testid="users-list" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminUserDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    setupMocks(null, null, null, true);
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    setupMocks(null, null, null, false, 'Server error');
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('renders user details', () => {
    setupMocks(sampleUsers, samplePasskeys, sampleAPIKeys);
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders passkeys', () => {
    setupMocks(sampleUsers, samplePasskeys, sampleAPIKeys);
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByText('My Key')).toBeInTheDocument();
  });

  it('renders API keys', () => {
    setupMocks(sampleUsers, samplePasskeys, sampleAPIKeys);
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByText('Test Key')).toBeInTheDocument();
    expect(screen.getByText('rk_abc...')).toBeInTheDocument();
  });

  it('deletes passkey and refetches', async () => {
    mockDeletePasskey.mockResolvedValue(undefined);
    setupMocks(sampleUsers, samplePasskeys, sampleAPIKeys);
    renderPage(<AdminUserDetailPage />);
    const passkeyItem = screen.getByText('My Key').closest('.list-group-item')!;
    await act(async () => {
      fireEvent.click(within(passkeyItem).getByText('Delete'));
    });
    expect(mockDeletePasskey).toHaveBeenCalledWith('u1', 'pk1');
    expect(refetchPasskeys).toHaveBeenCalled();
  });

  it('revokes API key and refetches', async () => {
    mockDeleteAPIKey.mockResolvedValue(undefined);
    setupMocks(sampleUsers, samplePasskeys, sampleAPIKeys);
    renderPage(<AdminUserDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByText('Revoke'));
    });
    expect(mockDeleteAPIKey).toHaveBeenCalledWith('u1', 'ak1');
    expect(refetchApiKeys).toHaveBeenCalled();
  });

  it('generates temporary API key', async () => {
    mockCreateAPIKey.mockResolvedValue({
      id: 'tk1',
      key: 'temp-key-xyz',
      keyPrefix: 'rk_tmp',
      expiresAt: 1700100000,
    });
    setupMocks(sampleUsers, samplePasskeys, sampleAPIKeys);
    renderPage(<AdminUserDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByText('Generate Temporary API Key'));
    });
    expect(screen.getByText('temp-key-xyz')).toBeInTheDocument();
  });

  it('shows edit form when edit button clicked', () => {
    setupMocks(sampleUsers, samplePasskeys, sampleAPIKeys);
    renderPage(<AdminUserDetailPage />);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit User')).toBeInTheDocument();
  });
});
