import type { NutritionUnitData } from './NutritionUnit';
import { NutritionUnit } from './NutritionUnit';

export type ServingSizeType = 'servings' | 'mass' | 'volume' | 'energy' | 'customSize';

export interface CustomSizeValue {
  name: string;
  amount: number;
}

export type ServingSizeValue = number | NutritionUnit | CustomSizeValue;

/** Plain object format for deserializing a ServingSize from an API response. */
export interface ServingSizeData {
  kind?: string;
  type?: string;
  amount?: number | NutritionUnitData;
  value?: number | NutritionUnitData;
  name?: string;
}

/**
 * Represents different ways to measure a serving.
 * Mirrors RecipeKit's ServingSize enum.
 */
export class ServingSize {
  type: ServingSizeType;
  value: ServingSizeValue;

  constructor(type: ServingSizeType, value: ServingSizeValue) {
    this.type = type;
    this.value = value;
  }

  static servings(count: number): ServingSize {
    return new ServingSize('servings', count);
  }

  static mass(amount: number, unit: string): ServingSize {
    return new ServingSize('mass', new NutritionUnit(amount, unit));
  }

  static volume(amount: number, unit: string): ServingSize {
    return new ServingSize('volume', new NutritionUnit(amount, unit));
  }

  static energy(amount: number, unit: string): ServingSize {
    return new ServingSize('energy', new NutritionUnit(amount, unit));
  }

  static customSize(name: string, amount: number): ServingSize {
    return new ServingSize('customSize', { name, amount });
  }

  get amount(): number {
    switch (this.type) {
      case 'servings':
        return this.value as number;
      case 'mass':
      case 'volume':
      case 'energy':
        return (this.value as NutritionUnit).amount;
      case 'customSize':
        return (this.value as CustomSizeValue).amount;
      default:
        return 0;
    }
  }

  scaled(factor: number): ServingSize {
    switch (this.type) {
      case 'servings':
        return ServingSize.servings((this.value as number) * factor);
      case 'mass':
        return new ServingSize('mass', (this.value as NutritionUnit).scaled(factor));
      case 'volume':
        return new ServingSize('volume', (this.value as NutritionUnit).scaled(factor));
      case 'energy':
        return new ServingSize('energy', (this.value as NutritionUnit).scaled(factor));
      case 'customSize': {
        const { name, amount } = this.value as CustomSizeValue;
        return ServingSize.customSize(name, amount * factor);
      }
      default:
        return this;
    }
  }

  /**
   * Create from plain object (e.g., from API response).
   * API format uses 'kind' field:
   * - { kind: 'servings', amount: 2 }
   * - { kind: 'customSize', name: '20oz Bottle', amount: 1 }
   * - { kind: 'volume', amount: { amount: 8, unit: 'fl oz (US)' } }
   */
  static fromObject(obj: ServingSizeData | null | undefined): ServingSize | null {
    if (obj == null) return null;

    const kind = obj.kind || obj.type;
    if (!kind) return null;

    const rawAmount = obj.amount ?? obj.value;

    switch (kind) {
      case 'servings': {
        if (typeof rawAmount !== 'number') return null;
        return ServingSize.servings(rawAmount);
      }
      case 'mass':
      case 'volume':
      case 'energy': {
        if (typeof rawAmount !== 'object' || rawAmount === null) return null;
        const nu = NutritionUnit.fromObject(rawAmount);
        if (!nu) return null;
        return new ServingSize(kind, nu);
      }
      case 'customSize': {
        const { name } = obj;
        const amount = typeof obj.amount === 'number' ? obj.amount : undefined;
        if (name == null || amount == null) return null;
        return ServingSize.customSize(name, amount);
      }
      default:
        return null;
    }
  }

  toString(): string {
    switch (this.type) {
      case 'servings': {
        const count = this.value as number;
        return `${count} serving${count !== 1 ? 's' : ''}`;
      }
      case 'mass':
      case 'volume':
      case 'energy':
        return (this.value as NutritionUnit).toString();
      case 'customSize': {
        const { name, amount } = this.value as CustomSizeValue;
        return `${amount} ${name}${amount !== 1 ? 's' : ''}`;
      }
      default:
        return '';
    }
  }
}
