import type { ApiFavorite, ApiProduct } from '../api';
import type { ProductGroupData } from '../domain';

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
  lastUsedAt: 1700001000,
  item: {
    kind: 'product',
    productID: 'p1',
    preparationID: 'prep1',
    servingSize: { kind: 'servings', amount: 2 },
  },
};

const groupFavorite: ApiFavorite = {
  id: 'fav2',
  lastUsedAt: 1700001000,
  item: {
    kind: 'group',
    groupID: 'g1',
    servingSize: { kind: 'servings', amount: 1 },
  },
};

const emptyFavorite: ApiFavorite = {
  id: 'fav3',
  lastUsedAt: 1700001000,
  item: {
    servingSize: { kind: 'servings', amount: 1 },
  },
};

const products: Record<string, ApiProduct> = {
  p1: {
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
};

const groups: Record<string, ProductGroupData> = {
  g1: {
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
};

describe('favoriteName', () => {
  it('returns product name for product favorites', () => {
    expect(favoriteName(productFavorite, products, groups)).toBe('Peanut Butter');
  });

  it('returns group name for group favorites', () => {
    expect(favoriteName(groupFavorite, products, groups)).toBe('Breakfast Bowl');
  });

  it('returns "Group" when group has no name', () => {
    const fav: ApiFavorite = {
      ...groupFavorite,
      item: {
        groupID: 'g-noname',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    expect(
      favoriteName(fav, {}, { 'g-noname': { id: 'g-noname', name: undefined!, items: [] } }),
    ).toBe('Group');
  });

  it('returns "Unknown" when neither product nor group', () => {
    expect(favoriteName(emptyFavorite, {}, {})).toBe('Unknown');
  });

  it('returns "Unknown" when product not in lookup', () => {
    expect(favoriteName(productFavorite, {}, {})).toBe('Unknown');
  });
});

describe('favoriteBrand', () => {
  it('returns brand for product favorites', () => {
    expect(favoriteBrand(productFavorite, products, groups)).toBe('NutCo');
  });

  it('returns undefined for group favorites without brand', () => {
    expect(favoriteBrand(groupFavorite, products, groups)).toBeUndefined();
  });

  it('returns brand for group favorites with brand', () => {
    const groupsWithBrand: Record<string, ProductGroupData> = {
      g1: { ...groups.g1, brand: 'HomeMade' },
    };
    expect(favoriteBrand(groupFavorite, {}, groupsWithBrand)).toBe('HomeMade');
  });

  it('returns undefined when product has no brand', () => {
    const productsNoBrand: Record<string, ApiProduct> = {
      p1: { ...products.p1, brand: undefined },
    };
    expect(favoriteBrand(productFavorite, productsNoBrand, {})).toBeUndefined();
  });
});

describe('favoriteDetailPath', () => {
  it('returns product path with serving size params and prep', () => {
    const path = favoriteDetailPath(productFavorite);
    expect(path).toContain('/products/p1?');
    const params = new URLSearchParams(path.split('?')[1]);
    expect(params.get('st')).toBe('servings');
    expect(params.get('sa')).toBe('2');
    // Always includes prep since we can't determine the default without resolved data
    expect(params.get('prep')).toBe('prep1');
  });

  it('does not include prep param when preparationID is not set', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        productID: 'p1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const path = favoriteDetailPath(fav);
    const params = new URLSearchParams(path.split('?')[1]);
    expect(params.has('prep')).toBe(false);
  });

  it('includes prep param when preparationID is set', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        productID: 'p1',
        preparationID: 'prep-b',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const path = favoriteDetailPath(fav);
    const params = new URLSearchParams(path.split('?')[1]);
    expect(params.get('prep')).toBe('prep-b');
  });

  it('returns group path with serving size params', () => {
    const path = favoriteDetailPath(groupFavorite);
    expect(path).toContain('/groups/g1?');
    const params = new URLSearchParams(path.split('?')[1]);
    expect(params.get('st')).toBe('servings');
    expect(params.get('sa')).toBe('1');
  });

  it('returns "#" when neither product nor group', () => {
    expect(favoriteDetailPath(emptyFavorite)).toBe('#');
  });
});

describe('favoriteCalories', () => {
  it('computes calories for product favorites', () => {
    // 2 servings of 190 kcal = 380 kcal
    expect(favoriteCalories(productFavorite, products, groups)).toBe(380);
  });

  it('computes calories for group favorites', () => {
    // 1 serving of group with 150 kcal item = 150 kcal
    expect(favoriteCalories(groupFavorite, products, groups)).toBe(150);
  });

  it('returns null when product has no preparations', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        productID: 'p-noprep',
        preparationID: 'prep1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const productsNoPrep: Record<string, ApiProduct> = {
      'p-noprep': { id: 'p-noprep', name: 'No Prep', preparations: [] },
    };
    expect(favoriteCalories(fav, productsNoPrep, {})).toBeNull();
  });

  it('returns null for empty favorite', () => {
    expect(favoriteCalories(emptyFavorite, {}, {})).toBeNull();
  });

  it('returns null when preparation has no calories', () => {
    const productsNoCal: Record<string, ApiProduct> = {
      p1: {
        id: 'p1',
        name: 'NoCal',
        preparations: [{ id: 'prep1', nutritionalInformation: {} }],
      },
    };
    expect(favoriteCalories(productFavorite, productsNoCal, {})).toBeNull();
  });

  it('uses matching preparationID', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        productID: 'p1',
        preparationID: 'prep-b',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const multiPrepProducts: Record<string, ApiProduct> = {
      p1: {
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
    };
    expect(favoriteCalories(fav, multiPrepProducts, {})).toBe(200);
  });

  it('returns null when group not in lookup', () => {
    expect(favoriteCalories(groupFavorite, {}, {})).toBeNull();
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
    const params = buildFavoriteLogParams(productFavorite, products);
    expect(params).not.toBeNull();
    expect(params!.productId).toBe('p1');
    expect(params!.preparationId).toBe('prep1');
    expect(params!.groupId).toBeUndefined();
    expect(params!.servingSize).toEqual({ kind: 'servings', amount: 2 });
  });

  it('builds log params for group favorites', () => {
    const params = buildFavoriteLogParams(groupFavorite, {});
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
        productID: 'p-noprep',
        preparationID: 'prep1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const productsNoPrep: Record<string, ApiProduct> = {
      'p-noprep': { id: 'p-noprep', name: 'No Prep', preparations: [] },
    };
    expect(buildFavoriteLogParams(fav, productsNoPrep)).toBeNull();
  });

  it('returns null for empty favorite', () => {
    expect(buildFavoriteLogParams(emptyFavorite, {})).toBeNull();
  });

  it('returns null when product not in lookup', () => {
    expect(buildFavoriteLogParams(productFavorite, {})).toBeNull();
  });

  it('uses matching preparationID', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        productID: 'p1',
        preparationID: 'prep-b',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const multiPrepProducts: Record<string, ApiProduct> = {
      p1: {
        id: 'p1',
        name: 'Multi Prep',
        preparations: [
          { id: 'prep-a', nutritionalInformation: {} },
          { id: 'prep-b', nutritionalInformation: {} },
        ],
      },
    };
    const params = buildFavoriteLogParams(fav, multiPrepProducts);
    expect(params!.preparationId).toBe('prep-b');
  });

  it('falls back to first preparation when preparationID is missing', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        productID: 'p1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const fallbackProducts: Record<string, ApiProduct> = {
      p1: {
        id: 'p1',
        name: 'Fallback',
        preparations: [{ id: 'prep-first', nutritionalInformation: {} }],
      },
    };
    const params = buildFavoriteLogParams(fav, fallbackProducts);
    expect(params!.preparationId).toBe('prep-first');
  });
});

