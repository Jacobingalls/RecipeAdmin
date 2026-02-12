import { Preparation, ProductGroup, ServingSize } from '../domain';
import type { PreparationData, ProductGroupData } from '../domain';

import { formatSignificant, formatServingSize, formatLastLogin } from './formatters';

describe('formatSignificant', () => {
  it('returns "0" for zero', () => {
    expect(formatSignificant(0)).toBe('0');
  });

  it('rounds large numbers (>= 100) to whole numbers', () => {
    expect(formatSignificant(230)).toBe('230');
    expect(formatSignificant(150.7)).toBe('151');
    expect(formatSignificant(100)).toBe('100');
  });

  it('uses locale separators for numbers >= 1000', () => {
    const result = formatSignificant(1234);
    // Locale-dependent, but should contain "1" and "234"
    expect(result).toMatch(/1.?234/);
  });

  it('shows up to 1 decimal for medium numbers (10-100)', () => {
    expect(formatSignificant(23.5)).toBe('23.5');
    expect(formatSignificant(23.0)).toBe('23');
    expect(formatSignificant(10)).toBe('10');
    expect(formatSignificant(99.95)).toBe('100');
  });

  it('shows up to 2 decimals for numbers 1-10', () => {
    expect(formatSignificant(2.35)).toBe('2.35');
    expect(formatSignificant(1.0)).toBe('1');
    expect(formatSignificant(9.999)).toBe('10');
  });

  it('uses 2 significant figures for fractional numbers (< 1)', () => {
    expect(formatSignificant(0.24)).toBe('0.24');
    expect(formatSignificant(0.024)).toBe('0.024');
    expect(formatSignificant(0.0035)).toBe('0.004');
  });

  it('handles negative numbers', () => {
    expect(formatSignificant(-230)).toBe('-230');
    expect(formatSignificant(-23.5)).toBe('-23.5');
    expect(formatSignificant(-2.35)).toBe('-2.35');
    expect(formatSignificant(-0.24)).toBe('-0.24');
  });
});

