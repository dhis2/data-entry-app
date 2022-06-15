import { useQueryClient, useQuery } from 'react-query'
import keys from './option-set-query-key-factory.js'

const useOptionSetsVersions = () => {
    return useQuery(keys.allVersions, {
        refetchOnMount: false,
    })
}

export const useOptionSetsPrefetch = () => {
    const queryClient = useQueryClient()
    const { isSuccess, data: optionSetVersionsData } = useOptionSetsVersions()
    console.log(queryClient)
    console.log({ optionSetVersionsData })
    if (isSuccess) {
        const { optionSets } = optionSetVersionsData
        const optionSetQueries = queryClient.getQueriesData(keys.all)

        console.log({ optionSetQueries })
        console.log('all queries', queryClient.getQueriesData(['optionSets']))
        const cache = queryClient.getQueryCache()
        console.log(cache.queries)
        const changedOptionSetIds = optionSets
            .filter((os) => {
                const matchingOptionQuery = optionSetQueries
                    .filter(([, data]) => {
                        const matchingOS = data?.optionSets.find(
                            (optionSetData) => optionSetData.id === os.id
                        )
                        return matchingOS
                    })
                    .sort(([keyA], [keyB]) => {
                        // filtered
                        console.log({ keyA, keyB })
                        const stateA = queryClient.getQueryState(keyA)
                        const stateB = queryClient.getQueryState(keyB)

                        console.log({ stateA, stateB })
                        return stateA.dataUpdatedAt - stateB.dataUpdatedAt
                    })[0]
                // console.log({ matchingOptionQuery })
                const matchingOptionSet =
                    matchingOptionQuery?.[1].optionSets.find(
                        (optionSetData) => optionSetData.id === os.id
                    )

                // refetch if not in cache or mismatching version
                const refetch =
                    matchingOptionSet === undefined ||
                    matchingOptionSet.version !== os.version
                return refetch
            })
            .map((os) => os.id)

        console.log({ changedOptionSetIds })

        if (changedOptionSetIds.length > 0) {
            const key =
                changedOptionSetIds.length === optionSets.length
                    ? keys.all
                    : keys.byIds(changedOptionSetIds)

            console.log(
                `Prefetching Using key ${JSON.stringify(key)}`,
                changedOptionSetIds.length,
                optionSets.length
            )
            queryClient
                .prefetchQuery(key, {
                    meta: {
                        persist: true,
                    },

                    //staleTime: 24 * 60 * 60 * 1000,
                    cacheTime: Infinity,
                    networkMode: 'online',
                })
                .then((data) => {
                    console.log('prefetched', data)
                    //const d = queryClient.getQueriesData()
                    //console.log('d', d)
                })
        }
    }
}
