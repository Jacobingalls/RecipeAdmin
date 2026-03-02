import { render, screen, fireEvent } from '@testing-library/react';

import type { ApiProduct } from '../../api';

import PreparationDangerZone from './PreparationDangerZone';

const onChange = vi.fn();
const onPrepDeleted = vi.fn();

const sampleProduct: ApiProduct = {
  id: 'p1',
  name: 'Butter',
  brand: '',
  barcodes: [],
  preparations: [
    { id: 'prep-1', name: 'Default' },
    { id: 'prep-2', name: 'Melted' },
  ],
  defaultPreparationID: 'prep-1',
  notes: [],
};

function renderSection(product = sampleProduct, prepId = 'prep-2') {
  return render(
    <PreparationDangerZone
      product={product}
      preparationId={prepId}
      onChange={onChange}
      onPrepDeleted={onPrepDeleted}
    />,
  );
}

describe('PreparationDangerZone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete button', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('disables delete when only one preparation', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [{ id: 'prep-1', name: 'Default' }],
    };
    renderSection(product, 'prep-1');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(
      screen.getByText("Can't delete the only preparation. Add another one first."),
    ).toBeInTheDocument();
  });

  it('opens confirmation modal', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Delete preparation' })).toBeInTheDocument();
  });

  it('calls onChange and onPrepDeleted after confirming delete', () => {
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'Melted' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Delete preparation' }));

    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    expect(passedProduct.preparations).toHaveLength(1);
    expect(passedProduct.preparations[0].id).toBe('prep-1');
    expect(onPrepDeleted).toHaveBeenCalled();
  });

  it('adjusts defaultPreparationID when deleting the default', () => {
    renderSection(sampleProduct, 'prep-1');

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'Default' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Delete preparation' }));

    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    expect(passedProduct.defaultPreparationID).toBe('prep-2');
  });

  it('returns null when prep not found', () => {
    const { container } = render(
      <PreparationDangerZone
        product={sampleProduct}
        preparationId="nonexistent"
        onChange={onChange}
        onPrepDeleted={onPrepDeleted}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
