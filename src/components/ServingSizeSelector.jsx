import { useState, useRef, useEffect } from 'react';

import { ServingSize } from '../domain';
import { buildOptionGroups, filterGroups } from '../config/unitConfig';

/**
 * A serving size selector with amount stepper and searchable grouped unit dropdown.
 *
 * @param {Object} props
 * @param {Preparation} props.prep - The preparation object
 * @param {ServingSize} props.value - Current serving size value
 * @param {Function} props.onChange - Callback when serving size changes
 */
export default function ServingSizeSelector({ prep, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Build option groups based on prep capabilities
  const allGroups = buildOptionGroups(prep);
  const filteredGroups = filterGroups(allGroups, searchQuery);

  // Get current unit display label
  const getCurrentLabel = () => {
    if (value.type === 'servings') {
      return 'servings';
    }
    if (value.type === 'customSize') {
      return value.value.name;
    }
    // For mass, volume, energy - find the matching unit label
    for (const group of allGroups) {
      const option = group.options.find(
        (o) => o.type === value.type && o.value === value.value.unit,
      );
      if (option) return option.label;
    }
    return value.value?.unit || 'unknown';
  };

  // Handle amount change
  const handleAmountChange = (newAmount) => {
    const amount = Math.max(0.01, newAmount);
    onChange(createServingSize(value.type, getUnitValue(), amount));
  };

  // Get the unit value (for mass/volume/energy) or name (for customSize)
  const getUnitValue = () => {
    if (value.type === 'servings') return 'servings';
    if (value.type === 'customSize') return value.value.name;
    return value.value.unit;
  };

  // Create a new ServingSize based on type and unit
  const createServingSize = (type, unitValue, amount) => {
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

  // Handle unit selection
  const handleUnitSelect = (option) => {
    const currentAmount = value.amount || 1;
    onChange(createServingSize(option.type, option.value, currentAmount));
    setIsOpen(false);
    setSearchQuery('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
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
            className="btn btn-outline-secondary dropdown-toggle"
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
