import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import { useQueryClient, useMutation } from 'react-query'
import useDataValueSetQueryKey from '../use-data-value-set-query-key.js'
import getMinMaxValueIndex from './get-min-max-value-index.js'

function addLimit(previousDataValueSet, newLimit) {
    return {
        ...previousDataValueSet,
        minMaxValues: previousDataValueSet?.minMaxValues
            ? [...previousDataValueSet.minMaxValues, newLimit]
            : [newLimit],
    }
}

// Updates dataValue without mutating previousDataValueSet
function updateLimit(previousDataValueSet, updatedLimit, targetIndex) {
    const newLimits = [...previousDataValueSet.minMaxValues]
    newLimits[targetIndex] = updatedLimit

    return {
        ...previousDataValueSet,
        minMaxValues: newLimits,
    }
}

const MUTATION_UPDATE_MIN_MAX_LIMITS = {
    resource: 'dataEntry/minMaxValues',
    type: 'create',
    data: ({
        dataElement,
        orgUnit,
        categoryOptionCombo,
        minValue,
        maxValue,
    }) => ({
        dataElement,
        orgUnit,
        categoryOptionCombo,
        minValue,
        maxValue,
    }),
}

export default function useUpdateLimits(onDone) {
    // These are needed for the optimistic update
    const queryClient = useQueryClient()
    const dataValueSetQueryKey = useDataValueSetQueryKey()

    const engine = useDataEngine()
    const showErrorAlert = useAlert((message) => message, { critical: true })

    const mutationFn = ({
        dataElement,
        orgUnit,
        categoryOptionCombo,
        minValue,
        maxValue,
    }) => {
        const variables = {
            dataElement,
            orgUnit,
            categoryOptionCombo,
            minValue,
            maxValue,
        }

        return engine.mutate(MUTATION_UPDATE_MIN_MAX_LIMITS, { variables })
    }

    return useMutation(mutationFn, {
        retry: 1,

        // Used to identify whether this mutation is running
        mutationKey: dataValueSetQueryKey,

        // Used so the limits UI can switch from form to value display
        onSuccess: onDone,

        onMutate: async (variables) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries(dataValueSetQueryKey)

            // Snapshot the previous value
            const previousDataValueSet =
                queryClient.getQueryData(dataValueSetQueryKey)

            // Optimistically update to the new value
            queryClient.setQueryData(dataValueSetQueryKey, () => {
                // dataValueSet.minMaxValues can be undefined
                const previousMinMaxValues =
                    previousDataValueSet?.minMaxValues || []
                const matchIndex = getMinMaxValueIndex(
                    previousMinMaxValues,
                    variables
                )
                const isNewLimit = matchIndex === -1

                return isNewLimit
                    ? addLimit(previousDataValueSet, variables)
                    : updateLimit(previousDataValueSet, variables, matchIndex)
            })

            const context = { previousDataValueSet, dataValueSetQueryKey }
            return context
        },
        onError: (event, _, context) => {
            showErrorAlert(
                `Something went wrong while updating the min-max limits: ${event.message}`
            )

            queryClient.setQueryData(
                context.dataValueSetQueryKey,
                context.previousDataValueSet
            )
        },
    })
}
