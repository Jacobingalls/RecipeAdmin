import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiLookupItem } from '../../api';

import LookupResultItem from './LookupResultItem';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const productItem: ApiLookupItem = {
  product: {
    id: 'prod-1',
    name: 'Product A',
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
};

const groupItem: ApiLookupItem = {
  group: {
    id: 'grp-1',
    name: 'Group B',
    items: [],
  },
};

describe('LookupResultItem', () => {
  it('renders ProductCard for product items', () => {
    renderWithRouter(<LookupResultItem item={productItem} />);
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('renders GroupCard for group items', () => {
    renderWithRouter(<LookupResultItem item={groupItem} />);
    expect(screen.getByText('Group B')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('returns null when item has neither product nor group', () => {
    const emptyItem: ApiLookupItem = {};
    const { container } = renderWithRouter(<LookupResultItem item={emptyItem} />);
    expect(container.innerHTML).toBe('');
  });

  it('passes barcode to ProductCard', () => {
    const item: ApiLookupItem = {
      product: {
        id: 'prod-2',
        name: 'Barcode Product',
        barcodes: [
          {
            code: '12345',
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
    };
    renderWithRouter(<LookupResultItem item={item} barcode="12345" />);
    expect(screen.getByText('2 servings')).toBeInTheDocument();
  });

  it('passes barcode to GroupCard', () => {
    const item: ApiLookupItem = {
      group: {
        id: 'grp-2',
        name: 'Barcode Group',
        items: [
          {
            product: {
              preparations: [
                {
                  id: 'p1',
                  nutritionalInformation: { calories: { amount: 50, unit: 'kcal' } },
                },
              ],
            },
            preparationID: 'p1',
          },
        ],
        barcodes: [
          {
            code: '67890',
            servingSize: { kind: 'servings', amount: 4 },
          },
        ],
      },
    };
    renderWithRouter(<LookupResultItem item={item} barcode="67890" />);
    expect(screen.getByText('4 servings')).toBeInTheDocument();
  });
});
