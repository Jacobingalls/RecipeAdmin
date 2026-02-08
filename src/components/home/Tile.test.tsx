import { render, screen } from '@testing-library/react';

import Tile from './Tile';

describe('Tile', () => {
  it('renders the title', () => {
    render(<Tile title="My Tile">content</Tile>);
    expect(screen.getByText('My Tile')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Tile title="Test">
        <p data-testid="child">Hello</p>
      </Tile>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders as a Bootstrap card', () => {
    const { container } = render(<Tile title="Card">body</Tile>);
    expect(container.querySelector('.card')).toBeInTheDocument();
    expect(container.querySelector('.card-header')).toBeInTheDocument();
    expect(container.querySelector('.card-body')).toBeInTheDocument();
  });
});
