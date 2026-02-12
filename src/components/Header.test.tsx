import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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

vi.mock('./VersionBadge', () => ({
  default: () => <span data-testid="version-badge">v1.0</span>,
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
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: mockLogout,
      updateUser: vi.fn(),
    });
    const { container } = renderWithRouter(<Header />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the brand name', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Recipe Admin')).toBeInTheDocument();
  });

  it('renders the version badge', () => {
    renderWithRouter(<Header />);
    expect(screen.getByTestId('version-badge')).toBeInTheDocument();
  });

  it('renders Home, Products, and Groups nav links', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });

  it('highlights the Home nav link on /', () => {
    renderWithRouter(<Header />, { route: '/' });
    const homeLink = screen.getByText('Home');
    expect(homeLink.className).toContain('active');
    expect(homeLink.className).toContain('bg-primary');
  });

  it('renders the barcode search form', () => {
    renderWithRouter(<Header />);
    expect(screen.getByPlaceholderText('Barcode...')).toBeInTheDocument();
    expect(document.querySelector('.bi-upc-scan')).toBeInTheDocument();
  });

  it('navigates to lookup page on search submit', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/lookup/123456');
  });

  it('clears the input after search', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(input).toHaveValue('');
  });

  it('does not navigate when search input is empty', () => {
    renderWithRouter(<Header />);
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when search input is only whitespace', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('trims whitespace from barcode before navigating', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: '  123  ' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/lookup/123');
  });

  it('encodes special characters in barcode', () => {
    renderWithRouter(<Header />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: 'foo/bar' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/lookup/foo%2Fbar');
  });

  it('highlights the active nav link', () => {
    renderWithRouter(<Header />, { route: '/products' });
    const productsLink = screen.getByText('Products');
    expect(productsLink.className).toContain('active');
    expect(productsLink.className).toContain('bg-primary');
  });

  it('renders inactive nav links with text-light class', () => {
    renderWithRouter(<Header />, { route: '/products' });
    const groupsLink = screen.getByText('Groups');
    expect(groupsLink.className).toContain('text-light');
    expect(groupsLink.className).not.toContain('active');
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
});
