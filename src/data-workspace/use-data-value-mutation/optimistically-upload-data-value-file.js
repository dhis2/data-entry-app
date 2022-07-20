import addDataValue from './add-data-value.js'
import getDataValueIndex from './get-data-value-index.js'
import updateDataValue from './update-data-value.js'

export default async function optimisticallyUploadDataValueFile({
    queryClient,
    newDataValue,
    dataValueSetQueryKey,
    attributeCombo,
    attributeOptions,
}) {
    // Optimistically update to the new value
    queryClient.setQueryData(dataValueSetQueryKey, (previousDataValueSet) => {
        // dataValueSet.dataValues can be undefined
        const previousDataValues = previousDataValueSet.dataValues || []
        const matchIndex = getDataValueIndex(previousDataValues, newDataValue)
        const isNewDataValue = matchIndex === -1

        // If this is a file-type data value, set value to some file metadata
        // so it's available offline. When DVSets is refetched, the value will
        // be replaced by a UID that will be handled in the FileResourceInput components
        const newValue = {
            name: newDataValue.file?.name,
            size: newDataValue.file?.size,
        }

        // If the field was previously empty the dataValue won't exist yet
        if (isNewDataValue) {
            const formattedNewDataValue = {
                ...newDataValue,
                attribute: {
                    combo: attributeCombo,
                    options: attributeOptions,
                },
                categoryOptionCombo: newDataValue.co,
                dataElement: newDataValue.de,
                orgUnit: newDataValue.ou,
                period: newDataValue.pe,
                value: newValue,
            }

            return addDataValue(previousDataValueSet, formattedNewDataValue)
        } else {
            const formattedNewDataValue = {
                ...previousDataValues[matchIndex],
                value: newValue,
            }

            return updateDataValue(
                previousDataValueSet,
                formattedNewDataValue,
                matchIndex
            )
        }
    })
}
