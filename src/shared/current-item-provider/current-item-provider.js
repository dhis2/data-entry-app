import PropTypes from 'prop-types'
import React, { useState } from 'react'
import {
    CurrentItemContext,
    SetCurrentItemContext,
} from './current-item-context.js'

export default function CurrentItemProvider({ children }) {
    const [item, setItem] = useState(null)
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
