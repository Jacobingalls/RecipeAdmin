import { render, screen, fireEvent, act } from '@testing-library/react';

import type { ApiProduct } from '../../api';
import * as api from '../../api';

import CreateProductModal from './CreateProductModal';

vi.mock('../../api', () => ({
  adminUpsertProducts: vi.fn(),
}));

const mockUpsert = vi.mocked(api.adminUpsertProducts);

const onClose = vi.fn();
const onProductCreated = vi.fn();

const sampleCreated: ApiProduct = {
  id: 'prod-1',
  name: 'Chocolate Chips',
  brand: 'Guittard',
  barcodes: [],
  preparations: [{ name: '', nutritionalInformation: { calories: { amount: 0, unit: 'kcal' } } }],
  notes: [],
};

function renderModal(isOpen = true) {
  return render(
    <CreateProductModal isOpen={isOpen} onClose={onClose} onProductCreated={onProductCreated} />,
  );
}

describe('CreateProductModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when isOpen is false', () => {
    const { container } = renderModal(false);
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with Add product title', () => {
    renderModal();
    expect(screen.getByText('Add product')).toBeInTheDocument();
  });

  it('renders Name and Brand inputs', () => {
    renderModal();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Brand')).toBeInTheDocument();
  });

  it('renders Add and Cancel buttons', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when header close button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls adminUpsertProducts with form values on submit', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Chocolate Chips' } });
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Guittard' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Chocolate Chips',
        brand: 'Guittard',
      }),
    );
  });

  it('trims whitespace from name and brand', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '  Chocolate Chips  ' },
    });
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: '  Guittard  ' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Chocolate Chips',
        brand: 'Guittard',
      }),
    );
  });

  it('calls onProductCreated with the returned ID on success', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Chocolate Chips' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(onProductCreated).toHaveBeenCalledWith('prod-1');
  });

  it('calls onClose after successful creation', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Chocolate Chips' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows error message when creation fails', async () => {
    mockUpsert.mockRejectedValue(new Error('Server error'));
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Chocolate Chips' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't create the product. Try again.");
  });

  it('stays on form view when creation fails', async () => {
    mockUpsert.mockRejectedValue(new Error('Server error'));
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Chocolate Chips' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('does not call onProductCreated when creation fails', async () => {
    mockUpsert.mockRejectedValue(new Error('Server error'));
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Chocolate Chips' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(onProductCreated).not.toHaveBeenCalled();
  });

  it('resets form when closed and reopened', () => {
    const { rerender } = render(
      <CreateProductModal isOpen onClose={onClose} onProductCreated={onProductCreated} />,
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Chocolate Chips' } });
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Guittard' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    rerender(<CreateProductModal isOpen onClose={onClose} onProductCreated={onProductCreated} />);

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Brand') as HTMLInputElement).value).toBe('');
  });

  it('has correct aria-labelledby on the modal', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-labelledby',
      'create-product-modal-title',
    );
  });

  it('sends a default preparation in the payload', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    const payload = mockUpsert.mock.calls[0][0] as ApiProduct;
    expect(payload.preparations).toEqual([
      { name: '', nutritionalInformation: { calories: { amount: 0, unit: 'kcal' } } },
    ]);
  });

  it('does not include an id in the payload', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    const payload = mockUpsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('id');
  });
});
