import { ProductGroup } from './ProductGroup';
import type { ProductGroupData } from './ProductGroup';
import { ServingSize } from './ServingSize';
import type { PreparationData } from './Preparation';

const makePrepData = (overrides: Partial<PreparationData> = {}): PreparationData => ({
  nutritionalInformation: {
    calories: { amount: 100, unit: 'kcal' },
    totalFat: { amount: 5, unit: 'g' },
    protein: { amount: 3, unit: 'g' },
  },
  mass: { amount: 50, unit: 'g' },
  volume: { amount: 100, unit: 'mL' },
  ...overrides,
});

describe('ProductGroup', () => {
  describe('constructor', () => {
    it('populates all fields from data', () => {
      const data: ProductGroupData = {
        id: 'grp-1',
        name: 'Trail Mix',
        items: [],
        mass: { amount: 40, unit: 'g' },
        volume: { amount: 60, unit: 'mL' },
        customSizes: [{ name: 'bag', servings: 3 }],
        barcodes: [{ code: '12345' }, { code: '67890' }],
      };
      const group = new ProductGroup(data);
      expect(group.id).toBe('grp-1');
      expect(group.name).toBe('Trail Mix');
      expect(group.items).toEqual([]);
      expect(group.mass!.amount).toBe(40);
      expect(group.volume!.amount).toBe(60);
      expect(group.customSizes).toHaveLength(1);
      expect(group.barcodes).toEqual([{ code: '12345' }, { code: '67890' }]);
    });

    it('defaults to empty/null values', () => {
      const group = new ProductGroup();
      expect(group.id).toBeUndefined();
      expect(group.name).toBeUndefined();
      expect(group.items).toEqual([]);
      expect(group.mass).toBeNull();
      expect(group.volume).toBeNull();
      expect(group.customSizes).toEqual([]);
      expect(group.barcodes).toEqual([]);
    });
  });

  describe('getItemServing', () => {
    it('calculates serving for a product item with default serving', () => {
      const item = {
        product: { preparations: [makePrepData()] },
      };
      const result = ProductGroup.getItemServing(item);
      expect(result).not.toBeNull();
      expect(result!.nutrition.calories!.amount).toBe(100);
      expect(result!.mass!.amount).toBe(50);
      expect(result!.volume!.amount).toBe(100);
    });

    it('uses item servingSize to scale the product serving', () => {
      const item = {
        servingSize: { kind: 'servings', amount: 2 },
        product: { preparations: [makePrepData()] },
      };
      const result = ProductGroup.getItemServing(item);
      expect(result).not.toBeNull();
      expect(result!.nutrition.calories!.amount).toBe(200);
      expect(result!.mass!.amount).toBe(100);
    });

    it('selects the preparation matching preparationID', () => {
      const item = {
        preparationID: 'p2',
        product: {
          preparations: [
            makePrepData({
              id: 'p1',
              nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
            }),
            makePrepData({
              id: 'p2',
              nutritionalInformation: { calories: { amount: 250, unit: 'kcal' } },
            }),
          ],
        },
      };
      const result = ProductGroup.getItemServing(item);
      expect(result!.nutrition.calories!.amount).toBe(250);
    });

    it('falls back to first preparation when preparationID not found', () => {
      const item = {
        preparationID: 'nonexistent',
        product: {
          preparations: [
            makePrepData({
              id: 'p1',
              nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
            }),
          ],
        },
      };
      const result = ProductGroup.getItemServing(item);
      expect(result!.nutrition.calories!.amount).toBe(100);
    });

    it('returns null for product with no preparations', () => {
      const item = { product: { preparations: [] } };
      expect(ProductGroup.getItemServing(item)).toBeNull();
    });

    it('returns null for an empty item', () => {
      expect(ProductGroup.getItemServing({})).toBeNull();
    });

    it('calculates serving for a group item', () => {
      const item = {
        group: {
          items: [{ product: { preparations: [makePrepData()] } }],
        },
      };
      const result = ProductGroup.getItemServing(item);
      expect(result).not.toBeNull();
      expect(result!.nutrition.calories!.amount).toBe(100);
    });

    it('falls back to oneServing when group item serving calculation throws', () => {
      // Nested group with mass-based servingSize but the inner group has no mass
      const item = {
        servingSize: { kind: 'mass', amount: { amount: 100, unit: 'g' } },
        group: {
          items: [
            {
              product: {
                preparations: [
                  makePrepData({
                    mass: null,
                    nutritionalInformation: { calories: { amount: 75, unit: 'kcal' } },
                  }),
                ],
              },
            },
          ],
        },
      };
      const result = ProductGroup.getItemServing(item);
      expect(result).not.toBeNull();
      // Falls back to oneServing (unscaled)
      expect(result!.nutrition.calories!.amount).toBe(75);
    });

    it('falls back to unscaled serving when scalar throws for product item', () => {
      // Mass-based servingSize but product has no mass
      const item = {
        servingSize: { kind: 'mass', amount: { amount: 100, unit: 'g' } },
        product: {
          preparations: [
            makePrepData({
              mass: null,
              nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
            }),
          ],
        },
      };
      const result = ProductGroup.getItemServing(item);
      expect(result).not.toBeNull();
      // Falls back to unscaled (1 serving) nutrition
      expect(result!.nutrition.calories!.amount).toBe(150);
    });
  });

  describe('oneServing', () => {
    it('sums nutrition from all items', () => {
      const group = new ProductGroup({
        items: [
          { product: { preparations: [makePrepData()] } },
          {
            product: {
              preparations: [
                makePrepData({
                  nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
                }),
              ],
            },
          },
        ],
      });
      const { nutrition } = group.oneServing;
      expect(nutrition.calories!.amount).toBe(250);
    });

    it('sums mass from items when all have mass', () => {
      const group = new ProductGroup({
        items: [
          { product: { preparations: [makePrepData({ mass: { amount: 30, unit: 'g' } })] } },
          { product: { preparations: [makePrepData({ mass: { amount: 20, unit: 'g' } })] } },
        ],
      });
      expect(group.oneServing.mass!.amount).toBe(50);
    });

    it('returns null mass when not all items have mass', () => {
      const group = new ProductGroup({
        items: [
          { product: { preparations: [makePrepData({ mass: { amount: 30, unit: 'g' } })] } },
          {
            product: {
              preparations: [
                makePrepData({
                  mass: null,
                  nutritionalInformation: { calories: { amount: 50, unit: 'kcal' } },
                }),
              ],
            },
          },
        ],
      });
      expect(group.oneServing.mass).toBeNull();
    });

    it('uses explicit mass over summed mass', () => {
      const group = new ProductGroup({
        mass: { amount: 100, unit: 'g' },
        items: [{ product: { preparations: [makePrepData({ mass: { amount: 30, unit: 'g' } })] } }],
      });
      expect(group.oneServing.mass!.amount).toBe(100);
    });

    it('sums volume from items when all have volume', () => {
      const group = new ProductGroup({
        items: [
          { product: { preparations: [makePrepData({ volume: { amount: 100, unit: 'mL' } })] } },
          { product: { preparations: [makePrepData({ volume: { amount: 50, unit: 'mL' } })] } },
        ],
      });
      expect(group.oneServing.volume!.amount).toBe(150);
    });

    it('uses explicit volume over summed volume', () => {
      const group = new ProductGroup({
        volume: { amount: 200, unit: 'mL' },
        items: [
          { product: { preparations: [makePrepData({ volume: { amount: 100, unit: 'mL' } })] } },
        ],
      });
      expect(group.oneServing.volume!.amount).toBe(200);
    });

    it('returns zero nutrition with no items', () => {
      const group = new ProductGroup({ items: [] });
      const { nutrition } = group.oneServing;
      expect(nutrition.calories!.amount).toBe(0);
    });
  });

  describe('scalar', () => {
    const groupData: ProductGroupData = {
      mass: { amount: 50, unit: 'g' },
      volume: { amount: 100, unit: 'mL' },
      customSizes: [{ name: 'handful', servings: 0.5 }],
      items: [
        {
          product: {
            preparations: [
              makePrepData({
                nutritionalInformation: { calories: { amount: 200, unit: 'kcal' } },
              }),
            ],
          },
        },
      ],
    };

    it('returns count for servings type', () => {
      const group = new ProductGroup(groupData);
      expect(group.scalar(ServingSize.servings(3))).toBe(3);
    });

    it('calculates scalar from mass', () => {
      const group = new ProductGroup(groupData);
      // 100g / 50g per serving = 2
      expect(group.scalar(ServingSize.mass(100, 'g'))).toBeCloseTo(2);
    });

    it('calculates scalar from volume', () => {
      const group = new ProductGroup(groupData);
      // 250mL / 100mL per serving = 2.5
      expect(group.scalar(ServingSize.volume(250, 'mL'))).toBeCloseTo(2.5);
    });

    it('calculates scalar from energy', () => {
      const group = new ProductGroup(groupData);
      // 400kcal / 200kcal per serving = 2
      expect(group.scalar(ServingSize.energy(400, 'kcal'))).toBeCloseTo(2);
    });

    it('calculates scalar from customSize', () => {
      const group = new ProductGroup(groupData);
      // "handful" = 0.5 servings, requesting 2 = 1 serving
      expect(group.scalar(ServingSize.customSize('handful', 2))).toBeCloseTo(1);
    });

    it('throws when mass is not available and requesting by mass', () => {
      const group = new ProductGroup({
        items: [
          {
            product: {
              preparations: [
                makePrepData({
                  mass: null,
                  nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
                }),
              ],
            },
          },
        ],
      });
      expect(() => group.scalar(ServingSize.mass(100, 'g'))).toThrow(
        'Cannot calculate serving by mass',
      );
    });

    it('throws when volume is not available and requesting by volume', () => {
      const group = new ProductGroup({
        items: [
          {
            product: {
              preparations: [
                makePrepData({
                  volume: null,
                  nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
                }),
              ],
            },
          },
        ],
      });
      expect(() => group.scalar(ServingSize.volume(100, 'mL'))).toThrow(
        'Cannot calculate serving by volume',
      );
    });

    it('throws for unknown custom size', () => {
      const group = new ProductGroup(groupData);
      expect(() => group.scalar(ServingSize.customSize('nonexistent', 1))).toThrow(
        'Unknown custom size: nonexistent',
      );
    });

    it('throws for unknown serving size type', () => {
      const group = new ProductGroup(groupData);
      const unknownSS = new ServingSize('unknown' as never, 1);
      expect(() => group.scalar(unknownSS)).toThrow('Unknown serving size type');
    });
  });

  describe('serving', () => {
    it('returns scaled nutrition, mass, volume, and servings count', () => {
      const group = new ProductGroup({
        mass: { amount: 50, unit: 'g' },
        volume: { amount: 100, unit: 'mL' },
        items: [
          {
            product: {
              preparations: [
                makePrepData({
                  nutritionalInformation: {
                    calories: { amount: 200, unit: 'kcal' },
                    protein: { amount: 10, unit: 'g' },
                  },
                }),
              ],
            },
          },
        ],
      });

      const result = group.serving(ServingSize.servings(2));
      expect(result.nutrition.calories!.amount).toBe(400);
      expect(result.nutrition.protein!.amount).toBe(20);
      expect(result.mass!.amount).toBe(100);
      expect(result.volume!.amount).toBe(200);
      expect(result.servings).toBe(2);
    });

    it('returns null mass/volume when group has none', () => {
      const group = new ProductGroup({
        items: [
          {
            product: {
              preparations: [
                makePrepData({
                  mass: null,
                  volume: null,
                  nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
                }),
              ],
            },
          },
        ],
      });

      const result = group.serving(ServingSize.servings(1));
      expect(result.mass).toBeNull();
      expect(result.volume).toBeNull();
    });
  });
});
