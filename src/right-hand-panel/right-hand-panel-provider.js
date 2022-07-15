import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import {
    HideRightHandPanelContext,
    RightHandPanelContext,
    ShowRightHandPanelContext,
} from './right-hand-panel-context.js'

export default function RightHandPanelProvider({ children }) {
    const [id, setId] = useState('')
    const show = setId
    const hide = useCallback(() => setId(''), [setId])
    const value = { id, show, hide }

    return (
        <RightHandPanelContext.Provider value={value}>
            <ShowRightHandPanelContext.Provider value={show}>
                <HideRightHandPanelContext.Provider value={hide}>
                    {children}
                </HideRightHandPanelContext.Provider>
            </ShowRightHandPanelContext.Provider>
        </RightHandPanelContext.Provider>
    )
}

RightHandPanelProvider.propTypes = {
    children: PropTypes.any.isRequired,
}
