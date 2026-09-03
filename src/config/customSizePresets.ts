/**
 * Preset custom sizes mirroring RecipeKit/CustomSize+Helpers.swift.
 * Used by both product preparation and group custom size editors.
 *
 * Serving sizes use the kind-based format expected by the RecipeKit API.
 */

import type { CustomSizeData, ServingSizeData } from '../domain';
import { ServingSize } from '../domain';
import i18n from '../i18n';
import type { MessageKey } from '../i18n';

export interface PresetCustomSize {
  /**
   * Saved onto the product as-is, so these names stay in English rather than being
   * translated — they're data, not interface text.
   */
  name: string;
  singularName: string;
  pluralName: string;
  servingSize: ServingSizeData;
  /** Message key for the heading this preset is listed under. */
  groupKey: MessageKey;
}

export const PRESET_CUSTOM_SIZES: PresetCustomSize[] = [
  // Generic containers
  {
    name: 'Bag',
    singularName: 'bag',
    pluralName: 'bags',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.containers',
  },
  {
    name: 'Box',
    singularName: 'box',
    pluralName: 'boxes',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.containers',
  },
  {
    name: 'Bottle',
    singularName: 'bottle',
    pluralName: 'bottles',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.containers',
  },
  {
    name: 'Jar',
    singularName: 'jar',
    pluralName: 'jars',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.containers',
  },
  {
    name: 'Jug',
    singularName: 'jug',
    pluralName: 'jugs',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.containers',
  },
  {
    name: 'Package',
    singularName: 'package',
    pluralName: 'packages',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.containers',
  },
  // Units
  {
    name: 'Chip',
    singularName: 'chip',
    pluralName: 'chips',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.units',
  },
  {
    name: 'Loaf',
    singularName: 'loaf',
    pluralName: 'loaves',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.units',
  },
  {
    name: 'Shot',
    singularName: 'shot',
    pluralName: 'shots',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.units',
  },
  {
    name: 'Slice',
    singularName: 'slice',
    pluralName: 'slices',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.units',
  },
  {
    name: 'Stick',
    singularName: 'stick',
    pluralName: 'sticks',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.units',
  },
  {
    name: 'Pump',
    singularName: 'pump',
    pluralName: 'pumps',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.units',
  },
  // Soda cans
  {
    name: 'Mini Soda Can',
    singularName: 'mini can',
    pluralName: 'mini cans',
    servingSize: { kind: 'volume', amount: { amount: 8, unit: 'fl oz' } },
    groupKey: 'customSizeGroup.sodaSizes',
  },
  {
    name: 'Soda Can',
    singularName: 'can',
    pluralName: 'cans',
    servingSize: { kind: 'volume', amount: { amount: 12, unit: 'fl oz' } },
    groupKey: 'customSizeGroup.sodaSizes',
  },
  {
    name: 'Soda Bottle',
    singularName: 'bottle',
    pluralName: 'bottles',
    servingSize: { kind: 'volume', amount: { amount: 20, unit: 'fl oz' } },
    groupKey: 'customSizeGroup.sodaSizes',
  },
  {
    name: 'Two-Liter Soda Bottle',
    singularName: 'two-liter bottle',
    pluralName: 'two-liter bottles',
    servingSize: { kind: 'volume', amount: { amount: 2, unit: 'L' } },
    groupKey: 'customSizeGroup.sodaSizes',
  },
  // Eggs
  {
    name: 'Small Egg',
    singularName: 'small egg',
    pluralName: 'small eggs',
    servingSize: { kind: 'mass', amount: { amount: 1.5, unit: 'oz' } },
    groupKey: 'customSizeGroup.eggs',
  },
  {
    name: 'Medium Egg',
    singularName: 'medium egg',
    pluralName: 'medium eggs',
    servingSize: { kind: 'mass', amount: { amount: 1.5, unit: 'oz' } },
    groupKey: 'customSizeGroup.eggs',
  },
  {
    name: 'Large Egg',
    singularName: 'large egg',
    pluralName: 'large eggs',
    servingSize: { kind: 'mass', amount: { amount: 1.5, unit: 'oz' } },
    groupKey: 'customSizeGroup.eggs',
  },
  {
    name: 'Extra-Large Egg',
    singularName: 'extra-large egg',
    pluralName: 'extra-large eggs',
    servingSize: { kind: 'mass', amount: { amount: 1.5, unit: 'oz' } },
    groupKey: 'customSizeGroup.eggs',
  },
  {
    name: 'Jumbo Egg',
    singularName: 'jumbo egg',
    pluralName: 'jumbo eggs',
    servingSize: { kind: 'servings', amount: 1 },
    groupKey: 'customSizeGroup.eggs',
  },
];

export function formatPresetServing(s: ServingSizeData): string {
  const { t } = i18n;
  if (s.kind === 'servings' && typeof s.amount === 'number') {
    return t('customSizePreset.servings', { amount: s.amount });
  }
  if (s.kind === 'mass' && typeof s.amount === 'object' && s.amount) {
    return `${s.amount.amount} ${s.amount.unit}`;
  }
  if (s.kind === 'volume' && typeof s.amount === 'object' && s.amount) {
    return `${s.amount.amount} ${s.amount.unit}`;
  }
  // Fallback for tagged union format (backwards compatibility)
  if (s.servings != null) return t('customSizePreset.servings', { amount: s.servings });
  if (s.mass) return `${s.mass.amount} ${s.mass.unit}`;
  if (s.volume) return `${s.volume.amount} ${s.volume.unit}`;
  return t('customSizePreset.servings', { amount: 1 });
}

export function presetToCustomSizeData(preset: PresetCustomSize): CustomSizeData {
  // Normalize through fromObject → toApiObject to guarantee API format
  const ss = ServingSize.fromObject(preset.servingSize);
  return {
    id: crypto.randomUUID(),
    name: preset.name,
    singularName: preset.singularName,
    pluralName: preset.pluralName,
    servingSize: ss?.toApiObject() ?? preset.servingSize,
  };
}
