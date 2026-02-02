import { NutritionInformation } from './NutritionInformation'
import { NutritionUnit } from './NutritionUnit'
import { ServingSize } from './ServingSize'
import { CustomSize } from './CustomSize'

/**
 * Represents a specific preparation of a product.
 * Contains nutritional information for one serving and methods to calculate
 * nutrition for different serving sizes.
 *
 * Mirrors RecipeKit's Product.Preperation struct.
 */
export class Preperation {
    /**
     * @param {object} data - Plain object from API
     */
    constructor(data = {}) {
        this.id = data.id
        this.name = data.name || 'Default'

        // Nutrition information for ONE serving
        this.nutritionalInformation = new NutritionInformation(data.nutritionalInformation || {})

        // Size of one serving in mass (optional)
        this.mass = NutritionUnit.fromObject(data.mass)

        // Size of one serving in volume (optional)
        this.volume = NutritionUnit.fromObject(data.volume)

        // Custom sizes (e.g., "1 cookie", "1 slice")
        this.customSizes = (data.customSizes || []).map(cs => new CustomSize(cs))

        // Notes about the preparation
        this.notes = data.notes || []
    }

    /**
     * Calculate the scalar (multiplier) for a given serving size.
     * This tells us how many "base servings" the requested serving size represents.
     *
     * @param {ServingSize} servingSize
     * @returns {number} The scalar to multiply nutritional information by
     * @throws {Error} If the serving size type is not supported for this preparation
     */
    scalar(servingSize) {
        switch (servingSize.type) {
            case 'servings':
                return servingSize.value

            case 'mass':
                if (!this.mass) {
                    throw new Error('Cannot calculate serving by mass: preparation has no mass defined')
                }
                // Convert requested mass to same unit as serving mass, then divide
                const requestedMass = servingSize.value.converted(this.mass.unit)
                return requestedMass.amount / this.mass.amount

            case 'volume':
                if (!this.volume) {
                    throw new Error('Cannot calculate serving by volume: preparation has no volume defined')
                }
                // Convert requested volume to same unit as serving volume, then divide
                const requestedVolume = servingSize.value.converted(this.volume.unit)
                return requestedVolume.amount / this.volume.amount

            case 'energy':
                if (!this.nutritionalInformation.calories) {
                    throw new Error('Cannot calculate serving by energy: preparation has no calories defined')
                }
                // Convert requested energy to same unit as serving calories, then divide
                const requestedEnergy = servingSize.value.converted(this.nutritionalInformation.calories.unit)
                return requestedEnergy.amount / this.nutritionalInformation.calories.amount

            case 'customSize':
                const customSize = this.customSizes.find(cs => cs.name === servingSize.value.name)
                if (!customSize) {
                    throw new Error(`Unknown custom size: ${servingSize.value.name}`)
                }
                // Recursively resolve the custom size's serving size, scaled by the requested amount
                return this.scalar(customSize.servingSize.scaled(servingSize.value.amount))

            default:
                throw new Error(`Unknown serving size type: ${servingSize.type}`)
        }
    }

    /**
     * Get nutritional information for a given serving size.
     *
     * @param {ServingSize} servingSize
     * @returns {NutritionInformation} Scaled nutritional information
     */
    nutritionalInformationFor(servingSize) {
        const scaler = this.scalar(servingSize)
        return this.nutritionalInformation.scaled(scaler)
    }

    /**
     * Get nutritional information for a given number of servings.
     * Convenience method for the common case.
     *
     * @param {number} servings
     * @returns {NutritionInformation}
     */
    nutritionalInformationForServings(servings) {
        return this.nutritionalInformationFor(ServingSize.servings(servings))
    }
}
