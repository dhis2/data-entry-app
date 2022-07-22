/**
 * @param {String} min
 * @param {String} max
 */
export default function calculateAverage(min, max) {
    if (!min || !max) {
        return null
    }

    const minimum = parseFloat(min)
    const maximum = parseFloat(max)

    if (minimum > maximum) {
        return null
    }

    return (parseFloat(min) + parseFloat(max)) / 2
}
