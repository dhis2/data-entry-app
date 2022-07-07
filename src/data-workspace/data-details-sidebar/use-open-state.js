import { useCallback, useRef, useState } from 'react'

function isDifferentItem(left, right) {
    return (
        left?.dataElement !== right?.dataElement ||
        left?.categoryOptionCombo !== right?.categoryOptionCombo ||
        left?.value !== right?.value
    )
}

/**
 * useState's setter is asynchronous, but we also need the updated value
 * synchronously as we don't want the `useDataValueContext` hook to load
 * the values for the next cell, hence also using the ref. Using a ref
 * alone wouldn't trigger a rerender when closing/opening the expandable
 * unit, so we have to use `useState` as well
 */
export default function useOpenState(item) {
    const prevItemRef = useRef(null)
    const openRef = useRef(false)
    const [open, _setOpen] = useState(false)
    const setOpen = useCallback((nextValue) => {
        openRef.current = nextValue
        _setOpen(nextValue)
    }, [_setOpen])

    if (isDifferentItem(item, prevItemRef.current)) {
        if (
            // Do not open during first render
            prevItemRef.current &&
            // Only close when opened already
            open
        ) {
            setOpen(false)
        }

        prevItemRef.current = item
    }

    return { open, setOpen, openRef }
}
