import { useContext } from 'react'
import { ShowRightHandPanelContext } from './right-hand-panel-context.js'

export default function useShowRightHandPanel() {
    return useContext(ShowRightHandPanelContext)
}
