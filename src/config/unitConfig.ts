/**
 * Unit definitions and helpers for the serving size selector.
 * Contains curated lists of nutrition-relevant units with search aliases.
 */

import type { Preparation, ProductGroup, ServingSizeType } from '../domain';

export interface UnitDefinition {
  value: string;
  label: string;
  aliases: string[];
}

export interface SelectOption {
  type: ServingSizeType;
  value: string;
  label: string;
  aliases: string[];
}

export interface OptionGroup {
  label: string;
  options: SelectOption[];
}

type PrepOrGroup = Preparation | ProductGroup;

// Mass units with display labels and search aliases
// Uses RecipeKit unit names as values
export const massUnits: UnitDefinition[] = [
  { value: 'g', label: 'grams (g)', aliases: ['gram', 'grams', 'g'] },
  { value: 'mg', label: 'milligrams (mg)', aliases: ['milligram', 'milligrams', 'mg'] },
  {
    value: 'μg',
    label: 'micrograms (μg)',
    aliases: ['microgram', 'micrograms', 'mcg', 'μg', 'ug'],
  },
  { value: 'kg', label: 'kilograms (kg)', aliases: ['kilogram', 'kilograms', 'kg'] },
  { value: 'oz', label: 'ounces (oz)', aliases: ['ounce', 'ounces', 'oz'] },
  { value: 'lb', label: 'pounds (lb)', aliases: ['pound', 'pounds', 'lb', 'lbs'] },
];

// Volume units with display labels and search aliases
// Uses RecipeKit unit names as values (e.g., 'fl oz (US)' not 'fl oz')
export const volumeUnits: UnitDefinition[] = [
  { value: 'mL', label: 'milliliters (mL)', aliases: ['milliliter', 'milliliters', 'ml', 'mL'] },
  { value: 'L', label: 'liters (L)', aliases: ['liter', 'liters', 'l', 'L'] },
  { value: 'cup (US)', label: 'cups', aliases: ['cup', 'cups'] },
  {
    value: 'tbsp (US)',
    label: 'tablespoons (tbsp)',
    aliases: ['tablespoon', 'tablespoons', 'tbsp', 'tbs'],
  },
  { value: 'tsp (US)', label: 'teaspoons (tsp)', aliases: ['teaspoon', 'teaspoons', 'tsp'] },
  {
    value: 'fl oz (US)',
    label: 'fluid ounces (fl oz)',
    aliases: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz'],
  },
  { value: 'pt (US)', label: 'pints (pt)', aliases: ['pint', 'pints', 'pt'] },
  { value: 'qt (US)', label: 'quarts (qt)', aliases: ['quart', 'quarts', 'qt'] },
  { value: 'gal (US)', label: 'gallons (gal)', aliases: ['gallon', 'gallons', 'gal'] },
];

// Energy units with display labels and search aliases
export const energyUnits: UnitDefinition[] = [
  { value: 'kcal', label: 'calories (kcal)', aliases: ['calorie', 'calories', 'kcal', 'cal'] },
  { value: 'kJ', label: 'kilojoules (kJ)', aliases: ['kilojoule', 'kilojoules', 'kj', 'kJ'] },
  { value: 'J', label: 'joules (J)', aliases: ['joule', 'joules', 'j', 'J'] },
  { value: 'Wh', label: 'watt-hours (Wh)', aliases: ['watt-hour', 'watt-hours', 'wh', 'Wh'] },
];

/**
 * Build option groups for the serving size selector based on preparation/group capabilities.
 * Works with both Preparation and ProductGroup objects.
 */
export function buildOptionGroups(prepOrGroup: PrepOrGroup): OptionGroup[] {
  const groups: OptionGroup[] = [];

  // Get mass/volume - for ProductGroup, check oneServing if not explicit
  const oneServing = 'oneServing' in prepOrGroup ? prepOrGroup.oneServing : null;
  const mass = prepOrGroup.mass || oneServing?.mass;
  const volume = prepOrGroup.volume || oneServing?.volume;

  // Get calories - Preparation has nutritionalInformation, ProductGroup has oneServing.nutrition
  const calories =
    'nutritionalInformation' in prepOrGroup
      ? prepOrGroup.nutritionalInformation?.calories
      : oneServing?.nutrition?.calories;

  // Servings - always available
  groups.push({
    label: 'Servings',
    options: [
      { type: 'servings', value: 'servings', label: 'servings', aliases: ['serving', 'servings'] },
    ],
  });

  // Custom Sizes - only if has custom sizes
  if (prepOrGroup.customSizes && prepOrGroup.customSizes.length > 0) {
    groups.push({
      label: 'Custom Sizes',
      options: prepOrGroup.customSizes.map((cs) => ({
        type: 'customSize' as ServingSizeType,
        value: cs.name,
        label: cs.name,
        aliases: [cs.name.toLowerCase()],
      })),
    });
  }

  // Mass - only if has mass defined
  if (mass) {
    groups.push({
      label: 'Mass',
      options: massUnits.map((u) => ({
        type: 'mass' as ServingSizeType,
        value: u.value,
        label: u.label,
        aliases: u.aliases,
      })),
    });
  }

  // Volume - only if has volume defined
  if (volume) {
    groups.push({
      label: 'Volume',
      options: volumeUnits.map((u) => ({
        type: 'volume' as ServingSizeType,
        value: u.value,
        label: u.label,
        aliases: u.aliases,
      })),
    });
  }

  // Energy - only if has calories defined
  if (calories) {
    groups.push({
      label: 'Energy',
      options: energyUnits.map((u) => ({
        type: 'energy' as ServingSizeType,
        value: u.value,
        label: u.label,
        aliases: u.aliases,
      })),
    });
  }

  return groups;
}

/**
 * Filter option groups by search query.
 * Groups with no matching options are excluded.
 */
export function filterGroups(groups: OptionGroup[], query: string): OptionGroup[] {
  if (!query || query.trim() === '') {
    return groups;
  }

  const lowerQuery = query.toLowerCase().trim();

  return groups
    .map((group) => ({
      ...group,
      options: group.options.filter(
        (option) =>
          option.label.toLowerCase().includes(lowerQuery) ||
          option.aliases.some((alias) => alias.toLowerCase().includes(lowerQuery)),
      ),
    }))
    .filter((group) => group.options.length > 0);
}
