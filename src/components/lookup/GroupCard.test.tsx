import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiLookupItem } from '../../api';

import GroupCard from './GroupCard';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const makeItem = (overrides: Partial<ApiLookupItem> = {}): ApiLookupItem => ({
  group: {
    id: 'grp-1',
    name: 'Test Group',
    items: [
      {
        product: {
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
      },
    ],
    barcodes: [],
  },
  ...overrides,
});

describe('GroupCard', () => {
  it('renders the group name as a link', () => {
    renderWithRouter(<GroupCard item={makeItem()} />);
    const link = screen.getByRole('link', { name: 'Test Group' });
    expect(link).toHaveAttribute('href', '/groups/grp-1');
  });

  it('renders the Group badge', () => {
    renderWithRouter(<GroupCard item={makeItem()} />);
    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('renders calories', () => {
    renderWithRouter(<GroupCard item={makeItem()} />);
    expect(screen.getByText(/200/)).toBeInTheDocument();
    expect(screen.getByText(/cal/)).toBeInTheDocument();
  });

  it('renders mass', () => {
    renderWithRouter(<GroupCard item={makeItem()} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('renders item count', () => {
    renderWithRouter(<GroupCard item={makeItem()} />);
    expect(screen.getByText('1 item(s)')).toBeInTheDocument();
  });

  it('displays default 1 serving', () => {
    renderWithRouter(<GroupCard item={makeItem()} />);
    expect(screen.getByText('1 serving')).toBeInTheDocument();
  });

  it('uses matching barcode serving size', () => {
    const item = makeItem({
      group: {
        id: 'grp-1',
        name: 'Barcode Group',
        items: [
          {
            product: {
              preparations: [
                {
                  id: 'prep-1',
                  nutritionalInformation: {
                    calories: { amount: 100, unit: 'kcal' },
                  },
                  mass: { amount: 30, unit: 'g' },
                },
              ],
            },
            preparationID: 'prep-1',
          },
        ],
        barcodes: [
          {
            code: 'XYZ',
            servingSize: { kind: 'servings', amount: 3 },
          },
        ],
      },
    });
    renderWithRouter(<GroupCard item={item} barcode="XYZ" />);
    expect(screen.getByText('3 servings')).toBeInTheDocument();
  });

  it('renders 0 items when group has no items', () => {
    const item = makeItem({
      group: {
        id: 'grp-empty',
        name: 'Empty Group',
        items: [],
      },
    });
    renderWithRouter(<GroupCard item={item} />);
    expect(screen.getByText('0 item(s)')).toBeInTheDocument();
  });

  it('handles missing items field gracefully', () => {
    const item = makeItem({
      group: {
        id: 'grp-no-items',
        name: 'No Items',
      },
    });
    renderWithRouter(<GroupCard item={item} />);
    expect(screen.getByText('No Items')).toBeInTheDocument();
    expect(screen.getByText('0 item(s)')).toBeInTheDocument();
  });

  it('falls back to oneServing when serving calculation throws', () => {
    // Mass-based barcode serving size on a group with no mass defined → throws, falls back
    const item: ApiLookupItem = {
      group: {
        id: 'grp-fallback',
        name: 'Fallback Group',
        items: [
          {
            product: {
              preparations: [
                {
                  id: 'prep-1',
                  nutritionalInformation: {
                    calories: { amount: 80, unit: 'kcal' },
                  },
                },
              ],
            },
            preparationID: 'prep-1',
          },
        ],
        barcodes: [
          {
            code: 'FAIL',
            servingSize: { kind: 'mass', amount: { amount: 100, unit: 'g' } },
          },
        ],
      },
    };
    renderWithRouter(<GroupCard item={item} barcode="FAIL" />);
    // Falls back to oneServing nutrition
    expect(screen.getByText(/80/)).toBeInTheDocument();
    expect(screen.getByText(/cal/)).toBeInTheDocument();
  });
});
