import type { Translations } from '../../types';
import type { enUnits } from '../en/units';

export const daUnits: Translations<typeof enUnits> = {
  'unit.group.servings': 'Portioner',
  'unit.group.customSizes': 'Egne størrelser',
  'unit.group.mass': 'Vægt',
  'unit.group.volume': 'Volumen',
  'unit.group.energy': 'Energi',

  'unit.servings': 'Portioner',
  'unit.none': 'Ingen',
  'unit.amount': 'Mængde',
  'unit.unit': 'Enhed',
  'unit.searchPlaceholder': 'Søg efter enheder...',
  'unit.searchLabel': 'Søg efter enheder',
  'unit.noMatches': 'Ingen enheder matcher',

  'unit.mass.g': 'Gram (g)',
  'unit.mass.mg': 'Milligram (mg)',
  'unit.mass.ug': 'Mikrogram (μg)',
  'unit.mass.kg': 'Kilogram (kg)',
  'unit.mass.oz': 'Ounce (oz)',
  'unit.mass.lb': 'Pund (lb)',

  'unit.volume.ml': 'Milliliter (mL)',
  'unit.volume.l': 'Liter (L)',
  'unit.volume.cup': 'Cups',
  'unit.volume.tbsp': 'Spiseskeer (spsk.)',
  'unit.volume.tsp': 'Teskeer (tsk.)',
  'unit.volume.flOz': 'Fluid ounces (fl oz)',
  'unit.volume.pt': 'Pints (pt)',
  'unit.volume.qt': 'Quarts (qt)',
  'unit.volume.gal': 'Gallon (gal)',

  'unit.energy.kcal': 'Kalorier (kcal)',
  'unit.energy.kj': 'Kilojoule (kJ)',
  'unit.energy.j': 'Joule (J)',
  'unit.energy.wh': 'Watt-timer (Wh)',
};
