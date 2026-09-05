import type { NutritionInformation, Preparation, ProductGroup } from '../domain';
import { ServingSize } from '../domain';

type PrepOrGroup = Preparation | ProductGroup;

/** The quantity a European label declares nutrition against, beside the serving itself. */
export interface ReferenceQuantity {
  amount: number;
  /** `g` for solids, `mL` for liquids — whichever the product is measured in. */
  unit: string;
  servingSize: ServingSize;
}

/**
 * Nutrition for a serving of a preparation or a group, or `null` when the serving can't be
 * resolved — a mass asked of a product that carries no mass, say.
 */
export function nutritionForServing(
  prepOrGroup: PrepOrGroup | null | undefined,
  servingSize: ServingSize,
): NutritionInformation | null {
  if (!prepOrGroup) return null;

  try {
    if ('nutritionalInformationFor' in prepOrGroup) {
      return prepOrGroup.nutritionalInformationFor(servingSize);
    }
    return prepOrGroup.serving(servingSize).nutrition;
  } catch {
    return null;
  }
}

/**
 * The per-100 quantity a European label leads with: 100 g for anything with a mass, 100 ml
 * for anything measured only by volume.
 *
 * `null` means the product carries neither, so nutrition can only be declared per serving —
 * a label that is short of what the regulation asks for, but all the data supports.
 */
export function referenceQuantity(
  prepOrGroup: PrepOrGroup | null | undefined,
): ReferenceQuantity | null {
  if (!prepOrGroup) return null;

  const oneServing = 'oneServing' in prepOrGroup ? prepOrGroup.oneServing : null;
  const mass = prepOrGroup.mass || oneServing?.mass;
  const volume = prepOrGroup.volume || oneServing?.volume;

  if (mass) {
    return { amount: 100, unit: 'g', servingSize: ServingSize.mass(100, 'g') };
  }
  if (volume) {
    return { amount: 100, unit: 'mL', servingSize: ServingSize.volume(100, 'mL') };
  }
  return null;
}
