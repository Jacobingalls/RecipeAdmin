import type { NutritionInformationData } from './NutritionInformation';
import { NutritionInformation } from './NutritionInformation';
import type { NutritionUnitData } from './NutritionUnit';
import { NutritionUnit } from './NutritionUnit';
import type { CustomSizeValue } from './ServingSize';
import { ServingSize } from './ServingSize';
import type { CustomSizeData } from './CustomSize';
import { CustomSize } from './CustomSize';

export interface PreparationData {
  id?: string;
  name?: string;
  nutritionalInformation?: NutritionInformationData;
  mass?: NutritionUnitData | null;
  volume?: NutritionUnitData | null;
  customSizes?: CustomSizeData[];
  servingSizeDescription?: string | null;
  notes?: string[];
}

/**
 * Represents a specific preparation of a product.
 * Contains nutritional information for one serving and methods to calculate
 * nutrition for different serving sizes.
 *
 * Mirrors RecipeKit's Product.Preparation struct.
 */
export class Preparation {
  id: string | undefined;
  name: string;
  nutritionalInformation: NutritionInformation;
  mass: NutritionUnit | null;
  volume: NutritionUnit | null;
  customSizes: CustomSize[];
  servingSizeDescription: string | null;
  notes: string[];

  constructor(data: PreparationData = {}) {
    this.id = data.id;
    this.name = data.name || 'Default';

    // Nutrition information for ONE serving
    this.nutritionalInformation = new NutritionInformation(data.nutritionalInformation || {});

    // Size of one serving in mass (optional)
    this.mass = NutritionUnit.fromObject(data.mass);

    // Size of one serving in volume (optional)
    this.volume = NutritionUnit.fromObject(data.volume);

    // Custom sizes (e.g., "1 cookie", "1 slice")
    this.customSizes = (data.customSizes || []).map((cs) => new CustomSize(cs));

    // Human-readable serving size description (e.g., "1 tbsp (14g)")
    this.servingSizeDescription = data.servingSizeDescription || null;

    // Notes about the preparation
    this.notes = data.notes || [];
  }

  /**
   * Calculate the scalar (multiplier) for a given serving size.
   * This tells us how many "base servings" the requested serving size represents.
   */
  scalar(servingSize: ServingSize): number {
    switch (servingSize.type) {
      case 'servings':
        return servingSize.value as number;

      case 'mass': {
        if (!this.mass) {
          throw new Error('Cannot calculate serving by mass: preparation has no mass defined');
        }
        // Convert requested mass to same unit as serving mass, then divide
        const requestedMass = (servingSize.value as NutritionUnit).converted(this.mass.unit);
        return requestedMass.amount / this.mass.amount;
      }

      case 'volume': {
        if (!this.volume) {
          throw new Error('Cannot calculate serving by volume: preparation has no volume defined');
        }
        // Convert requested volume to same unit as serving volume, then divide
        const requestedVolume = (servingSize.value as NutritionUnit).converted(this.volume.unit);
        return requestedVolume.amount / this.volume.amount;
      }

      case 'energy': {
        if (!this.nutritionalInformation.calories) {
          throw new Error(
            'Cannot calculate serving by energy: preparation has no calories defined',
          );
        }
        // Convert requested energy to same unit as serving calories, then divide
        const requestedEnergy = (servingSize.value as NutritionUnit).converted(
          this.nutritionalInformation.calories.unit,
        );
        return requestedEnergy.amount / this.nutritionalInformation.calories.amount;
      }

      case 'customSize': {
        const { name, amount } = servingSize.value as CustomSizeValue;
        const customSize = this.customSizes.find((cs) => cs.name === name);
        if (!customSize) {
          throw new Error(`Unknown custom size: ${name}`);
        }
        // Recursively resolve the custom size's serving size, scaled by the requested amount
        return this.scalar(customSize.servingSize.scaled(amount));
      }

      default:
        throw new Error(`Unknown serving size type: ${servingSize.type}`);
    }
  }

  nutritionalInformationFor(servingSize: ServingSize): NutritionInformation {
    const scaler = this.scalar(servingSize);
    return this.nutritionalInformation.scaled(scaler);
  }

  nutritionalInformationForServings(servings: number): NutritionInformation {
    return this.nutritionalInformationFor(ServingSize.servings(servings));
  }
}
