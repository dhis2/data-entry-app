import { createContext } from 'react'

export const HighlightedFieldIdsContext = createContext({
    item: null,
    setItem: () => {
        throw new Error('Current item context has not been initialized yet')
    },
})

export const SetHighlightedFieldIdsContext = createContext(() => {
    throw new Error('Current item context has not been initialized yet')
})
