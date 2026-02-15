import type { ApiLogEntry, ApiProduct } from '../api';
import type { ProductGroupData } from '../domain';

import {
  formatTime,
  formatRelativeTime,
  resolveEntryName,
  entryDetailPath,
  formatServingSizeDescription,
  buildLogTarget,
} from './logEntryHelpers';

function nowSeconds() {
  return Date.now() / 1000;
}

describe('formatTime', () => {
  it('returns a time-only string', () => {
    const timestamp = new Date(2025, 0, 15, 14, 30).getTime() / 1000;
    const expected = new Date(2025, 0, 15, 14, 30).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    expect(formatTime(timestamp)).toBe(expected);
  });

  it('formats morning times', () => {
    const timestamp = new Date(2025, 5, 1, 8, 5).getTime() / 1000;
    const expected = new Date(2025, 5, 1, 8, 5).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    expect(formatTime(timestamp)).toBe(expected);
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for less than a minute ago', () => {
    const timestamp = nowSeconds() - 30;
    expect(formatRelativeTime(timestamp)).toBe('just now');
  });

  it('returns minutes ago for less than an hour', () => {
    const timestamp = nowSeconds() - 15 * 60;
    expect(formatRelativeTime(timestamp)).toBe('15m ago');
  });

  it('returns hours ago for less than a day', () => {
    const timestamp = nowSeconds() - 5 * 3600;
    expect(formatRelativeTime(timestamp)).toBe('5h ago');
  });

  it('returns days ago for less than a week', () => {
    const timestamp = nowSeconds() - 3 * 86_400;
    expect(formatRelativeTime(timestamp)).toBe('3d ago');
  });

  it('returns formatted date for a week or more', () => {
    const timestamp = nowSeconds() - 10 * 86_400;
    const result = formatRelativeTime(timestamp);
    expect(result).toBe(new Date(timestamp * 1000).toLocaleDateString());
  });

  it('returns "in Xm" for minutes in the future', () => {
    const timestamp = nowSeconds() + 15 * 60;
    expect(formatRelativeTime(timestamp)).toBe('in 15m');
  });

  it('returns "in Xh" for hours in the future', () => {
    const timestamp = nowSeconds() + 5 * 3600;
    expect(formatRelativeTime(timestamp)).toBe('in 5h');
  });

  it('returns "in Xd" for days in the future', () => {
    const timestamp = nowSeconds() + 3 * 86_400;
    expect(formatRelativeTime(timestamp)).toBe('in 3d');
  });

  it('returns formatted date for a week or more in the future', () => {
    const timestamp = nowSeconds() + 10 * 86_400;
    const result = formatRelativeTime(timestamp);
    expect(result).toBe(new Date(timestamp * 1000).toLocaleDateString());
  });
});

