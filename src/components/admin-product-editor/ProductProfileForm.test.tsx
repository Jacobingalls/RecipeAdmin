import { render, screen, fireEvent } from '@testing-library/react';

import type { ApiProduct } from '../../api';

import ProductProfileForm from './ProductProfileForm';

const onChange = vi.fn();

const sampleProduct: ApiProduct = {
  id: 'p1',
  name: 'Peanut Butter',
  brand: 'NutCo',
  barcodes: [],
  preparations: [
    { id: 'prep-1', name: 'Default' },
    { id: 'prep-2', name: 'Melted' },
  ],
  defaultPreparationID: 'prep-1',
  notes: [],
};

function renderForm(product = sampleProduct) {
  return render(<ProductProfileForm product={product} onChange={onChange} />);
}

describe('ProductProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name field with current value', () => {
    renderForm();
    expect(screen.getByLabelText('Name')).toHaveValue('Peanut Butter');
  });

  it('renders brand field with current value', () => {
    renderForm();
    expect(screen.getByLabelText('Brand')).toHaveValue('NutCo');
  });

  it('renders default preparation select', () => {
    renderForm();
    expect(screen.getByLabelText('Default preparation')).toHaveValue('prep-1');
  });

  it('calls onChange when name is edited', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Almond Butter' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p1', name: 'Almond Butter', brand: 'NutCo' }),
    );
  });

  it('calls onChange when brand is edited', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'AlmondCo' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p1', name: 'Peanut Butter', brand: 'AlmondCo' }),
    );
  });

  it('calls onChange when default preparation changes', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Default preparation'), {
      target: { value: 'prep-2' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ defaultPreparationID: 'prep-2' }),
    );
  });

  it('hides preparation select when no preparations', () => {
    renderForm({ ...sampleProduct, preparations: [] });
    expect(screen.queryByLabelText('Default preparation')).not.toBeInTheDocument();
  });
});
