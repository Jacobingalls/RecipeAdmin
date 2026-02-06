import { NutritionInformation } from './NutritionInformation';
import type { NutritionUnitData } from './NutritionUnit';
import { NutritionUnit } from './NutritionUnit';
import type { CustomSizeValue, ServingSizeData } from './ServingSize';
import { ServingSize } from './ServingSize';
import type { CustomSizeData } from './CustomSize';
import { CustomSize } from './CustomSize';
import type { PreparationData } from './Preparation';
import { Preparation } from './Preparation';

export interface BarcodeData {
  code: string;
  notes?: unknown[];
  servingSize?: ServingSizeData;
}

export interface GroupItem {
  servingSize?: ServingSizeData;
  preparationID?: string;
  product?: {
    id?: string;
    name?: string;
    brand?: string;
    preparations?: PreparationData[];
  };
  group?: ProductGroupData;
}

export interface ProductGroupData {
  id?: string;
  name?: string;
  items?: GroupItem[];
  mass?: NutritionUnitData | null;
  volume?: NutritionUnitData | null;
  customSizes?: CustomSizeData[];
  barcodes?: BarcodeData[];
}

interface ItemServing {
  nutrition: NutritionInformation;
  mass: NutritionUnit | null;
  volume: NutritionUnit | null;
}

interface GroupServing extends ItemServing {
  servings: number;
}

/**
 * Represents a product group containing multiple items.
 * Calculates aggregate nutritional information by summing item servings.
 *
 * Mirrors RecipeKit's ProductGroup struct.
 */
export class ProductGroup {
  id: string | undefined;
  name: string | undefined;
  items: GroupItem[];
  mass: NutritionUnit | null;
  volume: NutritionUnit | null;
  customSizes: CustomSize[];
  barcodes: BarcodeData[];

  constructor(data: ProductGroupData = {}) {
    this.id = data.id;
    this.name = data.name;

    // Items in the group (each is a lookup result with product or group)
    this.items = data.items || [];

    // Explicit size of one serving in mass (optional)
    this.mass = NutritionUnit.fromObject(data.mass);

    // Explicit size of one serving in volume (optional)
    this.volume = NutritionUnit.fromObject(data.volume);

    // Custom sizes (e.g., "1 cookie", "1 slice")
    this.customSizes = (data.customSizes || []).map((cs) => new CustomSize(cs));

    this.barcodes = data.barcodes || [];
  }

  /**
   * Get the serving of an item using the item's own servingSize.
   * Each item in a group has a servingSize that specifies how much of that
   * product/group contributes to one serving of the parent group.
   *
   * Returns { nutrition, mass, volume } or null if cannot calculate.
   */
  static getItemServing(item: GroupItem): ItemServing | null {
    // Get the item's serving size (how much of this item is in one serving of the group)
    const itemServingSize = item.servingSize
      ? ServingSize.fromObject(item.servingSize) || ServingSize.servings(1)
      : ServingSize.servings(1);

    if (item.product) {
      const p = item.product;
      const prepData =
        p.preparations?.find((pr) => pr.id === item.preparationID) || p.preparations?.[0];
      if (!prepData) return null;

      const prep = new Preparation(prepData);

      // Calculate nutrition for this item's serving size, not just 1 serving
      try {
        const scalar = prep.scalar(itemServingSize);
        return {
          nutrition: prep.nutritionalInformation.scaled(scalar),
          mass: prep.mass ? prep.mass.scaled(scalar) : null,
          volume: prep.volume ? prep.volume.scaled(scalar) : null,
        };
      } catch {
        // Fall back to 1 serving if calculation fails
        return {
          nutrition: prep.nutritionalInformation,
          mass: prep.mass,
          volume: prep.volume,
        };
      }
    } else if (item.group) {
      const group = new ProductGroup(item.group);

      // Calculate nutrition for this item's serving size
      try {
        const serving = group.serving(itemServingSize);
        return {
          nutrition: serving.nutrition,
          mass: serving.mass,
          volume: serving.volume,
        };
      } catch {
        // Fall back to one serving if calculation fails
        return group.oneServing;
      }
    }
    return null;
  }

