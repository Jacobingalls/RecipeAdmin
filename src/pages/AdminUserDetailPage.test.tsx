import type { ReactElement } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { AdminUserDetail } from '../api';
import * as api from '../api';
import { useApiQuery } from '../hooks';

import AdminUserDetailPage from './AdminUserDetailPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../api', () => ({
  adminGetUser: vi.fn(),
  adminUpdateUser: vi.fn(),
  adminDeleteUser: vi.fn(),
  adminDeleteUserPasskey: vi.fn(),
  adminDeleteUserAPIKey: vi.fn(),
  adminCreateUserAPIKey: vi.fn(),
  adminRevokeUserSessions: vi.fn(),
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

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockDeleteUser = vi.mocked(api.adminDeleteUser);
const mockDeletePasskey = vi.mocked(api.adminDeleteUserPasskey);
const mockDeleteAPIKey = vi.mocked(api.adminDeleteUserAPIKey);
const mockCreateAPIKey = vi.mocked(api.adminCreateUserAPIKey);
const mockRevokeSessions = vi.mocked(api.adminRevokeUserSessions);

const sampleUser: AdminUserDetail = {
  id: 'u1',
  username: 'alice',
  displayName: 'Alice',
  email: 'alice@example.com',
  isAdmin: true,
  createdAt: 1700000000,
  passkeys: [{ id: 'pk1', name: 'My Key', createdAt: 1700000000, lastUsedAt: null }],
  apiKeys: [
    {
      id: 'ak1',
      name: 'Test Key',
      isTemporary: false,
      createdAt: 1700000000,
      lastUsedAt: null,
      expiresAt: null,
    },
  ],
};

const refetch = vi.fn();

function setupMocks(user: AdminUserDetail | null, loading = false, error: string | null = null) {
  mockUseApiQuery.mockReturnValue({
    data: user,
    loading,
    error,
    refetch,
  } as UseApiQueryResult<AdminUserDetail>);
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
    setupMocks(null, true);
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    setupMocks(null, false, 'Server error');
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('renders user details in edit form', () => {
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByText('u1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('alice@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Administrator')).toBeChecked();
  });

  it('renders passkeys', () => {
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByText('My Key')).toBeInTheDocument();
  });

  it('renders API keys', () => {
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    expect(screen.getByText('Test Key')).toBeInTheDocument();
  });

  it('deletes passkey after typing name to confirm', async () => {
    mockDeletePasskey.mockResolvedValue(undefined);
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete passkey My Key' }));
    expect(screen.getByRole('heading', { name: 'Delete passkey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete passkey' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'My Key' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete passkey' }));
    });
    expect(mockDeletePasskey).toHaveBeenCalledWith('u1', 'pk1');
    expect(refetch).toHaveBeenCalled();
  });

  it('revokes API key after typing name to confirm', async () => {
    mockDeleteAPIKey.mockResolvedValue(undefined);
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Revoke API key Test Key' }));
    expect(screen.getByText('Revoke API key')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revoke key' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'Test Key' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Revoke key' }));
    });
    expect(mockDeleteAPIKey).toHaveBeenCalledWith('u1', 'ak1');
    expect(refetch).toHaveBeenCalled();
  });

  it('generates temporary API key and shows result in modal', async () => {
    mockCreateAPIKey.mockResolvedValue({
      id: 'tk1',
      key: 'temp-key-xyz',
      expiresAt: 1700100000,
    });
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByText('Generate Temporary API Key'));
    });
    expect(screen.getByText('Temporary API Key')).toBeInTheDocument();
    expect(screen.getByDisplayValue('temp-key-xyz')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('closes result modal on Done', async () => {
    mockCreateAPIKey.mockResolvedValue({
      id: 'tk1',
      key: 'temp-key-xyz',
      expiresAt: 1700100000,
    });
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByText('Generate Temporary API Key'));
    });
    expect(screen.getByDisplayValue('temp-key-xyz')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Done'));
    expect(screen.queryByDisplayValue('temp-key-xyz')).not.toBeInTheDocument();
  });

  it('renders user ID as code block', () => {
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    const idElement = screen.getByText('u1');
    expect(idElement.tagName).toBe('CODE');
  });

  it('revokes all sessions for user', async () => {
    mockRevokeSessions.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Revoke sessions' }));
    });
    expect(mockRevokeSessions).toHaveBeenCalledWith('u1');
    expect(screen.getByRole('status')).toHaveTextContent(/All sessions revoked/);
  });

  it('cancels revoke sessions when confirm is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Revoke sessions' }));
    });
    expect(mockRevokeSessions).not.toHaveBeenCalled();
  });

  it('shows delete confirmation modal when Delete User is clicked', () => {
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(/Type/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete this user' })).toBeDisabled();
  });

  it('enables delete button only when username matches', () => {
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));

    const input = screen.getByLabelText(/Type .* to confirm/);
    const deleteBtn = screen.getByRole('button', { name: 'Delete this user' });

    fireEvent.change(input, { target: { value: 'wrong' } });
    expect(deleteBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'alice' } });
    expect(deleteBtn).toBeEnabled();
  });

  it('deletes user and navigates to user list', async () => {
    mockDeleteUser.mockResolvedValue(undefined);
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));

    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'alice' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete this user' }));
    });

    expect(mockDeleteUser).toHaveBeenCalledWith('u1');
    expect(screen.getByTestId('users-list')).toBeInTheDocument();
  });

  it('closes delete modal on cancel', () => {
    setupMocks(sampleUser);
    renderPage(<AdminUserDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
