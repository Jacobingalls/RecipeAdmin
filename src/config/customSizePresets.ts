/**
 * Preset custom sizes mirroring RecipeKit/CustomSize+Helpers.swift.
 * Used by both product preparation and group custom size editors.
 *
 * Serving sizes use the kind-based format expected by the RecipeKit API.
 */

import type { CustomSizeData, ServingSizeData } from '../domain';
import { ServingSize } from '../domain';

export interface PresetCustomSize {
  name: string;
  singularName: string;
  pluralName: string;
  servingSize: ServingSizeData;
  group: string;
}

export const PRESET_CUSTOM_SIZES: PresetCustomSize[] = [
  // Generic containers
  {
    name: 'Bag',
    singularName: 'bag',
    pluralName: 'bags',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Containers',
  },
  {
    name: 'Box',
    singularName: 'box',
    pluralName: 'boxes',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Containers',
  },
  {
    name: 'Bottle',
    singularName: 'bottle',
    pluralName: 'bottles',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Containers',
  },
  {
    name: 'Jar',
    singularName: 'jar',
    pluralName: 'jars',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Containers',
  },
  {
    name: 'Jug',
    singularName: 'jug',
    pluralName: 'jugs',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Containers',
  },
  {
    name: 'Package',
    singularName: 'package',
    pluralName: 'packages',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Containers',
  },
  // Units
  {
    name: 'Chip',
    singularName: 'chip',
    pluralName: 'chips',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Units',
  },
  {
    name: 'Loaf',
    singularName: 'loaf',
    pluralName: 'loaves',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Units',
  },
  {
    name: 'Shot',
    singularName: 'shot',
    pluralName: 'shots',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Units',
  },
  {
    name: 'Slice',
    singularName: 'slice',
    pluralName: 'slices',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Units',
  },
  {
    name: 'Stick',
    singularName: 'stick',
    pluralName: 'sticks',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Units',
  },
  {
    name: 'Pump',
    singularName: 'pump',
    pluralName: 'pumps',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Units',
  },
  // Soda cans
  {
    name: 'Mini Soda Can',
    singularName: 'mini can',
    pluralName: 'mini cans',
    servingSize: { kind: 'volume', amount: { amount: 8, unit: 'fl oz' } },
    group: 'Soda sizes',
  },
  {
    name: 'Soda Can',
    singularName: 'can',
    pluralName: 'cans',
    servingSize: { kind: 'volume', amount: { amount: 12, unit: 'fl oz' } },
    group: 'Soda sizes',
  },
  {
    name: 'Soda Bottle',
    singularName: 'bottle',
    pluralName: 'bottles',
    servingSize: { kind: 'volume', amount: { amount: 20, unit: 'fl oz' } },
    group: 'Soda sizes',
  },
  {
    name: 'Two-Liter Soda Bottle',
    singularName: 'two-liter bottle',
    pluralName: 'two-liter bottles',
    servingSize: { kind: 'volume', amount: { amount: 2, unit: 'L' } },
    group: 'Soda sizes',
  },
  // Eggs
  {
    name: 'Small Egg',
    singularName: 'small egg',
    pluralName: 'small eggs',
    servingSize: { kind: 'mass', amount: { amount: 1.5, unit: 'oz' } },
    group: 'Eggs',
  },
  {
    name: 'Medium Egg',
    singularName: 'medium egg',
    pluralName: 'medium eggs',
    servingSize: { kind: 'mass', amount: { amount: 1.5, unit: 'oz' } },
    group: 'Eggs',
  },
  {
    name: 'Large Egg',
    singularName: 'large egg',
    pluralName: 'large eggs',
    servingSize: { kind: 'mass', amount: { amount: 1.5, unit: 'oz' } },
    group: 'Eggs',
  },
  {
    name: 'Extra-Large Egg',
    singularName: 'extra-large egg',
    pluralName: 'extra-large eggs',
    servingSize: { kind: 'mass', amount: { amount: 1.5, unit: 'oz' } },
    group: 'Eggs',
  },
  {
    name: 'Jumbo Egg',
    singularName: 'jumbo egg',
    pluralName: 'jumbo eggs',
    servingSize: { kind: 'servings', amount: 1 },
    group: 'Eggs',
  },
];

export function formatPresetServing(s: ServingSizeData): string {
  if (s.kind === 'servings' && typeof s.amount === 'number') return `${s.amount} serving(s)`;
  if (s.kind === 'mass' && typeof s.amount === 'object' && s.amount) {
    return `${s.amount.amount} ${s.amount.unit}`;
  }
  if (s.kind === 'volume' && typeof s.amount === 'object' && s.amount) {
    return `${s.amount.amount} ${s.amount.unit}`;
  }
  // Fallback for tagged union format (backwards compatibility)
  if (s.servings != null) return `${s.servings} serving(s)`;
  if (s.mass) return `${s.mass.amount} ${s.mass.unit}`;
  if (s.volume) return `${s.volume.amount} ${s.volume.unit}`;
  return '1 serving(s)';
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
