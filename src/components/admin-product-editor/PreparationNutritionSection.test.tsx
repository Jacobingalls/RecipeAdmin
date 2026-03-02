import { render, screen, fireEvent, within } from '@testing-library/react';

import type { ApiProduct } from '../../api';

import PreparationNutritionSection from './PreparationNutritionSection';

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
      nutritionalInformation: {
        calories: { amount: 100, unit: 'kcal' },
        totalFat: { amount: 11, unit: 'g' },
      },
    },
  ],
  notes: [],
};

function renderSection(product = sampleProduct) {
  return render(
    <PreparationNutritionSection product={product} preparationId="prep-1" onChange={onChange} />,
  );
}

describe('PreparationNutritionSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders populated nutrients', () => {
    renderSection();
    expect(screen.getByLabelText('Calories amount')).toHaveValue(100);
    expect(screen.getByLabelText('Calories unit')).toHaveTextContent('Calories (kcal)');
    expect(screen.getByLabelText('Total fat amount')).toHaveValue(11);
  });

  it('renders energy units for calorie nutrients', () => {
    renderSection();
    const unitButton = screen.getByLabelText('Calories unit');
    expect(unitButton.tagName).toBe('BUTTON');
    expect(unitButton).toHaveTextContent('Calories (kcal)');
    // Open dropdown and verify energy-only options
    fireEvent.click(unitButton);
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Kilojoules (kJ)')).toBeInTheDocument();
    expect(within(listbox).queryByText('Grams (g)')).not.toBeInTheDocument();
  });

  it('renders mass units for fat nutrients', () => {
    renderSection();
    const unitButton = screen.getByLabelText('Total fat unit');
    expect(unitButton.tagName).toBe('BUTTON');
    expect(unitButton).toHaveTextContent('Grams (g)');
    // Open dropdown and verify mass-only options
    fireEvent.click(unitButton);
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Milligrams (mg)')).toBeInTheDocument();
    expect(within(listbox).getByText('Micrograms (μg)')).toBeInTheDocument();
    expect(within(listbox).queryByText('Calories (kcal)')).not.toBeInTheDocument();
  });

  it('renders fallback for unknown nutrition unit', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [
        {
          id: 'prep-1',
          name: 'Default',
          nutritionalInformation: {
            calories: { amount: 100, unit: 'weird-unit' },
          },
        },
      ],
    };
    renderSection(product);
    const unitButton = screen.getByLabelText('Calories unit');
    // Unknown unit falls back to raw string
    expect(unitButton).toHaveTextContent('weird-unit');
  });

  it('calls onChange when nutrient unit is changed', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Calories unit'));
    fireEvent.click(screen.getByText('Kilojoules (kJ)'));
    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    const nutrition = passedProduct.preparations[0].nutritionalInformation;
    expect(nutrition?.calories).toEqual({ amount: 100, unit: 'kJ' });
  });

  it('renders Add dropdown for missing nutrients', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders delete button for optional nutrients but not calories', () => {
    renderSection();
    expect(screen.queryByLabelText('Remove Calories')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Remove Total fat')).toBeInTheDocument();
  });

  it('calls onChange when nutrient amount is edited', () => {
    renderSection();
    fireEvent.change(screen.getByLabelText('Calories amount'), { target: { value: '200' } });
    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    const nutrition = passedProduct.preparations[0].nutritionalInformation;
    expect(nutrition?.calories).toEqual({ amount: 200, unit: 'kcal' });
  });

  it('calls onChange when a nutrient is removed', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Remove Total fat'));
    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    const nutrition = passedProduct.preparations[0].nutritionalInformation;
    expect(nutrition?.totalFat).toBeUndefined();
    expect(nutrition?.calories).toEqual({ amount: 100, unit: 'kcal' });
  });

  it('shows empty state when no nutrition data', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [{ id: 'prep-1', name: 'Default', nutritionalInformation: {} }],
    };
    renderSection(product);
    expect(screen.getByText('No nutrition data')).toBeInTheDocument();
  });

  it('returns null when prep not found', () => {
    const { container } = render(
      <PreparationNutritionSection
        product={sampleProduct}
        preparationId="nonexistent"
        onChange={onChange}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
