/**
 * Unit definitions and helpers for the serving size selector.
 * Contains curated lists of nutrition-relevant units with search aliases.
 */

import type { Preparation, ProductGroup, ServingSizeType } from '../domain';
import { getTranslator } from '../i18n';
import type { MessageKey } from '../i18n';

export interface UnitDefinition {
  value: string;
  /** Message key for the unit's display name. */
  labelKey: MessageKey;
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
  { value: 'g', labelKey: 'unit.mass.g', aliases: ['gram', 'grams', 'g'] },
  { value: 'mg', labelKey: 'unit.mass.mg', aliases: ['milligram', 'milligrams', 'mg'] },
  {
    value: 'μg',
    labelKey: 'unit.mass.ug',
    aliases: ['microgram', 'micrograms', 'mcg', 'μg', 'ug'],
  },
  { value: 'kg', labelKey: 'unit.mass.kg', aliases: ['kilogram', 'kilograms', 'kg'] },
  { value: 'oz', labelKey: 'unit.mass.oz', aliases: ['ounce', 'ounces', 'oz'] },
  { value: 'lb', labelKey: 'unit.mass.lb', aliases: ['pound', 'pounds', 'lb', 'lbs'] },
];

// Volume units with display labels and search aliases
// Uses RecipeKit unit names as values (e.g., 'fl oz (US)' not 'fl oz')
export const volumeUnits: UnitDefinition[] = [
  { value: 'mL', labelKey: 'unit.volume.ml', aliases: ['milliliter', 'milliliters', 'ml', 'mL'] },
  { value: 'L', labelKey: 'unit.volume.l', aliases: ['liter', 'liters', 'l', 'L'] },
  { value: 'cup (US)', labelKey: 'unit.volume.cup', aliases: ['cup', 'cups'] },
  {
    value: 'tbsp (US)',
    labelKey: 'unit.volume.tbsp',
    aliases: ['tablespoon', 'tablespoons', 'tbsp', 'tbs'],
  },
  { value: 'tsp (US)', labelKey: 'unit.volume.tsp', aliases: ['teaspoon', 'teaspoons', 'tsp'] },
  {
    value: 'fl oz (US)',
    labelKey: 'unit.volume.flOz',
    aliases: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz'],
  },
  { value: 'pt (US)', labelKey: 'unit.volume.pt', aliases: ['pint', 'pints', 'pt'] },
  { value: 'qt (US)', labelKey: 'unit.volume.qt', aliases: ['quart', 'quarts', 'qt'] },
  { value: 'gal (US)', labelKey: 'unit.volume.gal', aliases: ['gallon', 'gallons', 'gal'] },
];

// Energy units with display labels and search aliases
export const energyUnits: UnitDefinition[] = [
  { value: 'kcal', labelKey: 'unit.energy.kcal', aliases: ['calorie', 'calories', 'kcal', 'cal'] },
  { value: 'kJ', labelKey: 'unit.energy.kj', aliases: ['kilojoule', 'kilojoules', 'kj', 'kJ'] },
  { value: 'J', labelKey: 'unit.energy.j', aliases: ['joule', 'joules', 'j', 'J'] },
  { value: 'Wh', labelKey: 'unit.energy.wh', aliases: ['watt-hour', 'watt-hours', 'wh', 'Wh'] },
];

// Nutrition-label units: separate mass and energy subsets for nutrition facts
export const nutritionMassUnits: UnitDefinition[] = [
  { value: 'g', labelKey: 'unit.mass.g', aliases: ['gram', 'grams', 'g'] },
  { value: 'mg', labelKey: 'unit.mass.mg', aliases: ['milligram', 'milligrams', 'mg'] },
  {
    value: 'μg',
    labelKey: 'unit.mass.ug',
    aliases: ['microgram', 'micrograms', 'mcg', 'μg', 'ug'],
  },
];

export const nutritionEnergyUnits: UnitDefinition[] = [
  { value: 'kcal', labelKey: 'unit.energy.kcal', aliases: ['calorie', 'calories', 'kcal', 'cal'] },
  { value: 'kJ', labelKey: 'unit.energy.kj', aliases: ['kilojoule', 'kilojoules', 'kj', 'kJ'] },
];

/**
 * Build one option group from a list of units, translating the group and unit names.
 *
 * ```ts
 * unitGroup('unit.group.mass', massUnits, 'mass')
 * ```
 */
export function unitGroup(
  labelKey: MessageKey,
  units: UnitDefinition[],
  type: ServingSizeType,
): OptionGroup {
  const { t } = getTranslator();
  return {
    label: t(labelKey),
    options: units.map((u) => ({
      type,
      value: u.value,
      label: t(u.labelKey),
      aliases: u.aliases,
    })),
  };
}

/** The "Servings" group, which every serving size selector offers. */
export function servingsGroup(): OptionGroup {
  const { t } = getTranslator();
  return {
    label: t('unit.group.servings'),
    options: [
      {
        type: 'servings',
        value: 'servings',
        label: t('unit.servings'),
        aliases: ['serving', 'servings'],
      },
    ],
  };
}

/** Option groups with servings, mass, and volume, for when there's no prep-specific data. */
export function buildFallbackOptionGroups(): OptionGroup[] {
  return [
    servingsGroup(),
    unitGroup('unit.group.mass', massUnits, 'mass'),
    unitGroup('unit.group.volume', volumeUnits, 'volume'),
  ];
}

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
  groups.push(servingsGroup());

  // Custom Sizes - only if has custom sizes
  if (prepOrGroup.customSizes && prepOrGroup.customSizes.length > 0) {
    groups.push({
      label: getTranslator().t('unit.group.customSizes'),
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
    groups.push(unitGroup('unit.group.mass', massUnits, 'mass'));
  }

  // Volume - only if has volume defined
  if (volume) {
    groups.push(unitGroup('unit.group.volume', volumeUnits, 'volume'));
  }

  // Energy - only if has calories defined
  if (calories) {
    groups.push(unitGroup('unit.group.energy', energyUnits, 'energy'));
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
