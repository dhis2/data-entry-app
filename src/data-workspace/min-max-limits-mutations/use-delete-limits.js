import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import { useQueryClient, useMutation } from 'react-query'
import { useContextSelection } from '../../context-selection/index.js'
import { dataValueSets } from '../query-key-factory.js'

function deleteLimit(
    previousDataValueSet,
    deletedLimit,
    targetIndex
) {
    const newLimits = [
        ...previousDataValueSet.minMaxValues.slice(0, targetIndex),
        ...previousDataValueSet.minMaxValues.slice(targetIndex + 1),
    ]

    return {
        ...previousDataValueSet,
        minMaxValues: newLimits,
    }
}

const MUTATION_DELETE_MIN_MAX_LIMITS = {
    resource: 'dataEntry/minMaxValues',
    type: 'delete',
    params: ({ dataElement, orgUnit, categoryOptionCombo }) => ({
        dataElement,
        orgUnit,
        categoryOptionCombo,
    }),
}

export default function useDeleteLimits(onDone) {
    // These are needed for the optimistic delete
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

        console.log('> mutate now', variables)
        return engine
            .mutate(MUTATION_DELETE_MIN_MAX_LIMITS, { variables })
            .then(() => console.log('mutate then'))
            .finally(() => console.log('mutate finally'))
    }

    return useMutation(mutationFn, {
        retry: 1,

        // Used to identify whether this mutation is running
        mutationKey: dataValueSetQueryKey,

        // Used so the limits UI can switch from form to value display
        onSuccess: onDone,

        onMutate: async (variables) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic delete)
            await queryClient.cancelQueries(dataValueSetQueryKey)

            // Snapshot the previous value
            const previousDataValueSet = queryClient.getQueryData(dataValueSetQueryKey)

            // Optimistically delete to the new value
            queryClient.setQueryData(dataValueSetQueryKey, () => {
                // dataValueSet.dataValues can be undefined
                const previousMinMaxValues = previousDataValueSet.minMaxValues || []

                const matchIndex = previousMinMaxValues.findIndex(
                    (minMaxValue) =>
                        minMaxValue.categoryOptionCombo === variables.categoryOptionCombo &&
                        minMaxValue.dataElement === variables.dataElement &&
                        minMaxValue.orgUnit === variables.orgUnit
                )

                // If the field was previously empty the dataValue won't exist yet
                const withDeletedLimit = deleteLimit(
                    previousDataValueSet,
                    variables,
                    matchIndex
                )

                return withDeletedLimit
            })

            return { previousDataValueSet, dataValueSetQueryKey }
        },
        onError: (e, newLimit, context) => {
            showErrorAlert(
                `Something went wrong while deleting the min-max limits: ${e.message}`
            )

            queryClient.setQueryData(
                context.dataValueSetQueryKey,
                context.previousDataValueSet,
            )
        }
    })
}
