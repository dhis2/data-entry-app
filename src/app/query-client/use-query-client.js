import { useDataEngine } from '@dhis2/app-runtime'
import { QueryClient } from 'react-query'
import createQueryFn from './create-query-fn.js'

const logger = {
    log: console.log,
    warn: console.warn,
    error: () => {},
}

const queryClient = new QueryClient({ logger })

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

    return queryClient
}

export default useQueryClient
