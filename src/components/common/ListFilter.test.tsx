import { render, screen, fireEvent } from '@testing-library/react';

import ListFilter from './ListFilter';

const defaultProps = {
  nameFilter: '',
  onNameFilterChange: vi.fn(),
  dropdownFilter: '',
  onDropdownFilterChange: vi.fn(),
  dropdownLabel: 'All categories',
  dropdownOptions: ['Fruit', 'Vegetable', 'Grain'],
};

describe('ListFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name input with default placeholder', () => {
    render(<ListFilter {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
  });

  it('renders dropdown with label as first option', () => {
    render(<ListFilter {...defaultProps} />);
    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    expect(options[0]).toHaveTextContent('All categories');
    expect(options[0]).toHaveValue('');
  });

  it('calls onNameFilterChange when typing in name input', () => {
    const onNameFilterChange = vi.fn();
    render(<ListFilter {...defaultProps} onNameFilterChange={onNameFilterChange} />);
    fireEvent.change(screen.getByPlaceholderText('Search by name...'), {
      target: { value: 'apple' },
    });
    expect(onNameFilterChange).toHaveBeenCalledWith('apple');
  });

  it('calls onDropdownFilterChange when selecting dropdown option', () => {
    const onDropdownFilterChange = vi.fn();
    render(<ListFilter {...defaultProps} onDropdownFilterChange={onDropdownFilterChange} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Fruit' },
    });
    expect(onDropdownFilterChange).toHaveBeenCalledWith('Fruit');
  });

  it('renders string[] dropdown options', () => {
    render(<ListFilter {...defaultProps} dropdownOptions={['Alpha', 'Beta']} />);
    const options = screen.getByRole('combobox').querySelectorAll('option');
    // First option is the label, then the two string options
    expect(options).toHaveLength(3);
    expect(options[1]).toHaveTextContent('Alpha');
    expect(options[1]).toHaveValue('Alpha');
    expect(options[2]).toHaveTextContent('Beta');
    expect(options[2]).toHaveValue('Beta');
  });

  it('renders DropdownOption[] dropdown options', () => {
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    render(<ListFilter {...defaultProps} dropdownOptions={options} />);
    const rendered = screen.getByRole('combobox').querySelectorAll('option');
    expect(rendered).toHaveLength(3);
    expect(rendered[1]).toHaveTextContent('Option A');
    expect(rendered[1]).toHaveValue('a');
    expect(rendered[2]).toHaveTextContent('Option B');
    expect(rendered[2]).toHaveValue('b');
  });

  it('uses custom nameLabel and namePlaceholder', () => {
    render(
      <ListFilter
        {...defaultProps}
        nameLabel="Search foods"
        namePlaceholder="Type a food name..."
      />,
    );
    expect(screen.getByPlaceholderText('Type a food name...')).toBeInTheDocument();
    expect(screen.getByLabelText('Search foods')).toBeInTheDocument();
  });

  it('renders empty dropdown options', () => {
    render(<ListFilter {...defaultProps} dropdownOptions={[]} />);
    const options = screen.getByRole('combobox').querySelectorAll('option');
    // Only the label option
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('All categories');
  });

  it('has accessible labels associated with inputs', () => {
    render(<ListFilter {...defaultProps} />);
    // The visually-hidden label for the name input
    const nameInput = screen.getByLabelText('Filter by name');
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.tagName).toBe('INPUT');

    // The visually-hidden label for the dropdown
    const dropdown = screen.getByLabelText('All categories');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown.tagName).toBe('SELECT');
  });

  it('displays current nameFilter value', () => {
    render(<ListFilter {...defaultProps} nameFilter="existing text" />);
    const input = screen.getByPlaceholderText('Search by name...') as HTMLInputElement;
    expect(input.value).toBe('existing text');
  });

  it('displays current dropdownFilter value', () => {
    render(<ListFilter {...defaultProps} dropdownFilter="Vegetable" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('Vegetable');
  });
});
