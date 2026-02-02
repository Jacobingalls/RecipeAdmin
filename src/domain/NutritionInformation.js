import { NutritionUnit } from './NutritionUnit'

/**
 * Helper to add two optional NutritionUnits
 */
function addOptional(a, b) {
    if (a == null && b == null) return null
    if (a == null) return b
    if (b == null) return a
    return a.add(b)
}

/**
 * Helper to scale an optional NutritionUnit
 */
function scaleOptional(nu, factor) {
    if (nu == null) return null
    return nu.scaled(factor)
}

/**
 * Represents complete nutritional information.
 * Supports adding together and scaling.
 */
export class NutritionInformation {
    constructor(data = {}) {
        // Energy
        this.calories = NutritionUnit.fromObject(data.calories)
        this.caloriesFromFat = NutritionUnit.fromObject(data.caloriesFromFat)

        // Fats
        this.totalFat = NutritionUnit.fromObject(data.totalFat)
        this.saturatedFat = NutritionUnit.fromObject(data.saturatedFat)
        this.transFat = NutritionUnit.fromObject(data.transFat)
        this.polyunsaturatedFat = NutritionUnit.fromObject(data.polyunsaturatedFat)
        this.monounsaturatedFat = NutritionUnit.fromObject(data.monounsaturatedFat)

        // Cholesterol & Sodium
        this.cholesterol = NutritionUnit.fromObject(data.cholesterol)
        this.sodium = NutritionUnit.fromObject(data.sodium)

        // Carbohydrates
        this.totalCarbohydrate = NutritionUnit.fromObject(data.totalCarbohydrate)
        this.dietaryFiber = NutritionUnit.fromObject(data.dietaryFiber)
        this.solubleFiber = NutritionUnit.fromObject(data.solubleFiber)
        this.insolubleFiber = NutritionUnit.fromObject(data.insolubleFiber)
        this.totalSugars = NutritionUnit.fromObject(data.totalSugars)
        this.addedSugars = NutritionUnit.fromObject(data.addedSugars)
        this.sugarAlcohol = NutritionUnit.fromObject(data.sugarAlcohol)

        // Protein
        this.protein = NutritionUnit.fromObject(data.protein)

        // Vitamins
        this.vitaminA = NutritionUnit.fromObject(data.vitaminA)
        this.vitaminC = NutritionUnit.fromObject(data.vitaminC)
        this.vitaminD = NutritionUnit.fromObject(data.vitaminD)
        this.vitaminE = NutritionUnit.fromObject(data.vitaminE)
        this.vitaminK = NutritionUnit.fromObject(data.vitaminK)
        this.thiamin = NutritionUnit.fromObject(data.thiamin)
        this.riboflavin = NutritionUnit.fromObject(data.riboflavin)
        this.niacin = NutritionUnit.fromObject(data.niacin)
        this.vitaminB6 = NutritionUnit.fromObject(data.vitaminB6)
        this.folate = NutritionUnit.fromObject(data.folate)
        this.vitaminB12 = NutritionUnit.fromObject(data.vitaminB12)
        this.biotin = NutritionUnit.fromObject(data.biotin)
        this.pantothenicAcid = NutritionUnit.fromObject(data.pantothenicAcid)
        this.choline = NutritionUnit.fromObject(data.choline)

        // Minerals
        this.calcium = NutritionUnit.fromObject(data.calcium)
        this.iron = NutritionUnit.fromObject(data.iron)
        this.phosphorus = NutritionUnit.fromObject(data.phosphorus)
        this.iodine = NutritionUnit.fromObject(data.iodine)
        this.magnesium = NutritionUnit.fromObject(data.magnesium)
        this.zinc = NutritionUnit.fromObject(data.zinc)
        this.selenium = NutritionUnit.fromObject(data.selenium)
        this.copper = NutritionUnit.fromObject(data.copper)
        this.manganese = NutritionUnit.fromObject(data.manganese)
        this.chromium = NutritionUnit.fromObject(data.chromium)
        this.molybdenum = NutritionUnit.fromObject(data.molybdenum)
        this.chloride = NutritionUnit.fromObject(data.chloride)
        this.potassium = NutritionUnit.fromObject(data.potassium)
    }

