import { useContextSelection } from '../../context-selection/index.js'
import { useMetadata, selectors } from '../../metadata/index.js'

export const useDataValueParams = ({ deId, cocId }) => {
    const [dataEntryContext] = useContextSelection()
    const metadataFetch = useMetadata()

    if (!metadataFetch.data) {
        return null
    }

    const { dataSetId, orgUnitId, periodId, attributeOptionComboSelection } =
        dataEntryContext

    const attributeComboId = selectors.getDataSetById(
        metadataFetch.data,
        dataSetId
    ).categoryCombo.id
    const isDefaultAttributeCombo = selectors.getCategoryComboById(
        metadataFetch.data,
        attributeComboId
    ).isDefault

    const dataValueParams = {
        de: deId,
        co: cocId,
        ds: dataSetId,
        ou: orgUnitId,
        pe: periodId,
    }

    // Add attribute params to mutation if relevant
    if (!isDefaultAttributeCombo) {
        // Get a ';'-separated listed of attribute options
        const attributeOptionIdList = Object.values(
            attributeOptionComboSelection
        ).join(';')
        dataValueParams.cc = attributeComboId
        dataValueParams.cp = attributeOptionIdList
    }

    return dataValueParams
}
