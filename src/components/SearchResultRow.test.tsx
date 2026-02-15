import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import type { ApiSearchResult } from '../api';

import SearchResultRow from './SearchResultRow';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('./AddToFavoritesButton', () => ({
  default: ({ productId, groupId }: { productId?: string; groupId?: string }) => (
    <div
      data-testid="add-to-favorites-button"
      data-product-id={productId}
      data-group-id={groupId}
    />
  ),
}));

function renderWithRouter(ui: ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/test']}>
      <Routes>
        <Route path="/test" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

function makeProductResult(overrides?: Partial<ApiSearchResult>): ApiSearchResult {
  return {
    item: {
      product: {
        id: 'p1',
        name: 'Oats',
        brand: "Bob's Red Mill",
        preparations: [
          {
            id: 'prep1',
            nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
            mass: { amount: 40, unit: 'g' },
          },
        ],
      },
      preparationID: 'prep1',
    },
    servingSize: { kind: 'servings', amount: 1 },
    relevance: 1.0,
    ...overrides,
  };
}

function makeGroupResult(overrides?: Partial<ApiSearchResult>): ApiSearchResult {
  return {
    item: {
      group: {
        id: 'g1',
        name: 'Breakfast Bowl',
        items: [],
      },
    },
    servingSize: { kind: 'servings', amount: 1 },
    relevance: 0.9,
    ...overrides,
  };
}

describe('SearchResultRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product name, brand, and serving size', () => {
    renderWithRouter(<SearchResultRow result={makeProductResult()} />);
    expect(screen.getByText('Oats')).toBeInTheDocument();
    expect(screen.getByText(/Bob's Red Mill/)).toBeInTheDocument();
    expect(screen.getByText(/1 serving/)).toBeInTheDocument();
  });

  it('renders group name and serving size', () => {
    renderWithRouter(<SearchResultRow result={makeGroupResult()} />);
    expect(screen.getByText('Breakfast Bowl')).toBeInTheDocument();
    expect(screen.getByText(/1 serving/)).toBeInTheDocument();
  });

  it('renders calories for product results', () => {
    renderWithRouter(<SearchResultRow result={makeProductResult()} />);
    expect(screen.getByText('150 kcal')).toBeInTheDocument();
  });

  it('navigates to product detail with serving size params on click', () => {
    renderWithRouter(<SearchResultRow result={makeProductResult()} />);
    fireEvent.click(screen.getByRole('button', { name: 'View Oats' }));
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1?st=servings&sa=1');
  });

  it('navigates to group detail with serving size params on click', () => {
    renderWithRouter(<SearchResultRow result={makeGroupResult()} />);
    fireEvent.click(screen.getByRole('button', { name: 'View Breakfast Bowl' }));
    expect(mockNavigate).toHaveBeenCalledWith('/groups/g1?st=servings&sa=1');
  });

  it('includes prep param when preparationID differs from default', () => {
    const result = makeProductResult({
      item: {
        product: {
          id: 'p1',
          name: 'Oats',
          brand: "Bob's Red Mill",
          preparations: [
            {
              id: 'prep1',
              nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
              mass: { amount: 40, unit: 'g' },
            },
            {
              id: 'prep-cooked',
              nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
              mass: { amount: 100, unit: 'g' },
            },
          ],
        },
        preparationID: 'prep-cooked',
      },
    });
    renderWithRouter(<SearchResultRow result={result} />);
    fireEvent.click(screen.getByRole('button', { name: 'View Oats' }));
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1?st=servings&sa=1&prep=prep-cooked');
  });

  it('omits prep param when preparationID matches default', () => {
    renderWithRouter(<SearchResultRow result={makeProductResult()} />);
    fireEvent.click(screen.getByRole('button', { name: 'View Oats' }));
    const path = mockNavigate.mock.calls[0][0] as string;
    expect(path).not.toContain('prep=');
  });

  it('includes mass serving size params in link', () => {
    const result = makeProductResult({
      servingSize: { mass: { amount: 100, unit: 'g' } },
    });
    renderWithRouter(<SearchResultRow result={result} />);
    fireEvent.click(screen.getByRole('button', { name: 'View Oats' }));
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1?st=mass&sa=100&su=g');
  });

  it('renders log button when onLog is provided', () => {
    const onLog = vi.fn();
    renderWithRouter(<SearchResultRow result={makeProductResult()} onLog={onLog} />);
    expect(screen.getByRole('button', { name: 'Log Oats' })).toBeInTheDocument();
  });

  it('does not render action buttons when onLog is not provided', () => {
    renderWithRouter(<SearchResultRow result={makeProductResult()} />);
    expect(screen.queryByRole('button', { name: 'Log Oats' })).not.toBeInTheDocument();
  });

  it('calls onLog when log button is clicked', () => {
    const onLog = vi.fn();
    const result = makeProductResult();
    renderWithRouter(<SearchResultRow result={result} onLog={onLog} />);
    fireEvent.click(screen.getByRole('button', { name: 'Log Oats' }));
    expect(onLog).toHaveBeenCalledWith(result);
  });

  it('does not navigate when log button is clicked', () => {
    const onLog = vi.fn();
    renderWithRouter(<SearchResultRow result={makeProductResult()} onLog={onLog} />);
    fireEvent.click(screen.getByRole('button', { name: 'Log Oats' }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders AddToFavoritesButton with product id', () => {
    renderWithRouter(<SearchResultRow result={makeProductResult()} onLog={vi.fn()} />);
    const favBtn = screen.getByTestId('add-to-favorites-button');
    expect(favBtn).toHaveAttribute('data-product-id', 'p1');
  });

  it('renders AddToFavoritesButton with group id', () => {
    renderWithRouter(<SearchResultRow result={makeGroupResult()} onLog={vi.fn()} />);
    const favBtn = screen.getByTestId('add-to-favorites-button');
    expect(favBtn).toHaveAttribute('data-group-id', 'g1');
  });

  it('disables log button when logLoading is true', () => {
    renderWithRouter(<SearchResultRow result={makeProductResult()} onLog={vi.fn()} logLoading />);
    expect(screen.getByRole('button', { name: 'Log Oats' })).toBeDisabled();
  });

  it('shows spinner when logLoading is true', () => {
    renderWithRouter(<SearchResultRow result={makeProductResult()} onLog={vi.fn()} logLoading />);
    const btn = screen.getByRole('button', { name: 'Log Oats' });
    expect(btn.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('renders placeholder calories when nutrition is unavailable', () => {
    const result = makeProductResult({
      item: {
        product: { id: 'p2', name: 'Unknown Food', preparations: [] },
      },
    });
    renderWithRouter(<SearchResultRow result={result} />);
    expect(screen.getByText('-- kcal')).toBeInTheDocument();
  });
});
