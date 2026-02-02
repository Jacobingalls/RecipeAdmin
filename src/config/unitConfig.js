/**
 * Unit definitions and helpers for the serving size selector.
 * Contains curated lists of nutrition-relevant units with search aliases.
 */

// Mass units with display labels and search aliases
// Uses RecipeKit unit names as values
export const massUnits = [
    { value: 'g', label: 'grams (g)', aliases: ['gram', 'grams', 'g'] },
    { value: 'mg', label: 'milligrams (mg)', aliases: ['milligram', 'milligrams', 'mg'] },
    { value: 'μg', label: 'micrograms (μg)', aliases: ['microgram', 'micrograms', 'mcg', 'μg', 'ug'] },
    { value: 'kg', label: 'kilograms (kg)', aliases: ['kilogram', 'kilograms', 'kg'] },
    { value: 'oz', label: 'ounces (oz)', aliases: ['ounce', 'ounces', 'oz'] },
    { value: 'lb', label: 'pounds (lb)', aliases: ['pound', 'pounds', 'lb', 'lbs'] },
]

// Volume units with display labels and search aliases
// Uses RecipeKit unit names as values (e.g., 'fl oz (US)' not 'fl oz')
export const volumeUnits = [
    { value: 'mL', label: 'milliliters (mL)', aliases: ['milliliter', 'milliliters', 'ml', 'mL'] },
    { value: 'L', label: 'liters (L)', aliases: ['liter', 'liters', 'l', 'L'] },
    { value: 'cup (US)', label: 'cups', aliases: ['cup', 'cups'] },
    { value: 'tbsp (US)', label: 'tablespoons (tbsp)', aliases: ['tablespoon', 'tablespoons', 'tbsp', 'tbs'] },
    { value: 'tsp (US)', label: 'teaspoons (tsp)', aliases: ['teaspoon', 'teaspoons', 'tsp'] },
    { value: 'fl oz (US)', label: 'fluid ounces (fl oz)', aliases: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz'] },
    { value: 'pt (US)', label: 'pints (pt)', aliases: ['pint', 'pints', 'pt'] },
    { value: 'qt (US)', label: 'quarts (qt)', aliases: ['quart', 'quarts', 'qt'] },
    { value: 'gal (US)', label: 'gallons (gal)', aliases: ['gallon', 'gallons', 'gal'] },
]

// Energy units with display labels and search aliases
export const energyUnits = [
    { value: 'kcal', label: 'calories (kcal)', aliases: ['calorie', 'calories', 'kcal', 'cal'] },
    { value: 'kJ', label: 'kilojoules (kJ)', aliases: ['kilojoule', 'kilojoules', 'kj', 'kJ'] },
    { value: 'J', label: 'joules (J)', aliases: ['joule', 'joules', 'j', 'J'] },
    { value: 'Wh', label: 'watt-hours (Wh)', aliases: ['watt-hour', 'watt-hours', 'wh', 'Wh'] },
]

/**
 * Build option groups for the serving size selector based on preparation capabilities.
 * @param {Preperation} prep - The preparation object
 * @returns {Array} Array of option groups with their options
 */
export function buildOptionGroups(prep) {
    const groups = []

    // Servings - always available
    groups.push({
        label: 'Servings',
        options: [
            { type: 'servings', value: 'servings', label: 'servings', aliases: ['serving', 'servings'] }
        ]
    })

    // Custom Sizes - only if prep has custom sizes
    if (prep.customSizes && prep.customSizes.length > 0) {
        groups.push({
            label: 'Custom Sizes',
            options: prep.customSizes.map(cs => ({
                type: 'customSize',
                value: cs.name,
                label: cs.name,
                aliases: [cs.name.toLowerCase()]
            }))
        })
    }

    // Mass - only if prep has mass defined
    if (prep.mass) {
        groups.push({
            label: 'Mass',
            options: massUnits.map(u => ({
                type: 'mass',
                value: u.value,
                label: u.label,
                aliases: u.aliases
            }))
        })
    }

    // Volume - only if prep has volume defined
    if (prep.volume) {
        groups.push({
            label: 'Volume',
            options: volumeUnits.map(u => ({
                type: 'volume',
                value: u.value,
                label: u.label,
                aliases: u.aliases
            }))
        })
    }

    // Energy - only if prep has calories defined
    if (prep.nutritionalInformation?.calories) {
        groups.push({
            label: 'Energy',
            options: energyUnits.map(u => ({
                type: 'energy',
                value: u.value,
                label: u.label,
                aliases: u.aliases
            }))
        })
    }

    return groups
}

/**
 * Filter option groups by search query.
 * @param {Array} groups - Array of option groups
 * @param {string} query - Search query
 * @returns {Array} Filtered option groups (groups with no matches are excluded)
 */
export function filterGroups(groups, query) {
    if (!query || query.trim() === '') {
        return groups
    }

    const lowerQuery = query.toLowerCase().trim()

    return groups
        .map(group => ({
            ...group,
            options: group.options.filter(option =>
                option.label.toLowerCase().includes(lowerQuery) ||
                option.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))
            )
        }))
        .filter(group => group.options.length > 0)
}
