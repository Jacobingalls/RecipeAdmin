import { render, screen, act } from '@testing-library/react';

import * as api from '../api';

import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../api', () => ({
  getStatus: vi.fn(),
  authLogin: vi.fn(),
  authLoginBegin: vi.fn(),
  authLoginFinish: vi.fn(),
  authLogout: vi.fn(),
  tryRefresh: vi.fn().mockResolvedValue(true),
}));

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: vi.fn().mockResolvedValue({ id: 'cred-1' }),
}));

const mockGetStatus = vi.mocked(api.getStatus);
const mockAuthLogin = vi.mocked(api.authLogin);
const mockAuthLogout = vi.mocked(api.authLogout);
const mockAuthLoginBegin = vi.mocked(api.authLoginBegin);
const mockAuthLoginFinish = vi.mocked(api.authLoginFinish);
const mockTryRefresh = vi.mocked(api.tryRefresh);

const testUser = {
  id: '1',
  username: 'testuser',
  displayName: 'Test User',
  email: 'test@example.com',
  isAdmin: false,
  hasPasskeys: true,
};

function TestConsumer() {
  const { isAuthenticated, user, isLoading, login, logout, loginWithPasskey, refreshSession } =
    useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.username ?? 'none'}</span>
      <span data-testid="display-name">{user?.displayName ?? 'none'}</span>
      <button data-testid="login" onClick={() => login('user', 'pass')} type="button" />
      <button data-testid="logout" onClick={() => logout()} type="button" />
      <button data-testid="passkey" onClick={() => loginWithPasskey()} type="button" />
      <button data-testid="refresh-session" onClick={() => refreshSession()} type="button" />
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('checks auth on mount and sets user', async () => {
    mockGetStatus.mockResolvedValue({
      version: null,
      environment: null,
      debug: false,
      user: testUser,
    });
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
  });

  it('sets unauthenticated when getStatus returns null user', async () => {
    mockGetStatus.mockResolvedValue({ version: null, environment: null, debug: false, user: null });
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
  });

  it('login calls API and sets user', async () => {
    mockGetStatus.mockResolvedValue({ version: null, environment: null, debug: false, user: null });
    mockAuthLogin.mockResolvedValue({
      token: 'tok',
      user: testUser,
      isTemporaryKey: false,
    });
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    await act(async () => {
      screen.getByTestId('login').click();
    });
    expect(mockAuthLogin).toHaveBeenCalledWith('user', 'pass');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('logout calls API and clears user', async () => {
    mockGetStatus.mockResolvedValue({
      version: null,
      environment: null,
      debug: false,
      user: testUser,
    });
    mockAuthLogout.mockResolvedValue(undefined);
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    await act(async () => {
      screen.getByTestId('logout').click();
    });
    expect(mockAuthLogout).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('handles auth:unauthorized event', async () => {
    mockGetStatus.mockResolvedValue({
      version: null,
      environment: null,
      debug: false,
      user: testUser,
    });
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    await act(async () => {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('loginWithPasskey calls begin, startAuthentication, finish', async () => {
    mockGetStatus.mockResolvedValue({ version: null, environment: null, debug: false, user: null });
    mockAuthLoginBegin.mockResolvedValue({
      options: { challenge: 'abc' },
      sessionID: 'sess-1',
    });
    mockAuthLoginFinish.mockResolvedValue({
      token: 'tok',
      user: testUser,
      isTemporaryKey: false,
    });
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });
    await act(async () => {
      screen.getByTestId('passkey').click();
    });
    expect(mockAuthLoginBegin).toHaveBeenCalled();
    expect(mockAuthLoginFinish).toHaveBeenCalledWith('sess-1', { id: 'cred-1' });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('refreshSession calls tryRefresh and getStatus to update user', async () => {
    mockGetStatus.mockResolvedValue({
      version: null,
      environment: null,
      debug: false,
      user: testUser,
    });
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });
    expect(screen.getByTestId('display-name')).toHaveTextContent('Test User');

    const updatedUser = { ...testUser, displayName: 'Updated Name' };
    mockTryRefresh.mockResolvedValue(true);
    mockGetStatus.mockResolvedValue({
      version: null,
      environment: null,
      debug: false,
      user: updatedUser,
    });

    await act(async () => {
      screen.getByTestId('refresh-session').click();
    });
    expect(mockTryRefresh).toHaveBeenCalled();
    expect(mockGetStatus).toHaveBeenCalledTimes(2); // once on mount, once on refresh
    expect(screen.getByTestId('display-name')).toHaveTextContent('Updated Name');
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
