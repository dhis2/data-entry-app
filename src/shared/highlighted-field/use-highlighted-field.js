import { useEffect, useState } from 'react'
import { useDataValueSet } from '../use-data-value-set/index.js'
import { useHighlightedFieldIdsContext } from './use-highlighted-field-context.js'

function gatherHighlightedFieldData({ de, coc, dataValueSet }) {
    const dataValue = dataValueSet?.dataValues[de.id]?.[coc.id]

    if (dataValue) {
        return {
            ...dataValue,
            categoryOptionCombo: coc.id,
            name: de.displayName,
            code: de.code,
        }
    }

    return {
        categoryOptionCombo: coc.id,
        dataElement: de.id,
        name: de.displayName,
        lastUpdated: '',
        followup: false,
        comment: null,
        storedBy: null,
        code: null,
    }
}

export default function useHighlightedField() {
    const { data: dataValueSet } = useDataValueSet()
    const { item } = useHighlightedFieldIdsContext()
    const [currentItem, setHighlightedFieldIds] = useState(() => {
        if (dataValueSet) {
            const { de, coc } = item
            return gatherHighlightedFieldData({ de, coc, dataValueSet })
        }

        return null
    })

    useEffect(() => {
        const { de, coc } = item
        setHighlightedFieldIds(
            gatherHighlightedFieldData({ de, coc, dataValueSet })
        )
    }, [item, dataValueSet])

    return currentItem
}
