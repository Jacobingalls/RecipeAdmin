import { Preparation, ProductGroup } from '../domain';
import type { PreparationData, ProductGroupData } from '../domain';

import { massUnits, volumeUnits, energyUnits, buildOptionGroups, filterGroups } from './unitConfig';
import type { OptionGroup } from './unitConfig';

describe('unit arrays', () => {
  it('massUnits has expected structure', () => {
    expect(massUnits.length).toBeGreaterThan(0);
    for (const u of massUnits) {
      expect(u).toHaveProperty('value');
      expect(u).toHaveProperty('label');
      expect(u).toHaveProperty('aliases');
      expect(u.aliases.length).toBeGreaterThan(0);
    }
  });

  it('volumeUnits has expected structure', () => {
    expect(volumeUnits.length).toBeGreaterThan(0);
    for (const u of volumeUnits) {
      expect(u).toHaveProperty('value');
      expect(u).toHaveProperty('label');
      expect(u).toHaveProperty('aliases');
      expect(u.aliases.length).toBeGreaterThan(0);
    }
  });

  it('energyUnits has expected structure', () => {
    expect(energyUnits.length).toBeGreaterThan(0);
    for (const u of energyUnits) {
      expect(u).toHaveProperty('value');
      expect(u).toHaveProperty('label');
      expect(u).toHaveProperty('aliases');
      expect(u.aliases.length).toBeGreaterThan(0);
    }
  });

  it('massUnits includes grams', () => {
    const g = massUnits.find((u) => u.value === 'g');
    expect(g).toBeDefined();
    expect(g!.aliases).toContain('gram');
  });

  it('volumeUnits includes milliliters', () => {
    const mL = volumeUnits.find((u) => u.value === 'mL');
    expect(mL).toBeDefined();
    expect(mL!.aliases).toContain('milliliter');
  });

  it('energyUnits includes kcal', () => {
    const kcal = energyUnits.find((u) => u.value === 'kcal');
    expect(kcal).toBeDefined();
    expect(kcal!.aliases).toContain('calorie');
  });
});

describe('buildOptionGroups', () => {
  it('always includes Servings group', () => {
    const prep = new Preparation({});
    const groups = buildOptionGroups(prep);

    const servingsGroup = groups.find((g) => g.label === 'Servings');
    expect(servingsGroup).toBeDefined();
    expect(servingsGroup!.options).toHaveLength(1);
    expect(servingsGroup!.options[0].type).toBe('servings');
  });

  it('includes all groups for Preparation with mass, volume, and calories', () => {
    const prepData: PreparationData = {
      mass: { amount: 28, unit: 'g' },
      volume: { amount: 30, unit: 'mL' },
      nutritionalInformation: {
        calories: { amount: 200, unit: 'kcal' },
      },
      customSizes: [{ name: 'piece', servingSize: { kind: 'servings', amount: 1 } }],
    };
    const prep = new Preparation(prepData);
    const groups = buildOptionGroups(prep);

    const labels = groups.map((g) => g.label);
    expect(labels).toContain('Servings');
    expect(labels).toContain('Custom Sizes');
    expect(labels).toContain('Mass');
    expect(labels).toContain('Volume');
    expect(labels).toContain('Energy');
  });

  it('excludes Volume when no volume defined', () => {
    const prepData: PreparationData = {
      mass: { amount: 28, unit: 'g' },
      nutritionalInformation: {
        calories: { amount: 200, unit: 'kcal' },
      },
    };
    const prep = new Preparation(prepData);
    const groups = buildOptionGroups(prep);

    const labels = groups.map((g) => g.label);
    expect(labels).toContain('Mass');
    expect(labels).not.toContain('Volume');
  });

  it('excludes Mass when no mass defined', () => {
    const prep = new Preparation({
      volume: { amount: 30, unit: 'mL' },
      nutritionalInformation: {},
    });
    const groups = buildOptionGroups(prep);

    const labels = groups.map((g) => g.label);
    expect(labels).not.toContain('Mass');
    expect(labels).toContain('Volume');
  });

  it('excludes Energy when no calories defined', () => {
    const prep = new Preparation({
      mass: { amount: 28, unit: 'g' },
      nutritionalInformation: {},
    });
    const groups = buildOptionGroups(prep);

    const labels = groups.map((g) => g.label);
    expect(labels).not.toContain('Energy');
  });

  it('excludes Custom Sizes when none defined', () => {
    const prep = new Preparation({
      mass: { amount: 28, unit: 'g' },
      nutritionalInformation: {},
    });
    const groups = buildOptionGroups(prep);

    const labels = groups.map((g) => g.label);
    expect(labels).not.toContain('Custom Sizes');
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
    const groups = buildOptionGroups(group);

    const labels = groups.map((g) => g.label);
    expect(labels).toContain('Servings');
    expect(labels).toContain('Mass');
    expect(labels).toContain('Volume');
    expect(labels).toContain('Energy');
  });

  it('Custom Sizes options have correct type and names', () => {
    const prepData: PreparationData = {
      customSizes: [
        { name: 'cookie', servingSize: { kind: 'servings', amount: 0.5 } },
        { name: 'slice', servingSize: { kind: 'servings', amount: 1 } },
      ],
      nutritionalInformation: {},
    };
    const prep = new Preparation(prepData);
    const groups = buildOptionGroups(prep);

    const customGroup = groups.find((g) => g.label === 'Custom Sizes');
    expect(customGroup).toBeDefined();
    expect(customGroup!.options).toHaveLength(2);
    expect(customGroup!.options[0].type).toBe('customSize');
    expect(customGroup!.options[0].value).toBe('cookie');
    expect(customGroup!.options[1].value).toBe('slice');
  });
});

