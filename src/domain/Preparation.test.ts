import { Preparation } from './Preparation';
import type { PreparationData } from './Preparation';
import { ServingSize } from './ServingSize';

describe('Preparation', () => {
  const fullData: PreparationData = {
    id: 'prep-1',
    name: 'Baked',
    nutritionalInformation: {
      calories: { amount: 200, unit: 'kcal' },
      totalFat: { amount: 10, unit: 'g' },
      protein: { amount: 8, unit: 'g' },
    },
    mass: { amount: 28, unit: 'g' },
    volume: { amount: 30, unit: 'mL' },
    customSizes: [
      { name: 'cookie', servingSize: { kind: 'servings', amount: 0.5 } },
      { name: 'box', servings: 12 },
    ],
    servingSizeDescription: '1 cookie (28g)',
    notes: ['Per serving basis'],
  };

  describe('constructor', () => {
    it('populates all fields from data', () => {
      const prep = new Preparation(fullData);
      expect(prep.id).toBe('prep-1');
      expect(prep.name).toBe('Baked');
      expect(prep.nutritionalInformation.calories!.amount).toBe(200);
      expect(prep.mass!.amount).toBe(28);
      expect(prep.mass!.unit).toBe('g');
      expect(prep.volume!.amount).toBe(30);
      expect(prep.volume!.unit).toBe('mL');
      expect(prep.customSizes).toHaveLength(2);
      expect(prep.customSizes[0].name).toBe('cookie');
      expect(prep.servingSizeDescription).toBe('1 cookie (28g)');
      expect(prep.notes).toEqual(['Per serving basis']);
    });

    it('defaults name to "Default"', () => {
      const prep = new Preparation();
      expect(prep.name).toBe('Default');
    });

    it('defaults mass and volume to null', () => {
      const prep = new Preparation();
      expect(prep.mass).toBeNull();
      expect(prep.volume).toBeNull();
    });

    it('defaults to empty arrays', () => {
      const prep = new Preparation();
      expect(prep.customSizes).toEqual([]);
      expect(prep.notes).toEqual([]);
    });

    it('defaults servingSizeDescription to null', () => {
      const prep = new Preparation();
      expect(prep.servingSizeDescription).toBeNull();
    });
  });

  describe('scalar', () => {
    it('returns the count for servings type', () => {
      const prep = new Preparation(fullData);
      expect(prep.scalar(ServingSize.servings(2))).toBe(2);
      expect(prep.scalar(ServingSize.servings(0.5))).toBe(0.5);
    });

    it('calculates scalar from mass', () => {
      const prep = new Preparation(fullData);
      // 56g requested / 28g per serving = 2 servings
      expect(prep.scalar(ServingSize.mass(56, 'g'))).toBeCloseTo(2);
    });

    it('converts mass units before calculating scalar', () => {
      const prep = new Preparation(fullData);
      // 0.028kg = 28g = 1 serving
      expect(prep.scalar(ServingSize.mass(0.028, 'kg'))).toBeCloseTo(1);
    });

    it('calculates scalar from volume', () => {
      const prep = new Preparation(fullData);
      // 60mL requested / 30mL per serving = 2 servings
      expect(prep.scalar(ServingSize.volume(60, 'mL'))).toBeCloseTo(2);
    });

    it('calculates scalar from energy', () => {
      const prep = new Preparation(fullData);
      // 400kcal requested / 200kcal per serving = 2 servings
      expect(prep.scalar(ServingSize.energy(400, 'kcal'))).toBeCloseTo(2);
    });

    it('calculates scalar from energy with unit conversion', () => {
      const prep = new Preparation(fullData);
      // 200kcal = 836.8kJ; 836.8kJ / 836.8kJ per serving = 1
      expect(prep.scalar(ServingSize.energy(836.8, 'kJ'))).toBeCloseTo(1);
    });

    it('calculates scalar from customSize', () => {
      const prep = new Preparation(fullData);
      // "cookie" = 0.5 servings, requesting 2 cookies = 1 serving
      expect(prep.scalar(ServingSize.customSize('cookie', 2))).toBeCloseTo(1);
    });

    it('calculates scalar from customSize with servings shorthand', () => {
      const prep = new Preparation(fullData);
      // "box" = 12 servings, requesting 1 box = 12 servings
      expect(prep.scalar(ServingSize.customSize('box', 1))).toBeCloseTo(12);
    });

    it('throws when mass is not defined and requesting by mass', () => {
      const prep = new Preparation({ nutritionalInformation: {} });
      expect(() => prep.scalar(ServingSize.mass(100, 'g'))).toThrow(
        'Cannot calculate serving by mass',
      );
    });

    it('throws when volume is not defined and requesting by volume', () => {
      const prep = new Preparation({ nutritionalInformation: {} });
      expect(() => prep.scalar(ServingSize.volume(100, 'mL'))).toThrow(
        'Cannot calculate serving by volume',
      );
    });

    it('throws when calories are not defined and requesting by energy', () => {
      const prep = new Preparation({ nutritionalInformation: {} });
      expect(() => prep.scalar(ServingSize.energy(100, 'kcal'))).toThrow(
        'Cannot calculate serving by energy',
      );
    });

    it('throws for unknown custom size name', () => {
      const prep = new Preparation(fullData);
      expect(() => prep.scalar(ServingSize.customSize('nonexistent', 1))).toThrow(
        'Unknown custom size: nonexistent',
      );
    });
  });

  describe('nutritionalInformationFor', () => {
    it('returns scaled nutrition for the given serving size', () => {
      const prep = new Preparation(fullData);
      const result = prep.nutritionalInformationFor(ServingSize.servings(2));
      expect(result.calories!.amount).toBe(400);
      expect(result.totalFat!.amount).toBe(20);
      expect(result.protein!.amount).toBe(16);
    });

    it('returns scaled nutrition for mass-based serving size', () => {
      const prep = new Preparation(fullData);
      // 56g = 2 servings
      const result = prep.nutritionalInformationFor(ServingSize.mass(56, 'g'));
      expect(result.calories!.amount).toBeCloseTo(400);
    });
  });

  describe('nutritionalInformationForServings', () => {
    it('is a convenience wrapper for nutritionalInformationFor with servings', () => {
      const prep = new Preparation(fullData);
      const a = prep.nutritionalInformationForServings(3);
      const b = prep.nutritionalInformationFor(ServingSize.servings(3));
      expect(a.calories!.amount).toBe(b.calories!.amount);
      expect(a.totalFat!.amount).toBe(b.totalFat!.amount);
    });
  });
});