describe('resolveEntryName', () => {
  const products: Record<string, { name: string }> = {
    p1: { name: 'Oats' },
    p2: { name: 'Milk' },
  };
  const groups: Record<string, { name: string }> = {
    g1: { name: 'Breakfast Bowl' },
  };

  it('resolves a product name', () => {
    const entry: ApiLogEntry = {
      id: 'log1',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'product', productID: 'p1', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(resolveEntryName(entry, products, groups)).toBe('Oats');
  });

  it('resolves a group name', () => {
    const entry: ApiLogEntry = {
      id: 'log2',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(resolveEntryName(entry, products, groups)).toBe('Breakfast Bowl');
  });

  it('returns "Unknown Product" when product not found', () => {
    const entry: ApiLogEntry = {
      id: 'log3',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'product', productID: 'missing', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(resolveEntryName(entry, products, groups)).toBe('Unknown Product');
  });

  it('returns "Unknown Group" when group not found', () => {
    const entry: ApiLogEntry = {
      id: 'log4',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'group', groupID: 'missing', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(resolveEntryName(entry, products, groups)).toBe('Unknown Group');
  });

  it('returns "Unknown Item" when no product or group ID', () => {
    const entry: ApiLogEntry = {
      id: 'log5',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'other', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(resolveEntryName(entry, products, groups)).toBe('Unknown Item');
  });
});

describe('entryDetailPath', () => {
  it('returns product path with serving size params', () => {
    const entry: ApiLogEntry = {
      id: 'log1',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'product', productID: 'p1', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(entryDetailPath(entry)).toBe('/products/p1?st=servings&sa=1');
  });

  it('includes prep param when preparationID is present', () => {
    const entry: ApiLogEntry = {
      id: 'log1',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: {
        kind: 'product',
        productID: 'p1',
        preparationID: 'prep-abc',
        servingSize: { kind: 'servings', amount: 2 },
      },
    };
    const path = entryDetailPath(entry);
    expect(path).toContain('/products/p1?');
    const params = new URLSearchParams(path.split('?')[1]);
    expect(params.get('st')).toBe('servings');
    expect(params.get('sa')).toBe('2');
    expect(params.get('prep')).toBe('prep-abc');
  });

  it('includes mass serving size params for product entries', () => {
    const entry: ApiLogEntry = {
      id: 'log1',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: {
        kind: 'product',
        productID: 'p1',
        servingSize: { kind: 'mass', amount: { amount: 100, unit: 'g' } },
      },
    };
    const path = entryDetailPath(entry);
    const params = new URLSearchParams(path.split('?')[1]);
    expect(params.get('st')).toBe('mass');
    expect(params.get('sa')).toBe('100');
    expect(params.get('su')).toBe('g');
  });

  it('returns group path with serving size params', () => {
    const entry: ApiLogEntry = {
      id: 'log2',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(entryDetailPath(entry)).toBe('/groups/g1?st=servings&sa=1');
  });

  it('returns "#" when no ID available', () => {
    const entry: ApiLogEntry = {
      id: 'log3',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'other', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(entryDetailPath(entry)).toBe('#');
  });
});

describe('formatServingSizeDescription', () => {
  it('formats servings', () => {
    const entry: ApiLogEntry = {
      id: 'log1',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'product', productID: 'p1', servingSize: { kind: 'servings', amount: 2 } },
    };
    expect(formatServingSizeDescription(entry)).toBe('2 servings');
  });

  it('formats single serving', () => {
    const entry: ApiLogEntry = {
      id: 'log2',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'product', productID: 'p1', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(formatServingSizeDescription(entry)).toBe('1 serving');
  });

  it('returns empty string for null serving size', () => {
    const entry: ApiLogEntry = {
      id: 'log3',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'product', productID: 'p1', servingSize: {} },
    };
    expect(formatServingSizeDescription(entry)).toBe('');
  });
});

describe('buildLogTarget', () => {
  const mockProduct: ApiProduct = {
    id: 'prod-1',
    name: 'Oats',
    brand: 'QuakerCo',
    preparations: [
      {
        id: 'prep-1',
        nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
        mass: { amount: 40, unit: 'g' },
        customSizes: [],
      },
    ],
  };

  const mockGroupData: ProductGroupData = {
    id: 'group-1',
    name: 'Breakfast Bowl',
    items: [],
  };

  it('includes initialTimestamp for product entries', () => {
    const entry: ApiLogEntry = {
      id: 'log-1',
      timestamp: 1700000000,
      userID: 'u1',
      item: {
        kind: 'product',
        productID: 'prod-1',
        preparationID: 'prep-1',
        servingSize: { kind: 'servings', amount: 2 },
      },
    };

    const target = buildLogTarget(entry, mockProduct, null);
    expect(target).not.toBeNull();
    expect(target!.initialTimestamp).toBe(1700000000);
    expect(target!.editEntryId).toBe('log-1');
    expect(target!.name).toBe('Oats');
    expect(target!.brand).toBe('QuakerCo');
  });

  it('includes initialTimestamp for group entries', () => {
    const entry: ApiLogEntry = {
      id: 'log-2',
      timestamp: 1700001000,
      userID: 'u1',
      item: {
        kind: 'group',
        groupID: 'group-1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };

    const target = buildLogTarget(entry, null, mockGroupData);
    expect(target).not.toBeNull();
    expect(target!.initialTimestamp).toBe(1700001000);
    expect(target!.editEntryId).toBe('log-2');
    expect(target!.name).toBe('Breakfast Bowl');
  });

  it('returns null when product has no preparations', () => {
    const entry: ApiLogEntry = {
      id: 'log-3',
      timestamp: 1700000000,
      userID: 'u1',
      item: {
        kind: 'product',
        productID: 'prod-2',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };

    const noPrepProduct: ApiProduct = { id: 'prod-2', name: 'Empty', preparations: [] };
    expect(buildLogTarget(entry, noPrepProduct, null)).toBeNull();
  });

  it('returns null for unknown entry kind', () => {
    const entry: ApiLogEntry = {
      id: 'log-4',
      timestamp: 1700000000,
      userID: 'u1',
      item: { kind: 'other', servingSize: { kind: 'servings', amount: 1 } },
    };

    expect(buildLogTarget(entry, null, null)).toBeNull();
  });
});
