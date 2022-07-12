import { useDataEngine } from '@dhis2/app-runtime'
import { useQueryClient, useMutation } from 'react-query'
import { useDataValueSetQueryKey } from '../../shared/index.js'

const MUTATION_SET_COMMENT = {
    resource: '/dataEntry/dataValue',
    params: ({
        dataElementId,
        periodId,
        orgUnitId,
        categoryOptionIds,
        categoryComboId,
        categoryOptionComboId,
    }) => ({
        de: dataElementId,
        pe: periodId,
        ou: orgUnitId,
        co: categoryOptionComboId,
        cc: categoryComboId,
        cp: categoryOptionIds.join(','),
    }),
    data: ({ comment }) => ({ comment }),
}

// @TODO: This needs to be implemented correctly once we have an api to update
//        the comment properly
export default function useSetComment(currentItem) {
    const queryClient = useQueryClient()
    const engine = useDataEngine()

    // Use mutation appropriate to mutation type
    const mutationFn = (variables) =>
        engine.mutate(MUTATION_SET_COMMENT, {
            variables: {
                ...variables,
                dataElementId: currentItem.dataElement,
                periodId: currentItem.period,
                orgUnitId: currentItem.orgUnit,
                categoryOptionIds: null,
                categoryComboId: null,
                categoryOptionComboId: currentItem.categoryOptionCombo,
            },
        })

    const dataValueSetQueryKey = useDataValueSetQueryKey()

    return useMutation(mutationFn, {
        // Used to identify whether this mutation is running
        mutationKey: dataValueSetQueryKey,
        // Optimistic update of the react-query cache
        onMutate: async () => {},
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newDataValue, context) => {
            queryClient.setQueryData(
                context.dataValueSetQueryKey,
                context.previousDataValueSet
            )
        },
        retry: 1,
    })
}
