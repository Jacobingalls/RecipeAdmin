import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import HomePage from './HomePage';

vi.mock('../components/common', () => ({
  PasskeySetupPrompt: () => <div data-testid="passkey-setup-prompt" />,
}));

vi.mock('../components/home', () => ({
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
  it('renders greeting with display name', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText('Hello, Test User')).toBeInTheDocument();
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
    expect(screen.getByText('Hello, testuser')).toBeInTheDocument();
  });

  it('renders the HistoryTile', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByTestId('history-tile')).toBeInTheDocument();
  });

  it('renders the PasskeySetupPrompt', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByTestId('passkey-setup-prompt')).toBeInTheDocument();
  });

  it('renders a settings gear link to /settings', () => {
    renderWithRouter(<HomePage />);
    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).toHaveAttribute('href', '/settings');
    expect(settingsLink.querySelector('.bi-gear')).toBeInTheDocument();
  });
});
