import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useRightHandPanelContext } from '../right-hand-panel/index.js'

export default function useCloseRightHandPanelOnSelectionChange() {
    const { show } = useRightHandPanelContext()
    const searchParams = useParams()

    useEffect(
        () => {
            show('')
        },
        // search params are part of the dependency array as we need to hide
        // the sidebar when the selection changes. There's no need to use the
        // search params in the useEffect though
        [searchParams, show]
    )
}
