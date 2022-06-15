import { useApiAttributeParams } from '../../shared/index.js'
import optimisticallySetDataValueComment from './optimistically-set-data-value-comment.js'
import useDataValueMutation from './use-data-value-mutation.js'
import useMutationFn from './use-mutation-fn.js'

export const SET_DATA_VALUE_COMMENT_MUTATION = {
    resource: 'dataValues',
    type: 'create',
    data: ({ co, de, ds, ou, pe, comment }) => {
        return {
            // Easier to read this way..
            // eslint-disable-next-line
            co, de, ds, ou, pe,

            // when sending `undefined` something causes that
            // to get stored as a string `"undefined"`
            comment: comment ? comment : '',
        }
    },
}

export function useSetDataValueCommentMutation(onDone) {
    const { attributeCombo, attributeOptions } = useApiAttributeParams()
    const mutationFn = useMutationFn(SET_DATA_VALUE_COMMENT_MUTATION)

    return useDataValueMutation({
        mutationFn,
        onSuccess: onDone,
        onMutate: ({ queryClient, newDataValue, dataValueSetQueryKey }) =>
            optimisticallySetDataValueComment({
                queryClient,
                newDataValue,
                dataValueSetQueryKey,
                attributeCombo,
                attributeOptions,
            }),
    })
}
