import { useQuery, useIsMutating } from 'react-query'
import { useContextSelection } from '../context-selection/index.js'
import { DATA_VALUE_MUTATION_KEY } from './data-entry-cell/index.js'
import { useAttributeOptionCombo } from './use-attribute-option-combo.js'

export const useDataValueSet = () => {
    const [{ dataSetId, orgUnitId, periodId }] = useContextSelection()
    const attributeOptionCombo = useAttributeOptionCombo()
    const activeMutations = useIsMutating({
        mutationKey: DATA_VALUE_MUTATION_KEY,
    })
    const queryKey = [
        'dataValueSets',
        {
            params: {
                dataSet: dataSetId,
                period: periodId,
                orgUnit: orgUnitId,
                attributeOptionCombo,
            },
        },
    ]

    return useQuery(queryKey, {
        // Only enable this query if there are no ongoing mutations
        enabled: activeMutations === 0,
    })
}
