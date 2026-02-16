import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { Outlet } from 'react-router-dom';

import App from './App';

vi.mock('./hooks', () => ({
  useTheme: () => 'light',
}));

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => ({
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
    updateUser: vi.fn(),
  }),
}));

vi.mock('./components/Header', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('./components/common/RequireAuth', () => ({
  default: () => <Outlet />,
}));

vi.mock('./components/common/RequireAdmin', () => ({
  default: () => <Outlet />,
}));

vi.mock('./pages/LookupPage', () => ({
  default: () => <div data-testid="lookup-page" />,
}));

vi.mock('./pages/ProductsPage', () => ({
  default: () => <div data-testid="products-page" />,
}));

vi.mock('./pages/ProductDetailPage', () => ({
  default: () => <div data-testid="product-detail-page" />,
}));

vi.mock('./pages/GroupsPage', () => ({
  default: () => <div data-testid="groups-page" />,
}));

vi.mock('./pages/GroupDetailPage', () => ({
  default: () => <div data-testid="group-detail-page" />,
}));

vi.mock('./pages/HomePage', () => ({
  default: () => <div data-testid="home-page" />,
}));

vi.mock('./pages/HistoryPage', () => ({
  default: () => <div data-testid="history-page" />,
}));

vi.mock('./pages/LoginPage', () => ({
  default: () => <div data-testid="login-page" />,
}));

vi.mock('./pages/SettingsPage', () => ({
  default: () => <div data-testid="settings-page" />,
}));

vi.mock('./pages/AdminUsersPage', () => ({
  default: () => <div data-testid="admin-users-page" />,
}));

vi.mock('./pages/AdminProductEditorPage', () => ({
  default: () => <div data-testid="admin-product-editor-page" />,
}));

vi.mock('./pages/AdminGroupEditorPage', () => ({
  default: () => <div data-testid="admin-group-editor-page" />,
}));

vi.mock('./pages/AdminUserDetailPage', () => ({
  default: () => <div data-testid="admin-user-detail-page" />,
}));

describe('App', () => {
  it('renders the header', () => {
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders home page on /', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders login page on /login', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders lookup page on /lookup', () => {
    window.history.pushState({}, '', '/lookup');
    render(<App />);
    expect(screen.getByTestId('lookup-page')).toBeInTheDocument();
  });

  it('renders product detail page on /products/:id', () => {
    window.history.pushState({}, '', '/products/p1');
    render(<App />);
    expect(screen.getByTestId('product-detail-page')).toBeInTheDocument();
  });

  it('renders group detail page on /groups/:id', () => {
    window.history.pushState({}, '', '/groups/g1');
    render(<App />);
    expect(screen.getByTestId('group-detail-page')).toBeInTheDocument();
  });

  it('renders products list page on /admin/products', () => {
    window.history.pushState({}, '', '/admin/products');
    render(<App />);
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });

  it('redirects /admin to /admin/products', () => {
    window.history.pushState({}, '', '/admin');
    render(<App />);
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });

  it('renders admin product editor on /admin/products/:id', () => {
    window.history.pushState({}, '', '/admin/products/p1');
    render(<App />);
    expect(screen.getByTestId('admin-product-editor-page')).toBeInTheDocument();
  });

  it('renders groups list page on /admin/groups', () => {
    window.history.pushState({}, '', '/admin/groups');
    render(<App />);
    expect(screen.getByTestId('groups-page')).toBeInTheDocument();
  });

  it('renders admin group editor on /admin/groups/:id', () => {
    window.history.pushState({}, '', '/admin/groups/g1');
    render(<App />);
    expect(screen.getByTestId('admin-group-editor-page')).toBeInTheDocument();
  });

  it('renders lookup page with barcode param', () => {
    window.history.pushState({}, '', '/lookup/12345');
    render(<App />);
    expect(screen.getByTestId('lookup-page')).toBeInTheDocument();
  });

  it('renders history page on /history', () => {
    window.history.pushState({}, '', '/history');
    render(<App />);
    expect(screen.getByTestId('history-page')).toBeInTheDocument();
  });

  it('redirects unknown routes to /', () => {
    window.history.pushState({}, '', '/unknown-route');
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
