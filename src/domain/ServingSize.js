import { NutritionUnit } from './NutritionUnit'

/**
 * Represents different ways to measure a serving.
 * Mirrors RecipeKit's ServingSize enum.
 */
export class ServingSize {
    /**
     * @param {string} type - One of: 'servings', 'mass', 'volume', 'energy', 'customSize'
     * @param {number|NutritionUnit|{name: string, amount: number}} value - The value for this serving size
     */
    constructor(type, value) {
        this.type = type
        this.value = value
    }

    /**
     * Create a serving size by number of servings
     * @param {number} count
     */
    static servings(count) {
        return new ServingSize('servings', count)
    }

    /**
     * Create a serving size by mass
     * @param {number} amount
     * @param {string} unit - e.g., 'g', 'mg', 'kg'
     */
    static mass(amount, unit) {
        return new ServingSize('mass', new NutritionUnit(amount, unit))
    }

    /**
     * Create a serving size by volume
     * @param {number} amount
     * @param {string} unit - e.g., 'mL', 'L', 'cup'
     */
    static volume(amount, unit) {
        return new ServingSize('volume', new NutritionUnit(amount, unit))
    }

    /**
     * Create a serving size by energy (calories)
     * @param {number} amount
     * @param {string} unit - e.g., 'kcal'
     */
    static energy(amount, unit) {
        return new ServingSize('energy', new NutritionUnit(amount, unit))
    }

    /**
     * Create a serving size by custom size name and amount
     * @param {string} name - e.g., 'cookie', 'slice'
     * @param {number} amount - e.g., 2 for "2 cookies"
     */
    static customSize(name, amount) {
        return new ServingSize('customSize', { name, amount })
    }

    /**
     * Get the numeric amount of this serving size
     */
    get amount() {
        switch (this.type) {
            case 'servings':
                return this.value
            case 'mass':
            case 'volume':
            case 'energy':
                return this.value.amount
            case 'customSize':
                return this.value.amount
            default:
                return 0
        }
    }

    /**
     * Scale this serving size by a factor
     * @param {number} factor
     */
    scaled(factor) {
        switch (this.type) {
            case 'servings':
                return ServingSize.servings(this.value * factor)
            case 'mass':
                return new ServingSize('mass', this.value.scaled(factor))
            case 'volume':
                return new ServingSize('volume', this.value.scaled(factor))
            case 'energy':
                return new ServingSize('energy', this.value.scaled(factor))
            case 'customSize':
                return ServingSize.customSize(this.value.name, this.value.amount * factor)
            default:
                return this
        }
    }

    /**
     * Create from plain object (e.g., from API response)
     * API format uses 'kind' field:
     * - { kind: 'servings', amount: 2 }
     * - { kind: 'customSize', name: '20oz Bottle', amount: 1 }
     * - { kind: 'volume', amount: { amount: 8, unit: 'fl oz (US)' } }
     */
    static fromObject(obj) {
        if (obj == null) return null

        const kind = obj.kind || obj.type
        if (!kind) return null

        switch (kind) {
            case 'servings':
                return ServingSize.servings(obj.amount ?? obj.value)
            case 'mass':
                return new ServingSize('mass', NutritionUnit.fromObject(obj.amount ?? obj.value))
            case 'volume':
                return new ServingSize('volume', NutritionUnit.fromObject(obj.amount ?? obj.value))
            case 'energy':
                return new ServingSize('energy', NutritionUnit.fromObject(obj.amount ?? obj.value))
            case 'customSize':
                // customSize has name and amount at top level
                const name = obj.name ?? obj.value?.name
                const amount = obj.amount ?? obj.value?.amount
                return ServingSize.customSize(name, amount)
            default:
                return null
        }
    }

    toString() {
        switch (this.type) {
            case 'servings':
                return `${this.value} serving${this.value !== 1 ? 's' : ''}`
            case 'mass':
            case 'volume':
            case 'energy':
                return this.value.toString()
            case 'customSize':
                return `${this.value.amount} ${this.value.name}${this.value.amount !== 1 ? 's' : ''}`
            default:
                return ''
        }
    }
}
