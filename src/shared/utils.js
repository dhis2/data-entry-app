import { diff } from 'deep-object-diff'
import { useRef } from 'react'

// Computes the cartesian product of a matrix (array of array)
export const cartesian = (args) => {
    const result = []
    const lim = args.length - 1

    function add(row, i) {
        const len = args[i].length
        for (let j = 0; j < len; j++) {
            const a = [...row]
            a.push(args[i][j])
            if (i === lim) {
                result.push(a)
            } else {
                add(a, i + 1)
            }
        }
    }
    add([], 0)
    return result
}
// [[1,2,3]. [1,2]] => [[1,1],[1,2],[2,1],[2,2],[3,1],[3,2]]

export function filterObject(object, filterFn) {
    return Object.fromEntries(Object.entries(object).filter(filterFn))
}

const EMPTY_ROW = {
    propertyName: null,
    hasChanged: null,
    oldValue: null,
    newValue: null,
}
export function usePropertyRenderDiffer() {
    const oldData = useRef({})
    return (newData) => {
        console.group('Property diff summary')
        const logTableRows = Object.keys(newData).map((key) => ({
            propertyName: key,
            hasChanged: newData[key] !== oldData.current[key],
            oldValue: oldData.current[key],
            newValue: newData[key],
        }))
        // Last table row is being covered by a scrollbar ¯\_(ツ)_/¯
        logTableRows.push(EMPTY_ROW)
        console.table(logTableRows)

        console.group('Changed object diffs')
        logTableRows
            .filter(
                (row) =>
                    row.hasChanged &&
                    (typeof row.oldValue === 'object' ||
                        typeof row.newValue === 'object')
            )
            .forEach(({ propertyName, oldValue, newValue }) => {
                console.groupCollapsed(propertyName)
                console.log(diff(oldValue, newValue))
                console.groupEnd(propertyName)
            })

        console.groupEnd('Changed object diffs')
        console.groupEnd('Property diff summary')

        oldData.current = newData
    }
}
