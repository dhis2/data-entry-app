import { useContext } from 'react'
import {
    HighlightedFieldIdsContext,
    SetHighlightedFieldIdsContext,
} from './highlighted-field-context.js'

export function useHighlightedFieldIdsContext() {
    return useContext(HighlightedFieldIdsContext)
}

export function useSetHighlightedFieldIdsContext() {
    return useContext(SetHighlightedFieldIdsContext)
}
