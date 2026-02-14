import type { ApiFavorite } from '../api';

import {
  favoriteName,
  favoriteBrand,
  favoriteDetailPath,
  favoriteCalories,
  favoriteServingSizeDescription,
  buildFavoriteLogParams,
  buildFavoriteLogTarget,
} from './favoriteHelpers';

const productFavorite: ApiFavorite = {
  id: 'fav1',
  createdAt: 1700000000,
  lastUsedAt: 1700001000,
  item: {
    product: {
      id: 'p1',
      name: 'Peanut Butter',
      brand: 'NutCo',
      preparations: [
        {
          id: 'prep1',
          name: 'Standard',
          nutritionalInformation: {
            calories: { amount: 190, unit: 'kcal' },
          },
          mass: { amount: 32, unit: 'g' },
        },
      ],
    },
    preparationID: 'prep1',
    servingSize: { kind: 'servings', amount: 2 },
  },
};

const groupFavorite: ApiFavorite = {
  id: 'fav2',
  createdAt: 1700000000,
  lastUsedAt: 1700001000,
  item: {
    group: {
      id: 'g1',
      name: 'Breakfast Bowl',
      items: [
        {
          product: {
            id: 'p2',
            name: 'Oats',
            preparations: [
              {
                id: 'prep2',
                nutritionalInformation: {
                  calories: { amount: 150, unit: 'kcal' },
                },
              },
            ],
          },
          preparationID: 'prep2',
        },
      ],
    },
    servingSize: { kind: 'servings', amount: 1 },
  },
};

const emptyFavorite: ApiFavorite = {
  id: 'fav3',
  createdAt: 1700000000,
  lastUsedAt: 1700001000,
  item: {
    servingSize: { kind: 'servings', amount: 1 },
  },
};

describe('favoriteName', () => {
  it('returns product name for product favorites', () => {
    expect(favoriteName(productFavorite)).toBe('Peanut Butter');
  });

  it('returns group name for group favorites', () => {
    expect(favoriteName(groupFavorite)).toBe('Breakfast Bowl');
  });

  it('returns "Group" when group has no name', () => {
    const fav: ApiFavorite = {
      ...groupFavorite,
      item: {
        group: { id: 'g-noname', items: [] },
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    expect(favoriteName(fav)).toBe('Group');
  });

  it('returns "Unknown" when neither product nor group', () => {
    expect(favoriteName(emptyFavorite)).toBe('Unknown');
  });
});

describe('favoriteBrand', () => {
  it('returns brand for product favorites', () => {
    expect(favoriteBrand(productFavorite)).toBe('NutCo');
  });

  it('returns undefined for group favorites', () => {
    expect(favoriteBrand(groupFavorite)).toBeUndefined();
  });

  it('returns undefined when product has no brand', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        ...productFavorite.item,
        product: { ...productFavorite.item.product!, brand: undefined },
      },
    };
    expect(favoriteBrand(fav)).toBeUndefined();
  });
});

describe('favoriteDetailPath', () => {
  it('returns product path for product favorites', () => {
    expect(favoriteDetailPath(productFavorite)).toBe('/products/p1');
  });

  it('returns group path for group favorites', () => {
    expect(favoriteDetailPath(groupFavorite)).toBe('/groups/g1');
  });

  it('returns "#" when neither product nor group', () => {
    expect(favoriteDetailPath(emptyFavorite)).toBe('#');
  });
});

describe('favoriteCalories', () => {
  it('computes calories for product favorites', () => {
    // 2 servings of 190 kcal = 380 kcal
    expect(favoriteCalories(productFavorite)).toBe(380);
  });

  it('computes calories for group favorites', () => {
    // 1 serving of group with 150 kcal item = 150 kcal
    expect(favoriteCalories(groupFavorite)).toBe(150);
  });

  it('returns null when product has no preparations', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        ...productFavorite.item,
        product: { id: 'p-noprep', name: 'No Prep', preparations: [] },
      },
    };
    expect(favoriteCalories(fav)).toBeNull();
  });

  it('returns null for empty favorite', () => {
    expect(favoriteCalories(emptyFavorite)).toBeNull();
  });

  it('returns null when preparation has no calories', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        ...productFavorite.item,
        product: {
          id: 'p1',
          name: 'NoCal',
          preparations: [{ id: 'prep1', nutritionalInformation: {} }],
        },
      },
    };
    expect(favoriteCalories(fav)).toBeNull();
  });

  it('uses matching preparationID', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        product: {
          id: 'p1',
          name: 'Multi Prep',
          preparations: [
            {
              id: 'prep-a',
              nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
            },
            {
              id: 'prep-b',
              nutritionalInformation: { calories: { amount: 200, unit: 'kcal' } },
            },
          ],
        },
        preparationID: 'prep-b',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    expect(favoriteCalories(fav)).toBe(200);
  });
});

