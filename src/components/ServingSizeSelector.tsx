import type { KeyboardEvent } from 'react';
import { useState, useRef, useEffect, useId } from 'react';

import type {
  CustomSizeValue,
  NutritionUnit,
  Preparation,
  ProductGroup,
  ServingSizeType,
} from '../domain';
import { ServingSize } from '../domain';
import type { SelectOption, OptionGroup } from '../config/unitConfig';
import { buildOptionGroups, filterGroups } from '../config/unitConfig';

function optionElId(prefix: string, option: SelectOption): string {
  return `${prefix}-option-${option.type}-${option.value.replace(/\s+/g, '-')}`;
}

interface ServingSizeSelectorProps {
  prep?: Preparation | ProductGroup;
  value: ServingSize | null;
  onChange: (servingSize: ServingSize) => void;
  onClear?: () => void;
  size?: 'sm';
  groups?: OptionGroup[];
  amountAriaLabel?: string;
  unitAriaLabel?: string;
}

export default function ServingSizeSelector({
  prep,
  value,
  onChange,
  onClear,
  size,
  groups: groupsOverride,
  amountAriaLabel,
  unitAriaLabel,
}: ServingSizeSelectorProps) {
  const instanceId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const compact = size === 'sm';
  const amountInputId = `${instanceId}-amount`;
  const unitButtonId = `${instanceId}-unit`;
  const noneOptionId = `${instanceId}-option-none`;

  // Build option groups from either groups override or prep
  const allGroups = groupsOverride ?? (prep ? buildOptionGroups(prep) : []);
  const filteredGroups = filterGroups(allGroups, searchQuery);

  // Flat list of all visible options for keyboard navigation
  const flatOptions = filteredGroups.flatMap((group) => group.options);

  const getCurrentLabel = (): string => {
    if (!value) return 'None';
    if (value.type === 'servings') {
      return 'Servings';
    }
    if (value.type === 'customSize') {
      return (value.value as CustomSizeValue).name;
    }
    // For mass, volume, energy - find the matching unit label
    const unitValue = (value.value as NutritionUnit).unit;
    for (const group of allGroups) {
      const option = group.options.find((o) => o.type === value.type && o.value === unitValue);
      if (option) return option.label;
    }
    return unitValue || 'unknown';
  };

  const getUnitValue = (): string => {
    if (!value) return '';
    if (value.type === 'servings') return 'Servings';
    if (value.type === 'customSize') return (value.value as CustomSizeValue).name;
    return (value.value as NutritionUnit).unit;
  };

  const createServingSize = (
    type: ServingSizeType,
    unitValue: string,
    amount: number,
  ): ServingSize => {
    switch (type) {
      case 'servings':
        return ServingSize.servings(amount);
      case 'customSize':
        return ServingSize.customSize(unitValue, amount);
      case 'mass':
        return ServingSize.mass(amount, unitValue);
      case 'volume':
        return ServingSize.volume(amount, unitValue);
      case 'energy':
        return ServingSize.energy(amount, unitValue);
      default:
        return ServingSize.servings(amount);
    }
  };

  const handleAmountChange = (newAmount: number): void => {
    if (!value) return;
    const amount = compact ? newAmount : Math.max(0.01, newAmount);
    onChange(createServingSize(value.type, getUnitValue(), amount));
  };

  const isOptionSelected = (option: SelectOption): boolean => {
    if (!value) return false;
    return (
      option.type === value.type &&
      (option.type === 'servings' ||
        (option.type === 'customSize'
          ? option.value === (value.value as CustomSizeValue).name
          : option.value === (value.value as NutritionUnit).unit))
    );
  };

  const handleUnitSelect = (option: SelectOption): void => {
    const currentAmount = value ? value.amount || (compact ? 0 : 1) : 1;
    onChange(createServingSize(option.type, option.value, currentAmount));
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleNoneSelect = (): void => {
    if (onClear) {
      onClear();
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex === -1 && onClear) {
      document.getElementById(noneOptionId)?.scrollIntoView({ block: 'nearest' });
    } else if (highlightedIndex >= 0 && highlightedIndex < flatOptions.length) {
      const el = document.getElementById(optionElId(instanceId, flatOptions[highlightedIndex]));
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, flatOptions, instanceId, onClear, noneOptionId]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      return;
    }

    if (flatOptions.length === 0 && !onClear) return;

    // When onClear is set, index -1 represents the "None" option.
    // Navigation wraps circularly: None <-> 0 <-> ... <-> N <-> None
    const min = onClear ? -1 : 0;
    const max = flatOptions.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (flatOptions.length === 0) return min;
          return prev >= max ? min : prev + 1;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (flatOptions.length === 0) return min;
          return prev <= min ? max : prev - 1;
        });
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(min);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(max >= 0 ? max : min);
        break;
      case 'Enter':
      case ' ':
        if (highlightedIndex === -1 && onClear) {
          e.preventDefault();
          handleNoneSelect();
        } else if (highlightedIndex >= 0 && highlightedIndex < flatOptions.length) {
          // Allow space to type in search input
          if (e.key === ' ' && e.target === searchInputRef.current) return;
          e.preventDefault();
          handleUnitSelect(flatOptions[highlightedIndex]);
        }
        break;
      default:
        break;
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      if (!value && onClear) {
        setHighlightedIndex(-1);
      } else {
        const selectedIdx = flatOptions.findIndex(isOptionSelected);
        const fallback = onClear ? -1 : 0;
        setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : fallback);
      }
    }
    setIsOpen(!isOpen);
  };

  const noneItem = onClear && (
    <button
      id={noneOptionId}
      className={`dropdown-item${highlightedIndex === -1 ? ' active' : ''}`}
      role="option"
      aria-selected={!value}
      onClick={handleNoneSelect}
      onMouseEnter={() => setHighlightedIndex(-1)}
    >
      None
    </button>
  );

  const getActiveDescendant = (): string | undefined => {
    if (highlightedIndex === -1 && onClear) return noneOptionId;
    if (highlightedIndex >= 0 && highlightedIndex < flatOptions.length) {
      return optionElId(instanceId, flatOptions[highlightedIndex]);
    }
    return undefined;
  };

  const dropdownMenu = isOpen && (
    <div
      className="dropdown-menu show"
      role="listbox"
      tabIndex={-1}
      style={{ minWidth: 220, maxHeight: 300, overflowY: 'auto' }}
      onKeyDown={handleKeyDown}
      aria-activedescendant={getActiveDescendant()}
    >
      <div className="px-2 pb-2">
        <input
          ref={searchInputRef}
          type="text"
          className="form-control form-control-sm"
          placeholder="Search units..."
          aria-label="Search units"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            const newGroups = filterGroups(allGroups, e.target.value);
            const newFlat = newGroups.flatMap((g) => g.options);
            setHighlightedIndex(newFlat.length > 0 ? 0 : -1);
          }}
        />
      </div>
      {noneItem}
      {onClear && filteredGroups.length > 0 && <div className="dropdown-divider" />}
      {filteredGroups.length === 0 ? (
        <div className="dropdown-item-text text-muted small">No matching units</div>
      ) : (
        filteredGroups.map((group, groupIndex) => (
          <div key={group.label}>
            {groupIndex > 0 && <div className="dropdown-divider" />}
            <h6 className="dropdown-header">{group.label}</h6>
            {group.options.map((option) => {
              const flatIdx = flatOptions.indexOf(option);
              const isHighlighted = flatIdx === highlightedIndex;
              return (
                <button
                  key={`${option.type}-${option.value}`}
                  id={optionElId(instanceId, option)}
                  className={`dropdown-item${isHighlighted ? ' active' : ''}`}
                  role="option"
                  aria-selected={isOptionSelected(option)}
                  onClick={() => handleUnitSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(flatIdx)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ))
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="d-flex align-items-center gap-2 flex-shrink-1" style={{ minWidth: 0 }}>
        {value && (
          <input
            type="number"
            className="form-control form-control-sm flex-shrink-0"
            style={{ width: '5rem' }}
            step="any"
            value={value.amount}
            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
            aria-label={amountAriaLabel ?? 'Amount'}
          />
        )}
        <div ref={dropdownRef} className="dropdown flex-shrink-1" style={{ minWidth: '5rem' }}>
          <button
            className="form-select form-select-sm text-start text-truncate w-100"
            type="button"
            onClick={toggleDropdown}
            style={{ minWidth: '5rem' }}
            aria-label={unitAriaLabel ?? 'Unit'}
          >
            {getCurrentLabel()}
          </button>
          {dropdownMenu}
        </div>
      </div>
    );
  }

  return (
    <div className="row g-2 align-items-end">
      {value && (
        <div className="col-auto">
          <label htmlFor={amountInputId} className="form-label small mb-1">
            Amount
          </label>
          <input
            id={amountInputId}
            type="number"
            className="form-control"
            style={{ width: '6.25rem' }}
            min="0.01"
            step="0.25"
            value={value.amount}
            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 1)}
          />
        </div>
      )}
      <div className="col-auto" ref={dropdownRef}>
        <label htmlFor={unitButtonId} className="form-label small mb-1">
          Unit
        </label>
        <div className="dropdown">
          <button
            id={unitButtonId}
            className="form-select text-start"
            type="button"
            onClick={toggleDropdown}
            style={{ minWidth: '11.25rem' }}
          >
            {getCurrentLabel()}
          </button>
          {dropdownMenu}
        </div>
      </div>
    </div>
  );
}
