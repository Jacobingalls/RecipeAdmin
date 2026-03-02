import { render, screen, fireEvent } from '@testing-library/react';

import type { ApiProduct } from '../../api';
import type * as CommonModule from '../common';

import BarcodesSection from './BarcodesSection';

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

vi.mock('../common', async (importOriginal) => {
  const actual = await importOriginal<typeof CommonModule>();
  return {
    ...actual,
    NoteContent: ({ note }: { note: unknown }) => (
      <span data-testid="note-content">{JSON.stringify(note)}</span>
    ),
  };
});

const onChange = vi.fn();

const sampleProduct: ApiProduct = {
  id: 'p1',
  name: 'Butter',
  brand: '',
  barcodes: [{ code: '012345678905' }, { code: '987654321098', servingSize: { servings: 2 } }],
  preparations: [],
  notes: [],
};

const productWithPreps: ApiProduct = {
  ...sampleProduct,
  preparations: [
    { id: 'prep-dry', name: 'Dry' },
    { id: 'prep-cooked', name: 'Cooked' },
  ],
  defaultPreparationID: 'prep-dry',
};

function renderSection(product = sampleProduct) {
  return render(<BarcodesSection product={product} onChange={onChange} />);
}

describe('BarcodesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Static display ---

  it('renders barcode codes as static text', () => {
    renderSection();
    expect(screen.getByText('012345678905')).toBeInTheDocument();
    expect(screen.getByText('987654321098')).toBeInTheDocument();
  });

  it('renders serving size labels', () => {
    renderSection();
    expect(screen.getByText('1 serving')).toBeInTheDocument();
    expect(screen.getByText('2 servings')).toBeInTheDocument();
  });

  it('renders mass serving size label', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      barcodes: [{ code: '111', servingSize: { mass: { amount: 50, unit: 'g' } } }],
    };
    renderSection(product);
    expect(screen.getByText('50 g')).toBeInTheDocument();
  });

  it('shows prep name only when explicitly set on the barcode', () => {
    const product: ApiProduct = {
      ...productWithPreps,
      barcodes: [{ code: '111', preparationID: 'prep-cooked' }, { code: '222' }],
    };
    renderSection(product);
    // Explicit prep shows with trailing comma
    expect(screen.getByText('Cooked,')).toBeInTheDocument();
    // Default-resolved prep is not shown
    expect(screen.queryByText('Dry,')).not.toBeInTheDocument();
    expect(screen.queryByText('Dry')).not.toBeInTheDocument();
  });

  it('does not show prep name when product has no preparations', () => {
    renderSection();
    expect(screen.queryByText('Dry')).not.toBeInTheDocument();
  });

  it('renders edit and delete buttons for each barcode', () => {
    renderSection();
    expect(screen.getByLabelText('Edit barcode 012345678905')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove barcode 012345678905')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit barcode 987654321098')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove barcode 987654321098')).toBeInTheDocument();
  });

  it('shows empty state when no barcodes', () => {
    renderSection({ ...sampleProduct, barcodes: [] });
    expect(screen.getByText('No barcodes')).toBeInTheDocument();
  });

  // --- Remove ---

  it('calls onChange when a barcode is removed', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Remove barcode 012345678905'));

    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    expect(passedProduct.barcodes).toHaveLength(1);
    expect(passedProduct.barcodes[0].code).toBe('987654321098');
  });

  // --- Add modal ---

  it('opens add modal and adds a barcode', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add barcode')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Barcode'), { target: { value: '111222333444' } });
    fireEvent.click(screen.getByRole('dialog').querySelector('button.btn-primary')!);

    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    expect(passedProduct.barcodes).toHaveLength(3);
    expect(passedProduct.barcodes[2].code).toBe('111222333444');
  });

  it('add modal includes serving size and prep controls', () => {
    renderSection(productWithPreps);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByLabelText('Barcode serving amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Barcode serving unit')).toBeInTheDocument();
    expect(screen.getByLabelText('Preparation')).toBeInTheDocument();
  });

  it('add modal omits prep dropdown when product has no preparations', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.queryByLabelText('Preparation')).not.toBeInTheDocument();
  });

  it('adds barcode with prep and serving size from modal', () => {
    renderSection(productWithPreps);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    fireEvent.change(screen.getByLabelText('Barcode'), { target: { value: '555' } });
    fireEvent.change(screen.getByLabelText('Preparation'), {
      target: { value: 'prep-cooked' },
    });
    fireEvent.change(screen.getByLabelText('Barcode serving amount'), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByRole('dialog').querySelector('button.btn-primary')!);

    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    const added = passedProduct.barcodes[passedProduct.barcodes.length - 1];
    expect(added.code).toBe('555');
    expect(added.preparationID).toBe('prep-cooked');
    expect(added.servingSize).toEqual({ servings: 50 });
  });

  it('omits default serving size and prep from added barcode', () => {
    renderSection(productWithPreps);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    fireEvent.change(screen.getByLabelText('Barcode'), { target: { value: '666' } });
    fireEvent.click(screen.getByRole('dialog').querySelector('button.btn-primary')!);

    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    const added = passedProduct.barcodes[passedProduct.barcodes.length - 1];
    expect(added.code).toBe('666');
    expect(added.preparationID).toBeUndefined();
    expect(added.servingSize).toBeUndefined();
  });

  // --- Edit modal ---

  it('opens edit modal pre-populated with barcode data', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Edit barcode 987654321098'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit barcode')).toBeInTheDocument();
    expect(screen.getByLabelText('Barcode')).toHaveValue('987654321098');
    expect(screen.getByLabelText('Barcode serving amount')).toHaveValue(2);
  });

  it('saves edited barcode via onChange', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Edit barcode 987654321098'));
    fireEvent.change(screen.getByLabelText('Barcode'), { target: { value: 'EDITED' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    expect(passedProduct.barcodes[0].code).toBe('012345678905');
    expect(passedProduct.barcodes[1].code).toBe('EDITED');
    expect(passedProduct.barcodes[1].servingSize).toEqual({ servings: 2 });
  });

  it('edit modal shows prep dropdown when product has preparations', () => {
    const product: ApiProduct = {
      ...productWithPreps,
      barcodes: [{ code: '012345678905', preparationID: 'prep-cooked' }],
    };
    renderSection(product);
    fireEvent.click(screen.getByLabelText('Edit barcode 012345678905'));
    const select = screen.getByLabelText('Preparation') as HTMLSelectElement;
    expect(select.value).toBe('prep-cooked');
  });
});
