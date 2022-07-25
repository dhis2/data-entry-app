import { useConfig } from '@dhis2/app-runtime'
import moment from 'moment'
import { useMemo } from 'react'
import { selectors, useMetadata } from '../../metadata/index.js'
import {
    getCurrentDate,
    getFixedPeriodsForTypeAndDateRange,
} from '../../shared/index.js'
import { useDataSetId } from '../use-context-selection/index.js'

function createFormatYyyyMmDd({ periodType, dateFormat }) {
    return (date) => {
        if (periodType === 'Daily') {
            // moment format tokens are case sensitive
            // see https://momentjs.com/docs/#/parsing/string-format/
            return moment(date).format(dateFormat.toUpperCase())
        }

        return moment(date).format('YYYY-MM-DD')
    }
}

export default function useFuturePeriods() {
    const [dataSetId] = useDataSetId()
    const { data: metadata } = useMetadata()
    const {
        systemInfo: { dateFormat },
    } = useConfig()

    return useMemo(() => {
        const dataSet = selectors.getDataSetById(metadata, dataSetId)
        const periodType = dataSet?.periodType
        const openFuturePeriods = dataSet?.openFuturePeriods
        const formatYyyyMmDd = createFormatYyyyMmDd({ periodType, dateFormat })
        const currentDate = getCurrentDate()
        const currentYear = currentDate.getFullYear()
        const periodsThisYear = getFixedPeriodsForTypeAndDateRange({
            periodType,
            startDate: `${currentYear}-01-01`,
            endDate: `${currentYear}-12-31`,
            formatYyyyMmDd,
        })

        const futurePeriods = periodsThisYear.filter(({ endDate }) => {
            return new Date(endDate) > currentDate
        })

        if (futurePeriods.length < openFuturePeriods) {
            const nextYear = currentYear + 1
            const periodsNextYear = getFixedPeriodsForTypeAndDateRange({
                periodType,
                startDate: `${nextYear}-01-01`,
                endDate: `${nextYear}-12-31`,
                formatYyyyMmDd,
            })

            const missingPeriodsCount = openFuturePeriods - futurePeriods.length
            futurePeriods.push(...periodsNextYear.slice(0, missingPeriodsCount))
        }

        return futurePeriods
    }, [dataSetId, metadata, dateFormat])
}
