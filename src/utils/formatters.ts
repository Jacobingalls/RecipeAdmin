import type {
  Preparation,
  ProductGroup,
  ServingSize,
  CustomSizeValue,
  NutritionUnit,
} from '../domain';

type PrepOrGroup = Preparation | ProductGroup;

export interface FormattedServingSize {
  primary: string | null;
  resolved: string | null;
}

/**
 * Format a number to a reasonable number of significant figures.
 * - >= 100: whole number (230 or 1,234)
 * - >= 10: 1 decimal place (23.5)
 * - >= 1: 2 decimal places (2.35)
 * - < 1: 2 significant figures (0.24, 0.024)
 * Uses localized thousand separators for numbers >= 1000.
 */
export function formatSignificant(value: number): string {
  if (value === 0) return '0';

  const absValue = Math.abs(value);

  if (absValue >= 100) {
    return Math.round(value).toLocaleString();
  } else if (absValue >= 10) {
    const rounded = Math.round(value * 10) / 10;
    return rounded.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
  } else if (absValue >= 1) {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
  // For values < 1, use 2 significant figures
  const sigFigs = 2;
  const magnitude = Math.floor(Math.log10(absValue));
  const scale = Math.pow(10, sigFigs - magnitude - 1);
  const rounded = Math.round(value * scale) / scale;
  return rounded.toLocaleString();
}

/**
 * Format a serving size for display, returning primary label and resolved breakdown.
 * Works with both Preparation and ProductGroup objects.
 */
export function formatServingSize(
  servingSize: ServingSize | null | undefined,
  prepOrGroup: PrepOrGroup | null | undefined,
): FormattedServingSize {
  if (!servingSize || !prepOrGroup) return { primary: null, resolved: null };

  let scalar: number;
  try {
    scalar = prepOrGroup.scalar(servingSize);
  } catch {
    return { primary: null, resolved: null };
  }

  // Get mass/volume - for ProductGroup, check oneServing if not explicit
  const oneServing = 'oneServing' in prepOrGroup ? prepOrGroup.oneServing : null;
  const mass = prepOrGroup.mass || oneServing?.mass;
  const volume = prepOrGroup.volume || oneServing?.volume;

  // Primary description based on type
  let primary: string | null = null;
  if (servingSize.type === 'servings') {
    const count = servingSize.value as number;
    primary = `${formatSignificant(count)} serving${count !== 1 ? 's' : ''}`;
  } else if (servingSize.type === 'customSize') {
    const { name, amount } = servingSize.value as CustomSizeValue;
    primary = `${formatSignificant(amount)} ${name}`;
  } else if (servingSize.type === 'mass') {
    const val = servingSize.value as NutritionUnit;
    primary = `${formatSignificant(val.amount)}${val.unit}`;
  } else if (servingSize.type === 'volume') {
    const val = servingSize.value as NutritionUnit;
    primary = `${formatSignificant(val.amount)}${val.unit}`;
  } else if (servingSize.type === 'energy') {
    const val = servingSize.value as NutritionUnit;
    primary = `${formatSignificant(val.amount)}${val.unit}`;
  }

  // Build resolved breakdown, omitting whichever is the primary selection
  const resolved: string[] = [];
  if (servingSize.type !== 'servings') {
    resolved.push(`${formatSignificant(scalar)} serving${scalar !== 1 ? 's' : ''}`);
  }
  if (mass && servingSize.type !== 'mass') {
    const massAmount = mass.amount * scalar;
    resolved.push(`${formatSignificant(massAmount)}${mass.unit}`);
  }
  if (volume && servingSize.type !== 'volume') {
    const volumeAmount = volume.amount * scalar;
    resolved.push(`${formatSignificant(volumeAmount)}${volume.unit}`);
  }

  return { primary, resolved: resolved.join(', ') };
}
