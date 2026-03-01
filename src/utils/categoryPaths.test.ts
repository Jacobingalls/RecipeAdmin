import type { ApiCategory } from '../api';

import { buildSlugPath, resolvePathSegments } from './categoryPaths';

function makeCategory(
  overrides: Partial<ApiCategory> & Pick<ApiCategory, 'id' | 'slug'>,
): ApiCategory {
  return {
    displayName: overrides.slug,
    description: null,
    parents: [],
    children: [],
    notes: [],
    ...overrides,
  };
}

const food = makeCategory({ id: 'root', slug: 'food', children: ['mid'] });
const dairy = makeCategory({ id: 'mid', slug: 'dairy', parents: ['root'], children: ['leaf'] });
const cheese = makeCategory({ id: 'leaf', slug: 'cheese', parents: ['mid'] });
const snacks = makeCategory({ id: 'standalone', slug: 'snacks' });

const allCategories = [food, dairy, cheese, snacks];
const lookup = new Map(allCategories.map((c) => [c.id, c]));

describe('buildSlugPath', () => {
  it('returns single slug for a root category', () => {
    expect(buildSlugPath('root', lookup)).toBe('food');
  });

  it('returns dot-separated path for a nested category', () => {
    expect(buildSlugPath('mid', lookup)).toBe('food.dairy');
  });

  it('returns full path for a deeply nested category', () => {
    expect(buildSlugPath('leaf', lookup)).toBe('food.dairy.cheese');
  });

  it('returns single slug for a standalone root', () => {
    expect(buildSlugPath('standalone', lookup)).toBe('snacks');
  });

  it('returns empty string for unknown ID', () => {
    expect(buildSlugPath('nonexistent', lookup)).toBe('');
  });
});

describe('resolvePathSegments', () => {
  it('resolves a single-segment path to a root category', () => {
    const result = resolvePathSegments('food', allCategories);
    expect(result).toEqual([food]);
  });

  it('resolves a multi-segment path to an ordered chain', () => {
    const result = resolvePathSegments('food.dairy.cheese', allCategories);
    expect(result).toEqual([food, dairy, cheese]);
  });

  it('resolves a two-segment path', () => {
    const result = resolvePathSegments('food.dairy', allCategories);
    expect(result).toEqual([food, dairy]);
  });

  it('returns empty array for unknown first segment', () => {
    expect(resolvePathSegments('unknown', allCategories)).toEqual([]);
  });

  it('returns partial result when a middle segment is unknown', () => {
    const result = resolvePathSegments('food.unknown.cheese', allCategories);
    expect(result).toEqual([food]);
  });

  it('resolves standalone root', () => {
    const result = resolvePathSegments('snacks', allCategories);
    expect(result).toEqual([snacks]);
  });
});
