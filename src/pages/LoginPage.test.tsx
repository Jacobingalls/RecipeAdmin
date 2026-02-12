import type { ReactElement } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import LoginPage from './LoginPage';

const mockLogin = vi.fn();
const mockLoginWithPasskey = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    login: mockLogin,
    loginWithPasskey: mockLoginWithPasskey,
    logout: vi.fn(),
    updateUser: vi.fn(),
  })),
}));

vi.mock('../components/VersionBadge', () => ({
  default: () => <span data-testid="version-badge">v1.0</span>,
}));

const mockUseAuth = vi.mocked(useAuth);

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: mockLogin,
      loginWithPasskey: mockLoginWithPasskey,
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  it('renders branding heading', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Recipe Admin' })).toBeInTheDocument();
  });

  it('renders version badge', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByTestId('version-badge')).toBeInTheDocument();
  });

  it('renders passkey sign in button', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in with passkey/i })).toBeInTheDocument();
  });

  it('renders API key toggle link', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in with api key/i })).toBeInTheDocument();
  });

  it('does not show API key form by default', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.queryByLabelText(/username or email/i)).not.toBeInTheDocument();
  });

  it('switches to API key form when toggle is clicked', () => {
    renderWithRouter(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with api key/i }));
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with passkey/i })).toBeInTheDocument();
  });

  it('switches back to passkey mode and triggers passkey login', async () => {
    renderWithRouter(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with api key/i }));
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    mockLoginWithPasskey.mockRejectedValue(new Error('cancelled'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in with passkey/i }));
    });
    expect(screen.queryByLabelText(/username or email/i)).not.toBeInTheDocument();
    expect(mockLoginWithPasskey).toHaveBeenCalledTimes(1);
  });

  it('renders loading spinner when isLoading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      login: mockLogin,
      loginWithPasskey: mockLoginWithPasskey,
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Recipe Admin' })).not.toBeInTheDocument();
  });

  it('redirects when already authenticated', () => {
    mockUseAuth.mockReturnValue({
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
      login: mockLogin,
      loginWithPasskey: mockLoginWithPasskey,
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
    renderWithRouter(<LoginPage />);
    expect(screen.queryByRole('heading', { name: 'Recipe Admin' })).not.toBeInTheDocument();
  });

  it('does not auto-trigger passkey on mount', () => {
    renderWithRouter(<LoginPage />);
    expect(mockLoginWithPasskey).not.toHaveBeenCalled();
  });

  it('calls loginWithPasskey when passkey button clicked', async () => {
    mockLoginWithPasskey.mockResolvedValue(undefined);
    renderWithRouter(<LoginPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in with passkey/i }));
    });
    expect(mockLoginWithPasskey).toHaveBeenCalledTimes(1);
  });

  it('displays error when passkey login fails', async () => {
    mockLoginWithPasskey.mockRejectedValue(new Error('Passkey failed'));
    renderWithRouter(<LoginPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in with passkey/i }));
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't sign in with passkey. Try again.",
    );
  });

  it('calls login with username and password on form submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderWithRouter(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with api key/i }));
    fireEvent.change(screen.getByLabelText(/username or email/i), { target: { value: 'myuser' } });
    fireEvent.change(screen.getByLabelText(/api key/i), { target: { value: 'mykey' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    });
    expect(mockLogin).toHaveBeenCalledWith('myuser', 'mykey');
  });

  it('displays error when API key login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid key'));
    renderWithRouter(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with api key/i }));
    fireEvent.change(screen.getByLabelText(/username or email/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/api key/i), { target: { value: 'bad' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't sign in. Check your credentials and try again.",
    );
  });
});
