import { useContextSelection } from '../../context-selection/index.js'
import { useApiAttributeParams } from '../../shared/index.js'
import { dataValueSets } from './query-key-factory.js'

export default function useDataValueSetQueryKey() {
    const [{ dataSetId, orgUnitId, periodId }] = useContextSelection()
    const {
        attributeCombo: categoryComboId,
        attributeOptions: categoryOptionIds,
    } = useApiAttributeParams()

    return dataValueSets.byIds({
        dataSetId,
        periodId,
        orgUnitId,
        categoryComboId,
        categoryOptionIds,
    })
}
