import { describe, expect, it } from 'vitest';

import { Preparation, ProductGroup } from '../domain';

import { buildDeclaration, referenceIntakeEnergy } from './europeanDeclaration';

/** A 42 g bar, so per-100 g figures are the serving scaled by 100/42. */
function bar(overrides: Record<string, unknown> = {}) {
  return new Preparation({
    name: 'One bar',
    mass: { amount: 42, unit: 'g' },
    nutritionalInformation: {
      calories: { amount: 250, unit: 'kcal' },
      totalFat: { amount: 10, unit: 'g' },
      saturatedFat: { amount: 1.5, unit: 'g' },
      transFat: { amount: 0, unit: 'g' },
      cholesterol: { amount: 5, unit: 'mg' },
      sodium: { amount: 160, unit: 'mg' },
      totalCarbohydrate: { amount: 35, unit: 'g' },
      totalSugars: { amount: 12, unit: 'g' },
      dietaryFiber: { amount: 3, unit: 'g' },
      protein: { amount: 5, unit: 'g' },
      calcium: { amount: 40, unit: 'mg' },
      ...overrides,
    },
  });
}

function rowFor(declaration: ReturnType<typeof buildDeclaration>, labelKey: string) {
  return declaration.rows.find((row) => row.labelKey === labelKey);
}

