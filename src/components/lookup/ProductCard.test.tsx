import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiLookupItem } from '../../api';

import ProductCard from './ProductCard';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const makeItem = (overrides: Partial<ApiLookupItem> = {}): ApiLookupItem => ({
  product: {
    id: 'prod-1',
    name: 'Test Product',
    brand: 'Test Brand',
    barcodes: [],
    preparations: [
      {
        id: 'prep-1',
        nutritionalInformation: {
          calories: { amount: 200, unit: 'kcal' },
        },
        mass: { amount: 50, unit: 'g' },
        volume: { amount: 240, unit: 'mL' },
      },
    ],
  },
  preparationID: 'prep-1',
  ...overrides,
});

describe('ProductCard', () => {
  it('renders the product name as a link', () => {
    renderWithRouter(<ProductCard item={makeItem()} />);
    const link = screen.getByRole('link', { name: 'Test Product' });
    expect(link).toHaveAttribute('href', '/products/prod-1');
  });

  it('renders the brand', () => {
    renderWithRouter(<ProductCard item={makeItem()} />);
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
  });

  it('renders the Product badge', () => {
    renderWithRouter(<ProductCard item={makeItem()} />);
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('renders calories', () => {
    renderWithRouter(<ProductCard item={makeItem()} />);
    expect(screen.getByText(/200/)).toBeInTheDocument();
    expect(screen.getByText(/cal/)).toBeInTheDocument();
  });

  it('renders mass', () => {
    renderWithRouter(<ProductCard item={makeItem()} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('renders volume', () => {
    renderWithRouter(<ProductCard item={makeItem()} />);
    expect(screen.getByText(/240/)).toBeInTheDocument();
  });

  it('displays default 1 serving when no barcode matches', () => {
    renderWithRouter(<ProductCard item={makeItem()} />);
    expect(screen.getByText('1 serving')).toBeInTheDocument();
  });

  it('uses matching barcode serving size', () => {
    const item = makeItem({
      product: {
        id: 'prod-1',
        name: 'Test Product',
        barcodes: [
          {
            code: 'ABC',
            servingSize: { kind: 'servings', amount: 3 },
          },
        ],
        preparations: [
          {
            id: 'prep-1',
            nutritionalInformation: {
              calories: { amount: 100, unit: 'kcal' },
            },
          },
        ],
      },
      preparationID: 'prep-1',
    });
    renderWithRouter(<ProductCard item={item} barcode="ABC" />);
    expect(screen.getByText('3 servings')).toBeInTheDocument();
  });

  it('shows servings count when scalar is not 1', () => {
    const item = makeItem({
      product: {
        id: 'prod-1',
        name: 'Test Product',
        barcodes: [
          {
            code: 'ABC',
            servingSize: { kind: 'servings', amount: 2 },
          },
        ],
        preparations: [
          {
            id: 'prep-1',
            nutritionalInformation: {
              calories: { amount: 100, unit: 'kcal' },
            },
          },
        ],
      },
      preparationID: 'prep-1',
    });
    renderWithRouter(<ProductCard item={item} barcode="ABC" />);
    const matches = screen.getAllByText(/2 serving/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    // Both the serving size display and the scalar count show "2 servings"
    expect(screen.getByText('2 servings')).toBeInTheDocument();
    expect(screen.getByText(/\(2 serving/)).toBeInTheDocument();
  });

  it('handles missing preparations gracefully', () => {
    const item = makeItem({
      product: {
        id: 'prod-1',
        name: 'No Prep',
        preparations: [],
      },
      preparationID: 'none',
    });
    renderWithRouter(<ProductCard item={item} />);
    expect(screen.getByText('No Prep')).toBeInTheDocument();
  });

  it('falls back to first preparation when preparationID does not match', () => {
    const item: ApiLookupItem = {
      product: {
        id: 'prod-1',
        name: 'Fallback',
        preparations: [
          {
            id: 'prep-a',
            nutritionalInformation: {
              calories: { amount: 150, unit: 'kcal' },
            },
          },
        ],
      },
      preparationID: 'nonexistent',
    };
    renderWithRouter(<ProductCard item={item} />);
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });
});
