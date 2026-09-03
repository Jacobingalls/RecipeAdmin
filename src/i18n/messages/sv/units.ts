import type { Translations } from '../../types';
import type { enUnits } from '../en/units';

export const svUnits: Translations<typeof enUnits> = {
  'unit.group.servings': 'Portioner',
  'unit.group.customSizes': 'Egna storlekar',
  'unit.group.mass': 'Vikt',
  'unit.group.volume': 'Volym',
  'unit.group.energy': 'Energi',

  'unit.servings': 'Portioner',
  'unit.none': 'Ingen',
  'unit.amount': 'Mängd',
  'unit.unit': 'Enhet',
  'unit.searchPlaceholder': 'Sök enheter...',
  'unit.searchLabel': 'Sök enheter',
  'unit.noMatches': 'Inga matchande enheter',

  'unit.mass.g': 'Gram (g)',
  'unit.mass.mg': 'Milligram (mg)',
  'unit.mass.ug': 'Mikrogram (μg)',
  'unit.mass.kg': 'Kilogram (kg)',
  'unit.mass.oz': 'Uns (oz)',
  'unit.mass.lb': 'Pund (lb)',

  'unit.volume.ml': 'Milliliter (mL)',
  'unit.volume.l': 'Liter (L)',
  'unit.volume.cup': 'Cups',
  'unit.volume.tbsp': 'Matskedar (msk)',
  'unit.volume.tsp': 'Teskedar (tsk)',
  'unit.volume.flOz': 'Fluid ounces (fl oz)',
  'unit.volume.pt': 'Pints (pt)',
  'unit.volume.qt': 'Quarts (qt)',
  'unit.volume.gal': 'Gallon (gal)',

  'unit.energy.kcal': 'Kalorier (kcal)',
  'unit.energy.kj': 'Kilojoule (kJ)',
  'unit.energy.j': 'Joule (J)',
  'unit.energy.wh': 'Wattimmar (Wh)',
};
