import { useQuery } from 'react-query'
import { useIsValidSelection } from '../../context-selection/index.js'
import useDataValueSetQueryKey from './use-data-value-set-query-key.js'

// Form value object structure: { [dataElementId]: { [cocId]: value } }
function mapDataValuesToFormInitialValues(dataValues) {
    // It's possible for the backend to return a response
    // that does not have dataValues
    if (!dataValues) {
        return {}
    }

    const formInitialValues = dataValues.reduce(
        (
            acc,
            {
                dataElement,
                categoryOptionCombo,
                value,
                comment,
                storedBy,
                followup,
                lastUpdated,
            }
        ) => {
            const dataValueData = {
                value,
                dataElement,
                comment,
                storedBy,
                followup,
                lastUpdated,
            }

            if (!acc[dataElement]) {
                acc[dataElement] = { [categoryOptionCombo]: dataValueData }
            } else {
                acc[dataElement][categoryOptionCombo] = dataValueData
            }

            return acc
        },
        {}
    )
    return formInitialValues
}

const select = (data) => {
    const dataValues = mapDataValuesToFormInitialValues(data.dataValues)
    const minMaxValues = data.minMaxValues || {}
    return { dataValues, minMaxValues }
}

const meta = { persist: true }

export const useDataValueSet = () => {
    const isValidSelection = useIsValidSelection()
    const queryKey = useDataValueSetQueryKey()

    const result = useQuery(queryKey, {
        // Only enable this query if there are no ongoing mutations
        enabled: isValidSelection,
        select,
        // Only fetch whilst offline, to prevent optimistic updates from being overwritten
        networkMode: 'online',
        meta,
    })

    return result
}