describe('buildFavoriteLogTarget', () => {
  it('builds log target for product favorites', () => {
    const target = buildFavoriteLogTarget(productFavorite, products, groups);
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
    const target = buildFavoriteLogTarget(groupFavorite, {}, groups);
    expect(target).not.toBeNull();
    expect(target!.name).toBe('Breakfast Bowl');
    expect(target!.brand).toBeUndefined();
    expect(target!.groupId).toBe('g1');
    expect(target!.productId).toBeUndefined();
    expect(target!.editEntryId).toBeUndefined();
  });

  it('includes brand for group favorites with brand', () => {
    const groupsWithBrand: Record<string, ProductGroupData> = {
      g1: { ...groups.g1, brand: 'HomeMade' },
    };
    const target = buildFavoriteLogTarget(groupFavorite, {}, groupsWithBrand);
    expect(target).not.toBeNull();
    expect(target!.brand).toBe('HomeMade');
  });

  it('returns null when product has no preparations', () => {
    const fav: ApiFavorite = {
      ...productFavorite,
      item: {
        productID: 'p-noprep',
        preparationID: 'prep1',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const productsNoPrep: Record<string, ApiProduct> = {
      'p-noprep': { id: 'p-noprep', name: 'No Prep', preparations: [] },
    };
    expect(buildFavoriteLogTarget(fav, productsNoPrep, {})).toBeNull();
  });

  it('returns null for empty favorite', () => {
    expect(buildFavoriteLogTarget(emptyFavorite, {}, {})).toBeNull();
  });

  it('returns null when product not in lookup', () => {
    expect(buildFavoriteLogTarget(productFavorite, {}, {})).toBeNull();
  });

  it('returns null when group not in lookup', () => {
    expect(buildFavoriteLogTarget(groupFavorite, {}, {})).toBeNull();
  });

  it('returns "Group" for group with no name', () => {
    const fav: ApiFavorite = {
      ...groupFavorite,
      item: {
        groupID: 'g-noname',
        servingSize: { kind: 'servings', amount: 1 },
      },
    };
    const groupsNoName: Record<string, ProductGroupData> = {
      'g-noname': { id: 'g-noname', name: undefined!, items: [] },
    };
    const target = buildFavoriteLogTarget(fav, {}, groupsNoName);
    expect(target!.name).toBe('Group');
  });
});
