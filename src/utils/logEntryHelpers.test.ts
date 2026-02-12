import type { ApiLogEntry, ApiProductSummary, ApiGroupSummary } from '../api';

import {
  formatTime,
  formatRelativeTime,
  resolveEntryName,
  entryDetailPath,
  formatServingSizeDescription,
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
  const products: ApiProductSummary[] = [
    { id: 'p1', name: 'Oats' },
    { id: 'p2', name: 'Milk' },
  ];
  const groups: ApiGroupSummary[] = [{ id: 'g1', name: 'Breakfast Bowl', items: [] }];

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
  it('returns product path for product entries', () => {
    const entry: ApiLogEntry = {
      id: 'log1',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'product', productID: 'p1', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(entryDetailPath(entry)).toBe('/products/p1');
  });

  it('returns group path for group entries', () => {
    const entry: ApiLogEntry = {
      id: 'log2',
      timestamp: nowSeconds(),
      userID: 'u1',
      item: { kind: 'group', groupID: 'g1', servingSize: { kind: 'servings', amount: 1 } },
    };
    expect(entryDetailPath(entry)).toBe('/groups/g1');
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
