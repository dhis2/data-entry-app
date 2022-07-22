import optimisticallyDeleteDataValue from './optimistically-delete-data-value.js'
import useDataValueMutation from './use-data-value-mutation.js'
import useMutationFn from './use-mutation-fn.js'

// This needs to be used for file-type data values; sending an empty 'value' prop
// doesn't work to clear the file (todo: replace when backend changes)
export const DELETE_VALUE_MUTATION = {
    resource: 'dataValues',
    type: 'delete',
    params: ({ co, de, ds, ou, pe }) => ({ co, de, ds, ou, pe }),
}

export function useDeleteDataValueMutation() {
    const mutationFn = useMutationFn(DELETE_VALUE_MUTATION)

    return useDataValueMutation({
        mutationFn,
        onMutate: ({ queryClient, newDataValue, dataValueSetQueryKey }) =>
            optimisticallyDeleteDataValue({
                queryClient,
                newDataValue,
                dataValueSetQueryKey,
            }),
    })
}
