import { useDataQuery } from '@dhis2/app-runtime'
import { useEffect } from 'react'
import { useDataSetId } from '../use-context-selection.js'

const QUERY_DATA_SET = {
    dataSet: {
        resource: 'dataSets',
        id: ({ id }) => id,
        params: {
            fields: ['id', 'displayName'],
        },
    },
}

export default function useDataSet() {
    const [dataSetId] = useDataSetId()
    const { called, loading, error, refetch, data } = useDataQuery(
        QUERY_DATA_SET,
        { lazy: true }
    )

    useEffect(() => {
        if (dataSetId) {
            refetch({ id: dataSetId })
        }
    }, [dataSetId])

    const dataSet = data?.dataSet

    return {
        calledDataSet: called,
        loadingDataSet: loading,
        errorDataSet: error,
        refetchDataSet: refetch,
        dataSet,
    }
}
