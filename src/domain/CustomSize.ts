import { formatSignificant } from '../utils/formatters';

import type { ServingSizeData } from './ServingSize';
import { ServingSize } from './ServingSize';
import type { NutritionUnit } from './NutritionUnit';

export interface CustomSizeData {
  id?: string;
  name?: string;
  singularName?: string;
  pluralName?: string;
  notes?: string[];
  servingSize?: ServingSizeData;
  servings?: number;
}

/**
 * Represents a custom serving size (e.g., "1 cookie", "1 bottle").
 */
export class CustomSize {
  id: string | undefined;
  name: string;
  singularName: string;
  pluralName: string;
  notes: string[];
  servingSize: ServingSize;

  constructor(data: CustomSizeData = {}) {
    this.id = data.id;
    this.name = data.name || '';
    this.singularName = data.singularName || '';
    this.pluralName = data.pluralName || '';
    this.notes = data.notes || [];

    // The serving size that this custom size represents
    // e.g., "1 cookie" might be 0.5 servings, or 30 grams
    if (data.servingSize) {
      this.servingSize = ServingSize.fromObject(data.servingSize) || ServingSize.servings(1);
    } else if (data.servings != null) {
      // Shorthand: if servings is provided directly
      this.servingSize = ServingSize.servings(data.servings);
    } else {
      this.servingSize = ServingSize.servings(1);
    }
  }

  get description(): string | null {
    if (!this.servingSize) return null;

    switch (this.servingSize.type) {
      case 'servings': {
        const count = this.servingSize.value as number;
        return `${formatSignificant(count)} serving${count !== 1 ? 's' : ''}`;
      }
      case 'mass':
      case 'volume':
      case 'energy': {
        const nu = this.servingSize.value as NutritionUnit;
        return `${formatSignificant(nu.amount)}${nu.unit}`;
      }
      default:
        return null;
    }
  }
}
