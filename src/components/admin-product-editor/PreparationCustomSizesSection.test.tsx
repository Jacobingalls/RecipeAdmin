import { render, screen, fireEvent } from '@testing-library/react';

import type { ApiProduct } from '../../api';

import PreparationCustomSizesSection from './PreparationCustomSizesSection';

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const onChange = vi.fn();

const sampleProduct: ApiProduct = {
  id: 'p1',
  name: 'Butter',
  brand: '',
  barcodes: [],
  preparations: [
    {
      id: 'prep-1',
      name: 'Default',
      customSizes: [
        {
          id: 'cs-1',
          name: 'Stick',
          singularName: 'stick',
          pluralName: 'sticks',
          servingSize: { servings: 1 },
        },
      ],
    },
  ],
  notes: [],
};

function renderSection(product = sampleProduct) {
  return render(
    <PreparationCustomSizesSection product={product} preparationId="prep-1" onChange={onChange} />,
  );
}

describe('PreparationCustomSizesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing custom sizes', () => {
    renderSection();
    expect(screen.getByText('Stick')).toBeInTheDocument();
    expect(screen.getByText('(stick / sticks)')).toBeInTheDocument();
  });

  it('renders delete button for custom size', () => {
    renderSection();
    expect(screen.getByLabelText('Remove Stick')).toBeInTheDocument();
  });

  it('renders Add dropdown', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('shows empty state when no custom sizes', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [{ id: 'prep-1', name: 'Default', customSizes: [] }],
    };
    renderSection(product);
    expect(screen.getByText('No custom sizes')).toBeInTheDocument();
  });

  it('calls onChange when a custom size is removed', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Remove Stick'));
    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    expect(passedProduct.preparations[0].customSizes).toHaveLength(0);
  });

  it('returns null when prep not found', () => {
    const { container } = render(
      <PreparationCustomSizesSection
        product={sampleProduct}
        preparationId="nonexistent"
        onChange={onChange}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  // --- Inline serving size controls ---

  it('renders amount input and unit button for each custom size', () => {
    renderSection();
    expect(screen.getByLabelText('Stick amount')).toHaveValue(1);
    const unitButton = screen.getByLabelText('Stick unit');
    expect(unitButton.tagName).toBe('BUTTON');
    expect(unitButton).toHaveTextContent('Servings');
  });

  it('defaults to 1 serving when servingSize is undefined', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [
        {
          id: 'prep-1',
          name: 'Default',
          customSizes: [{ id: 'cs-1', name: 'Stick', singularName: 'stick', pluralName: 'sticks' }],
        },
      ],
    };
    renderSection(product);
    expect(screen.getByLabelText('Stick amount')).toHaveValue(1);
    expect(screen.getByLabelText('Stick unit')).toHaveTextContent('Servings');
  });

  it('calls onChange when amount is edited', () => {
    renderSection();
    fireEvent.change(screen.getByLabelText('Stick amount'), { target: { value: '2.5' } });
    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    const cs = passedProduct.preparations[0].customSizes![0];
    expect(cs.servingSize).toEqual({ servings: 2.5 });
  });

  it('calls onChange when unit is changed to mass', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Stick unit'));
    fireEvent.click(screen.getByText('Grams (g)'));
    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    const cs = passedProduct.preparations[0].customSizes![0];
    expect(cs.servingSize).toEqual({ mass: { amount: 1, unit: 'g' } });
  });

  it('renders mass serving size correctly', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [
        {
          id: 'prep-1',
          name: 'Default',
          customSizes: [
            {
              id: 'cs-1',
              name: 'Stick',
              singularName: 'stick',
              pluralName: 'sticks',
              servingSize: { mass: { amount: 113, unit: 'g' } },
            },
          ],
        },
      ],
    };
    renderSection(product);
    expect(screen.getByLabelText('Stick amount')).toHaveValue(113);
    expect(screen.getByLabelText('Stick unit')).toHaveTextContent('Grams (g)');
  });

  it('renders volume serving size correctly', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [
        {
          id: 'prep-1',
          name: 'Default',
          customSizes: [
            {
              id: 'cs-1',
              name: 'Can',
              singularName: 'can',
              pluralName: 'cans',
              servingSize: { volume: { amount: 12, unit: 'fl oz (US)' } },
            },
          ],
        },
      ],
    };
    renderSection(product);
    expect(screen.getByLabelText('Can amount')).toHaveValue(12);
    expect(screen.getByLabelText('Can unit')).toHaveTextContent('Fluid ounces (fl oz)');
  });

  it('calls onChange when unit is changed for mass type', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [
        {
          id: 'prep-1',
          name: 'Default',
          customSizes: [
            {
              id: 'cs-1',
              name: 'Stick',
              singularName: 'stick',
              pluralName: 'sticks',
              servingSize: { mass: { amount: 113, unit: 'g' } },
            },
          ],
        },
      ],
    };
    renderSection(product);
    fireEvent.click(screen.getByLabelText('Stick unit'));
    fireEvent.click(screen.getByText('Ounces (oz)'));
    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    const cs = passedProduct.preparations[0].customSizes![0];
    expect(cs.servingSize).toEqual({ mass: { amount: 113, unit: 'oz' } });
  });
});
