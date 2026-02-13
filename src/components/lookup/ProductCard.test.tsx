import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiLookupItem } from '../../api';
import { ServingSize } from '../../domain';

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
    renderWithRouter(<ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    const link = screen.getByRole('link', { name: 'Test Product' });
    expect(link).toHaveAttribute('href', '/products/prod-1');
  });

  it('renders the brand', () => {
    renderWithRouter(<ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
  });

  it('renders the Product badge', () => {
    renderWithRouter(<ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('renders calories', () => {
    renderWithRouter(<ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText(/200/)).toBeInTheDocument();
    expect(screen.getByText(/cal/)).toBeInTheDocument();
  });

  it('renders mass', () => {
    renderWithRouter(<ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('renders volume', () => {
    renderWithRouter(<ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText(/240/)).toBeInTheDocument();
  });

  it('displays default 1 serving when given 1 serving', () => {
    renderWithRouter(<ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText('1 serving')).toBeInTheDocument();
  });

  it('uses provided serving size', () => {
    const item = makeItem({
      product: {
        id: 'prod-1',
        name: 'Test Product',
        barcodes: [],
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
    renderWithRouter(<ProductCard item={item} servingSize={ServingSize.servings(3)} />);
    expect(screen.getByText('3 servings')).toBeInTheDocument();
  });

  it('shows servings count when scalar is not 1', () => {
    const item = makeItem({
      product: {
        id: 'prod-1',
        name: 'Test Product',
        barcodes: [],
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
    renderWithRouter(<ProductCard item={item} servingSize={ServingSize.servings(2)} />);
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
    renderWithRouter(<ProductCard item={item} servingSize={ServingSize.servings(1)} />);
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
    renderWithRouter(<ProductCard item={item} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });

  it('renders Log button when onLog is provided', () => {
    const onLog = vi.fn();
    renderWithRouter(
      <ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} onLog={onLog} />,
    );
    const logButton = screen.getByRole('button', { name: 'Log' });
    expect(logButton).toBeInTheDocument();
  });

  it('does not render Log button when onLog is not provided', () => {
    renderWithRouter(<ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.queryByRole('button', { name: 'Log' })).not.toBeInTheDocument();
  });

  it('calls onLog when Log button is clicked', () => {
    const onLog = vi.fn();
    renderWithRouter(
      <ProductCard item={makeItem()} servingSize={ServingSize.servings(1)} onLog={onLog} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Log' }));
    expect(onLog).toHaveBeenCalledTimes(1);
  });

  it('falls back to base nutrition when nutritionalInformationFor throws', () => {
    // Mass-based serving size on a product with no mass → throws, falls back
    const item: ApiLookupItem = {
      product: {
        id: 'prod-catch',
        name: 'Catch Product',
        barcodes: [],
        preparations: [
          {
            id: 'prep-1',
            nutritionalInformation: {
              calories: { amount: 120, unit: 'kcal' },
            },
          },
        ],
      },
      preparationID: 'prep-1',
    };
    renderWithRouter(<ProductCard item={item} servingSize={ServingSize.mass(100, 'g')} />);
    // Falls back to unscaled base nutrition
    expect(screen.getByText(/120/)).toBeInTheDocument();
    expect(screen.getByText(/cal/)).toBeInTheDocument();
  });
});
