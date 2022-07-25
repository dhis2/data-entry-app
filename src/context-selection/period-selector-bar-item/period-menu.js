import { useConfig } from '@dhis2/app-runtime'
import { Menu, MenuItem } from '@dhis2/ui'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { useMetadata, selectors } from '../../metadata/index.js'
import {
    getCurrentDate,
    getFixedPeriodsByTypeAndYear,
    usePeriod,
} from '../../shared/index.js'
import { useDataSetId, usePeriodId } from '../use-context-selection/index.js'
import classes from './period-menu.module.css'

// "openFuturePeriods" is a property that can be set on data sets in the
// maintenance app. It allows the user to select a certain amount of periods in
// the future which the user normally wouldn't be allowed to use
const createFilterFuturePeriods =
    (openFuturePeriods = 0) =>
    (periods) => {
        const periodsInOrder = [...periods].sort((left, right) => {
            const leftStartDate = new Date(left)
            const rightStartDate = new Date(right)

            return leftStartDate < rightStartDate ? -1 : 1
        })

        const array = []
        const now = getCurrentDate()

        let coveredOpenFuturePeriods = 0
        for (let i = 0; i < periodsInOrder.length; i++) {
            const startDate = new Date(periodsInOrder[i].startDate)
            const endDate = new Date(periodsInOrder[i].endDate)
            const nowBeforeStartDate = startDate > now
            const nowAfterOrOnStartDate = startDate <= now
            const endDateAfterNow = endDate >= now
            const endDateBeforeOrOnNow = endDate <= now
            const nextPeriod = periodsInOrder[i]
            const withinDateBoundaries =
                nowAfterOrOnStartDate && endDateBeforeOrOnNow

            if (withinDateBoundaries) {
                array.push(nextPeriod)
            }

            const isOpenFuturePeriod =
                // either it's a future period
                (nowBeforeStartDate ||
                    // or we're currently in the period
                    (nowAfterOrOnStartDate && endDateAfterNow)) &&
                // and we haven't exhausted the open future periods amount
                coveredOpenFuturePeriods < openFuturePeriods

            if (isOpenFuturePeriod) {
                array.push(nextPeriod)
                ++coveredOpenFuturePeriods
            }
        }

        // reverse again because "reversePeriods: true" has been set
        // and this function is a "filter function", not a "map"/"reduce" function
        return [...array].reverse()
    }

const getPeriods = ({ periodType, year, dateFormat, openFuturePeriods }) => {
    const filterFuturePeriods = createFilterFuturePeriods(openFuturePeriods)
    const fixedPeriods = getFixedPeriodsByTypeAndYear({
        periodType,
        year,
        formatYyyyMmDd: (date) => {
            if (periodType === 'Daily') {
                // moment format tokens are case sensitive
                // see https://momentjs.com/docs/#/parsing/string-format/
                return moment(date).format(dateFormat.toUpperCase())
            }
            return moment(date).format('YYYY-MM-DD')
        },
        config: {
            reversePeriods: true,
            filterFuturePeriods: true,
        },
        filterFuturePeriods,
    })

    return fixedPeriods
}

export default function PeriodMenu({
    periodType,
    futurePeriods,
    year,
    onChange,
}) {
    const currentYear = getCurrentDate().getFullYear()
    const { data: metadata } = useMetadata()
    const [dataSetId] = useDataSetId()
    const [periodId] = usePeriodId()
    const selectedPeriod = usePeriod(periodId)
    const {
        systemInfo: { dateFormat },
    } = useConfig()
    const dataSet = selectors.getDataSetById(metadata, dataSetId)
    const periods =
        currentYear < year
            ? futurePeriods.filter(({ startDate }) => {
                  return new Date(startDate).getFullYear() === year
              })
            : getPeriods({
                  periodType,
                  year,
                  dateFormat,
                  openFuturePeriods: dataSet?.openFuturePeriods,
              })

    return (
        <Menu dense className={classes.menu} dataTest="period-selector-menu">
            {periods.map((period) => (
                <MenuItem
                    active={period.id === selectedPeriod?.id}
                    key={period.id}
                    label={
                        <span data-value={period.id}>{period.displayName}</span>
                    }
                    onClick={() => onChange({ selected: period.id })}
                />
            ))}
        </Menu>
    )
}

PeriodMenu.propTypes = {
    futurePeriods: PropTypes.arrayOf(
        PropTypes.shape({
            startDate: PropTypes.string.isRequired,
        })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    periodType: PropTypes.string,
    year: PropTypes.number,
}
