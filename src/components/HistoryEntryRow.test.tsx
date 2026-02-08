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
    logAgainLoading: false,
    onEdit: vi.fn(),
    editLoading: false,
    onDelete: vi.fn(),
    deleteLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name, serving size, and relative time', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    expect(screen.getByText('Oats')).toBeInTheDocument();
    expect(screen.getByText(/2 servings/)).toBeInTheDocument();
    expect(screen.getByText(/5m ago/)).toBeInTheDocument();
    expect(screen.getByText('320 kcal')).toBeInTheDocument();
  });

  it('renders placeholder calories when unavailable', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} calories={null} />);
    expect(screen.getByText('-- kcal')).toBeInTheDocument();
  });

  it('navigates to detail page on click', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const row = screen.getByRole('button', { name: /Oats/i });
    fireEvent.click(row);
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1');
  });

  it('navigates on Enter key press', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const row = screen.getByRole('button', { name: /Oats/i });
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1');
  });

  it('navigates on Space key press', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const row = screen.getByRole('button', { name: /Oats/i });
    fireEvent.keyDown(row, { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledWith('/products/p1');
  });

  it('navigates to group detail for group entries', () => {
    const groupEntry = makeEntry({
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    });
    renderWithRouter(
      <HistoryEntryRow {...defaultProps} entry={groupEntry} name="Breakfast Bowl" />,
    );
    const row = screen.getByRole('button', { name: /Breakfast Bowl/i });
    fireEvent.click(row);
    expect(mockNavigate).toHaveBeenCalledWith('/groups/g1');
  });

  it('renders the overflow menu button', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    expect(screen.getByLabelText('Entry actions')).toBeInTheDocument();
  });

  it('renders a borderless round overflow button', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const btn = screen.getByLabelText('Entry actions');
    expect(btn).toHaveClass('rounded-circle', 'border-0', 'text-body-secondary');
    expect(btn).toHaveStyle({ width: '2rem', height: '2rem' });
  });

  it('does not navigate when overflow menu button is clicked', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Entry actions'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders Log again menu item', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    expect(screen.getByText('Log again')).toBeInTheDocument();
  });

  it('calls onLogAgain with the entry when Log again is clicked', () => {
    const onLogAgain = vi.fn();
    renderWithRouter(<HistoryEntryRow {...defaultProps} onLogAgain={onLogAgain} />);
    fireEvent.click(screen.getByText('Log again'));
    expect(onLogAgain).toHaveBeenCalledWith(defaultProps.entry);
  });

  it('does not navigate when Log again is clicked', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    fireEvent.click(screen.getByText('Log again'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables Log again when logAgainLoading is true', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} logAgainLoading />);
    expect(screen.getByText('Log again')).toBeDisabled();
  });

  it('renders a divider between Log again and Edit', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const menu = screen.getByText('Log again').closest('ul')!;
    const items = Array.from(menu.querySelectorAll('li'));
    expect(items[1].querySelector('hr.dropdown-divider')).toBeInTheDocument();
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

  it('disables Edit when editLoading is true', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} editLoading />);
    expect(screen.getByText('Edit')).toBeDisabled();
  });

  it('renders Delete menu item with destructive styling', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    const deleteBtn = screen.getByText('Delete');
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn).toHaveClass('text-danger');
  });

  it('calls onDelete with the entry when Delete is clicked', () => {
    const onDelete = vi.fn();
    renderWithRouter(<HistoryEntryRow {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith(defaultProps.entry);
  });

  it('does not navigate when Delete is clicked', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables Delete when deleteLoading is true', () => {
    renderWithRouter(<HistoryEntryRow {...defaultProps} deleteLoading />);
    expect(screen.getByText('Delete')).toBeDisabled();
  });
});
