import deleteDataValue from './delete-data-value.js'
import getDataValueIndex from './get-data-value-index.js'

export default async function optimisticallyDeleteDataValue({
    queryClient,
    newDataValue,
    dataValueSetQueryKey,
}) {
    // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries(dataValueSetQueryKey)

    // Snapshot the previous value
    const previousDataValueSet = queryClient.getQueryData(dataValueSetQueryKey)

    // Optimistically update to the new value
    queryClient.setQueryData(dataValueSetQueryKey, () => {
        // dataValueSet.dataValues can be undefined
        const previousDataValues = previousDataValueSet.dataValues || []
        const matchIndex = getDataValueIndex(previousDataValues, newDataValue)
        return deleteDataValue(previousDataValueSet, matchIndex)
    })

    return { previousDataValueSet, dataValueSetQueryKey }
}
