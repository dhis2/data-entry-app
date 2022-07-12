import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import { useDataValueSet } from '../use-data-value-set/index.js'
import {
    CurrentItemContext,
    SetCurrentItemContext,
} from './current-item-context.js'

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

export default function CurrentItemProvider({ children }) {
    const { data: dataValueSet } = useDataValueSet()
    const [item, _setItem] = useState(null)
    const setItem = useCallback(({ de, coc }) => {
        if (!dataValueSet) {
            throw new Error('This should never happen')
        }

        _setItem(createCurrentItem({
            de,
            coc,
            dataValueSet,
        }))
    }, [dataValueSet])

    const value = { item, setItem }

    return (
        <CurrentItemContext.Provider value={value}>
            <SetCurrentItemContext.Provider value={setItem}>
                {children}
            </SetCurrentItemContext.Provider>
        </CurrentItemContext.Provider>
    )
}

CurrentItemProvider.propTypes = {
    children: PropTypes.any,
}
