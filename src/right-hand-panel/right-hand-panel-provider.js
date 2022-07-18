import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import {
    RightHandPanelContext,
    SetRightHandPanelContext,
} from './right-hand-panel-context.js'

export default function RightHandPanelProvider({ children }) {
    const [id, setId] = useState('')
    const show = setId
    const hide = useCallback(() => setId(''), [setId])
    const value = { id, show, hide }

    return (
        <RightHandPanelContext.Provider value={value}>
            <SetRightHandPanelContext.Provider value={show}>
                {children}
            </SetRightHandPanelContext.Provider>
        </RightHandPanelContext.Provider>
    )
}

RightHandPanelProvider.propTypes = {
    children: PropTypes.any.isRequired,
}
