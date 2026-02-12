import { render, screen, fireEvent } from '@testing-library/react';

import type { ProductGroup } from '../domain';
import { Preparation, ServingSize } from '../domain';

import ServingSizeSelector from './ServingSizeSelector';

function makePrep(overrides = {}) {
  return new Preparation({
    name: 'Default',
    nutritionalInformation: {
      calories: { amount: 200, unit: 'kcal' },
    },
    mass: { amount: 100, unit: 'g' },
    volume: { amount: 240, unit: 'mL' },
    customSizes: [{ name: 'Cookie', servingSize: { kind: 'servings', amount: 0.5 } }],
    ...overrides,
  });
}

function renderSelector(
  overrides: {
    prep?: Preparation | ProductGroup;
    value?: ServingSize;
    onChange?: (s: ServingSize) => void;
  } = {},
) {
  const prep = overrides.prep ?? makePrep();
  const value = overrides.value ?? ServingSize.servings(1);
  const onChange = overrides.onChange ?? vi.fn();

  return {
    onChange,
    ...render(<ServingSizeSelector prep={prep} value={value} onChange={onChange} />),
  };
}

describe('ServingSizeSelector', () => {
  it('renders the amount input with current value', () => {
    renderSelector({ value: ServingSize.servings(2) });
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('2');
  });

  it('renders the unit button with servings label', () => {
    renderSelector();
    expect(screen.getByText('servings')).toBeInTheDocument();
  });

  it('renders correct label for customSize type', () => {
    const prep = makePrep();
    const value = ServingSize.customSize('Cookie', 2);
    renderSelector({ prep, value });
    expect(screen.getByText('Cookie')).toBeInTheDocument();
  });

  it('renders correct label for mass type', () => {
    const prep = makePrep();
    const value = ServingSize.mass(100, 'g');
    renderSelector({ prep, value });
    expect(screen.getByText('Grams (g)')).toBeInTheDocument();
  });

  it('renders correct label for volume type', () => {
    const prep = makePrep();
    const value = ServingSize.volume(240, 'mL');
    renderSelector({ prep, value });
    expect(screen.getByText('Milliliters (mL)')).toBeInTheDocument();
  });

  it('renders correct label for energy type', () => {
    const prep = makePrep();
    const value = ServingSize.energy(200, 'kcal');
    renderSelector({ prep, value });
    expect(screen.getByText('Calories (kcal)')).toBeInTheDocument();
  });

  it('falls back to unit string for unknown mass unit', () => {
    const prep = makePrep();
    const value = ServingSize.mass(100, 'stone');
    renderSelector({ prep, value });
    // Should fall back to the unit string since 'stone' isn't in massUnits
    expect(screen.getByText('stone')).toBeInTheDocument();
  });

  it('opens dropdown on button click', () => {
    renderSelector();
    fireEvent.click(screen.getByText('servings'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search units...')).toBeInTheDocument();
  });

  it('closes dropdown on second button click', () => {
    renderSelector();
    const button = screen.getByText('servings');
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows option groups when dropdown is open', () => {
    renderSelector();
    fireEvent.click(screen.getByText('servings'));
    // "Servings" appears as dropdown header and dropdown option (button says "servings")
    expect(screen.getAllByText('Servings').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Custom Sizes')).toBeInTheDocument();
    expect(screen.getByText('Mass')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
  });

  it('filters options by search query', () => {
    renderSelector();
    fireEvent.click(screen.getByText('servings'));
    const searchInput = screen.getByPlaceholderText('Search units...');
    fireEvent.change(searchInput, { target: { value: 'gram' } });
    expect(screen.getByText('Grams (g)')).toBeInTheDocument();
    expect(screen.getByText('Milligrams (mg)')).toBeInTheDocument();
    expect(screen.getByText('Kilograms (kg)')).toBeInTheDocument();
    expect(screen.queryByText('Ounces (oz)')).not.toBeInTheDocument();
    expect(screen.queryByText('Milliliters (mL)')).not.toBeInTheDocument();
  });

  it('shows no matching units message when search has no results', () => {
    renderSelector();
    fireEvent.click(screen.getByText('servings'));
    const searchInput = screen.getByPlaceholderText('Search units...');
    fireEvent.change(searchInput, { target: { value: 'zzzzzzz' } });
    expect(screen.getByText('No matching units')).toBeInTheDocument();
  });

  it('calls onChange with correct ServingSize when option selected', () => {
    const onChange = vi.fn();
    renderSelector({ onChange });
    fireEvent.click(screen.getByText('servings'));
    fireEvent.click(screen.getByText('Grams (g)'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.type).toBe('mass');
    expect(result.amount).toBe(1);
  });

  it('closes dropdown after selecting an option', () => {
    renderSelector();
    fireEvent.click(screen.getByText('servings'));
    fireEvent.click(screen.getByText('Grams (g)'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('calls onChange when amount is changed', () => {
    const onChange = vi.fn();
    renderSelector({ onChange });
    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.type).toBe('servings');
    expect(result.amount).toBe(3);
  });

  it('enforces minimum amount of 0.01', () => {
    const onChange = vi.fn();
    renderSelector({ onChange });
    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '-5' } });
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.amount).toBe(0.01);
  });

  it('defaults to 1 when amount input is empty', () => {
    const onChange = vi.fn();
    renderSelector({ onChange });
    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '' } });
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.amount).toBe(1);
  });

  it('closes dropdown on Escape key', () => {
    renderSelector();
    fireEvent.click(screen.getByText('servings'));
    const dropdown = screen.getByRole('listbox');
    fireEvent.keyDown(dropdown, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown on outside click', () => {
    renderSelector();
    fireEvent.click(screen.getByText('servings'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears search query when dropdown closes via Escape', () => {
    renderSelector();
    fireEvent.click(screen.getByText('servings'));
    const searchInput = screen.getByPlaceholderText('Search units...');
    fireEvent.change(searchInput, { target: { value: 'gram' } });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    // Reopen and verify search is cleared
    fireEvent.click(screen.getByText('servings'));
    expect(screen.getByPlaceholderText('Search units...')).toHaveValue('');
  });

  it('preserves current amount when changing unit', () => {
    const onChange = vi.fn();
    const value = ServingSize.servings(5);
    renderSelector({ onChange, value });
    fireEvent.click(screen.getByText('servings'));
    fireEvent.click(screen.getByText('Grams (g)'));
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.type).toBe('mass');
    expect(result.amount).toBe(5);
  });

  it('shows custom size options', () => {
    renderSelector();
    fireEvent.click(screen.getByText('servings'));
    expect(screen.getByText('Cookie')).toBeInTheDocument();
  });

  it('calls onChange with customSize when custom size selected', () => {
    const onChange = vi.fn();
    renderSelector({ onChange });
    fireEvent.click(screen.getByText('servings'));
    fireEvent.click(screen.getByText('Cookie'));
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.type).toBe('customSize');
  });

  it('does not show mass options when prep has no mass', () => {
    const prep = makePrep({ mass: null });
    renderSelector({ prep });
    fireEvent.click(screen.getByText('servings'));
    expect(screen.queryByText('Mass')).not.toBeInTheDocument();
    expect(screen.queryByText('Grams (g)')).not.toBeInTheDocument();
  });

  it('does not show volume options when prep has no volume', () => {
    const prep = makePrep({ volume: null });
    renderSelector({ prep });
    fireEvent.click(screen.getByText('servings'));
    expect(screen.queryByText('Volume')).not.toBeInTheDocument();
  });

  it('does not show energy options when prep has no calories', () => {
    const prep = makePrep({ nutritionalInformation: {} });
    renderSelector({ prep });
    fireEvent.click(screen.getByText('servings'));
    expect(screen.queryByText('Energy')).not.toBeInTheDocument();
  });

  it('handles amount change for mass serving size', () => {
    const onChange = vi.fn();
    const value = ServingSize.mass(100, 'g');
    renderSelector({ onChange, value });
    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '200' } });
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.type).toBe('mass');
    expect(result.amount).toBe(200);
  });
});
