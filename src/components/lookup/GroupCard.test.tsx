import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiLookupItem } from '../../api';
import { ServingSize } from '../../domain';

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
    renderWithRouter(<GroupCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    const link = screen.getByRole('link', { name: 'Test Group' });
    expect(link).toHaveAttribute('href', '/groups/grp-1');
  });

  it('renders the Group badge', () => {
    renderWithRouter(<GroupCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('renders calories', () => {
    renderWithRouter(<GroupCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText(/200/)).toBeInTheDocument();
    expect(screen.getByText(/cal/)).toBeInTheDocument();
  });

  it('renders mass', () => {
    renderWithRouter(<GroupCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('renders item count', () => {
    renderWithRouter(<GroupCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText('1 item(s)')).toBeInTheDocument();
  });

  it('displays default 1 serving', () => {
    renderWithRouter(<GroupCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText('1 serving')).toBeInTheDocument();
  });

  it('uses provided serving size', () => {
    renderWithRouter(<GroupCard item={makeItem()} servingSize={ServingSize.servings(3)} />);
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
    renderWithRouter(<GroupCard item={item} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText('0 item(s)')).toBeInTheDocument();
  });

  it('handles missing items field gracefully', () => {
    const item = makeItem({
      group: {
        id: 'grp-no-items',
        name: 'No Items',
      },
    });
    renderWithRouter(<GroupCard item={item} servingSize={ServingSize.servings(1)} />);
    expect(screen.getByText('No Items')).toBeInTheDocument();
    expect(screen.getByText('0 item(s)')).toBeInTheDocument();
  });

  it('renders Log button when onLog is provided', () => {
    const onLog = vi.fn();
    renderWithRouter(
      <GroupCard item={makeItem()} servingSize={ServingSize.servings(1)} onLog={onLog} />,
    );
    const logButton = screen.getByRole('button', { name: 'Log' });
    expect(logButton).toBeInTheDocument();
  });

  it('does not render Log button when onLog is not provided', () => {
    renderWithRouter(<GroupCard item={makeItem()} servingSize={ServingSize.servings(1)} />);
    expect(screen.queryByRole('button', { name: 'Log' })).not.toBeInTheDocument();
  });

  it('calls onLog when Log button is clicked', () => {
    const onLog = vi.fn();
    renderWithRouter(
      <GroupCard item={makeItem()} servingSize={ServingSize.servings(1)} onLog={onLog} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Log' }));
    expect(onLog).toHaveBeenCalledTimes(1);
  });

  it('falls back to oneServing when serving calculation throws', () => {
    // Mass-based serving size on a group with no mass defined → throws, falls back
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
        barcodes: [],
      },
    };
    renderWithRouter(<GroupCard item={item} servingSize={ServingSize.mass(100, 'g')} />);
    // Falls back to oneServing nutrition
    expect(screen.getByText(/80/)).toBeInTheDocument();
    expect(screen.getByText(/cal/)).toBeInTheDocument();
  });
});
