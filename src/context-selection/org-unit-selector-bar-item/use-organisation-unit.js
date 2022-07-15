import { useQuery } from 'react-query'
import { useOrgUnitId } from '../use-context-selection/index.js'

export default function useOrgUnit() {
    const [id] = useOrgUnitId()
    const queryKey = [
        'organisationUnits',
        {
            id,
            params: {
                fields: ['id', 'displayName', 'path'],
            },
        },
    ]
    const { isFetching, error, data } = useQuery(queryKey, {
        enabled: !!id,
    })

    return {
        loading: isFetching,
        error,
        data,
    }
}