  /**
   * Get one serving of the entire group.
   * Sums nutritional information from all items.
   * Uses explicit mass/volume if set, otherwise sums from items.
   */
  get oneServing(): ItemServing {
    // Get one serving from each item
    const itemServings = this.items
      .map((item) => ProductGroup.getItemServing(item))
      .filter((s): s is ItemServing => s != null);

    // Sum nutritional information
    let nutrition = NutritionInformation.zero();
    for (const serving of itemServings) {
      if (serving.nutrition) {
        nutrition = nutrition.add(serving.nutrition);
      }
    }

    // Calculate mass: use explicit if set, otherwise sum from items (only if ALL have mass)
    let { mass } = this;
    if (!mass && itemServings.length > 0) {
      const allHaveMass = itemServings.every((s) => s.mass != null);
      if (allHaveMass) {
        mass = itemServings.reduce<NutritionUnit | null>((acc, s) => {
          if (!acc) return s.mass;
          return acc.add(s.mass!);
        }, null);
      }
    }

    // Calculate volume: use explicit if set, otherwise sum from items (only if ALL have volume)
    let { volume } = this;
    if (!volume && itemServings.length > 0) {
      const allHaveVolume = itemServings.every((s) => s.volume != null);
      if (allHaveVolume) {
        volume = itemServings.reduce<NutritionUnit | null>((acc, s) => {
          if (!acc) return s.volume;
          return acc.add(s.volume!);
        }, null);
      }
    }

    return { nutrition, mass, volume };
  }

  /**
   * Calculate the scalar (multiplier) for a given serving size.
   */
  scalar(servingSize: ServingSize): number {
    const { oneServing } = this;

    switch (servingSize.type) {
      case 'servings':
        return servingSize.value as number;

      case 'mass': {
        if (!oneServing.mass) {
          throw new Error('Cannot calculate serving by mass: group has no mass defined');
        }
        const requestedMass = (servingSize.value as NutritionUnit).converted(oneServing.mass.unit);
        return requestedMass.amount / oneServing.mass.amount;
      }

      case 'volume': {
        if (!oneServing.volume) {
          throw new Error('Cannot calculate serving by volume: group has no volume defined');
        }
        const requestedVolume = (servingSize.value as NutritionUnit).converted(
          oneServing.volume.unit,
        );
        return requestedVolume.amount / oneServing.volume.amount;
      }

      case 'energy': {
        if (!oneServing.nutrition.calories) {
          throw new Error('Cannot calculate serving by energy: group has no calories defined');
        }
        const requestedEnergy = (servingSize.value as NutritionUnit).converted(
          oneServing.nutrition.calories.unit,
        );
        return requestedEnergy.amount / oneServing.nutrition.calories.amount;
      }

      case 'customSize': {
        const { name, amount } = servingSize.value as CustomSizeValue;
        const customSize = this.customSizes.find((cs) => cs.name === name);
        if (!customSize) {
          throw new Error(`Unknown custom size: ${name}`);
        }
        return this.scalar(customSize.servingSize.scaled(amount));
      }

      default:
        throw new Error(`Unknown serving size type: ${servingSize.type}`);
    }
  }

  /**
   * Get nutritional information for a given serving size.
   */
  serving(servingSize: ServingSize): GroupServing {
    const { oneServing } = this;
    const factor = this.scalar(servingSize);

    return {
      nutrition: oneServing.nutrition.scaled(factor),
      mass: oneServing.mass ? oneServing.mass.scaled(factor) : null,
      volume: oneServing.volume ? oneServing.volume.scaled(factor) : null,
      servings: factor,
    };
  }
}
