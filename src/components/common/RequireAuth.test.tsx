import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

import RequireAuth from './RequireAuth';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: {
      id: '1',
      username: 'test',
      displayName: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
      hasPasskeys: true,
    },
    isLoading: false,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  })),
}));

vi.mock('./LoadingState', () => ({
  default: () => <div data-testid="loading-state" />,
}));

const mockUseAuth = vi.mocked(useAuth);

function LoginLocation() {
  const location = useLocation();
  return <div data-testid="login-page">{JSON.stringify(location.state)}</div>;
}

function renderWithRouter(isAuthenticated: boolean, isLoading: boolean, path = '/protected') {
  mockUseAuth.mockReturnValue({
    isAuthenticated,
    user: isAuthenticated
      ? {
          id: '1',
          username: 'test',
          displayName: 'Test User',
          email: 'test@example.com',
          isAdmin: false,
          hasPasskeys: true,
        }
      : null,
    isLoading,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    apiVersion: null,
    apiGitCommit: null,
    apiEnvironment: null,
    mcpURL: null,
    refreshSession: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LoginLocation />} />
        <Route element={<RequireAuth />}>
          <Route path="/protected" element={<div data-testid="protected-content" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when loading', () => {
    renderWithRouter(false, true);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderWithRouter(false, false);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderWithRouter(true, false);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('does not render PasskeySetupPrompt', () => {
    renderWithRouter(true, false);
    expect(screen.queryByTestId('passkey-setup-prompt')).not.toBeInTheDocument();
  });

  it('remembers the requested page, including its query, for after sign-in', () => {
    renderWithRouter(false, false, '/protected?request=abc.def');
    expect(JSON.parse(screen.getByTestId('login-page').textContent ?? 'null')).toEqual({
      from: '/protected?request=abc.def',
    });
  });
});
