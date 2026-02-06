import { NutritionUnit } from './NutritionUnit';
import type { NutritionUnitData } from './NutritionUnit';

describe('NutritionUnit', () => {
  describe('constructor', () => {
    it('sets amount and unit', () => {
      const nu = new NutritionUnit(100, 'g');
      expect(nu.amount).toBe(100);
      expect(nu.unit).toBe('g');
    });
  });

  describe('converted', () => {
    it('returns a copy when converting to the same unit', () => {
      const nu = new NutritionUnit(100, 'g');
      const result = nu.converted('g');
      expect(result.amount).toBe(100);
      expect(result.unit).toBe('g');
      expect(result).not.toBe(nu);
    });

    it('converts between mass units', () => {
      const nu = new NutritionUnit(1000, 'g');
      const result = nu.converted('kg');
      expect(result.amount).toBeCloseTo(1);
      expect(result.unit).toBe('kg');
    });

    it('converts between volume units', () => {
      const nu = new NutritionUnit(1000, 'mL');
      const result = nu.converted('L');
      expect(result.amount).toBeCloseTo(1);
      expect(result.unit).toBe('L');
    });

    it('converts energy: kcal to kJ', () => {
      const nu = new NutritionUnit(100, 'kcal');
      const result = nu.converted('kJ');
      expect(result.amount).toBeCloseTo(418.4);
      expect(result.unit).toBe('kJ');
    });

    it('converts energy: kJ to kcal', () => {
      const nu = new NutritionUnit(418.4, 'kJ');
      const result = nu.converted('kcal');
      expect(result.amount).toBeCloseTo(100);
      expect(result.unit).toBe('kcal');
    });

    it('converts energy: cal to kcal', () => {
      const nu = new NutritionUnit(1000, 'cal');
      const result = nu.converted('kcal');
      expect(result.amount).toBeCloseTo(1);
    });

    it('converts energy: Wh to kJ', () => {
      const nu = new NutritionUnit(1, 'Wh');
      const result = nu.converted('kJ');
      expect(result.amount).toBeCloseTo(3.6);
    });

    it('converts RecipeKit unit names via UNIT_TO_CONVERT mapping', () => {
      // "fl oz (US)" should map to "fl oz" in the convert library
      const nu = new NutritionUnit(1, 'fl oz (US)');
      const result = nu.converted('mL');
      expect(result.amount).toBeCloseTo(29.5735, 1);
      expect(result.unit).toBe('mL');
    });

    it('converts cup (US) to mL', () => {
      const nu = new NutritionUnit(1, 'cup (US)');
      const result = nu.converted('mL');
      expect(result.amount).toBeCloseTo(236.588, 0);
    });

    it('converts μg to mg', () => {
      const nu = new NutritionUnit(1000, 'μg');
      const result = nu.converted('mg');
      expect(result.amount).toBeCloseTo(1);
    });

    it('converts mcg to mg', () => {
      const nu = new NutritionUnit(1000, 'mcg');
      const result = nu.converted('mg');
      expect(result.amount).toBeCloseTo(1);
    });

    it('handles double-space typo in "tbsp  (US)"', () => {
      const nu = new NutritionUnit(1, 'tbsp  (US)');
      const result = nu.converted('mL');
      expect(result.amount).toBeCloseTo(14.787, 0);
    });
  });

  describe('scaled', () => {
    it('multiplies amount by factor', () => {
      const nu = new NutritionUnit(100, 'g');
      const result = nu.scaled(2.5);
      expect(result.amount).toBe(250);
      expect(result.unit).toBe('g');
    });

    it('returns a new instance', () => {
      const nu = new NutritionUnit(100, 'g');
      const result = nu.scaled(1);
      expect(result).not.toBe(nu);
    });

    it('handles zero factor', () => {
      const nu = new NutritionUnit(100, 'g');
      const result = nu.scaled(0);
      expect(result.amount).toBe(0);
    });
  });

  describe('add', () => {
    it('adds amounts with the same unit', () => {
      const a = new NutritionUnit(100, 'g');
      const b = new NutritionUnit(50, 'g');
      const result = a.add(b);
      expect(result.amount).toBe(150);
      expect(result.unit).toBe('g');
    });

    it('converts other to the same unit before adding', () => {
      const a = new NutritionUnit(1, 'kg');
      const b = new NutritionUnit(500, 'g');
      const result = a.add(b);
      expect(result.amount).toBeCloseTo(1.5);
      expect(result.unit).toBe('kg');
    });

    it('adds energy units with conversion', () => {
      const a = new NutritionUnit(100, 'kcal');
      const b = new NutritionUnit(418.4, 'kJ');
      const result = a.add(b);
      expect(result.amount).toBeCloseTo(200);
      expect(result.unit).toBe('kcal');
    });
  });

  describe('toString', () => {
    it('formats amount and unit', () => {
      const nu = new NutritionUnit(100, 'g');
      expect(nu.toString()).toBe('100g');
    });

    it('handles decimal amounts', () => {
      const nu = new NutritionUnit(2.5, 'mg');
      expect(nu.toString()).toBe('2.5mg');
    });
  });

  describe('fromObject', () => {
    it('creates a NutritionUnit from valid data', () => {
      const data: NutritionUnitData = { amount: 100, unit: 'g' };
      const result = NutritionUnit.fromObject(data);
      expect(result).toBeInstanceOf(NutritionUnit);
      expect(result!.amount).toBe(100);
      expect(result!.unit).toBe('g');
    });

    it('returns null for null input', () => {
      expect(NutritionUnit.fromObject(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(NutritionUnit.fromObject(undefined)).toBeNull();
    });
  });
});