    /**
     * Scale all nutritional values by a factor
     */
    scaled(factor) {
        const result = new NutritionInformation()

        // Energy
        result.calories = scaleOptional(this.calories, factor)
        result.caloriesFromFat = scaleOptional(this.caloriesFromFat, factor)

        // Fats
        result.totalFat = scaleOptional(this.totalFat, factor)
        result.saturatedFat = scaleOptional(this.saturatedFat, factor)
        result.transFat = scaleOptional(this.transFat, factor)
        result.polyunsaturatedFat = scaleOptional(this.polyunsaturatedFat, factor)
        result.monounsaturatedFat = scaleOptional(this.monounsaturatedFat, factor)

        // Cholesterol & Sodium
        result.cholesterol = scaleOptional(this.cholesterol, factor)
        result.sodium = scaleOptional(this.sodium, factor)

        // Carbohydrates
        result.totalCarbohydrate = scaleOptional(this.totalCarbohydrate, factor)
        result.dietaryFiber = scaleOptional(this.dietaryFiber, factor)
        result.solubleFiber = scaleOptional(this.solubleFiber, factor)
        result.insolubleFiber = scaleOptional(this.insolubleFiber, factor)
        result.totalSugars = scaleOptional(this.totalSugars, factor)
        result.addedSugars = scaleOptional(this.addedSugars, factor)
        result.sugarAlcohol = scaleOptional(this.sugarAlcohol, factor)

        // Protein
        result.protein = scaleOptional(this.protein, factor)

        // Vitamins
        result.vitaminA = scaleOptional(this.vitaminA, factor)
        result.vitaminC = scaleOptional(this.vitaminC, factor)
        result.vitaminD = scaleOptional(this.vitaminD, factor)
        result.vitaminE = scaleOptional(this.vitaminE, factor)
        result.vitaminK = scaleOptional(this.vitaminK, factor)
        result.thiamin = scaleOptional(this.thiamin, factor)
        result.riboflavin = scaleOptional(this.riboflavin, factor)
        result.niacin = scaleOptional(this.niacin, factor)
        result.vitaminB6 = scaleOptional(this.vitaminB6, factor)
        result.folate = scaleOptional(this.folate, factor)
        result.vitaminB12 = scaleOptional(this.vitaminB12, factor)
        result.biotin = scaleOptional(this.biotin, factor)
        result.pantothenicAcid = scaleOptional(this.pantothenicAcid, factor)
        result.choline = scaleOptional(this.choline, factor)

        // Minerals
        result.calcium = scaleOptional(this.calcium, factor)
        result.iron = scaleOptional(this.iron, factor)
        result.phosphorus = scaleOptional(this.phosphorus, factor)
        result.iodine = scaleOptional(this.iodine, factor)
        result.magnesium = scaleOptional(this.magnesium, factor)
        result.zinc = scaleOptional(this.zinc, factor)
        result.selenium = scaleOptional(this.selenium, factor)
        result.copper = scaleOptional(this.copper, factor)
        result.manganese = scaleOptional(this.manganese, factor)
        result.chromium = scaleOptional(this.chromium, factor)
        result.molybdenum = scaleOptional(this.molybdenum, factor)
        result.chloride = scaleOptional(this.chloride, factor)
        result.potassium = scaleOptional(this.potassium, factor)

        return result
    }

    /**
     * Add another NutritionInformation to this one
     */
    add(other) {
        const result = new NutritionInformation()

        // Energy
        result.calories = addOptional(this.calories, other.calories)
        result.caloriesFromFat = addOptional(this.caloriesFromFat, other.caloriesFromFat)

        // Fats
        result.totalFat = addOptional(this.totalFat, other.totalFat)
        result.saturatedFat = addOptional(this.saturatedFat, other.saturatedFat)
        result.transFat = addOptional(this.transFat, other.transFat)
        result.polyunsaturatedFat = addOptional(this.polyunsaturatedFat, other.polyunsaturatedFat)
        result.monounsaturatedFat = addOptional(this.monounsaturatedFat, other.monounsaturatedFat)

        // Cholesterol & Sodium
        result.cholesterol = addOptional(this.cholesterol, other.cholesterol)
        result.sodium = addOptional(this.sodium, other.sodium)

        // Carbohydrates
        result.totalCarbohydrate = addOptional(this.totalCarbohydrate, other.totalCarbohydrate)
        result.dietaryFiber = addOptional(this.dietaryFiber, other.dietaryFiber)
        result.solubleFiber = addOptional(this.solubleFiber, other.solubleFiber)
        result.insolubleFiber = addOptional(this.insolubleFiber, other.insolubleFiber)
        result.totalSugars = addOptional(this.totalSugars, other.totalSugars)
        result.addedSugars = addOptional(this.addedSugars, other.addedSugars)
        result.sugarAlcohol = addOptional(this.sugarAlcohol, other.sugarAlcohol)

        // Protein
        result.protein = addOptional(this.protein, other.protein)

        // Vitamins
        result.vitaminA = addOptional(this.vitaminA, other.vitaminA)
        result.vitaminC = addOptional(this.vitaminC, other.vitaminC)
        result.vitaminD = addOptional(this.vitaminD, other.vitaminD)
        result.vitaminE = addOptional(this.vitaminE, other.vitaminE)
        result.vitaminK = addOptional(this.vitaminK, other.vitaminK)
        result.thiamin = addOptional(this.thiamin, other.thiamin)
        result.riboflavin = addOptional(this.riboflavin, other.riboflavin)
        result.niacin = addOptional(this.niacin, other.niacin)
        result.vitaminB6 = addOptional(this.vitaminB6, other.vitaminB6)
        result.folate = addOptional(this.folate, other.folate)
        result.vitaminB12 = addOptional(this.vitaminB12, other.vitaminB12)
        result.biotin = addOptional(this.biotin, other.biotin)
        result.pantothenicAcid = addOptional(this.pantothenicAcid, other.pantothenicAcid)
        result.choline = addOptional(this.choline, other.choline)

        // Minerals
        result.calcium = addOptional(this.calcium, other.calcium)
        result.iron = addOptional(this.iron, other.iron)
        result.phosphorus = addOptional(this.phosphorus, other.phosphorus)
        result.iodine = addOptional(this.iodine, other.iodine)
        result.magnesium = addOptional(this.magnesium, other.magnesium)
        result.zinc = addOptional(this.zinc, other.zinc)
        result.selenium = addOptional(this.selenium, other.selenium)
        result.copper = addOptional(this.copper, other.copper)
        result.manganese = addOptional(this.manganese, other.manganese)
        result.chromium = addOptional(this.chromium, other.chromium)
        result.molybdenum = addOptional(this.molybdenum, other.molybdenum)
        result.chloride = addOptional(this.chloride, other.chloride)
        result.potassium = addOptional(this.potassium, other.potassium)

        return result
    }

    /**
     * Create a zero NutritionInformation (all values null except calories at 0)
     */
    static zero() {
        return new NutritionInformation({
            calories: { amount: 0, unit: 'kcal' }
        })
    }
}
