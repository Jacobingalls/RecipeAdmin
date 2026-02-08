import { render, screen, fireEvent, act } from '@testing-library/react';

import * as api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

import PasskeySetupPrompt from './PasskeySetupPrompt';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: { id: '1', username: 'test', isAdmin: false, hasPasskeys: false },
    isLoading: false,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('../../api', () => ({
  authAddPasskeyBegin: vi.fn(),
  authAddPasskeyFinish: vi.fn(),
}));

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration: vi.fn().mockResolvedValue({ id: 'cred-1' }),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockBegin = vi.mocked(api.authAddPasskeyBegin);
const mockFinish = vi.mocked(api.authAddPasskeyFinish);

describe('PasskeySetupPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', username: 'test', isAdmin: false, hasPasskeys: false },
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('shows when user has no passkeys', () => {
    render(<PasskeySetupPrompt />);
    expect(screen.getByText('Secure your account with a passkey')).toBeInTheDocument();
  });

  it('hides when user has passkeys', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', username: 'test', isAdmin: false, hasPasskeys: true },
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: vi.fn(),
    });
    const { container } = render(<PasskeySetupPrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('hides when no user', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: vi.fn(),
    });
    const { container } = render(<PasskeySetupPrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('dismiss button stores in sessionStorage and hides prompt', () => {
    render(<PasskeySetupPrompt />);
    fireEvent.click(screen.getByText('Remind me later'));
    expect(sessionStorage.getItem('passkey-prompt-dismissed')).toBe('true');
    expect(screen.queryByText('Secure your account with a passkey')).not.toBeInTheDocument();
  });

  it('hides when sessionStorage already has dismissal', () => {
    sessionStorage.setItem('passkey-prompt-dismissed', 'true');
    const { container } = render(<PasskeySetupPrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('setup button triggers registration flow', async () => {
    mockBegin.mockResolvedValue({ options: { challenge: 'abc' }, sessionID: 'sess-1' });
    mockFinish.mockResolvedValue({
      id: 'pk-1',
      name: 'Passkey',
      createdAt: null,
      lastUsedAt: null,
    });

    render(<PasskeySetupPrompt />);
    await act(async () => {
      fireEvent.click(screen.getByText('Set up now'));
    });
    expect(mockBegin).toHaveBeenCalled();
    expect(mockFinish).toHaveBeenCalled();
    // After success, prompt should be hidden
    expect(screen.queryByText('Secure your account with a passkey')).not.toBeInTheDocument();
  });

  it('shows error when registration fails', async () => {
    mockBegin.mockRejectedValue(new Error('Registration failed'));

    render(<PasskeySetupPrompt />);
    await act(async () => {
      fireEvent.click(screen.getByText('Set up now'));
    });
    expect(screen.getByText('Registration failed')).toBeInTheDocument();
  });
});
