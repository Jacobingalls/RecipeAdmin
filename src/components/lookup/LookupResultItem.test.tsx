import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiSearchResult } from '../../api';

import LookupResultItem from './LookupResultItem';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const productResult: ApiSearchResult = {
  item: {
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
  },
  servingSize: { kind: 'servings', amount: 1 },
  relevance: 1.0,
};

const groupResult: ApiSearchResult = {
  item: {
    group: {
      id: 'grp-1',
      name: 'Group B',
      items: [],
    },
  },
  servingSize: { kind: 'servings', amount: 1 },
  relevance: 0.8,
};

describe('LookupResultItem', () => {
  it('renders ProductCard for product items', () => {
    renderWithRouter(<LookupResultItem result={productResult} />);
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('renders GroupCard for group items', () => {
    renderWithRouter(<LookupResultItem result={groupResult} />);
    expect(screen.getByText('Group B')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('returns null when item has neither product nor group', () => {
    const emptyResult: ApiSearchResult = {
      item: {},
      servingSize: { kind: 'servings', amount: 1 },
      relevance: 1.0,
    };
    const { container } = renderWithRouter(<LookupResultItem result={emptyResult} />);
    expect(container.innerHTML).toBe('');
  });

  it('uses serving size from the result', () => {
    const result: ApiSearchResult = {
      item: {
        product: {
          id: 'prod-2',
          name: 'Barcode Product',
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
      },
      servingSize: { kind: 'servings', amount: 2 },
      relevance: 1.0,
    };
    renderWithRouter(<LookupResultItem result={result} />);
    expect(screen.getByText('2 servings')).toBeInTheDocument();
  });

  it('passes onLog to ProductCard', () => {
    const onLog = vi.fn();
    renderWithRouter(<LookupResultItem result={productResult} onLog={onLog} />);
    const logButton = screen.getByRole('button', { name: 'Log' });
    fireEvent.click(logButton);
    expect(onLog).toHaveBeenCalledWith(productResult);
  });

  it('passes onLog to GroupCard', () => {
    const onLog = vi.fn();
    renderWithRouter(<LookupResultItem result={groupResult} onLog={onLog} />);
    const logButton = screen.getByRole('button', { name: 'Log' });
    fireEvent.click(logButton);
    expect(onLog).toHaveBeenCalledWith(groupResult);
  });

  it('does not render Log button when onLog is not provided', () => {
    renderWithRouter(<LookupResultItem result={productResult} />);
    expect(screen.queryByRole('button', { name: 'Log' })).not.toBeInTheDocument();
  });

  it('uses serving size from result for GroupCard', () => {
    const result: ApiSearchResult = {
      item: {
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
          barcodes: [],
        },
      },
      servingSize: { kind: 'servings', amount: 4 },
      relevance: 1.0,
    };
    renderWithRouter(<LookupResultItem result={result} />);
    expect(screen.getByText('4 servings')).toBeInTheDocument();
  });
});