describe('favoriteServingSizeDescription', () => {
  it('formats servings', () => {
    expect(favoriteServingSizeDescription(productFavorite)).toBe('2 servings');
  });

  it('formats single serving', () => {
    expect(favoriteServingSizeDescription(groupFavorite)).toBe('1 serving');
  });

  it('returns empty string for invalid serving size', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: { ...productFavorite.item, servingSize: {} },
    };
    expect(favoriteServingSizeDescription(fav)).toBe('');
  });
});

describe('buildFavoriteLogParams', () => {
  it('builds log params for product favorites', () => {
    const params = buildFavoriteLogParams(productFavorite);
    expect(params).not.toBeNull();
    expect(params!.productId).toBe('p1');
    expect(params!.preparationId).toBe('prep1');
    expect(params!.groupId).toBeUndefined();
    expect(params!.servingSize).toEqual({ kind: 'servings', amount: 2 });
  });

  it('builds log params for group favorites', () => {
    const params = buildFavoriteLogParams(groupFavorite);
    expect(params).not.toBeNull();
    expect(params!.groupId).toBe('g1');
    expect(params!.productId).toBeUndefined();
    expect(params!.preparationId).toBeUndefined();
    expect(params!.servingSize).toEqual({ kind: 'servings', amount: 1 });
  });

  it('returns null when product has no preparations', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        ...productFavorite.item,
        product: { id: 'p-noprep', name: 'No Prep', preparations: [] },
      },
    };
    expect(buildFavoriteLogParams(fav)).toBeNull();
  });

  it('returns null for empty favorite', () => {
    expect(buildFavoriteLogParams(emptyFavorite)).toBeNull();
  });

  it('uses matching preparationID', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        product: {
          id: 'p1',
          name: 'Multi Prep',
          preparations: [
            { id: 'prep-a', nutritionalInformation: {} },
            { id: 'prep-b', nutritionalInformation: {} },
          ],
        },
        preparationID: 'prep-b',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const params = buildFavoriteLogParams(fav);
    expect(params!.preparationId).toBe('prep-b');
  });

  it('falls back to first preparation when preparationID is missing', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        product: {
          id: 'p1',
          name: 'Fallback',
          preparations: [{ id: 'prep-first', nutritionalInformation: {} }],
        },
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const params = buildFavoriteLogParams(fav);
    expect(params!.preparationId).toBe('prep-first');
  });
});

describe('buildFavoriteLogTarget', () => {
  it('builds log target for product favorites', () => {
    const target = buildFavoriteLogTarget(productFavorite);
    expect(target).not.toBeNull();
    expect(target!.name).toBe('Peanut Butter');
    expect(target!.brand).toBe('NutCo');
    expect(target!.productId).toBe('p1');
    expect(target!.preparationId).toBe('prep1');
    expect(target!.groupId).toBeUndefined();
    expect(target!.editEntryId).toBeUndefined();
    expect(target!.initialServingSize.type).toBe('servings');
    expect(target!.initialServingSize.amount).toBe(2);
  });

  it('builds log target for group favorites', () => {
    const target = buildFavoriteLogTarget(groupFavorite);
    expect(target).not.toBeNull();
    expect(target!.name).toBe('Breakfast Bowl');
    expect(target!.brand).toBeUndefined();
    expect(target!.groupId).toBe('g1');
    expect(target!.productId).toBeUndefined();
    expect(target!.editEntryId).toBeUndefined();
  });

  it('returns null when product has no preparations', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        ...productFavorite.item,
        product: { id: 'p-noprep', name: 'No Prep', preparations: [] },
      },
    };
    expect(buildFavoriteLogTarget(fav)).toBeNull();
  });

  it('returns null for empty favorite', () => {
    expect(buildFavoriteLogTarget(emptyFavorite)).toBeNull();
  });

  it('returns "Group" for group with no name', () => {
    const fav: ApiFavorite = {
      ...groupFavorite,
      item: {
        group: { id: 'g-noname', items: [] },
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const target = buildFavoriteLogTarget(fav);
    expect(target!.name).toBe('Group');
  });
});
