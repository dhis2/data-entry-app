import { useQuery, useIsMutating } from 'react-query'
import { useContextSelection } from '../context-selection/index.js'
import { dataValueSets } from './query-key-factory.js'
import { useAttributeOptionCombo } from './use-attribute-option-combo.js'

// Form value object structure: { [dataElementId]: { [cocId]: value } }
function mapDataValuesToFormInitialValues(dataValues) {
    const formInitialValues = dataValues.reduce(
        (acc, { dataElement, categoryOptionCombo, value }) => {
            if (!acc[dataElement]) {
                acc[dataElement] = { [categoryOptionCombo]: value }
            } else {
                acc[dataElement][categoryOptionCombo] = value
            }
            return acc
        },
        {}
    )
    return formInitialValues
}

export const useInitialDataValues = () => {
    const [{ dataSetId, orgUnitId, periodId }] = useContextSelection()
    const attributeOptionCombo = useAttributeOptionCombo()
    const queryKey = dataValueSets.byIds({
        dataSetId,
        periodId,
        orgUnitId,
        attributeOptionCombo,
    })
    const activeMutations = useIsMutating({
        mutationKey: queryKey,
    })
    const hasParameters =
        !!dataSetId && !!orgUnitId && !!periodId && !!attributeOptionCombo

    return useQuery(queryKey, {
        // Only enable this query if there are no ongoing mutations
        enabled: activeMutations === 0 && hasParameters,
        select: (data) =>
            // It's possible for the backend to return a response that does not have dataValues
            data.dataValues
                ? mapDataValuesToFormInitialValues(data.dataValues)
                : {},
        // Only fetch whilst offline, to prevent optimistic updates from being overwritten
        networkMode: 'online',
        meta: {
            persist: true,
        },
    })
}
