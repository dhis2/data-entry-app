import { useDataEngine } from '@dhis2/app-runtime'
import { QueryClient } from 'react-query'
import { persistQueryClient } from 'react-query/persistQueryClient'
import createQueryFn from './create-query-fn.js'
import createIDBPersister from './persister.js'

const queryClient = new QueryClient()

const useQueryClient = () => {
    const engine = useDataEngine()
    const queryFn = createQueryFn(engine)

    queryClient.setDefaultOptions({
        queries: {
            queryFn,
            refetchOnWindowFocus: false,
            // Inactive queries were being garbage collected immediately unless set to Infinity
            cacheTime: Infinity,
            // https://react-query-alpha.tanstack.com/guides/network-mode
            networkMode: 'offlineFirst',
        },
    })

    const persister = createIDBPersister()

    persistQueryClient({
        queryClient,
        persister,
        maxAge: Infinity,
        dehydrateOptions: {
            dehydrateMutations: true,
            dehydrateQueries: true,
            shouldDehydrateQuery: (query) => {
                const isSuccess = query.state.status === 'success'
                let shouldPersist = query?.meta?.persist === true
                const [key] = query.queryKey
                const [keyStr, keyObj] = key

                if (
                    keyStr.startsWith('optionSets') &&
                    keyObj.params?.fields ===
                        'id,version,options[id,displayFormName]'
                ) {
                    shouldPersist = true
                }
                // if (key.startsWith('optionSets')) {
                //     console.log(
                //         'query',
                //         query,
                //         ' should persist:',
                //         shouldPersist
                //     )
                // }

                return isSuccess && shouldPersist
            },
        },
    })

    return queryClient
}

export default useQueryClient
