import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import { useQueryClient, useMutation } from 'react-query'
import { useContextSelection } from '../../context-selection/index.js'
import { dataValueSets } from '../query-key-factory.js'

function addLimit(previousDataValueSet, newLimit) {
    return {
        ...previousDataValueSet,
        minMaxValues: previousDataValueSet.minMaxValues
            ? [...previousDataValueSet.minMaxValues, newLimit]
            : [newLimit],
    }
}

// Updates dataValue without mutating previousDataValueSet
function updateLimit(
    previousDataValueSet,
    updatedLimit,
    targetIndex
) {
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
    const [{ dataSetId: ds, orgUnitId: ou, periodId: pe }] =
        useContextSelection()
    const dataValueSetQueryKey = dataValueSets.byIds({ ds, pe, ou })

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
            const previousDataValueSet = queryClient.getQueryData(dataValueSetQueryKey)

            // Optimistically update to the new value
            queryClient.setQueryData(dataValueSetQueryKey, () => {
                // dataValueSet.dataValues can be undefined
                const previousMinMaxValues = previousDataValueSet.minMaxValues || []
                const matchIndex = previousMinMaxValues.findIndex(
                    (minMaxValue) =>
                        minMaxValue.categoryOptionCombo === variables.categoryOptionCombo &&
                        minMaxValue.dataElement === variables.dataElement &&
                        minMaxValue.orgUnit === variables.orgUnit
                )

                const isNewLimit = matchIndex === -1

                // If the field was previously empty the dataValue won't exist yet
                if (isNewLimit) {
                    return addLimit(previousDataValueSet, variables)
                } else {
                    return updateLimit(
                        previousDataValueSet,
                        variables,
                        matchIndex
                    )
                }
            })

            return { previousDataValueSet, dataValueSetQueryKey }
        },
        onError: (e, newLimit, context) => {
            showErrorAlert(
                `Something went wrong while updating the min-max limits: ${e.message}`
            )

            queryClient.setQueryData(
                context.dataValueSetQueryKey,
                context.previousDataValueSet,
            )
        }
    })
}
