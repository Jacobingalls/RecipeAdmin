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
    user: { id: '1', username: 'testuser', isAdmin: false, hasPasskeys: true },
    isLoading: false,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: mockLogout,
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
      user: { id: '1', username: 'testuser', isAdmin: false, hasPasskeys: true },
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: mockLogout,
    });
  });

  it('renders the brand name', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Recipe Admin')).toBeInTheDocument();
  });

  it('renders the version badge', () => {
    renderWithRouter(<Header />);
    expect(screen.getByTestId('version-badge')).toBeInTheDocument();
  });

  it('renders Home, Products, and Groups nav links when authenticated', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });

  it('does not render nav links when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: mockLogout,
    });
    renderWithRouter(<Header />);
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Products')).not.toBeInTheDocument();
    expect(screen.queryByText('Groups')).not.toBeInTheDocument();
  });

  it('highlights the Home nav link on /', () => {
    renderWithRouter(<Header />, { route: '/' });
    const homeLink = screen.getByText('Home');
    expect(homeLink.className).toContain('active');
    expect(homeLink.className).toContain('bg-primary');
  });

  it('renders the barcode search form when authenticated', () => {
    renderWithRouter(<Header />);
    expect(screen.getByPlaceholderText('Barcode...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lookup' })).toBeInTheDocument();
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

  it('renders username in dropdown when authenticated', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('renders Settings link in dropdown', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders Sign out button in dropdown', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('calls logout and navigates on sign out', async () => {
    mockLogout.mockResolvedValue(undefined);
    renderWithRouter(<Header />);
    fireEvent.click(screen.getByText('Sign out'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('shows Admin link when user is admin', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', username: 'admin', isAdmin: true, hasPasskeys: true },
      isLoading: false,
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      logout: mockLogout,
    });
    renderWithRouter(<Header />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('does not show Admin link when user is not admin', () => {
    renderWithRouter(<Header />);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
