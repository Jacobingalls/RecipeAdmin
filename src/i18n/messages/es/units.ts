import type { Translations } from '../../types';
import type { enUnits } from '../en/units';

export const esUnits: Translations<typeof enUnits> = {
  'unit.group.servings': 'Raciones',
  'unit.group.customSizes': 'Tamaños personalizados',
  'unit.group.mass': 'Peso',
  'unit.group.volume': 'Volumen',
  'unit.group.energy': 'Energía',

  'unit.servings': 'Raciones',
  'unit.none': 'Ninguna',
  'unit.amount': 'Cantidad',
  'unit.unit': 'Unidad',
  'unit.searchPlaceholder': 'Buscar unidades...',
  'unit.searchLabel': 'Buscar unidades',
  'unit.noMatches': 'Ninguna unidad coincide',

  'unit.mass.g': 'Gramos (g)',
  'unit.mass.mg': 'Miligramos (mg)',
  'unit.mass.ug': 'Microgramos (μg)',
  'unit.mass.kg': 'Kilogramos (kg)',
  'unit.mass.oz': 'Onzas (oz)',
  'unit.mass.lb': 'Libras (lb)',

  'unit.volume.ml': 'Mililitros (mL)',
  'unit.volume.l': 'Litros (L)',
  'unit.volume.cup': 'Tazas',
  'unit.volume.tbsp': 'Cucharadas (cda.)',
  'unit.volume.tsp': 'Cucharaditas (cdta.)',
  'unit.volume.flOz': 'Onzas líquidas (fl oz)',
  'unit.volume.pt': 'Pintas (pt)',
  'unit.volume.qt': 'Cuartos de galón (qt)',
  'unit.volume.gal': 'Galones (gal)',

  'unit.energy.kcal': 'Calorías (kcal)',
  'unit.energy.kj': 'Kilojulios (kJ)',
  'unit.energy.j': 'Julios (J)',
  'unit.energy.wh': 'Vatios-hora (Wh)',
};
