import PropTypes from 'prop-types'
import React, { useState } from 'react'
import {
    HighlightedFieldIdsContext,
    SetHighlightedFieldIdsContext,
} from './highlighted-field-context.js'

export default function HighlightedFieldIdsProvider({ children }) {
    const [item, setItem] = useState(null)
    const value = { item, setItem }

    return (
        <HighlightedFieldIdsContext.Provider value={value}>
            <SetHighlightedFieldIdsContext.Provider value={setItem}>
                {children}
            </SetHighlightedFieldIdsContext.Provider>
        </HighlightedFieldIdsContext.Provider>
    )
}

HighlightedFieldIdsProvider.propTypes = {
    children: PropTypes.any,
}
