import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Header from './Header';

const mockNavigate = vi.fn();

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

const defaultProps = { theme: 'light' as const, onToggleTheme: vi.fn() };

function renderWithRouter(ui: ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

describe('Header', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    defaultProps.onToggleTheme = vi.fn();
  });

  it('renders the brand name', () => {
    renderWithRouter(<Header {...defaultProps} />);
    expect(screen.getByText('Recipe Admin')).toBeInTheDocument();
  });

  it('renders the version badge', () => {
    renderWithRouter(<Header {...defaultProps} />);
    expect(screen.getByTestId('version-badge')).toBeInTheDocument();
  });

  it('renders Products and Groups nav links', () => {
    renderWithRouter(<Header {...defaultProps} />);
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });

  it('renders the barcode search form', () => {
    renderWithRouter(<Header {...defaultProps} />);
    expect(screen.getByPlaceholderText('Barcode...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lookup' })).toBeInTheDocument();
  });

  it('navigates to lookup page on search submit', () => {
    renderWithRouter(<Header {...defaultProps} />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/lookup/123456');
  });

  it('clears the input after search', () => {
    renderWithRouter(<Header {...defaultProps} />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(input).toHaveValue('');
  });

  it('does not navigate when search input is empty', () => {
    renderWithRouter(<Header {...defaultProps} />);
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when search input is only whitespace', () => {
    renderWithRouter(<Header {...defaultProps} />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('trims whitespace from barcode before navigating', () => {
    renderWithRouter(<Header {...defaultProps} />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: '  123  ' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/lookup/123');
  });

  it('encodes special characters in barcode', () => {
    renderWithRouter(<Header {...defaultProps} />);
    const input = screen.getByPlaceholderText('Barcode...');
    fireEvent.change(input, { target: { value: 'foo/bar' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledWith('/lookup/foo%2Fbar');
  });

  it('highlights the active nav link', () => {
    renderWithRouter(<Header {...defaultProps} />, { route: '/products' });
    const productsLink = screen.getByText('Products');
    expect(productsLink.className).toContain('active');
    expect(productsLink.className).toContain('bg-primary');
  });

  it('renders inactive nav links with text-light class', () => {
    renderWithRouter(<Header {...defaultProps} />, { route: '/products' });
    const groupsLink = screen.getByText('Groups');
    expect(groupsLink.className).toContain('text-light');
    expect(groupsLink.className).not.toContain('active');
  });

  it('renders navbar toggler button', () => {
    renderWithRouter(<Header {...defaultProps} />);
    const toggler = screen.getByRole('button', { name: '' });
    expect(toggler.className).toContain('navbar-toggler');
  });

  it('renders theme toggle button', () => {
    renderWithRouter(<Header {...defaultProps} />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('calls onToggleTheme when toggle button is clicked', () => {
    renderWithRouter(<Header {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(defaultProps.onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('shows switch to light mode label when theme is dark', () => {
    renderWithRouter(<Header {...defaultProps} theme="dark" />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });
});
