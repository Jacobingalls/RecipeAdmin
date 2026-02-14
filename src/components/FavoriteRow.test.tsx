import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import type { ApiFavorite } from '../api';

import FavoriteRow from './FavoriteRow';
import type { FavoriteLogState } from './FavoriteRow';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const productFavorite: ApiFavorite = {
  id: 'fav1',
  createdAt: 1700000000,
  lastUsedAt: 1700001000,
  item: {
    product: {
      id: 'p1',
      name: 'Peanut Butter',
      brand: 'NutCo',
      preparations: [
        {
          id: 'prep1',
          nutritionalInformation: { calories: { amount: 190, unit: 'kcal' } },
          mass: { amount: 32, unit: 'g' },
        },
      ],
    },
    preparationID: 'prep1',
    servingSize: { kind: 'servings', amount: 2 },
  },
};

const groupFavorite: ApiFavorite = {
  id: 'fav2',
  createdAt: 1700000000,
  lastUsedAt: 1700001000,
  item: {
    group: {
      id: 'g1',
      name: 'Breakfast Bowl',
      items: [],
    },
    servingSize: { kind: 'servings', amount: 1 },
  },
};

interface RenderOptions {
  favorite?: ApiFavorite;
  logState?: FavoriteLogState;
  onLog?: (fav: ApiFavorite) => void;
  onLogWithSize?: (fav: ApiFavorite) => void;
  onRemove?: (fav: ApiFavorite) => void;
  removeLoading?: boolean;
}

function renderRow(options: RenderOptions = {}) {
  const {
    favorite = productFavorite,
    logState = 'idle',
    onLog = vi.fn(),
    onLogWithSize = vi.fn(),
    onRemove = vi.fn(),
    removeLoading = false,
  } = options;

  return renderWithRouter(
    <FavoriteRow
      favorite={favorite}
      logState={logState}
      onLog={onLog}
      onLogWithSize={onLogWithSize}
      onRemove={onRemove}
      removeLoading={removeLoading}
    />,
  );
}

describe('FavoriteRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders the favorite name', () => {
    renderRow();
    expect(screen.getByText('Peanut Butter')).toBeInTheDocument();
  });

  it('renders serving size description', () => {
    renderRow();
    expect(screen.getByText(/2 servings/)).toBeInTheDocument();
  });

  it('renders calorie display', () => {
    renderRow();
    // 2 servings * 190 = 380
    expect(screen.getByText(/380 kcal/)).toBeInTheDocument();
  });

  it('renders last used relative time', () => {
    renderRow();
    // lastUsedAt is a past timestamp, so formatRelativeTime will produce a relative string
    // The subtitle should contain the em dash separator
    const subtitle = screen.getByText(/2 servings/);
    expect(subtitle).toHaveTextContent(/\u2014/);
  });

  it('renders group name', () => {
    renderRow({ favorite: groupFavorite });
    expect(screen.getByText('Breakfast Bowl')).toBeInTheDocument();
  });

  it('navigates to product detail on click', () => {
    renderRow();
    fireEvent.click(screen.getByRole('button', { name: 'View Peanut Butter' }));
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1');
  });

  it('navigates to group detail on click', () => {
    renderRow({ favorite: groupFavorite });
    fireEvent.click(screen.getByRole('button', { name: 'View Breakfast Bowl' }));
    expect(mockNavigate).toHaveBeenCalledWith('/groups/g1');
  });

  it('navigates on Enter key', () => {
    renderRow();
    fireEvent.keyDown(screen.getByRole('button', { name: 'View Peanut Butter' }), {
      key: 'Enter',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1');
  });

  it('calls onLog when Log button is clicked', () => {
    const onLog = vi.fn();
    renderRow({ onLog });
    fireEvent.click(screen.getByRole('button', { name: 'Log Peanut Butter' }));
    expect(onLog).toHaveBeenCalledWith(productFavorite);
  });

  it('does not call onLog when logging', () => {
    const onLog = vi.fn();
    renderRow({ onLog, logState: 'logging' });
    fireEvent.click(screen.getByRole('button', { name: 'Log Peanut Butter' }));
    expect(onLog).not.toHaveBeenCalled();
  });

  it('does not call onLog when success', () => {
    const onLog = vi.fn();
    renderRow({ onLog, logState: 'success' });
    fireEvent.click(screen.getByRole('button', { name: 'Log Peanut Butter' }));
    expect(onLog).not.toHaveBeenCalled();
  });

  it('shows "Logged!" when success', () => {
    renderRow({ logState: 'success' });
    expect(screen.getByText('Logged!')).toBeInTheDocument();
  });

  it('calls onLogWithSize from dropdown', () => {
    const onLogWithSize = vi.fn();
    renderRow({ onLogWithSize });
    fireEvent.click(screen.getByText('Log with different size'));
    expect(onLogWithSize).toHaveBeenCalledWith(productFavorite);
  });

  it('calls onRemove from dropdown', () => {
    const onRemove = vi.fn();
    renderRow({ onRemove });
    fireEvent.click(screen.getByText('Remove'));
    expect(onRemove).toHaveBeenCalledWith(productFavorite);
  });

  it('disables Remove when removeLoading is true', () => {
    renderRow({ removeLoading: true });
    expect(screen.getByText('Remove')).toBeDisabled();
  });

  it('has dropdown trigger with correct aria-label', () => {
    renderRow();
    expect(screen.getByLabelText('Peanut Butter actions')).toBeInTheDocument();
  });

  it('does not navigate when Log button is clicked', () => {
    renderRow();
    fireEvent.click(screen.getByRole('button', { name: 'Log Peanut Butter' }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
