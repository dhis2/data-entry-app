export default function getMinMaxValueIndex(
    minMaxValues,
    { categoryOptionCombo, dataElement, orgUnit }
) {
    return minMaxValues.findIndex(
        (minMaxValue) =>
            minMaxValue.categoryOptionCombo === categoryOptionCombo &&
            minMaxValue.dataElement === dataElement &&
            minMaxValue.orgUnit === orgUnit
    )
}
