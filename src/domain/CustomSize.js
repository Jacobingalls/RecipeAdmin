import { ServingSize } from './ServingSize'
import { formatSignificant } from '../utils/formatters'

/**
 * Represents a custom serving size (e.g., "1 cookie", "1 bottle").
 */
export class CustomSize {
    constructor(data = {}) {
        this.id = data.id
        this.name = data.name || ''
        this.singularName = data.singularName || ''
        this.pluralName = data.pluralName || ''
        this.notes = data.notes || []

        // The serving size that this custom size represents
        // e.g., "1 cookie" might be 0.5 servings, or 30 grams
        if (data.servingSize) {
            this.servingSize = ServingSize.fromObject(data.servingSize)
        } else if (data.servings != null) {
            // Shorthand: if servings is provided directly
            this.servingSize = ServingSize.servings(data.servings)
        } else {
            this.servingSize = ServingSize.servings(1)
        }
    }

    /**
     * Get a human-readable description of what this custom size equals.
     * e.g., "8 fl oz (US)" or "30g"
     */
    get description() {
        if (!this.servingSize) return null

        switch (this.servingSize.type) {
            case 'servings':
                const count = this.servingSize.value
                return `${formatSignificant(count)} serving${count !== 1 ? 's' : ''}`
            case 'mass':
            case 'volume':
            case 'energy':
                return `${formatSignificant(this.servingSize.value.amount)}${this.servingSize.value.unit}`
            default:
                return null
        }
    }
}
