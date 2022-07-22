import deleteDataValue from './delete-data-value.js'
import getDataValueIndex from './get-data-value-index.js'

export default async function optimisticallyDeleteDataValue({
    queryClient,
    newDataValue,
    dataValueSetQueryKey,
}) {
    // Optimistically update to the new value
    queryClient.setQueryData(dataValueSetQueryKey, (previousDataValueSet) => {
        // dataValueSet.dataValues can be undefined
        const previousDataValues = previousDataValueSet.dataValues || []
        const matchIndex = getDataValueIndex(previousDataValues, newDataValue)
        return deleteDataValue(previousDataValueSet, matchIndex)
    })
}
