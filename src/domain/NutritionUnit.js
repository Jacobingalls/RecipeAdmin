import convert from 'convert';

/**
 * Maps RecipeKit unit names to convert library unit names.
 * Only includes units that differ between the two systems.
 */
const UNIT_TO_CONVERT = {
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
const ENERGY_TO_JOULES = {
  kcal: 4184,
  cal: 4.184,
  kJ: 1000,
  J: 1,
  Wh: 3600,
};

/**
 * Check if a unit is an energy unit we handle specially.
 */
function isEnergyUnit(unit) {
  return unit in ENERGY_TO_JOULES;
}

/**
 * Convert between energy units (since convert library doesn't support kcal).
 */
function convertEnergy(amount, fromUnit, toUnit) {
  const joules = amount * ENERGY_TO_JOULES[fromUnit];
  return joules / ENERGY_TO_JOULES[toUnit];
}

/**
 * Translate a RecipeKit unit to the convert library's expected unit name.
 */
function toConvertUnit(unit) {
  return UNIT_TO_CONVERT[unit] || unit;
}

/**
 * Represents a nutritional amount with a unit.
 * Supports conversion, scaling, and addition.
 */
export class NutritionUnit {
  constructor(amount, unit) {
    this.amount = amount;
    this.unit = unit;
  }

  /**
   * Convert to a different unit
   */
  converted(toUnit) {
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
    const convertedAmount = convert(this.amount, fromUnit).to(targetUnit);
    return new NutritionUnit(convertedAmount, toUnit);
  }

  /**
   * Scale the amount by a factor
   */
  scaled(factor) {
    return new NutritionUnit(this.amount * factor, this.unit);
  }

  /**
   * Add another NutritionUnit, converting to this unit first
   */
  add(other) {
    const otherConverted = other.converted(this.unit);
    return new NutritionUnit(this.amount + otherConverted.amount, this.unit);
  }

  /**
   * Format as string (e.g., "100mg")
   */
  toString() {
    return `${this.amount}${this.unit}`;
  }

  /**
   * Create from plain object { amount, unit }
   */
  static fromObject(obj) {
    if (obj == null) return null;
    return new NutritionUnit(obj.amount, obj.unit);
  }
}
