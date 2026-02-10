import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

import RequireAdmin from './RequireAdmin';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: {
      id: '1',
      username: 'test',
      displayName: 'Test User',
      email: 'test@example.com',
      isAdmin: true,
      hasPasskeys: true,
    },
    isLoading: false,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('./LoadingState', () => ({
  default: () => <div data-testid="loading-state" />,
}));

const mockUseAuth = vi.mocked(useAuth);

function renderWithRoutes(user: { isAdmin: boolean } | null, isLoading = false) {
  mockUseAuth.mockReturnValue({
    isAuthenticated: !!user,
    user: user
      ? {
          id: '1',
          username: 'test',
          displayName: 'Test User',
          email: 'test@example.com',
          hasPasskeys: true,
          ...user,
        }
      : null,
    isLoading,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/" element={<div data-testid="home-page" />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<div data-testid="admin-content" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when loading', () => {
    renderWithRoutes(null, true);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('redirects to / when user is not admin', () => {
    renderWithRoutes({ isAdmin: false });
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders children when user is admin', () => {
    renderWithRoutes({ isAdmin: true });
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });

  it('redirects to / when no user', () => {
    renderWithRoutes(null);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
