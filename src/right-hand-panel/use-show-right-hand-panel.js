import { useContext } from 'react'
import { SetRightHandPanelContext } from './right-hand-panel-context.js'

export default function useSetRightHandPanel() {
    return useContext(SetRightHandPanelContext)
}
