import type { ApiSearchResult } from '../api';
import { Preparation, ProductGroup, ServingSize } from '../domain';

import { buildSearchResultLogTarget } from './searchResultLogTarget';

describe('buildSearchResultLogTarget', () => {
  it('returns a LogTarget for a product result with matching preparationID', () => {
    const result: ApiSearchResult = {
      item: {
        product: {
          id: 'p1',
          name: 'Oats',
          brand: 'BrandA',
          preparations: [
            {
              id: 'prep-1',
              nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
              mass: { amount: 40, unit: 'g' },
            },
            {
              id: 'prep-2',
              nutritionalInformation: { calories: { amount: 200, unit: 'kcal' } },
            },
          ],
        },
        preparationID: 'prep-2',
      },
      servingSize: { kind: 'servings', amount: 2 },
      relevance: 1,
    };

    const target = buildSearchResultLogTarget(result);

    expect(target).not.toBeNull();
    expect(target!.name).toBe('Oats');
    expect(target!.brand).toBe('BrandA');
    expect(target!.productId).toBe('p1');
    expect(target!.preparationId).toBe('prep-2');
    expect(target!.prepOrGroup).toBeInstanceOf(Preparation);
    expect(target!.initialServingSize).toEqual(ServingSize.servings(2));
  });

  it('falls back to the first preparation when preparationID does not match', () => {
    const result: ApiSearchResult = {
      item: {
        product: {
          id: 'p1',
          name: 'Oats',
          preparations: [
            {
              id: 'prep-1',
              nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
            },
          ],
        },
        preparationID: 'nonexistent',
      },
      servingSize: { kind: 'servings', amount: 1 },
      relevance: 1,
    };

    const target = buildSearchResultLogTarget(result);

    expect(target).not.toBeNull();
    expect(target!.preparationId).toBe('prep-1');
  });

  it('returns null when product has no preparations', () => {
    const result: ApiSearchResult = {
      item: {
        product: {
          id: 'p1',
          name: 'Oats',
          preparations: [],
        },
      },
      servingSize: { kind: 'servings', amount: 1 },
      relevance: 1,
    };

    expect(buildSearchResultLogTarget(result)).toBeNull();
  });

  it('returns null when product has undefined preparations', () => {
    const result: ApiSearchResult = {
      item: {
        product: {
          id: 'p1',
          name: 'Oats',
        },
      },
      servingSize: { kind: 'servings', amount: 1 },
      relevance: 1,
    };

    expect(buildSearchResultLogTarget(result)).toBeNull();
  });

  it('returns a LogTarget for a group result', () => {
    const result: ApiSearchResult = {
      item: {
        group: {
          id: 'g1',
          name: 'Breakfast Bowl',
          brand: 'HomeMade',
          items: [],
        },
      },
      servingSize: { kind: 'mass', amount: { amount: 200, unit: 'g' } },
      relevance: 0.8,
    };

    const target = buildSearchResultLogTarget(result);

    expect(target).not.toBeNull();
    expect(target!.name).toBe('Breakfast Bowl');
    expect(target!.brand).toBe('HomeMade');
    expect(target!.groupId).toBe('g1');
    expect(target!.prepOrGroup).toBeInstanceOf(ProductGroup);
    expect(target!.initialServingSize).toEqual(ServingSize.mass(200, 'g'));
    expect(target!.productId).toBeUndefined();
  });

  it('uses "Group" as the name when group has no name', () => {
    const result: ApiSearchResult = {
      item: {
        group: {
          id: 'g1',
          items: [],
        },
      },
      servingSize: { kind: 'servings', amount: 1 },
      relevance: 0.5,
    };

    const target = buildSearchResultLogTarget(result);

    expect(target).not.toBeNull();
    expect(target!.name).toBe('Group');
  });

  it('returns null when neither product nor group is set', () => {
    const result: ApiSearchResult = {
      item: {},
      servingSize: { kind: 'servings', amount: 1 },
      relevance: 0,
    };

    expect(buildSearchResultLogTarget(result)).toBeNull();
  });

  it('defaults to 1 serving when servingSize is not parseable', () => {
    const result: ApiSearchResult = {
      item: {
        product: {
          id: 'p1',
          name: 'Oats',
          preparations: [
            {
              id: 'prep-1',
              nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
            },
          ],
        },
      },
      servingSize: {} as never,
      relevance: 1,
    };

    const target = buildSearchResultLogTarget(result);

    expect(target).not.toBeNull();
    expect(target!.initialServingSize).toEqual(ServingSize.servings(1));
  });

  it('falls back to first preparation when preparationID is undefined', () => {
    const result: ApiSearchResult = {
      item: {
        product: {
          id: 'p1',
          name: 'Oats',
          preparations: [
            {
              id: 'prep-1',
              nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
            },
          ],
        },
      },
      servingSize: { kind: 'servings', amount: 1 },
      relevance: 1,
    };

    const target = buildSearchResultLogTarget(result);

    expect(target).not.toBeNull();
    expect(target!.preparationId).toBe('prep-1');
  });

  it('does not include groupId for product results', () => {
    const result: ApiSearchResult = {
      item: {
        product: {
          id: 'p1',
          name: 'Oats',
          preparations: [
            {
              id: 'prep-1',
              nutritionalInformation: {},
            },
          ],
        },
      },
      servingSize: { kind: 'servings', amount: 1 },
      relevance: 1,
    };

    const target = buildSearchResultLogTarget(result);

    expect(target!.groupId).toBeUndefined();
  });

  it('does not include productId or preparationId for group results', () => {
    const result: ApiSearchResult = {
      item: {
        group: {
          id: 'g1',
          name: 'Bowl',
          items: [],
        },
      },
      servingSize: { kind: 'servings', amount: 1 },
      relevance: 1,
    };

    const target = buildSearchResultLogTarget(result);

    expect(target!.productId).toBeUndefined();
    expect(target!.preparationId).toBeUndefined();
  });
});
