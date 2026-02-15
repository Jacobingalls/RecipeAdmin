import { render, screen, act } from '@testing-library/react';

import * as api from '../api';

import { AuthProvider, useAuth, getDeviceName } from './AuthContext';

vi.mock('../api', () => ({
  getStatus: vi.fn(),
  getTokenExpiry: vi.fn().mockReturnValue(null),
  authLogin: vi.fn(),
  authLoginBegin: vi.fn(),
  authLoginFinish: vi.fn(),
  authLogout: vi.fn(),
  tryRefresh: vi.fn().mockResolvedValue(null),
}));

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: vi.fn().mockResolvedValue({ id: 'cred-1' }),
}));

const mockGetStatus = vi.mocked(api.getStatus);
const mockGetTokenExpiry = vi.mocked(api.getTokenExpiry);
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
  const {
    isAuthenticated,
    user,
    isLoading,
    apiVersion,
    apiGitCommit,
    apiEnvironment,
    login,
    logout,
    loginWithPasskey,
    refreshSession,
  } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.username ?? 'none'}</span>
      <span data-testid="display-name">{user?.displayName ?? 'none'}</span>
      <span data-testid="api-version">{apiVersion ?? 'null'}</span>
      <span data-testid="api-git-commit">{apiGitCommit ?? 'null'}</span>
      <span data-testid="api-environment">{apiEnvironment ?? 'null'}</span>
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
      gitCommit: null,
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

  it('stores apiVersion and apiEnvironment from status response', async () => {
    mockGetStatus.mockResolvedValue({
      version: '2.1.0',
      gitCommit: null,
      environment: 'staging',
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
    expect(screen.getByTestId('api-version')).toHaveTextContent('2.1.0');
    expect(screen.getByTestId('api-environment')).toHaveTextContent('staging');
  });

  it('derives environment from debug flag when environment is null', async () => {
    mockGetStatus.mockResolvedValue({
      version: '1.0.0',
      gitCommit: null,
      environment: null,
      debug: true,
      user: testUser,
    });
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });
    expect(screen.getByTestId('api-environment')).toHaveTextContent('Debug');
  });

  it('derives Production environment when debug is false and environment is null', async () => {
    mockGetStatus.mockResolvedValue({
      version: '1.0.0',
      gitCommit: null,
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
    expect(screen.getByTestId('api-environment')).toHaveTextContent('Production');
  });

  it('sets unauthenticated when getStatus returns null user', async () => {
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
      environment: null,
      debug: false,
      user: null,
    });
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
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
      environment: null,
      debug: false,
      user: null,
    });
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
    expect(mockAuthLogin).toHaveBeenCalledWith('user', 'pass', expect.any(String));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('logout calls API and clears user', async () => {
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
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
      gitCommit: null,
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
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
      environment: null,
      debug: false,
      user: null,
    });
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
    expect(mockAuthLoginFinish).toHaveBeenCalledWith(
      'sess-1',
      { id: 'cred-1' },
      expect.any(String),
    );
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('refreshSession calls tryRefresh and getStatus to update user', async () => {
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
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
    mockTryRefresh.mockResolvedValue(null);
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

  it('checkAuth calls tryRefresh before getStatus', async () => {
    const callOrder: string[] = [];
    mockTryRefresh.mockImplementation(async () => {
      callOrder.push('tryRefresh');
      return null;
    });
    mockGetStatus.mockImplementation(async () => {
      callOrder.push('getStatus');
      return { version: null, gitCommit: null, environment: null, debug: false, user: testUser };
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });

    expect(callOrder).toEqual(['tryRefresh', 'getStatus']);
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('checkAuth works when tryRefresh returns null (dev mode / no refresh token)', async () => {
    mockTryRefresh.mockResolvedValue(null);
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
      environment: null,
      debug: true,
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
  });

  it('login sets token expiry from JWT', async () => {
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
      environment: null,
      debug: false,
      user: null,
    });
    mockGetTokenExpiry.mockReturnValue(1700000900);
    mockAuthLogin.mockResolvedValue({
      token: 'fake.jwt.token',
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
      screen.getByTestId('login').click();
    });

    expect(mockGetTokenExpiry).toHaveBeenCalledWith('fake.jwt.token');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('proactive refresh fires and reschedules', async () => {
    vi.useFakeTimers();
    const futureExp = Math.floor(Date.now() / 1000) + 20; // 20s from now
    const nextExp = futureExp + 900; // 15 min from the refresh

    mockTryRefresh.mockResolvedValueOnce(futureExp); // initial checkAuth
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
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

    // The timer should fire at (futureExp * 1000 - Date.now() - 5000) ms = ~15s
    mockTryRefresh.mockResolvedValueOnce(nextExp);

    await act(async () => {
      vi.advanceTimersByTime(16000);
    });

    // tryRefresh called: once on mount (checkAuth), once proactively
    expect(mockTryRefresh).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

    vi.useRealTimers();
  });

  it('failed proactive refresh clears user', async () => {
    vi.useFakeTimers();
    const futureExp = Math.floor(Date.now() / 1000) + 10; // 10s from now

    mockTryRefresh.mockResolvedValueOnce(futureExp); // initial checkAuth
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
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

    // Proactive refresh fails
    mockTryRefresh.mockResolvedValueOnce(null);

    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

    vi.useRealTimers();
  });

  it('logout clears timer (no refresh fires after logout)', async () => {
    vi.useFakeTimers();
    const futureExp = Math.floor(Date.now() / 1000) + 20;

    mockTryRefresh.mockResolvedValueOnce(futureExp); // initial checkAuth
    mockGetStatus.mockResolvedValue({
      version: null,
      gitCommit: null,
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

    // Logout - should clear tokenExpiresAt, cancelling the timer
    await act(async () => {
      screen.getByTestId('logout').click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

    // Advance past when the timer would have fired - tryRefresh should NOT be called again
    const refreshCallCount = mockTryRefresh.mock.calls.length;
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    expect(mockTryRefresh).toHaveBeenCalledTimes(refreshCallCount);

    vi.useRealTimers();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});

describe('getDeviceName', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
  });

  function setUA(ua: string) {
    Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
  }

  it('returns iPhone for iPhone user agent', () => {
    setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');
    expect(getDeviceName()).toBe('iPhone');
  });

  it('returns iPad for iPad user agent', () => {
    setUA('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)');
    expect(getDeviceName()).toBe('iPad');
  });

  it('returns Android for Android user agent', () => {
    setUA('Mozilla/5.0 (Linux; Android 14; Pixel 8)');
    expect(getDeviceName()).toBe('Android');
  });

  it('returns Chrome on Mac for desktop Chrome on macOS', () => {
    setUA(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    expect(getDeviceName()).toBe('Chrome on Mac');
  });

  it('returns Safari on Mac for desktop Safari', () => {
    setUA(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    );
    expect(getDeviceName()).toBe('Safari on Mac');
  });

  it('returns Edge on Windows for Edge browser', () => {
    setUA(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    );
    expect(getDeviceName()).toBe('Edge on Windows');
  });

  it('returns Firefox on Linux for Firefox on Linux', () => {
    setUA('Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0');
    expect(getDeviceName()).toBe('Firefox on Linux');
  });

  it('returns Unknown device for unrecognized user agent', () => {
    setUA('curl/7.88.1');
    expect(getDeviceName()).toBe('Unknown device');
  });
});
