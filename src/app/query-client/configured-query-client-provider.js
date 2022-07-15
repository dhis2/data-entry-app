import PropTypes from 'prop-types'
import React from 'react'
import { PersistQueryClientProvider } from 'react-query/persistQueryClient'
import createIDBPersister from './persister.js'
import useQueryClient from './use-query-client.js'

const persister = createIDBPersister()

const persistOptions = {
    persister,
    maxAge: Infinity,
    dehydrateOptions: {
        dehydrateMutations: true,
        dehydrateQueries: true,
        shouldDehydrateQuery: (query) => {
            const isSuccess = query.state.status === 'success'
            const shouldPersist = query?.meta?.persist === true
            return isSuccess && shouldPersist
        },
    },
}
export const ConfiguredQueryClientProvider = ({ children }) => {
    const queryClient = useQueryClient()

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={persistOptions}
        >
            {children}
        </PersistQueryClientProvider>
    )
}

ConfiguredQueryClientProvider.propTypes = {
    children: PropTypes.node,
}
