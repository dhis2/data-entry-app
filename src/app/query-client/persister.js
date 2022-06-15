import { get, set, del } from 'idb-keyval'
import throttle from 'lodash.throttle'

/**
 * Creates an Indexed DB persister
 * @see https://react-query.tanstack.com/plugins/persistQueryClient#building-a-persistor
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */

const createIDBPersister = (idbValidKey = 'reactQuery') => {
    // Throttle persisting by a second to ensure that we're not writing to the cache
    // more than once per second. Otherwise we'd potentially slow down the app.
    const persistClient = throttle((client) => {
        console.log('persisting')
        console.log(client)
        set(idbValidKey, client)
    }, 1000)

    return {
        persistClient,
        restoreClient: async () => {
            const restored = await get(idbValidKey)
            console.log('restored', restored)
            return restored
        },
        removeClient: () => {
            return del(idbValidKey)
        },
    }
}

export default createIDBPersister
