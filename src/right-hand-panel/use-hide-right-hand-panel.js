import { useContext } from 'react'
import { HideRightHandPanelContext } from './right-hand-panel-context.js'

export default function useHideRightHandPanel() {
    return useContext(HideRightHandPanelContext)
}
