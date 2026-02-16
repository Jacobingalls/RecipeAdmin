import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import type { ApiLogEntry } from '../api';

import HistoryEntryRow from './HistoryEntryRow';

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

function makeEntry(overrides?: Partial<ApiLogEntry>): ApiLogEntry {
  return {
    id: 'log1',
    timestamp: Date.now() / 1000 - 5 * 60,
    userID: 'u1',
    item: {
      kind: 'product',
      productID: 'p1',
      servingSize: { kind: 'servings', amount: 2 },
    },
    ...overrides,
  };
}

describe('HistoryEntryRow', () => {
  const defaultProps = {
    entry: makeEntry(),
    name: 'Oats',
    calories: 320,
    onLogAgain: vi.fn(),
    logAgainLoadingId: null,
    onEdit: vi.fn(),
    editLoadingId: null,
    onDelete: vi.fn(),
    deleteLoadingId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name, serving size, and relative time by default', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    expect(screen.getByText('Oats')).toBeInTheDocument();
    expect(screen.getByText(/2 servings/)).toBeInTheDocument();
    expect(screen.getByText(/5m ago/)).toBeInTheDocument();
    expect(screen.getByText('320 kcal')).toBeInTheDocument();
  });

  it('renders time-only when timeDisplay is "time"', () => {
    const entry = makeEntry({ timestamp: new Date(2025, 0, 15, 14, 30).getTime() / 1000 });
    const expectedTime = new Date(2025, 0, 15, 14, 30).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    renderWithRouter(<HistoryEntryRow {...defaultProps} entry={entry} timeDisplay="time" />);
    expect(screen.getByText(new RegExp(expectedTime))).toBeInTheDocument();
    expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
  });

  it('renders placeholder calories when unavailable', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} calories={null} />);
    expect(screen.getByText('-- kcal')).toBeInTheDocument();
  });

  it('navigates to detail page with serving size params on click', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const row = screen.getByRole('button', { name: 'View Oats' });
    fireEvent.click(row);
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1?st=servings&sa=2');
  });

  it('navigates on Enter key press', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const row = screen.getByRole('button', { name: 'View Oats' });
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1?st=servings&sa=2');
  });

  it('navigates on Space key press', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const row = screen.getByRole('button', { name: 'View Oats' });
    fireEvent.keyDown(row, { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1?st=servings&sa=2');
  });

  it('navigates to group detail with serving size params', () => {
    const groupEntry = makeEntry({
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    });
    renderWithRouter(
      <HistoryEntryRow {...defaultProps} entry={groupEntry} name="Breakfast Bowl" />,
    );
    const row = screen.getByRole('button', { name: 'View Breakfast Bowl' });
    fireEvent.click(row);
    expect(mockNavigate).toHaveBeenCalledWith('/groups/g1?st=servings&sa=1');
  });

  it('renders the overflow menu button', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    expect(screen.getByLabelText('Entry actions')).toBeInTheDocument();
  });

  it('renders a borderless round overflow button', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const btn = screen.getByLabelText('Entry actions');
    expect(btn).toHaveClass('rounded-circle', 'border-0', 'text-body-secondary');
    expect(btn).toHaveStyle({ width: '2.25rem', height: '2.25rem' });
  });

  it('wraps action buttons in a CircularButtonGroup', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group.style.borderRadius).toBe('1.125rem');
  });

  it('does not navigate when overflow menu button is clicked', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Entry actions'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders log button with plus icon', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const btn = screen.getByRole('button', { name: 'Log Oats' });
    expect(btn.querySelector('.bi-plus-lg')).toBeInTheDocument();
  });

  it('calls onLogAgain when log button is clicked', () => {
    const onLogAgain = vi.fn();
    renderWithRouter(<HistoryEntryRow {...defaultProps} onLogAgain={onLogAgain} />);
    fireEvent.click(screen.getByRole('button', { name: 'Log Oats' }));
    expect(onLogAgain).toHaveBeenCalledWith(defaultProps.entry);
  });

  it('does not navigate when log button is clicked', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Log Oats' }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables log button when logAgainLoadingId matches entry', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} logAgainLoadingId="log1" />);
    expect(screen.getByRole('button', { name: 'Log Oats' })).toBeDisabled();
  });

  it('shows spinner when logAgainLoadingId matches entry', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} logAgainLoadingId="log1" />);
    const btn = screen.getByRole('button', { name: 'Log Oats' });
    expect(btn.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('renders Edit menu item', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('calls onEdit with the entry when Edit is clicked', () => {
    const onEdit = vi.fn();
    renderWithRouter(<HistoryEntryRow {...defaultProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(defaultProps.entry);
  });

  it('does not navigate when Edit is clicked', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables Edit when editLoadingId matches entry', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} editLoadingId="log1" />);
    expect(screen.getByText('Edit')).toBeDisabled();
  });

  it('renders Remove menu item', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('calls onDelete with the entry when Remove is clicked', () => {
    const onDelete = vi.fn();
    renderWithRouter(<HistoryEntryRow {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Remove'));
    expect(onDelete).toHaveBeenCalledWith(defaultProps.entry);
  });

  it('does not navigate when Remove is clicked', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    fireEvent.click(screen.getByText('Remove'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables Remove when deleteLoadingId matches entry', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} deleteLoadingId="log1" />);
    expect(screen.getByText('Remove')).toBeDisabled();
  });

  it('renders AddToFavoritesButton for product entries', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const favBtn = screen.getByTestId('add-to-favorites-button');
    expect(favBtn).toBeInTheDocument();
    expect(favBtn).toHaveAttribute('data-product-id', 'p1');
  });

  it('renders AddToFavoritesButton with groupId for group entries', () => {
    const groupEntry = makeEntry({
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    });
    renderWithRouter(
      <HistoryEntryRow {...defaultProps} entry={groupEntry} name="Breakfast Bowl" />,
    );
    const favBtn = screen.getByTestId('add-to-favorites-button');
    expect(favBtn).toHaveAttribute('data-group-id', 'g1');
  });
});
