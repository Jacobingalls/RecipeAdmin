import { CustomSize } from './CustomSize';
import type { CustomSizeData } from './CustomSize';
import type { NutritionUnit } from './NutritionUnit';

describe('CustomSize', () => {
  describe('constructor', () => {
    it('populates all fields from data', () => {
      const data: CustomSizeData = {
        id: 'cs-1',
        name: 'cookie',
        singularName: 'cookie',
        pluralName: 'cookies',
        notes: ['about 30g each'],
        servingSize: { kind: 'servings', amount: 0.5 },
      };
      const cs = new CustomSize(data);
      expect(cs.id).toBe('cs-1');
      expect(cs.name).toBe('cookie');
      expect(cs.singularName).toBe('cookie');
      expect(cs.pluralName).toBe('cookies');
      expect(cs.notes).toEqual(['about 30g each']);
      expect(cs.servingSize.type).toBe('servings');
      expect(cs.servingSize.value).toBe(0.5);
    });

    it('defaults to empty strings and arrays', () => {
      const cs = new CustomSize();
      expect(cs.id).toBeUndefined();
      expect(cs.name).toBe('');
      expect(cs.singularName).toBe('');
      expect(cs.pluralName).toBe('');
      expect(cs.notes).toEqual([]);
    });

    it('defaults servingSize to 1 serving when no data provided', () => {
      const cs = new CustomSize();
      expect(cs.servingSize.type).toBe('servings');
      expect(cs.servingSize.value).toBe(1);
    });

    it('uses servings shorthand when servings field is provided', () => {
      const cs = new CustomSize({ servings: 2 });
      expect(cs.servingSize.type).toBe('servings');
      expect(cs.servingSize.value).toBe(2);
    });

    it('prefers servingSize over servings shorthand', () => {
      const cs = new CustomSize({
        servingSize: { kind: 'servings', amount: 3 },
        servings: 5,
      });
      expect(cs.servingSize.value).toBe(3);
    });

    it('handles mass-based servingSize', () => {
      const cs = new CustomSize({
        servingSize: { kind: 'mass', amount: { amount: 30, unit: 'g' } },
      });
      expect(cs.servingSize.type).toBe('mass');
      expect((cs.servingSize.value as NutritionUnit).amount).toBe(30);
    });

    it('falls back to 1 serving for invalid servingSize data', () => {
      const cs = new CustomSize({
        servingSize: {
          kind: 'mass',
          amount: 'invalid',
        } as unknown as CustomSizeData['servingSize'],
      });
      expect(cs.servingSize.type).toBe('servings');
      expect(cs.servingSize.value).toBe(1);
    });
  });

  describe('description', () => {
    it('returns formatted servings description', () => {
      const cs = new CustomSize({
        servingSize: { kind: 'servings', amount: 0.5 },
      });
      expect(cs.description).toBe('0.5 servings');
    });

    it('returns singular serving description', () => {
      const cs = new CustomSize({
        servingSize: { kind: 'servings', amount: 1 },
      });
      expect(cs.description).toBe('1 serving');
    });

    it('returns formatted mass description', () => {
      const cs = new CustomSize({
        servingSize: { kind: 'mass', amount: { amount: 30, unit: 'g' } },
      });
      expect(cs.description).toBe('30g');
    });

    it('returns formatted volume description', () => {
      const cs = new CustomSize({
        servingSize: { kind: 'volume', amount: { amount: 240, unit: 'mL' } },
      });
      expect(cs.description).toBe('240mL');
    });

    it('returns formatted energy description', () => {
      const cs = new CustomSize({
        servingSize: { kind: 'energy', amount: { amount: 100, unit: 'kcal' } },
      });
      expect(cs.description).toBe('100kcal');
    });

    it('returns null for customSize type (no nested description)', () => {
      const cs = new CustomSize({
        servingSize: { kind: 'customSize', name: 'slice', amount: 2 },
      });
      expect(cs.description).toBeNull();
    });
  });
});
