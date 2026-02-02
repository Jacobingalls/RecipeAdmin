/**
 * Format a number to a reasonable number of significant figures.
 * - >= 100: whole number (230 or 1,234)
 * - >= 10: 1 decimal place (23.5)
 * - >= 1: 2 decimal places (2.35)
 * - < 1: 2 significant figures (0.24, 0.024)
 * Uses localized thousand separators for numbers >= 1000.
 */
export function formatSignificant(value) {
    if (value === 0) return '0'

    const absValue = Math.abs(value)

    if (absValue >= 100) {
        return Math.round(value).toLocaleString()
    } else if (absValue >= 10) {
        const rounded = Math.round(value * 10) / 10
        return rounded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })
    } else if (absValue >= 1) {
        const rounded = Math.round(value * 100) / 100
        return rounded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    } else {
        // For values < 1, use 2 significant figures
        const sigFigs = 2
        const magnitude = Math.floor(Math.log10(absValue))
        const scale = Math.pow(10, sigFigs - magnitude - 1)
        const rounded = Math.round(value * scale) / scale
        return rounded.toLocaleString()
    }
}

/**
 * Format a serving size for display, returning primary label and resolved breakdown.
 *
 * @param {ServingSize} servingSize - The serving size to format
 * @param {Preperation} prep - The preparation for context
 * @returns {{ primary: string|null, resolved: string|null }}
 */
export function formatServingSize(servingSize, prep) {
    if (!servingSize || !prep) return { primary: null, resolved: null }

    let scalar
    try {
        scalar = prep.scalar(servingSize)
    } catch {
        return { primary: null, resolved: null }
    }

    // Primary description based on type
    let primary = null
    if (servingSize.type === 'servings') {
        const count = servingSize.value
        primary = `${formatSignificant(count)} serving${count !== 1 ? 's' : ''}`
    } else if (servingSize.type === 'customSize') {
        const { name, amount } = servingSize.value
        primary = `${formatSignificant(amount)} ${name}`
    } else if (servingSize.type === 'mass') {
        primary = `${formatSignificant(servingSize.value.amount)}${servingSize.value.unit}`
    } else if (servingSize.type === 'volume') {
        primary = `${formatSignificant(servingSize.value.amount)}${servingSize.value.unit}`
    } else if (servingSize.type === 'energy') {
        primary = `${formatSignificant(servingSize.value.amount)}${servingSize.value.unit}`
    }

    // Build resolved breakdown, omitting whichever is the primary selection
    const resolved = []
    if (servingSize.type !== 'servings') {
        resolved.push(`${formatSignificant(scalar)} serving${scalar !== 1 ? 's' : ''}`)
    }
    if (prep.mass && servingSize.type !== 'mass') {
        const mass = prep.mass.amount * scalar
        resolved.push(`${formatSignificant(mass)}${prep.mass.unit}`)
    }
    if (prep.volume && servingSize.type !== 'volume') {
        const volume = prep.volume.amount * scalar
        resolved.push(`${formatSignificant(volume)}${prep.volume.unit}`)
    }

    return { primary, resolved: resolved.join(', ') }
}
