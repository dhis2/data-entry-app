import { useEffect, useState } from 'react'
import { useDataValueSet } from '../use-data-value-set/index.js'
import { useCurrentItemContext } from './use-current-item-context.js'

function createCurrentItem({ de, coc, dataValueSet }) {
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

export default function useCreateCurrentItem() {
    const { data: dataValueSet } = useDataValueSet()
    const { item } = useCurrentItemContext()
    const [currentItem, setCurrentItem] = useState(() => {
        if (dataValueSet) {
            const { de, coc } = item
            return createCurrentItem({ de, coc, dataValueSet })
        }

        return null
    })

    useEffect(() => {
        const { de, coc } = item
        const nextCurrentItem = createCurrentItem({ de, coc, dataValueSet })
        setCurrentItem(nextCurrentItem)
    }, [item, dataValueSet])

    return currentItem
}
