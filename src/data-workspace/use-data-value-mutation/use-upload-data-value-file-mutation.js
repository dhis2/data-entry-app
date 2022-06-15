import { useApiAttributeParams } from '../../shared/index.js'
import optimisticallyUploadDataValueFile from './optimistically-upload-data-value-file.js'
import useDataValueMutation from './use-data-value-mutation.js'
import useMutationFn from './use-mutation-fn.js'

export const UPLOAD_FILE_MUTATION = {
    resource: 'dataValues/file',
    type: 'create',
    data: ({ co, de, ds, ou, pe, value, file }) => ({
        co,
        de,
        ds,
        ou,
        pe,
        value,
        file,
    }),
}

export function useUploadDataValueFileMutation() {
    const { attributeCombo, attributeOptions } = useApiAttributeParams()
    const mutationFn = useMutationFn(UPLOAD_FILE_MUTATION)

    return useDataValueMutation({
        mutationFn,
        onMutate: ({ queryClient, newDataValue, dataValueSetQueryKey }) =>
            optimisticallyUploadDataValueFile({
                queryClient,
                newDataValue,
                dataValueSetQueryKey,
                attributeCombo,
                attributeOptions,
            }),
    })
}
