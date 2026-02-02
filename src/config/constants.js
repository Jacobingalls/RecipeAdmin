// FDA Daily Values (2020 update)
// Reference: https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
// Units: amounts are in the units shown, matching FDA reference

export const DAILY_VALUES = {
    // Energy
    calories: { amount: 2000, unit: 'kcal' },

    // Fats (grams)
    totalFat: { amount: 78, unit: 'g' },
    saturatedFat: { amount: 20, unit: 'g' },
    transFat: null, // No DV established
    polyunsaturatedFat: null, // No DV established
    monounsaturatedFat: null, // No DV established

    // Cholesterol & Sodium (milligrams)
    cholesterol: { amount: 300, unit: 'mg' },
    sodium: { amount: 2300, unit: 'mg' },

    // Carbohydrates (grams)
    totalCarbohydrate: { amount: 275, unit: 'g' },
    dietaryFiber: { amount: 28, unit: 'g' },
    solubleFiber: null, // No DV established
    insolubleFiber: null, // No DV established
    totalSugars: null, // No DV established
    addedSugars: { amount: 50, unit: 'g' },
    sugarAlcohol: null, // No DV established

    // Protein (grams)
    protein: { amount: 50, unit: 'g' },

    // Vitamins
    vitaminA: { amount: 900, unit: 'mcg' }, // RAE
    vitaminC: { amount: 90, unit: 'mg' },
    vitaminD: { amount: 20, unit: 'mcg' },
    vitaminE: { amount: 15, unit: 'mg' }, // alpha-tocopherol
    vitaminK: { amount: 120, unit: 'mcg' },
    thiamin: { amount: 1.2, unit: 'mg' },
    riboflavin: { amount: 1.3, unit: 'mg' },
    niacin: { amount: 16, unit: 'mg' }, // NE
    vitaminB6: { amount: 1.7, unit: 'mg' },
    folate: { amount: 400, unit: 'mcg' }, // DFE
    vitaminB12: { amount: 2.4, unit: 'mcg' },
    biotin: { amount: 30, unit: 'mcg' },
    pantothenicAcid: { amount: 5, unit: 'mg' },
    choline: { amount: 550, unit: 'mg' },

    // Minerals
    calcium: { amount: 1300, unit: 'mg' },
    iron: { amount: 18, unit: 'mg' },
    phosphorus: { amount: 1250, unit: 'mg' },
    iodine: { amount: 150, unit: 'mcg' },
    magnesium: { amount: 420, unit: 'mg' },
    zinc: { amount: 11, unit: 'mg' },
    selenium: { amount: 55, unit: 'mcg' },
    copper: { amount: 0.9, unit: 'mg' },
    manganese: { amount: 2.3, unit: 'mg' },
    chromium: { amount: 35, unit: 'mcg' },
    molybdenum: { amount: 45, unit: 'mcg' },
    chloride: { amount: 2300, unit: 'mg' },
    potassium: { amount: 4700, unit: 'mg' },
}
