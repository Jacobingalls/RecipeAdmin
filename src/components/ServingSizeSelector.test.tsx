import { render, screen, fireEvent } from '@testing-library/react';

import type { ProductGroup, ServingSizeType } from '../domain';
import { Preparation, ServingSize } from '../domain';
import type { OptionGroup } from '../config/unitConfig';

import ServingSizeSelector from './ServingSizeSelector';

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

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
    value?: ServingSize | null;
    onChange?: (s: ServingSize) => void;
    onClear?: () => void;
    size?: 'sm';
    groups?: OptionGroup[];
    amountAriaLabel?: string;
    unitAriaLabel?: string;
  } = {},
) {
  const prep = overrides.prep ?? makePrep();
  const value = overrides.value === undefined ? ServingSize.servings(1) : overrides.value;
  const onChange = overrides.onChange ?? vi.fn();

  return {
    onChange,
    ...render(
      <ServingSizeSelector
        prep={overrides.groups ? undefined : prep}
        value={value}
        onChange={onChange}
        onClear={overrides.onClear}
        size={overrides.size}
        groups={overrides.groups}
        amountAriaLabel={overrides.amountAriaLabel}
        unitAriaLabel={overrides.unitAriaLabel}
      />,
    ),
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
    expect(screen.getByText('Servings')).toBeInTheDocument();
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
    fireEvent.click(screen.getByText('Servings'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search units...')).toBeInTheDocument();
  });

  it('closes dropdown on second button click', () => {
    renderSelector();
    const button = screen.getByText('Servings');
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows option groups when dropdown is open', () => {
    renderSelector();
    fireEvent.click(screen.getAllByText('Servings')[0]);
    // "Servings" appears as button, dropdown header, and dropdown option
    expect(screen.getAllByText('Servings').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('Custom Sizes')).toBeInTheDocument();
    expect(screen.getByText('Mass')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
  });

  it('filters options by search query', () => {
    renderSelector();
    fireEvent.click(screen.getByText('Servings'));
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
    fireEvent.click(screen.getByText('Servings'));
    const searchInput = screen.getByPlaceholderText('Search units...');
    fireEvent.change(searchInput, { target: { value: 'zzzzzzz' } });
    expect(screen.getByText('No matching units')).toBeInTheDocument();
  });

  it('calls onChange with correct ServingSize when option selected', () => {
    const onChange = vi.fn();
    renderSelector({ onChange });
    fireEvent.click(screen.getByText('Servings'));
    fireEvent.click(screen.getByText('Grams (g)'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.type).toBe('mass');
    expect(result.amount).toBe(1);
  });

  it('closes dropdown after selecting an option', () => {
    renderSelector();
    fireEvent.click(screen.getByText('Servings'));
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
    fireEvent.click(screen.getByText('Servings'));
    const dropdown = screen.getByRole('listbox');
    fireEvent.keyDown(dropdown, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown on outside click', () => {
    renderSelector();
    fireEvent.click(screen.getByText('Servings'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears search query when dropdown closes via Escape', () => {
    renderSelector();
    fireEvent.click(screen.getByText('Servings'));
    const searchInput = screen.getByPlaceholderText('Search units...');
    fireEvent.change(searchInput, { target: { value: 'gram' } });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    // Reopen and verify search is cleared
    fireEvent.click(screen.getByText('Servings'));
    expect(screen.getByPlaceholderText('Search units...')).toHaveValue('');
  });

  it('preserves current amount when changing unit', () => {
    const onChange = vi.fn();
    const value = ServingSize.servings(5);
    renderSelector({ onChange, value });
    fireEvent.click(screen.getByText('Servings'));
    fireEvent.click(screen.getByText('Grams (g)'));
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.type).toBe('mass');
    expect(result.amount).toBe(5);
  });

  it('shows custom size options', () => {
    renderSelector();
    fireEvent.click(screen.getByText('Servings'));
    expect(screen.getByText('Cookie')).toBeInTheDocument();
  });

  it('calls onChange with customSize when custom size selected', () => {
    const onChange = vi.fn();
    renderSelector({ onChange });
    fireEvent.click(screen.getByText('Servings'));
    fireEvent.click(screen.getByText('Cookie'));
    const result = onChange.mock.calls[0][0] as ServingSize;
    expect(result.type).toBe('customSize');
  });

  it('does not show mass options when prep has no mass', () => {
    const prep = makePrep({ mass: null });
    renderSelector({ prep });
    fireEvent.click(screen.getByText('Servings'));
    expect(screen.queryByText('Mass')).not.toBeInTheDocument();
    expect(screen.queryByText('Grams (g)')).not.toBeInTheDocument();
  });

  it('does not show volume options when prep has no volume', () => {
    const prep = makePrep({ volume: null });
    renderSelector({ prep });
    fireEvent.click(screen.getByText('Servings'));
    expect(screen.queryByText('Volume')).not.toBeInTheDocument();
  });

  it('does not show energy options when prep has no calories', () => {
    const prep = makePrep({ nutritionalInformation: {} });
    renderSelector({ prep });
    fireEvent.click(screen.getByText('Servings'));
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

  // --- Compact mode (size="sm") ---

  describe('compact mode (size="sm")', () => {
    it('renders without labels', () => {
      renderSelector({ size: 'sm' });
      expect(screen.queryByText('Amount')).not.toBeInTheDocument();
      expect(screen.queryByText('Unit')).not.toBeInTheDocument();
    });

    it('uses sm classes on amount input and unit button', () => {
      renderSelector({ size: 'sm' });
      const input = screen.getByLabelText('Amount');
      expect(input).toHaveClass('form-control-sm');
      const button = screen.getByLabelText('Unit');
      expect(button).toHaveClass('form-select-sm');
    });

    it('uses custom aria-labels', () => {
      renderSelector({
        size: 'sm',
        amountAriaLabel: 'Mass amount',
        unitAriaLabel: 'Mass unit',
      });
      expect(screen.getByLabelText('Mass amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Mass unit')).toBeInTheDocument();
    });

    it('allows amount of 0 in compact mode', () => {
      const onChange = vi.fn();
      renderSelector({ size: 'sm', onChange });
      const input = screen.getByLabelText('Amount');
      fireEvent.change(input, { target: { value: '-5' } });
      const result = onChange.mock.calls[0][0] as ServingSize;
      expect(result.amount).toBe(-5);
    });

    it('defaults to 0 when amount input is empty in compact mode', () => {
      const onChange = vi.fn();
      renderSelector({ size: 'sm', onChange });
      const input = screen.getByLabelText('Amount');
      fireEvent.change(input, { target: { value: '' } });
      const result = onChange.mock.calls[0][0] as ServingSize;
      expect(result.amount).toBe(0);
    });

    it('opens searchable dropdown in compact mode', () => {
      renderSelector({ size: 'sm' });
      fireEvent.click(screen.getByLabelText('Unit'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search units...')).toBeInTheDocument();
    });
  });

  // --- groups prop ---

  describe('groups prop', () => {
    const massOnlyGroups: OptionGroup[] = [
      {
        label: 'Mass',
        options: [
          {
            type: 'mass' as ServingSizeType,
            value: 'g',
            label: 'Grams (g)',
            aliases: ['gram', 'grams', 'g'],
          },
          {
            type: 'mass' as ServingSizeType,
            value: 'mg',
            label: 'Milligrams (mg)',
            aliases: ['milligram', 'milligrams', 'mg'],
          },
        ],
      },
    ];

    it('uses provided groups instead of building from prep', () => {
      renderSelector({
        groups: massOnlyGroups,
        value: ServingSize.mass(100, 'g'),
      });
      fireEvent.click(screen.getByText('Grams (g)'));
      expect(screen.getByText('Mass')).toBeInTheDocument();
      expect(screen.getByText('Milligrams (mg)')).toBeInTheDocument();
      // Should not show servings, volume, etc. since groups override
      expect(screen.queryByText('Servings')).not.toBeInTheDocument();
      expect(screen.queryByText('Volume')).not.toBeInTheDocument();
    });

    it('does not require prep when groups is provided', () => {
      // No prep passed, only groups — should render without errors
      renderSelector({
        groups: massOnlyGroups,
        value: ServingSize.mass(50, 'g'),
      });
      expect(screen.getByText('Grams (g)')).toBeInTheDocument();
    });
  });

  // --- Nullable / onClear ---

  describe('nullable (onClear)', () => {
    const massGroups: OptionGroup[] = [
      {
        label: 'Mass',
        options: [
          {
            type: 'mass' as ServingSizeType,
            value: 'g',
            label: 'Grams (g)',
            aliases: ['gram', 'grams', 'g'],
          },
        ],
      },
    ];

    it('shows "None" label when value is null', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: null, onClear });
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('hides amount input when value is null', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: null, onClear });
      expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
    });

    it('hides amount input in compact mode when value is null', () => {
      const onClear = vi.fn();
      renderSelector({
        groups: massGroups,
        value: null,
        onClear,
        size: 'sm',
        unitAriaLabel: 'Mass unit',
      });
      expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Mass unit')).toHaveTextContent('None');
    });

    it('shows "None" option in dropdown when onClear is provided', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: ServingSize.mass(100, 'g'), onClear });
      fireEvent.click(screen.getByText('Grams (g)'));
      // "None" appears in the dropdown as an option
      expect(screen.getByRole('option', { name: 'None' })).toBeInTheDocument();
    });

    it('does not show "None" option when onClear is absent', () => {
      renderSelector({ groups: massGroups, value: ServingSize.mass(100, 'g') });
      fireEvent.click(screen.getByText('Grams (g)'));
      expect(screen.queryByRole('option', { name: 'None' })).not.toBeInTheDocument();
    });

    it('calls onClear when "None" option is clicked', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: ServingSize.mass(100, 'g'), onClear });
      fireEvent.click(screen.getByText('Grams (g)'));
      fireEvent.click(screen.getByRole('option', { name: 'None' }));
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('closes dropdown after selecting "None"', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: ServingSize.mass(100, 'g'), onClear });
      fireEvent.click(screen.getByText('Grams (g)'));
      fireEvent.click(screen.getByRole('option', { name: 'None' }));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('calls onChange with amount 1 when selecting a unit from null', () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: null, onChange, onClear });
      fireEvent.click(screen.getByText('None'));
      fireEvent.click(screen.getByText('Grams (g)'));
      expect(onChange).toHaveBeenCalledTimes(1);
      const result = onChange.mock.calls[0][0] as ServingSize;
      expect(result.type).toBe('mass');
      expect(result.amount).toBe(1);
    });

    it('marks "None" as aria-selected when value is null', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: null, onClear });
      fireEvent.click(screen.getByText('None'));
      const noneOption = screen.getByRole('option', { name: 'None' });
      expect(noneOption).toHaveAttribute('aria-selected', 'true');
    });

    it('does not mark "None" as aria-selected when value is set', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: ServingSize.mass(100, 'g'), onClear });
      fireEvent.click(screen.getByText('Grams (g)'));
      const noneOption = screen.getByRole('option', { name: 'None' });
      expect(noneOption).toHaveAttribute('aria-selected', 'false');
    });

    it('selects "None" via Enter key', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: null, onClear });
      fireEvent.click(screen.getByText('None'));
      const listbox = screen.getByRole('listbox');
      // Value is null, so "None" should be highlighted; press Enter
      fireEvent.keyDown(listbox, { key: 'Enter' });
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('navigates to "None" with ArrowUp from first option', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: ServingSize.mass(100, 'g'), onClear });
      fireEvent.click(screen.getByText('Grams (g)'));
      const listbox = screen.getByRole('listbox');
      // Open highlights the selected option (index 0). ArrowUp should go to None (index -1).
      fireEvent.keyDown(listbox, { key: 'ArrowUp' });
      fireEvent.keyDown(listbox, { key: 'Enter' });
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('"None" stays visible when search filters all options', () => {
      const onClear = vi.fn();
      renderSelector({ groups: massGroups, value: ServingSize.mass(100, 'g'), onClear });
      fireEvent.click(screen.getByText('Grams (g)'));
      const searchInput = screen.getByPlaceholderText('Search units...');
      fireEvent.change(searchInput, { target: { value: 'zzzzz' } });
      expect(screen.getByRole('option', { name: 'None' })).toBeInTheDocument();
      expect(screen.getByText('No matching units')).toBeInTheDocument();
    });
  });
});
