import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import HomePage from './HomePage';

vi.mock('../components/common', () => ({
  PasskeySetupPrompt: () => <div data-testid="passkey-setup-prompt" />,
}));

vi.mock('../components/home', () => ({
  TodayTile: () => <div data-testid="today-tile" />,
  FavoritesTile: () => <div data-testid="favorites-tile" />,
  HistoryTile: () => <div data-testid="history-tile" />,
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
    logout: vi.fn(),
    updateUser: vi.fn(),
  })),
}));

const mockUseAuth = vi.mocked(useAuth);

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('HomePage', () => {
  it('renders time-aware greeting with display name', () => {
    renderWithRouter(<HomePage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Good (morning|afternoon|evening), Test User/);
  });

  it('renders greeting with username when no display name', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        username: 'testuser',
        displayName: '',
        email: 'test@example.com',
        isAdmin: false,
        hasPasskeys: true,
      },
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      updateUser: vi.fn(),
      logout: vi.fn(),
    });
    renderWithRouter(<HomePage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Good (morning|afternoon|evening), testuser/);
  });

  it('renders the HistoryTile', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByTestId('history-tile')).toBeInTheDocument();
  });

  it('renders the PasskeySetupPrompt', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByTestId('passkey-setup-prompt')).toBeInTheDocument();
  });

  it('renders the FavoritesTile', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByTestId('favorites-tile')).toBeInTheDocument();
  });

  it('does not render a settings link on the page', () => {
    renderWithRouter(<HomePage />);
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });
});
