import { useQueryClient, useMutation } from 'react-query'
import useDataValueSetQueryKey from '../use-data-value-set-query-key.js'
import useApiError from './use-api-error.js'

export default function useDataValueMutation({
    mutationFn,
    onMutate,
    onSuccess,
}) {
    const queryClient = useQueryClient()
    const dataValueSetQueryKey = useDataValueSetQueryKey()
    const { onError: handleMutationError } = useApiError()

    return useMutation(mutationFn, {
        // optionally hooks can use this
        onSuccess,

        retry: 1,

        // Used to identify whether this mutation is running
        mutationKey: dataValueSetQueryKey,

        // Optimistic update of the react-query cache
        onMutate: async (newDataValue) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries(dataValueSetQueryKey)

            // Snapshot the previous value
            const previousDataValueSet = queryClient.getQueryData(dataValueSetQueryKey)

            await onMutate({
                queryClient,
                newDataValue,
                dataValueSetQueryKey,
            })

            return { previousDataValueSet, dataValueSetQueryKey }
        },

        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newDataValue, context) => {
            handleMutationError(err)
            queryClient.setQueryData(
                context.dataValueSetQueryKey,
                context.previousDataValueSet
            )
        },
    })
}
