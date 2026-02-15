import type { ReactElement } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';

import Header from './Header';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return {
    ...actual,
    getAdminVersion: vi.fn(() => null),
    getAdminGitCommit: vi.fn(() => null),
    getAdminEnvironment: vi.fn(() => null),
  };
});

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
    apiVersion: null,
    apiEnvironment: null,
    isLoading: false,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: mockLogout,
    updateUser: vi.fn(),
  })),
}));

const mockUseAuth = vi.mocked(useAuth);

function renderWithRouter(ui: ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

describe('Header', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogout.mockClear();
    vi.mocked(api.getAdminVersion).mockReturnValue(null);
    vi.mocked(api.getAdminGitCommit).mockReturnValue(null);
    vi.mocked(api.getAdminEnvironment).mockReturnValue(null);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        hasPasskeys: true,
      },
      apiVersion: null,
      apiGitCommit: null,
      apiEnvironment: null,
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: mockLogout,
      updateUser: vi.fn(),
    });
  });

  it('renders nothing when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      apiVersion: null,
      apiGitCommit: null,
      apiEnvironment: null,
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: mockLogout,
      updateUser: vi.fn(),
    });
    const { container } = renderWithRouter(<Header />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the branding icon linking to home', () => {
    renderWithRouter(<Header />);
    const brandLink = screen.getByRole('link', { name: 'Recipe Admin home' });
    expect(brandLink).toHaveAttribute('href', '/');
    expect(brandLink.querySelector('.bi-egg-fried')).toBeInTheDocument();
  });

  it('shows DEV badge on branding icon when no admin version', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('DEV')).toBeInTheDocument();
  });

  it('hides DEV badge on branding icon when admin version is set', () => {
    vi.mocked(api.getAdminVersion).mockReturnValue('0.0.28');
    renderWithRouter(<Header />);
    expect(screen.queryByText('DEV')).not.toBeInTheDocument();
  });

  it('renders Home nav link', () => {
    renderWithRouter(<Header />);
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('highlights the Home nav link on /', () => {
    renderWithRouter(<Header />, { route: '/' });
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link.className).toContain('active');
    expect(link.className).toContain('fw-semibold');
  });

  it('renders History nav link', () => {
    renderWithRouter(<Header />);
    const link = screen.getByRole('link', { name: 'History' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/history');
  });

  it('highlights the History nav link on /history', () => {
    renderWithRouter(<Header />, { route: '/history' });
    const link = screen.getByRole('link', { name: 'History' });
    expect(link.className).toContain('active');
    expect(link.className).toContain('fw-semibold');
  });

  it('renders the search form', () => {
    renderWithRouter(<Header />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(document.querySelector('.bi-search')).toBeInTheDocument();
  });

  it('navigates to search page on search submit', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'apple' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=apple', { replace: false });
  });

  it('keeps the query in the input after search', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'apple' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(input).toHaveValue('apple');
  });

  it('syncs input with URL q param', () => {
    renderWithRouter(<Header />, { route: '/search?q=banana' });
    expect(screen.getByPlaceholderText('Search...')).toHaveValue('banana');
  });

  it('navigates to /search when submitting empty input', () => {
    renderWithRouter(<Header />);
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/search', { replace: false });
  });

  it('navigates to /search when submitting only whitespace', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/search', { replace: false });
  });

  it('trims whitespace from query before navigating', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: '  apple  ' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=apple', { replace: false });
  });

  it('encodes special characters in search query', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'foo/bar' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=foo%2Fbar', { replace: false });
  });

  it('auto-navigates after debounce when typing', () => {
    vi.useFakeTimers();
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'apple' } });
    expect(mockNavigate).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(300));
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=apple', { replace: false });
    vi.useRealTimers();
  });

  it('does not auto-navigate for queries shorter than 2 characters', () => {
    vi.useFakeTimers();
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'a' } });
    act(() => vi.advanceTimersByTime(300));
    expect(mockNavigate).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('replaces history when already on search page', () => {
    vi.useFakeTimers();
    renderWithRouter(<Header />, { route: '/search?q=old' });
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'new query' } });
    act(() => vi.advanceTimersByTime(300));
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=new%20query', { replace: true });
    vi.useRealTimers();
  });

  it('navigates to /search when clearing input on search page', () => {
    vi.useFakeTimers();
    renderWithRouter(<Header />, { route: '/search?q=apple' });
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: '' } });
    act(() => vi.advanceTimersByTime(300));
    expect(mockNavigate).toHaveBeenCalledWith('/search', { replace: true });
    vi.useRealTimers();
  });

  it('does not auto-navigate to empty search from other pages', () => {
    vi.useFakeTimers();
    renderWithRouter(<Header />, { route: '/history' });
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'ap' } });
    act(() => vi.advanceTimersByTime(300));
    mockNavigate.mockClear();
    fireEvent.change(input, { target: { value: '' } });
    act(() => vi.advanceTimersByTime(300));
    expect(mockNavigate).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('renders navbar toggler button', () => {
    renderWithRouter(<Header />);
    const toggler = screen.getByRole('button', { name: 'Toggle navigation' });
    expect(toggler.className).toContain('navbar-toggler');
  });

  it('shows Admin link in dropdown when user is admin', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        username: 'admin',
        displayName: 'Admin User',
        email: 'admin@example.com',
        isAdmin: true,
        hasPasskeys: true,
      },
      apiVersion: null,
      apiGitCommit: null,
      apiEnvironment: null,
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: mockLogout,
      updateUser: vi.fn(),
    });
    renderWithRouter(<Header />);
    const adminLink = screen.getByRole('link', { name: /^admin$/i });
    expect(adminLink).toHaveAttribute('href', '/admin/users');
  });

  it('does not show Admin link when user is not admin', () => {
    renderWithRouter(<Header />);
    expect(screen.queryByRole('link', { name: /^admin$/i })).not.toBeInTheDocument();
  });

  it('renders user menu button', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('button', { name: 'User menu' })).toBeInTheDocument();
  });

  it('shows initials fallback in avatar', () => {
    renderWithRouter(<Header />);
    const btn = screen.getByRole('button', { name: 'User menu' });
    expect(btn).toHaveTextContent('T');
  });

  it('renders gravatar image after hash computes', async () => {
    renderWithRouter(<Header />);
    const img = await screen.findByAltText('', { exact: true });
    expect(img).toHaveAttribute('src', expect.stringContaining('gravatar.com/avatar/'));
    expect(img).toHaveClass('rounded-circle');
  });

  it('displays user display name and username in dropdown', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('renders settings link in dropdown', () => {
    renderWithRouter(<Header />);
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('renders sign out button in dropdown', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls logout when sign out is clicked', () => {
    renderWithRouter(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(mockLogout).toHaveBeenCalled();
  });

  describe('version info in dropdown', () => {
    it('shows Development when no admin version is set', () => {
      renderWithRouter(<Header />);
      expect(screen.getByText('Development')).toBeInTheDocument();
    });

    it('shows admin version when available', () => {
      vi.mocked(api.getAdminVersion).mockReturnValue('0.0.28');
      renderWithRouter(<Header />);
      const adminRow = document.querySelector('.bi-window')!.closest('div')!;
      expect(adminRow).toHaveTextContent('0.0.28');
    });

    it('shows admin version with git commit', () => {
      vi.mocked(api.getAdminVersion).mockReturnValue('0.0.28');
      vi.mocked(api.getAdminGitCommit).mockReturnValue('abc1234');
      renderWithRouter(<Header />);
      const adminRow = document.querySelector('.bi-window')!.closest('div')!;
      expect(adminRow).toHaveTextContent('0.0.28 (abc1234)');
    });

    it('does not show git commit without version', () => {
      vi.mocked(api.getAdminGitCommit).mockReturnValue('abc1234');
      renderWithRouter(<Header />);
      const adminRow = document.querySelector('.bi-window')!.closest('div')!;
      expect(adminRow).toHaveTextContent('Development');
      expect(adminRow).not.toHaveTextContent('abc1234');
    });

    it('shows admin environment when set', () => {
      vi.mocked(api.getAdminEnvironment).mockReturnValue('Production');
      vi.mocked(api.getAdminVersion).mockReturnValue('0.0.28');
      renderWithRouter(<Header />);
      const adminRow = document.querySelector('.bi-window')!.closest('div')!;
      expect(adminRow).toHaveTextContent('Production');
      expect(adminRow).toHaveTextContent('0.0.28');
    });

    it('shows API environment and version', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
          isAdmin: false,
          hasPasskeys: true,
        },
        apiVersion: '0.0.27',
        apiGitCommit: null,
        apiEnvironment: 'Production',
        isLoading: false,
        login: vi.fn(),
        loginWithPasskey: vi.fn(),
        logout: mockLogout,
        updateUser: vi.fn(),
      });
      renderWithRouter(<Header />);
      expect(screen.getByText(/0\.0\.27/)).toBeInTheDocument();
      expect(screen.getByText(/Production/)).toBeInTheDocument();
    });

    it('shows API environment without version', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
          isAdmin: false,
          hasPasskeys: true,
        },
        apiVersion: null,
        apiGitCommit: null,
        apiEnvironment: 'Debug',
        isLoading: false,
        login: vi.fn(),
        loginWithPasskey: vi.fn(),
        logout: mockLogout,
        updateUser: vi.fn(),
      });
      renderWithRouter(<Header />);
      const apiRow = document.querySelector('.bi-hdd-network')!.closest('div')!;
      expect(apiRow).toHaveTextContent('Development');
    });

    it('shows Unknown environment and API URL when no API info is available', () => {
      renderWithRouter(<Header />);
      const apiRow = document.querySelector('.bi-hdd-network')!.closest('div')!;
      expect(apiRow).toHaveTextContent('Unknown');
      expect(apiRow.querySelector('a')).toBeInTheDocument();
    });

    it('renders window and server icons', () => {
      renderWithRouter(<Header />);
      expect(document.querySelector('.bi-window')).toBeInTheDocument();
      expect(document.querySelector('.bi-hdd-network')).toBeInTheDocument();
    });
  });

  describe('dropdown menu behavior', () => {
    it('stops propagation when clicking non-interactive elements', () => {
      renderWithRouter(<Header />);
      const menu = document.querySelector('.dropdown-menu')!;
      const usernameEl = screen.getByText('testuser');
      const event = new MouseEvent('click', { bubbles: true });
      const stopPropagation = vi.spyOn(event, 'stopPropagation');
      usernameEl.dispatchEvent(event);
      expect(stopPropagation).toHaveBeenCalled();
      // Verify the menu handler is wired up
      expect(menu).toBeInTheDocument();
    });

    it('allows propagation when clicking links', () => {
      renderWithRouter(<Header />);
      const settingsLink = screen.getByRole('link', { name: /settings/i });
      const event = new MouseEvent('click', { bubbles: true });
      const stopPropagation = vi.spyOn(event, 'stopPropagation');
      settingsLink.dispatchEvent(event);
      expect(stopPropagation).not.toHaveBeenCalled();
    });

    it('allows propagation when clicking buttons', () => {
      renderWithRouter(<Header />);
      const signOutBtn = screen.getByRole('button', { name: /sign out/i });
      const event = new MouseEvent('click', { bubbles: true });
      const stopPropagation = vi.spyOn(event, 'stopPropagation');
      signOutBtn.dispatchEvent(event);
      expect(stopPropagation).not.toHaveBeenCalled();
    });
  });
});