describe('formatServingSize', () => {
  const basePrep: PreparationData = {
    mass: { amount: 28, unit: 'g' },
    volume: { amount: 30, unit: 'mL' },
    nutritionalInformation: {
      calories: { amount: 200, unit: 'kcal' },
    },
    customSizes: [{ name: 'cookie', servingSize: { kind: 'servings', amount: 0.5 } }],
  };

  it('returns nulls for null servingSize', () => {
    const prep = new Preparation(basePrep);
    expect(formatServingSize(null, prep)).toEqual({ primary: null, resolved: null });
  });

  it('returns nulls for null prepOrGroup', () => {
    const ss = ServingSize.servings(1);
    expect(formatServingSize(ss, null)).toEqual({ primary: null, resolved: null });
  });

  it('returns nulls for undefined inputs', () => {
    expect(formatServingSize(undefined, undefined)).toEqual({ primary: null, resolved: null });
  });

  it('formats servings type', () => {
    const prep = new Preparation(basePrep);
    const ss = ServingSize.servings(2);
    const result = formatServingSize(ss, prep);

    expect(result.primary).toBe('2 servings');
    expect(result.resolved).toContain('56g'); // 28g * 2
    expect(result.resolved).toContain('60mL'); // 30mL * 2
  });

  it('formats singular serving', () => {
    const prep = new Preparation(basePrep);
    const ss = ServingSize.servings(1);
    const result = formatServingSize(ss, prep);

    expect(result.primary).toBe('1 serving');
  });

  it('formats customSize type', () => {
    const prep = new Preparation(basePrep);
    const ss = ServingSize.customSize('cookie', 3);
    const result = formatServingSize(ss, prep);

    expect(result.primary).toBe('3 cookie');
    // resolved should include servings count and mass/volume
    expect(result.resolved).toContain('serving');
    expect(result.resolved).toContain('g');
  });

  it('formats mass type', () => {
    const prep = new Preparation(basePrep);
    const ss = ServingSize.mass(56, 'g');
    const result = formatServingSize(ss, prep);

    expect(result.primary).toBe('56g');
    expect(result.resolved).toContain('serving');
    expect(result.resolved).toContain('mL');
    // should NOT contain mass in resolved since that's the primary
    expect(result.resolved).not.toMatch(/\dg/);
  });

  it('formats volume type', () => {
    const prep = new Preparation(basePrep);
    const ss = ServingSize.volume(60, 'mL');
    const result = formatServingSize(ss, prep);

    expect(result.primary).toBe('60mL');
    expect(result.resolved).toContain('serving');
    expect(result.resolved).toContain('g');
  });

  it('formats energy type', () => {
    const prep = new Preparation(basePrep);
    const ss = ServingSize.energy(400, 'kcal');
    const result = formatServingSize(ss, prep);

    expect(result.primary).toBe('400kcal');
    expect(result.resolved).toContain('serving');
  });

  it('formats energy type with resolved servings and mass', () => {
    const prep = new Preparation(basePrep);
    const ss = ServingSize.energy(400, 'kcal');
    const result = formatServingSize(ss, prep);

    expect(result.primary).toBe('400kcal');
    expect(result.resolved).toContain('serving');
    expect(result.resolved).toContain('g');
    expect(result.resolved).toContain('mL');
  });

  it('omits volume from resolved when volume is the primary type', () => {
    const prep = new Preparation(basePrep);
    const ss = ServingSize.volume(60, 'mL');
    const result = formatServingSize(ss, prep);

    expect(result.resolved).not.toMatch(/\dmL/);
  });

  it('includes servings in resolved for non-servings types', () => {
    const prep = new Preparation(basePrep);
    const ss = ServingSize.mass(56, 'g');
    const result = formatServingSize(ss, prep);

    expect(result.resolved).toContain('serving');
  });

  it('returns nulls when scalar() throws', () => {
    // No mass defined, request by mass
    const prep = new Preparation({ nutritionalInformation: {} });
    const ss = ServingSize.mass(100, 'g');
    const result = formatServingSize(ss, prep);

    expect(result).toEqual({ primary: null, resolved: null });
  });

  it('works with ProductGroup using oneServing fallback', () => {
    const groupData: ProductGroupData = {
      name: 'Test Group',
      items: [
        {
          product: {
            preparations: [
              {
                mass: { amount: 50, unit: 'g' },
                volume: { amount: 100, unit: 'mL' },
                nutritionalInformation: {
                  calories: { amount: 150, unit: 'kcal' },
                },
              },
            ],
          },
        },
      ],
    };
    const group = new ProductGroup(groupData);
    const ss = ServingSize.servings(2);
    const result = formatServingSize(ss, group);

    expect(result.primary).toBe('2 servings');
    // Should use oneServing mass/volume from the group's items
    expect(result.resolved).toContain('g');
    expect(result.resolved).toContain('mL');
  });

  it('works with ProductGroup that has explicit mass/volume', () => {
    const groupData: ProductGroupData = {
      name: 'Test Group',
      mass: { amount: 30, unit: 'g' },
      volume: { amount: 50, unit: 'mL' },
      items: [
        {
          product: {
            preparations: [
              {
                nutritionalInformation: {
                  calories: { amount: 100, unit: 'kcal' },
                },
              },
            ],
          },
        },
      ],
    };
    const group = new ProductGroup(groupData);
    const ss = ServingSize.servings(1);
    const result = formatServingSize(ss, group);

    expect(result.primary).toBe('1 serving');
    expect(result.resolved).toContain('30g');
    expect(result.resolved).toContain('50mL');
  });
});

describe('formatLastLogin', () => {
  it('returns "Never logged in" for null', () => {
    expect(formatLastLogin(null)).toBe('Never logged in');
  });

  it('returns "Never logged in" for undefined', () => {
    expect(formatLastLogin(undefined)).toBe('Never logged in');
  });

  it('returns "Just now" for timestamps less than 1 minute ago', () => {
    const now = Date.now() / 1000 - 10; // 10 seconds ago
    expect(formatLastLogin(now)).toBe('Just now');
  });

  it('returns minutes ago for timestamps less than 1 hour ago', () => {
    const now = Date.now() / 1000 - 300; // 5 minutes ago
    expect(formatLastLogin(now)).toBe('5m ago');
  });

  it('returns hours ago for timestamps less than 1 day ago', () => {
    const now = Date.now() / 1000 - 3600 * 3; // 3 hours ago
    expect(formatLastLogin(now)).toBe('3h ago');
  });

  it('returns days ago for timestamps less than 2 weeks ago', () => {
    const now = Date.now() / 1000 - 86400 * 5; // 5 days ago
    expect(formatLastLogin(now)).toBe('5d ago');
  });

  it('returns a date string for timestamps older than 2 weeks', () => {
    const old = Date.now() / 1000 - 86400 * 30; // 30 days ago
    const result = formatLastLogin(old);
    // Should be a locale date string, not a relative time
    expect(result).not.toContain('ago');
    expect(result).not.toBe('Never logged in');
    // Should match a date-like pattern (e.g., "1/12/2026" or "12.1.2026")
    expect(result).toMatch(/\d/);
  });
});
