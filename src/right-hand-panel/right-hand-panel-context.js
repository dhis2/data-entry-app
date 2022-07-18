import { createContext } from 'react'

export const RightHandPanelContext = createContext({
    // used to identify which sidebar content should be displayed
    id: '',

    // used to set the id, which will automatically show the sidebar
    show: (id) => {
        throw new Error(
            `Context function "show" not set, tried to show id "${id}"`
        )
    },

    // used to hide the sidebar, should unset the id
    hide: () => {
        throw new Error('Context function "hide" not set')
    },
})

export const SetRightHandPanelContext = createContext((id) => {
    throw new Error(`Context function "show" not set, tried to show id "${id}"`)
})
