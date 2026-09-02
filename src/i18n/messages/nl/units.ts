import type { enUnits } from '../en/units';

export const nlUnits: Record<keyof typeof enUnits, string> = {
  'unit.group.servings': 'Porties',
  'unit.group.customSizes': 'Eigen porties',
  'unit.group.mass': 'Massa',
  'unit.group.volume': 'Volume',
  'unit.group.energy': 'Energie',

  'unit.servings': 'Porties',
  'unit.none': 'Geen',
  'unit.amount': 'Hoeveelheid',
  'unit.unit': 'Eenheid',
  'unit.searchPlaceholder': 'Zoek eenheden...',
  'unit.searchLabel': 'Eenheden zoeken',
  'unit.noMatches': 'Geen passende eenheden',

  'unit.mass.g': 'Grammen (g)',
  'unit.mass.mg': 'Milligrammen (mg)',
  'unit.mass.ug': 'Microgrammen (μg)',
  'unit.mass.kg': 'Kilogrammen (kg)',
  'unit.mass.oz': 'Ounces (oz)',
  'unit.mass.lb': 'Ponden (lb)',

  'unit.volume.ml': 'Milliliters (mL)',
  'unit.volume.l': 'Liters (L)',
  'unit.volume.cup': 'Kopjes',
  'unit.volume.tbsp': 'Eetlepels (el)',
  'unit.volume.tsp': 'Theelepels (tl)',
  'unit.volume.flOz': 'Fluid ounces (fl oz)',
  'unit.volume.pt': 'Pints (pt)',
  'unit.volume.qt': 'Quarts (qt)',
  'unit.volume.gal': 'Gallons (gal)',

  'unit.energy.kcal': 'Calorieën (kcal)',
  'unit.energy.kj': 'Kilojoules (kJ)',
  'unit.energy.j': 'Joules (J)',
  'unit.energy.wh': 'Wattuur (Wh)',
};
