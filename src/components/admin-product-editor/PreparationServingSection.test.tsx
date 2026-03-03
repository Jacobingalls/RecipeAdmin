import { render, screen, fireEvent } from '@testing-library/react';

import type { ApiProduct } from '../../api';

import PreparationServingSection from './PreparationServingSection';

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
      servingSizeDescription: '1 tbsp (14g)',
      mass: { amount: 14, unit: 'g' },
      volume: { amount: 1, unit: 'tbsp' },
    },
  ],
  notes: [],
};

function renderSection(product = sampleProduct) {
  return render(
    <PreparationServingSection product={product} preparationId="prep-1" onChange={onChange} />,
  );
}

describe('PreparationServingSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders serving description field', () => {
    renderSection();
    const input = screen.getByLabelText('Serving size description');
    expect(input).toHaveValue('1 tbsp (14g)');
  });

  it('renders mass fields', () => {
    renderSection();
    expect(screen.getByLabelText('Mass amount')).toHaveValue(14);
    expect(screen.getByLabelText('Mass unit')).toHaveTextContent('Grams (g)');
  });

  it('renders volume fields', () => {
    renderSection();
    expect(screen.getByLabelText('Volume amount')).toHaveValue(1);
    // 'tbsp' is not a known unitConfig value, so it falls back to raw unit string
    expect(screen.getByLabelText('Volume unit')).toHaveTextContent('tbsp');
  });

  it('calls onChange when serving description is edited', () => {
    renderSection();
    fireEvent.change(screen.getByLabelText('Serving size description'), {
      target: { value: '2 tbsp (28g)' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preparations: [
          expect.objectContaining({
            servingSizeDescription: '2 tbsp (28g)',
          }),
        ],
      }),
    );
  });

  it('calls onChange when mass amount is edited', () => {
    renderSection();
    fireEvent.change(screen.getByLabelText('Mass amount'), { target: { value: '28' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preparations: [expect.objectContaining({ mass: { amount: 28, unit: 'g' } })],
      }),
    );
  });

  it('sets mass amount to 0 when amount input is cleared', () => {
    renderSection();
    fireEvent.change(screen.getByLabelText('Mass amount'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preparations: [expect.objectContaining({ mass: { amount: 0, unit: 'g' } })],
      }),
    );
  });

  it('calls onChange with null mass when "None" is selected', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Mass unit'));
    fireEvent.click(screen.getByRole('option', { name: 'None' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preparations: [expect.objectContaining({ mass: null })],
      }),
    );
  });

  it('calls onChange with null volume when "None" is selected', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Volume unit'));
    fireEvent.click(screen.getByRole('option', { name: 'None' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preparations: [expect.objectContaining({ volume: null })],
      }),
    );
  });

  it('shows "None" when mass is not set', () => {
    const noMassProduct: ApiProduct = {
      ...sampleProduct,
      preparations: [{ ...sampleProduct.preparations[0], mass: undefined }],
    };
    renderSection(noMassProduct);
    expect(screen.getByLabelText('Mass unit')).toHaveTextContent('None');
    expect(screen.queryByLabelText('Mass amount')).not.toBeInTheDocument();
  });

  it('renders mass unit as a searchable dropdown button', () => {
    renderSection();
    const unitButton = screen.getByLabelText('Mass unit');
    expect(unitButton.tagName).toBe('BUTTON');
    expect(unitButton).toHaveTextContent('Grams (g)');
    // Open dropdown and verify mass options
    fireEvent.click(unitButton);
    expect(screen.getByText('Ounces (oz)')).toBeInTheDocument();
  });

  it('renders volume unit as a searchable dropdown button', () => {
    renderSection();
    const unitButton = screen.getByLabelText('Volume unit');
    expect(unitButton.tagName).toBe('BUTTON');
    // 'tbsp' is not a known unitConfig value, so it falls back to raw unit string
    expect(unitButton).toHaveTextContent('tbsp');
  });

  it('calls onChange when mass unit is changed', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Mass unit'));
    fireEvent.click(screen.getByText('Ounces (oz)'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preparations: [expect.objectContaining({ mass: { amount: 14, unit: 'oz' } })],
      }),
    );
  });

  it('returns null when prep not found', () => {
    const { container } = render(
      <PreparationServingSection
        product={sampleProduct}
        preparationId="nonexistent"
        onChange={onChange}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
