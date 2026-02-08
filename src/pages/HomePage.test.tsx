import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import HomePage from './HomePage';

vi.mock('../components/home', () => ({
  HistoryTile: () => <div data-testid="history-tile" />,
}));

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('HomePage', () => {
  it('renders the greeting', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('renders the HistoryTile', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByTestId('history-tile')).toBeInTheDocument();
  });
});
