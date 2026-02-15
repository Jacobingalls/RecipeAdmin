import { useId } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface ListFilterProps {
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  nameLabel?: string;
  namePlaceholder?: string;
  nameColumnClass?: string;
  dropdownFilter: string;
  onDropdownFilterChange: (value: string) => void;
  dropdownLabel: string;
  dropdownOptions: string[] | DropdownOption[];
  dropdownColumnClass?: string;
}

function normalizeOptions(options: string[] | DropdownOption[]): DropdownOption[] {
  if (options.length === 0) return [];
  if (typeof options[0] === 'string') {
    return (options as string[]).map((o) => ({ value: o, label: o }));
  }
  return options as DropdownOption[];
}

export default function ListFilter({
  nameFilter,
  onNameFilterChange,
  nameLabel = 'Filter by name',
  namePlaceholder = 'Search by name...',
  nameColumnClass = 'col-md-6',
  dropdownFilter,
  onDropdownFilterChange,
  dropdownLabel,
  dropdownOptions,
  dropdownColumnClass = 'col-md-6',
}: ListFilterProps) {
  const id = useId();
  const nameId = `${id}-name`;
  const dropdownId = `${id}-dropdown`;
  const normalized = normalizeOptions(dropdownOptions);

  return (
    <div className="row g-3 mb-4">
      <div className={nameColumnClass}>
        <label htmlFor={nameId} className="visually-hidden">
          {nameLabel}
        </label>
        <input
          type="text"
          className="form-control"
          id={nameId}
          placeholder={namePlaceholder}
          value={nameFilter}
          onChange={(e) => onNameFilterChange(e.target.value)}
        />
      </div>
      <div className={dropdownColumnClass}>
        <label htmlFor={dropdownId} className="visually-hidden">
          {dropdownLabel}
        </label>
        <select
          className="form-select"
          id={dropdownId}
          value={dropdownFilter}
          onChange={(e) => onDropdownFilterChange(e.target.value)}
        >
          <option value="">{dropdownLabel}</option>
          {normalized.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
