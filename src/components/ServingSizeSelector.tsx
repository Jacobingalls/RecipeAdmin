import type { KeyboardEvent } from 'react';
import { useState, useRef, useEffect } from 'react';

import type {
  CustomSizeValue,
  NutritionUnit,
  Preparation,
  ProductGroup,
  ServingSizeType,
} from '../domain';
import { ServingSize } from '../domain';
import type { SelectOption } from '../config/unitConfig';
import { buildOptionGroups, filterGroups } from '../config/unitConfig';

interface ServingSizeSelectorProps {
  prep: Preparation | ProductGroup;
  value: ServingSize;
  onChange: (servingSize: ServingSize) => void;
}

export default function ServingSizeSelector({ prep, value, onChange }: ServingSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Build option groups based on prep capabilities
  const allGroups = buildOptionGroups(prep);
  const filteredGroups = filterGroups(allGroups, searchQuery);

  const getCurrentLabel = (): string => {
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
    const amount = Math.max(0.01, newAmount);
    onChange(createServingSize(value.type, getUnitValue(), amount));
  };

  const handleUnitSelect = (option: SelectOption): void => {
    const currentAmount = value.amount || 1;
    onChange(createServingSize(option.type, option.value, currentAmount));
    setIsOpen(false);
    setSearchQuery('');
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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="row g-2 align-items-end">
      <div className="col-auto">
        <label htmlFor="serving-amount" className="form-label small mb-1">
          Amount
        </label>
        <input
          id="serving-amount"
          type="number"
          className="form-control"
          style={{ width: 100 }}
          min="0.01"
          step="0.25"
          value={value.amount}
          onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 1)}
        />
      </div>
      <div className="col-auto" ref={dropdownRef}>
        <label htmlFor="serving-unit" className="form-label small mb-1">
          Unit
        </label>
        <div className="dropdown">
          <button
            id="serving-unit"
            className="form-select text-start"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{ minWidth: 180 }}
          >
            {getCurrentLabel()}
          </button>
          {isOpen && (
            <div
              className="dropdown-menu show"
              role="listbox"
              tabIndex={-1}
              style={{ minWidth: 220, maxHeight: 300, overflowY: 'auto' }}
              onKeyDown={handleKeyDown}
            >
              <div className="px-2 pb-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search units..."
                  aria-label="Search units"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {filteredGroups.length === 0 ? (
                <div className="dropdown-item-text text-muted small">No matching units</div>
              ) : (
                filteredGroups.map((group, groupIndex) => (
                  <div key={group.label}>
                    {groupIndex > 0 && <div className="dropdown-divider" />}
                    <h6 className="dropdown-header">{group.label}</h6>
                    {group.options.map((option) => (
                      <button
                        key={`${option.type}-${option.value}`}
                        className="dropdown-item"
                        role="option"
                        aria-selected={
                          option.type === value.type &&
                          (option.type === 'servings' ||
                            (option.type === 'customSize'
                              ? option.value === (value.value as CustomSizeValue).name
                              : option.value === (value.value as NutritionUnit).unit))
                        }
                        onClick={() => handleUnitSelect(option)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
