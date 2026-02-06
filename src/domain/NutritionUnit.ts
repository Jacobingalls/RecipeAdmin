import convert from 'convert';
import type { Unit } from 'convert';

export interface NutritionUnitData {
  amount: number;
  unit: string;
}

/**
 * Maps RecipeKit unit names to convert library unit names.
 * Only includes units that differ between the two systems.
 */
const UNIT_TO_CONVERT: Record<string, string> = {
  // Volume - RecipeKit uses descriptive names
  'fl oz (US)': 'fl oz',
  'fl oz (Imperial)': 'imp fl oz',
  'cup (US)': 'cup',
  'cup (Metric)': 'metric cup',
  'tbsp (US)': 'tbsp',
  'tbsp  (US)': 'tbsp', // Handle typo with double space
  'tsp (US)': 'tsp',
  'pt (US)': 'pt',
  'qt (US)': 'qt',
  'gal (US)': 'gal',
  'pt (Imperial)': 'imp pt',
  'qt (Imperial)': 'imp qt',
  'gal (Imperial)': 'imp gal',

  // Mass - microgram variants
  μg: 'µg',
  mcg: 'µg',
};

/**
 * Energy units that need custom conversion (convert library doesn't support calories).
 * Values are in joules per unit.
 */
const ENERGY_TO_JOULES: Record<string, number> = {
  kcal: 4184,
  cal: 4.184,
  kJ: 1000,
  J: 1,
  Wh: 3600,
};

function isEnergyUnit(unit: string): boolean {
  return unit in ENERGY_TO_JOULES;
}

function convertEnergy(amount: number, fromUnit: string, toUnit: string): number {
  const joules = amount * ENERGY_TO_JOULES[fromUnit];
  return joules / ENERGY_TO_JOULES[toUnit];
}

function toConvertUnit(unit: string): string {
  return UNIT_TO_CONVERT[unit] || unit;
}

/**
 * Represents a nutritional amount with a unit.
 * Supports conversion, scaling, and addition.
 */
export class NutritionUnit {
  amount: number;
  unit: string;

  constructor(amount: number, unit: string) {
    this.amount = amount;
    this.unit = unit;
  }

  converted(toUnit: string): NutritionUnit {
    if (this.unit === toUnit) {
      return new NutritionUnit(this.amount, this.unit);
    }

    // Handle energy units specially (convert library doesn't support kcal)
    if (isEnergyUnit(this.unit) && isEnergyUnit(toUnit)) {
      const convertedAmount = convertEnergy(this.amount, this.unit, toUnit);
      return new NutritionUnit(convertedAmount, toUnit);
    }

    // Translate units and use convert library
    const fromUnit = toConvertUnit(this.unit);
    const targetUnit = toConvertUnit(toUnit);
    const convertedAmount = convert(this.amount, fromUnit as Unit).to(targetUnit as Unit);
    return new NutritionUnit(convertedAmount, toUnit);
  }

  scaled(factor: number): NutritionUnit {
    return new NutritionUnit(this.amount * factor, this.unit);
  }

  add(other: NutritionUnit): NutritionUnit {
    const otherConverted = other.converted(this.unit);
    return new NutritionUnit(this.amount + otherConverted.amount, this.unit);
  }

  toString(): string {
    return `${this.amount}${this.unit}`;
  }

  static fromObject(obj: NutritionUnitData | null | undefined): NutritionUnit | null {
    if (obj == null) return null;
    return new NutritionUnit(obj.amount, obj.unit);
  }
}
