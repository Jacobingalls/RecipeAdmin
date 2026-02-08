import { render, screen } from '@testing-library/react';

import App from './App';

vi.mock('./hooks', () => ({
  useTheme: () => 'light',
}));

vi.mock('./components/Header', () => ({
  default: () => <div data-testid="header" />,
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

describe('App', () => {
  it('renders the header', () => {
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('redirects unknown routes to /', () => {
    window.history.pushState({}, '', '/unknown-route');
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders home page on /', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders lookup page on /lookup', () => {
    window.history.pushState({}, '', '/lookup');
    render(<App />);
    expect(screen.getByTestId('lookup-page')).toBeInTheDocument();
  });

  it('renders products page on /products', () => {
    window.history.pushState({}, '', '/products');
    render(<App />);
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });

  it('renders product detail page on /products/:id', () => {
    window.history.pushState({}, '', '/products/p1');
    render(<App />);
    expect(screen.getByTestId('product-detail-page')).toBeInTheDocument();
  });

  it('renders groups page on /groups', () => {
    window.history.pushState({}, '', '/groups');
    render(<App />);
    expect(screen.getByTestId('groups-page')).toBeInTheDocument();
  });

  it('renders group detail page on /groups/:id', () => {
    window.history.pushState({}, '', '/groups/g1');
    render(<App />);
    expect(screen.getByTestId('group-detail-page')).toBeInTheDocument();
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
});