describe('filterGroups', () => {
  const sampleGroups: OptionGroup[] = [
    {
      label: 'Servings',
      options: [
        {
          type: 'servings',
          value: 'servings',
          label: 'Servings',
          aliases: ['serving', 'servings'],
        },
      ],
    },
    {
      label: 'Mass',
      options: [
        { type: 'mass', value: 'g', label: 'Grams (g)', aliases: ['gram', 'grams', 'g'] },
        { type: 'mass', value: 'oz', label: 'Ounces (oz)', aliases: ['ounce', 'ounces', 'oz'] },
      ],
    },
    {
      label: 'Volume',
      options: [
        { type: 'volume', value: 'mL', label: 'Milliliters (mL)', aliases: ['milliliter', 'mL'] },
      ],
    },
  ];

  it('returns all groups for empty query', () => {
    expect(filterGroups(sampleGroups, '')).toEqual(sampleGroups);
  });

  it('returns all groups for whitespace query', () => {
    expect(filterGroups(sampleGroups, '   ')).toEqual(sampleGroups);
  });

  it('filters by label match', () => {
    const result = filterGroups(sampleGroups, 'gram');
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Mass');
    expect(result[0].options).toHaveLength(1);
    expect(result[0].options[0].value).toBe('g');
  });

  it('filters by alias match', () => {
    const result = filterGroups(sampleGroups, 'ounce');
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Mass');
    expect(result[0].options).toHaveLength(1);
    expect(result[0].options[0].value).toBe('oz');
  });

  it('returns empty array when no matches', () => {
    const result = filterGroups(sampleGroups, 'xyz');
    expect(result).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    const result = filterGroups(sampleGroups, 'GRAM');
    expect(result).toHaveLength(1);
    expect(result[0].options[0].value).toBe('g');
  });

  it('excludes groups with no matching options', () => {
    const result = filterGroups(sampleGroups, 'milli');
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Volume');
  });

  it('can match across multiple groups', () => {
    // "s" matches "servings" and several others
    const result = filterGroups(sampleGroups, 'serving');
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Servings');
  });
});
