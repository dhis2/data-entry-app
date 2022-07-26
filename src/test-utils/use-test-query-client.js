import { useDataEngine } from '@dhis2/app-runtime'
import { setLogger, QueryClient } from 'react-query'
import createQueryFn from '../app/query-client/create-query-fn.js'

setLogger({
    log: console.log,
    warn: console.warn,
    error: () => {},
})

export const useTestQueryClient = () => {
    const engine = useDataEngine()
    const queryFn = createQueryFn(engine)
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                queryFn,
                retry: false,
            },
        },
    })

    return queryClient
}
