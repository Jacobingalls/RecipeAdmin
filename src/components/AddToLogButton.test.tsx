import { render, screen, fireEvent } from '@testing-library/react';

import { ProductGroup, ServingSize } from '../domain';

import type { LogTarget } from './LogModal';
import AddToLogButton from './AddToLogButton';

vi.mock('./LogModal', () => ({
  default: ({ target, onClose }: { target: LogTarget | null; onClose: () => void }) =>
    target ? (
      <div data-testid="log-modal" data-name={target.name}>
        <button type="button" onClick={onClose}>
          Close modal
        </button>
      </div>
    ) : null,
}));

const target: LogTarget = {
  name: 'Oatmeal',
  prepOrGroup: new ProductGroup({ name: 'Oatmeal', items: [] }),
  initialServingSize: ServingSize.servings(1),
  groupId: 'g1',
};

describe('AddToLogButton', () => {
  it('renders the button with the log modal closed', () => {
    render(<AddToLogButton target={target} />);
    expect(screen.getByRole('button', { name: 'Add to Log' })).toBeInTheDocument();
    expect(screen.queryByTestId('log-modal')).not.toBeInTheDocument();
  });

  it('opens the log modal for its target when clicked', () => {
    render(<AddToLogButton target={target} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));
    expect(screen.getByTestId('log-modal')).toHaveAttribute('data-name', 'Oatmeal');
  });

  it('closes the log modal when the modal asks to close', () => {
    render(<AddToLogButton target={target} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add to Log' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(screen.queryByTestId('log-modal')).not.toBeInTheDocument();
  });
});