describe('buildDeclaration', () => {
  it('leads with the per-100 g column, then the serving', () => {
    const prep = bar();
    const declaration = buildDeclaration(prep.nutritionalInformation, prep);

    expect(declaration.perHundred).toEqual(expect.objectContaining({ amount: 100, unit: 'g' }));
    expect(rowFor(declaration, 'euLabel.fat')?.amounts).toEqual(['23.8 g', '10 g']);
  });

  it('declares energy in both units the regulation requires', () => {
    const prep = bar();
    const declaration = buildDeclaration(prep.nutritionalInformation, prep);

    const [per100, perServing] = declaration.energy;
    expect(perServing).toEqual({ kilocalories: 250, kilojoules: 1046 });
    expect(per100?.kilocalories).toBeCloseTo(595.2, 1);
  });

  it('reports salt rather than sodium, at 2.5x the sodium', () => {
    const prep = bar();
    const declaration = buildDeclaration(prep.nutritionalInformation, prep);

    // 160 mg sodium x 2.5 = 400 mg salt = 0.4 g
    expect(rowFor(declaration, 'euLabel.salt')?.amounts[1]).toBe('0.4 g');
    expect(rowFor(declaration, 'euLabel.salt')?.referenceIntake).toBe('7%');
  });

  it.each([
    ['euLabel.saturates', '8%'],
    ['euLabel.sugars', '13%'],
    ['euLabel.protein', '10%'],
  ])('rates %s against the adult reference intake', (labelKey, percent) => {
    const prep = bar();
    const declaration = buildDeclaration(prep.nutritionalInformation, prep);
    expect(rowFor(declaration, labelKey)?.referenceIntake).toBe(percent);
  });

  it('rates fat against the EU intake of 70 g, not the FDA value of 78 g', () => {
    const prep = bar();
    const declaration = buildDeclaration(prep.nutritionalInformation, prep);
    expect(rowFor(declaration, 'euLabel.fat')?.referenceIntake).toBe('14%');
  });

  it('leaves out trans fat and cholesterol, which a European label may not declare', () => {
    const prep = bar();
    const declaration = buildDeclaration(prep.nutritionalInformation, prep);

    const labels = declaration.rows.map((row) => row.labelKey);
    expect(labels).not.toContain('nutritionLabel.transFat');
    expect(labels).not.toContain('nutritionLabel.cholesterol');
  });

  it('orders the declaration the way Annex XV fixes', () => {
    const prep = bar();
    const declaration = buildDeclaration(prep.nutritionalInformation, prep);

    expect(declaration.rows.map((row) => row.labelKey)).toEqual([
      'euLabel.fat',
      'euLabel.saturates',
      'euLabel.carbohydrate',
      'euLabel.sugars',
      'euLabel.fibre',
      'euLabel.protein',
      'euLabel.salt',
    ]);
  });

  it('skips nutrients the product carries no figure for', () => {
    const prep = new Preparation({
      mass: { amount: 42, unit: 'g' },
      nutritionalInformation: { calories: { amount: 250, unit: 'kcal' } },
    });
    const declaration = buildDeclaration(prep.nutritionalInformation, prep);
    expect(declaration.rows).toEqual([]);
  });

  describe('vitamins and minerals', () => {
    function labels(declaration: ReturnType<typeof buildDeclaration>) {
      return declaration.micronutrients.map((row) => row.labelKey);
    }

    it('rates them against the EU reference value, not the FDA one', () => {
      const prep = bar({ calcium: { amount: 200, unit: 'mg' } });
      const declaration = buildDeclaration(prep.nutritionalInformation, prep);

      const calcium = declaration.micronutrients.find(
        (row) => row.labelKey === 'nutritionLabel.calcium',
      );
      // 200 mg against an 800 mg NRV; the FDA daily value of 1300 mg would give 15%.
      expect(calcium?.referenceIntake).toBe('25%');
    });

    it('names every nutrient the product carries, however little of it', () => {
      // A pack may not name calcium at this level, but someone entered the figure and it shows.
      const prep = bar({ calcium: { amount: 1, unit: 'mg' } });
      const declaration = buildDeclaration(prep.nutritionalInformation, prep);

      expect(labels(declaration)).toContain('nutritionLabel.calcium');
      expect(
        declaration.micronutrients.find((row) => row.labelKey === 'nutritionLabel.calcium')
          ?.referenceIntake,
      ).toBe('0%');
    });

    it('names a nutrient in a portion-only product too', () => {
      const prep = new Preparation({
        nutritionalInformation: {
          calories: { amount: 250, unit: 'kcal' },
          iron: { amount: 4, unit: 'mg' },
        },
      });
      // 4 mg is 29% of the 14 mg NRV.
      expect(labels(buildDeclaration(prep.nutritionalInformation, prep))).toContain(
        'nutritionLabel.iron',
      );
    });
  });

  it('declares per 100 ml for something measured only by volume', () => {
    const drink = new Preparation({
      volume: { amount: 250, unit: 'mL' },
      nutritionalInformation: {
        calories: { amount: 105, unit: 'kcal' },
        totalSugars: { amount: 26, unit: 'g' },
      },
    });
    const declaration = buildDeclaration(drink.nutritionalInformation, drink);

    expect(declaration.perHundred?.unit).toBe('mL');
    expect(rowFor(declaration, 'euLabel.sugars')?.amounts).toEqual(['10.4 g', '26 g']);
  });

  it('falls back to the serving alone when there is nothing to declare per 100 against', () => {
    const prep = new Preparation({
      nutritionalInformation: {
        calories: { amount: 250, unit: 'kcal' },
        protein: { amount: 5, unit: 'g' },
      },
    });
    const declaration = buildDeclaration(prep.nutritionalInformation, prep);

    expect(declaration.perHundred).toBeNull();
    expect(rowFor(declaration, 'euLabel.protein')?.amounts).toEqual(['5 g']);
  });

  it('works for a group, which resolves its serving differently from a preparation', () => {
    const group = new ProductGroup({
      mass: { amount: 200, unit: 'g' },
      items: [
        {
          product: {
            preparations: [
              {
                id: 'p',
                mass: { amount: 200, unit: 'g' },
                nutritionalInformation: {
                  calories: { amount: 300, unit: 'kcal' },
                  protein: { amount: 20, unit: 'g' },
                },
              },
            ],
          },
        },
      ],
    });
    const declaration = buildDeclaration(group.oneServing.nutrition, group);

    expect(declaration.perHundred?.unit).toBe('g');
    expect(rowFor(declaration, 'euLabel.protein')?.amounts).toEqual(['10 g', '20 g']);
  });
});

describe('referenceIntakeEnergy', () => {
  it('states the intake the way the regulation rounds it', () => {
    expect(referenceIntakeEnergy()).toEqual({ kilojoules: 8400, kilocalories: 2000 });
  });
});
