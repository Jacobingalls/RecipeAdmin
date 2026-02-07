import { NutritionUnit } from './NutritionUnit';
import { ServingSize } from './ServingSize';
import type { CustomSizeValue, ServingSizeData, ServingSizeType } from './ServingSize';

describe('ServingSize', () => {
  describe('static constructors', () => {
    it('servings() creates servings type with numeric value', () => {
      const ss = ServingSize.servings(2);
      expect(ss.type).toBe('servings');
      expect(ss.value).toBe(2);
    });

    it('mass() creates mass type with NutritionUnit value', () => {
      const ss = ServingSize.mass(100, 'g');
      expect(ss.type).toBe('mass');
      expect(ss.value).toBeInstanceOf(NutritionUnit);
      expect((ss.value as NutritionUnit).amount).toBe(100);
      expect((ss.value as NutritionUnit).unit).toBe('g');
    });

    it('volume() creates volume type with NutritionUnit value', () => {
      const ss = ServingSize.volume(250, 'mL');
      expect(ss.type).toBe('volume');
      expect((ss.value as NutritionUnit).amount).toBe(250);
      expect((ss.value as NutritionUnit).unit).toBe('mL');
    });

    it('energy() creates energy type with NutritionUnit value', () => {
      const ss = ServingSize.energy(200, 'kcal');
      expect(ss.type).toBe('energy');
      expect((ss.value as NutritionUnit).amount).toBe(200);
      expect((ss.value as NutritionUnit).unit).toBe('kcal');
    });

    it('customSize() creates customSize type with name and amount', () => {
      const ss = ServingSize.customSize('cookie', 3);
      expect(ss.type).toBe('customSize');
      const val = ss.value as CustomSizeValue;
      expect(val.name).toBe('cookie');
      expect(val.amount).toBe(3);
    });
  });

  describe('amount getter', () => {
    it('returns the number directly for servings', () => {
      expect(ServingSize.servings(2.5).amount).toBe(2.5);
    });

    it('returns the NutritionUnit amount for mass', () => {
      expect(ServingSize.mass(100, 'g').amount).toBe(100);
    });

    it('returns the NutritionUnit amount for volume', () => {
      expect(ServingSize.volume(250, 'mL').amount).toBe(250);
    });

    it('returns the NutritionUnit amount for energy', () => {
      expect(ServingSize.energy(200, 'kcal').amount).toBe(200);
    });

    it('returns the CustomSizeValue amount for customSize', () => {
      expect(ServingSize.customSize('cookie', 3).amount).toBe(3);
    });
  });

  describe('scaled', () => {
    it('scales servings by factor', () => {
      const ss = ServingSize.servings(2);
      const result = ss.scaled(3);
      expect(result.type).toBe('servings');
      expect(result.value).toBe(6);
    });

    it('scales mass by factor', () => {
      const ss = ServingSize.mass(100, 'g');
      const result = ss.scaled(2);
      expect(result.type).toBe('mass');
      expect((result.value as NutritionUnit).amount).toBe(200);
      expect((result.value as NutritionUnit).unit).toBe('g');
    });

    it('scales volume by factor', () => {
      const ss = ServingSize.volume(250, 'mL');
      const result = ss.scaled(0.5);
      expect((result.value as NutritionUnit).amount).toBe(125);
    });

    it('scales energy by factor', () => {
      const ss = ServingSize.energy(200, 'kcal');
      const result = ss.scaled(1.5);
      expect((result.value as NutritionUnit).amount).toBe(300);
    });

    it('scales customSize amount by factor', () => {
      const ss = ServingSize.customSize('cookie', 2);
      const result = ss.scaled(3);
      expect(result.type).toBe('customSize');
      const val = result.value as CustomSizeValue;
      expect(val.name).toBe('cookie');
      expect(val.amount).toBe(6);
    });
  });

  describe('fromObject', () => {
    it('returns null for null input', () => {
      expect(ServingSize.fromObject(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(ServingSize.fromObject(undefined)).toBeNull();
    });

    it('returns null when no kind or type field', () => {
      expect(ServingSize.fromObject({})).toBeNull();
    });

    it('parses servings kind', () => {
      const data: ServingSizeData = { kind: 'servings', amount: 2 };
      const result = ServingSize.fromObject(data);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('servings');
      expect(result!.value).toBe(2);
    });

    it('returns null for servings with non-number amount', () => {
      const data: ServingSizeData = {
        kind: 'servings',
        amount: { amount: 2, unit: 'g' },
      };
      expect(ServingSize.fromObject(data)).toBeNull();
    });

    it('parses mass kind', () => {
      const data: ServingSizeData = {
        kind: 'mass',
        amount: { amount: 100, unit: 'g' },
      };
      const result = ServingSize.fromObject(data);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('mass');
      expect((result!.value as NutritionUnit).amount).toBe(100);
    });

    it('parses volume kind', () => {
      const data: ServingSizeData = {
        kind: 'volume',
        amount: { amount: 250, unit: 'mL' },
      };
      const result = ServingSize.fromObject(data);
      expect(result!.type).toBe('volume');
    });

    it('parses energy kind', () => {
      const data: ServingSizeData = {
        kind: 'energy',
        amount: { amount: 200, unit: 'kcal' },
      };
      const result = ServingSize.fromObject(data);
      expect(result!.type).toBe('energy');
    });

    it('returns null for mass/volume/energy with non-object amount', () => {
      const data: ServingSizeData = { kind: 'mass', amount: 100 };
      expect(ServingSize.fromObject(data)).toBeNull();
    });

    it('parses customSize kind', () => {
      const data: ServingSizeData = {
        kind: 'customSize',
        name: 'cookie',
        amount: 3,
      };
      const result = ServingSize.fromObject(data);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('customSize');
      const val = result!.value as CustomSizeValue;
      expect(val.name).toBe('cookie');
      expect(val.amount).toBe(3);
    });

    it('returns null for customSize missing name', () => {
      const data: ServingSizeData = { kind: 'customSize', amount: 3 };
      expect(ServingSize.fromObject(data)).toBeNull();
    });

    it('returns null for customSize missing amount', () => {
      const data: ServingSizeData = { kind: 'customSize', name: 'cookie' };
      expect(ServingSize.fromObject(data)).toBeNull();
    });

    it('uses "type" field as fallback for "kind"', () => {
      const data: ServingSizeData = { type: 'servings', amount: 1 };
      const result = ServingSize.fromObject(data);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('servings');
    });

    it('uses "value" field as fallback for "amount"', () => {
      const data: ServingSizeData = { kind: 'servings', value: 5 };
      const result = ServingSize.fromObject(data);
      expect(result).not.toBeNull();
      expect(result!.value).toBe(5);
    });

    it('returns null for unknown kind', () => {
      const data = { kind: 'unknown' } as ServingSizeData;
      expect(ServingSize.fromObject(data)).toBeNull();
    });
  });

  describe('amount getter - default branch', () => {
    it('returns 0 for unknown type', () => {
      const ss = new ServingSize('unknown' as ServingSizeType, 0);
      expect(ss.amount).toBe(0);
    });
  });

  describe('scaled - default branch', () => {
    it('returns self for unknown type', () => {
      const ss = new ServingSize('unknown' as ServingSizeType, 42);
      const result = ss.scaled(2);
      expect(result).toBe(ss);
    });
  });

  describe('toObject', () => {
    it('serializes servings', () => {
      expect(ServingSize.servings(2).toObject()).toEqual({ kind: 'servings', amount: 2 });
    });

    it('serializes mass', () => {
      expect(ServingSize.mass(100, 'g').toObject()).toEqual({
        kind: 'mass',
        amount: { amount: 100, unit: 'g' },
      });
    });

    it('serializes volume', () => {
      expect(ServingSize.volume(250, 'mL').toObject()).toEqual({
        kind: 'volume',
        amount: { amount: 250, unit: 'mL' },
      });
    });

    it('serializes energy', () => {
      expect(ServingSize.energy(200, 'kcal').toObject()).toEqual({
        kind: 'energy',
        amount: { amount: 200, unit: 'kcal' },
      });
    });

    it('serializes customSize', () => {
      expect(ServingSize.customSize('cookie', 3).toObject()).toEqual({
        kind: 'customSize',
        name: 'cookie',
        amount: 3,
      });
    });

    it('returns empty object for unknown type', () => {
      const ss = new ServingSize('unknown' as ServingSizeType, 0);
      expect(ss.toObject()).toEqual({});
    });

    it('round-trips with fromObject for servings', () => {
      const original = ServingSize.servings(2);
      const restored = ServingSize.fromObject(original.toObject());
      expect(restored).not.toBeNull();
      expect(restored!.type).toBe(original.type);
      expect(restored!.value).toBe(original.value);
    });

    it('round-trips with fromObject for mass', () => {
      const original = ServingSize.mass(100, 'g');
      const restored = ServingSize.fromObject(original.toObject());
      expect(restored).not.toBeNull();
      expect(restored!.type).toBe('mass');
      expect((restored!.value as NutritionUnit).amount).toBe(100);
      expect((restored!.value as NutritionUnit).unit).toBe('g');
    });

    it('round-trips with fromObject for volume', () => {
      const original = ServingSize.volume(250, 'mL');
      const restored = ServingSize.fromObject(original.toObject());
      expect(restored).not.toBeNull();
      expect(restored!.type).toBe('volume');
      expect((restored!.value as NutritionUnit).amount).toBe(250);
    });

    it('round-trips with fromObject for energy', () => {
      const original = ServingSize.energy(200, 'kcal');
      const restored = ServingSize.fromObject(original.toObject());
      expect(restored).not.toBeNull();
      expect(restored!.type).toBe('energy');
      expect((restored!.value as NutritionUnit).amount).toBe(200);
    });

    it('round-trips with fromObject for customSize', () => {
      const original = ServingSize.customSize('cookie', 3);
      const restored = ServingSize.fromObject(original.toObject());
      expect(restored).not.toBeNull();
      expect(restored!.type).toBe('customSize');
      const val = restored!.value as CustomSizeValue;
      expect(val.name).toBe('cookie');
      expect(val.amount).toBe(3);
    });
  });

  describe('toString', () => {
    it('formats singular serving', () => {
      expect(ServingSize.servings(1).toString()).toBe('1 serving');
    });

    it('formats plural servings', () => {
      expect(ServingSize.servings(2).toString()).toBe('2 servings');
    });

    it('formats fractional servings as plural', () => {
      expect(ServingSize.servings(0.5).toString()).toBe('0.5 servings');
    });

    it('formats mass', () => {
      expect(ServingSize.mass(100, 'g').toString()).toBe('100g');
    });

    it('formats volume', () => {
      expect(ServingSize.volume(250, 'mL').toString()).toBe('250mL');
    });

    it('formats energy', () => {
      expect(ServingSize.energy(200, 'kcal').toString()).toBe('200kcal');
    });

    it('formats singular customSize', () => {
      expect(ServingSize.customSize('cookie', 1).toString()).toBe('1 cookie');
    });

    it('formats plural customSize', () => {
      expect(ServingSize.customSize('cookie', 3).toString()).toBe('3 cookies');
    });

    it('returns empty string for unknown type', () => {
      const ss = new ServingSize('unknown' as ServingSizeType, 0);
      expect(ss.toString()).toBe('');
    });
  });
});
