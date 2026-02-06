import { NutritionInformation } from './NutritionInformation';
import type { NutritionInformationData } from './NutritionInformation';
import { NutritionUnit } from './NutritionUnit';

describe('NutritionInformation', () => {
  const sampleData: NutritionInformationData = {
    calories: { amount: 200, unit: 'kcal' },
    totalFat: { amount: 10, unit: 'g' },
    saturatedFat: { amount: 3, unit: 'g' },
    transFat: { amount: 0, unit: 'g' },
    cholesterol: { amount: 30, unit: 'mg' },
    sodium: { amount: 400, unit: 'mg' },
    totalCarbohydrate: { amount: 25, unit: 'g' },
    dietaryFiber: { amount: 3, unit: 'g' },
    totalSugars: { amount: 8, unit: 'g' },
    protein: { amount: 7, unit: 'g' },
    vitaminD: { amount: 2, unit: 'mcg' },
    calcium: { amount: 100, unit: 'mg' },
    iron: { amount: 2, unit: 'mg' },
    potassium: { amount: 200, unit: 'mg' },
  };

  describe('constructor', () => {
    it('creates NutritionUnit instances from data', () => {
      const ni = new NutritionInformation(sampleData);
      expect(ni.calories).toBeInstanceOf(NutritionUnit);
      expect(ni.calories!.amount).toBe(200);
      expect(ni.calories!.unit).toBe('kcal');
      expect(ni.totalFat!.amount).toBe(10);
      expect(ni.protein!.amount).toBe(7);
    });

    it('sets null for fields not in data', () => {
      const ni = new NutritionInformation({ calories: { amount: 100, unit: 'kcal' } });
      expect(ni.calories).not.toBeNull();
      expect(ni.totalFat).toBeNull();
      expect(ni.saturatedFat).toBeNull();
      expect(ni.protein).toBeNull();
      expect(ni.vitaminA).toBeNull();
      expect(ni.iron).toBeNull();
    });

    it('defaults all fields to null with empty data', () => {
      const ni = new NutritionInformation();
      expect(ni.calories).toBeNull();
      expect(ni.totalFat).toBeNull();
      expect(ni.protein).toBeNull();
    });

    it('handles explicit null values in data', () => {
      const ni = new NutritionInformation({
        calories: { amount: 100, unit: 'kcal' },
        totalFat: null,
      });
      expect(ni.calories!.amount).toBe(100);
      expect(ni.totalFat).toBeNull();
    });
  });

  describe('scaled', () => {
    it('scales all populated fields by factor', () => {
      const ni = new NutritionInformation(sampleData);
      const scaled = ni.scaled(2);

      expect(scaled.calories!.amount).toBe(400);
      expect(scaled.totalFat!.amount).toBe(20);
      expect(scaled.saturatedFat!.amount).toBe(6);
      expect(scaled.cholesterol!.amount).toBe(60);
      expect(scaled.sodium!.amount).toBe(800);
      expect(scaled.totalCarbohydrate!.amount).toBe(50);
      expect(scaled.protein!.amount).toBe(14);
      expect(scaled.potassium!.amount).toBe(400);
    });

    it('preserves null fields', () => {
      const ni = new NutritionInformation(sampleData);
      const scaled = ni.scaled(2);

      expect(scaled.polyunsaturatedFat).toBeNull();
      expect(scaled.monounsaturatedFat).toBeNull();
      expect(scaled.vitaminA).toBeNull();
    });

    it('preserves units', () => {
      const ni = new NutritionInformation(sampleData);
      const scaled = ni.scaled(3);

      expect(scaled.calories!.unit).toBe('kcal');
      expect(scaled.totalFat!.unit).toBe('g');
      expect(scaled.sodium!.unit).toBe('mg');
    });

    it('returns a new instance', () => {
      const ni = new NutritionInformation(sampleData);
      const scaled = ni.scaled(1);
      expect(scaled).not.toBe(ni);
      expect(scaled.calories).not.toBe(ni.calories);
    });

    it('handles fractional factor', () => {
      const ni = new NutritionInformation(sampleData);
      const scaled = ni.scaled(0.5);
      expect(scaled.calories!.amount).toBe(100);
      expect(scaled.totalFat!.amount).toBe(5);
    });
  });

  describe('add', () => {
    it('sums fields present in both', () => {
      const a = new NutritionInformation(sampleData);
      const b = new NutritionInformation(sampleData);
      const result = a.add(b);

      expect(result.calories!.amount).toBe(400);
      expect(result.totalFat!.amount).toBe(20);
      expect(result.protein!.amount).toBe(14);
    });

    it('keeps the value when only one side has a field', () => {
      const a = new NutritionInformation({
        calories: { amount: 100, unit: 'kcal' },
        totalFat: { amount: 5, unit: 'g' },
      });
      const b = new NutritionInformation({
        calories: { amount: 150, unit: 'kcal' },
        protein: { amount: 10, unit: 'g' },
      });
      const result = a.add(b);

      expect(result.calories!.amount).toBe(250);
      expect(result.totalFat!.amount).toBe(5);
      expect(result.protein!.amount).toBe(10);
    });

    it('returns null when both sides are null', () => {
      const a = new NutritionInformation({ calories: { amount: 100, unit: 'kcal' } });
      const b = new NutritionInformation({ calories: { amount: 50, unit: 'kcal' } });
      const result = a.add(b);

      expect(result.totalFat).toBeNull();
      expect(result.vitaminA).toBeNull();
    });

    it('returns a new instance', () => {
      const a = new NutritionInformation(sampleData);
      const b = new NutritionInformation(sampleData);
      const result = a.add(b);
      expect(result).not.toBe(a);
      expect(result).not.toBe(b);
    });
  });

  describe('zero', () => {
    it('creates an instance with 0 calories', () => {
      const zero = NutritionInformation.zero();
      expect(zero.calories).not.toBeNull();
      expect(zero.calories!.amount).toBe(0);
      expect(zero.calories!.unit).toBe('kcal');
    });

    it('has null for all other fields', () => {
      const zero = NutritionInformation.zero();
      expect(zero.totalFat).toBeNull();
      expect(zero.protein).toBeNull();
      expect(zero.sodium).toBeNull();
    });
  });
});
