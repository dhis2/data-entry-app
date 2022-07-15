import { useContext } from 'react'
import { RightHandPanelContext } from './right-hand-panel-context.js'

export default function useRightHandPanelContext() {
    return useContext(RightHandPanelContext)
}
