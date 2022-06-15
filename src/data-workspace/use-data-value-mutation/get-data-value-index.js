export default function getDataValueIndex(
    previousDataValues,
    { co, de, ou, pe }
) {
    return previousDataValues.findIndex(
        (dataValue) =>
            dataValue.categoryOptionCombo === co &&
            dataValue.dataElement === de &&
            dataValue.orgUnit === ou &&
            dataValue.period === pe
    )
}
