import { render, screen, fireEvent } from '@testing-library/react';

import type { ApiProduct } from '../../api';

import AddPreparationModal from './AddPreparationModal';

const onChange = vi.fn();
const onClose = vi.fn();

const sampleProduct: ApiProduct = {
  id: 'p1',
  name: 'Butter',
  brand: '',
  barcodes: [],
  preparations: [{ id: 'prep-1', name: 'Default' }],
  notes: [],
};

function renderModal(product = sampleProduct) {
  return render(<AddPreparationModal product={product} onChange={onChange} onClose={onClose} />);
}

describe('AddPreparationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'New preparation' })).toBeInTheDocument();
  });

  it('renders name input', () => {
    renderModal();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('disables Create button when name is empty', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('enables Create button when name is provided', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Cooked' } });
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  it('calls onChange with updated product and onClose', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Cooked' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    expect(passedProduct.preparations).toHaveLength(2);
    expect(passedProduct.preparations[1].name).toBe('Cooked');
    expect(passedProduct.preparations[1].id).toBeDefined();
    expect(passedProduct.preparations[1].nutritionalInformation?.calories).toEqual({
      amount: 0,
      unit: 'kcal',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
