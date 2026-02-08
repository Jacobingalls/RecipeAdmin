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
  })),
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
    });
  });

  it('renders sign in heading', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText('Sign in to Recipe Admin')).toBeInTheDocument();
  });

  it('renders passkey sign in button', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole('button', { name: /Sign in with Passkey/i })).toBeInTheDocument();
  });

  it('renders API key form', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders loading spinner when isLoading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      login: mockLogin,
      loginWithPasskey: mockLoginWithPasskey,
      logout: vi.fn(),
    });
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Sign in to Recipe Admin')).not.toBeInTheDocument();
  });

  it('redirects when already authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', username: 'test', isAdmin: false, hasPasskeys: true },
      isLoading: false,
      login: mockLogin,
      loginWithPasskey: mockLoginWithPasskey,
      logout: vi.fn(),
    });
    renderWithRouter(<LoginPage />);
    expect(screen.queryByText('Sign in to Recipe Admin')).not.toBeInTheDocument();
  });

  it('calls loginWithPasskey when passkey button clicked', async () => {
    mockLoginWithPasskey.mockResolvedValue(undefined);
    renderWithRouter(<LoginPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign in with Passkey/i }));
    });
    expect(mockLoginWithPasskey).toHaveBeenCalled();
  });

  it('displays error when passkey login fails', async () => {
    mockLoginWithPasskey.mockRejectedValue(new Error('Passkey failed'));
    renderWithRouter(<LoginPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign in with Passkey/i }));
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Passkey failed');
  });

  it('calls login with username and password on form submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderWithRouter(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'myuser' } });
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'mykey' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    });
    expect(mockLogin).toHaveBeenCalledWith('myuser', 'mykey');
  });

  it('displays error when API key login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid key'));
    renderWithRouter(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'bad' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid key');
  });
});
