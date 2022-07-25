import i18n from '@dhis2/d2-i18n'

/*
 * This code is copied from the analytics repo as a temporary solution.
 * https://github.com/dhis2/analytics/tree/master/src/components/PeriodDimension/utils
 * In the long term, this period related logic should be moved into its own repo, see:
 * https://jira.dhis2.org/browse/LIBS-193
 * The following changes to the code in the anaytics repo have been implemented:
 *   A. Renamed period-CODE to period-ID
 *   B. Adjusted period type names (values) to match the names in the response from `api/periodTypes`
 *   C. Adjusted period type variable names to equivalent of B, but in UPPER_SNAKE_CASE
 * IMO these changes should be implemented in the period package too
 */

// Period types
const DAILY = 'Daily'
const WEEKLY = 'Weekly'
const WEEKLY_WEDNESDAY = 'WeeklyWednesday'
const WEEKLY_THURSDAY = 'WeeklyThursday'
const WEEKLY_SATURDAY = 'WeeklySaturday'
const WEEKLY_SUNDAY = 'WeeklySunday'
const BI_WEEKLY = 'BiWeekly'
const MONTHLY = 'Monthly'
const BI_MONTHLY = 'BiMonthly'
const QUARTERLY = 'Quarterly'
const SIX_MONTHLY = 'SixMonthly'
const SIX_MONTHLY_APRIL = 'SixMonthlyApril'
// const SIX_MONTHLY_NOV = 'SixMonthlyNov'
const YEARLY = 'Yearly'
const FINANCIAL_APRIL = 'FinancialApril'
const FINANCIAL_JULY = 'FinancialJuly'
const FINANCIAL_OCT = 'FinancialOct'
const FINANCIAL_NOV = 'FinancialNov'

const isValidDate = (date) => !isNaN(date.getTime())

const PERIOD_TYPES = new Set([
    DAILY,
    WEEKLY,
    WEEKLY_WEDNESDAY,
    WEEKLY_THURSDAY,
    WEEKLY_SATURDAY,
    WEEKLY_SUNDAY,
    BI_WEEKLY,
    MONTHLY,
    BI_MONTHLY,
    QUARTERLY,
    SIX_MONTHLY,
    SIX_MONTHLY_APRIL,
    YEARLY,
    FINANCIAL_APRIL,
    FINANCIAL_JULY,
    FINANCIAL_OCT,
    FINANCIAL_NOV,
])

export const isValidPeriodType = (periodType) => PERIOD_TYPES.has(periodType)

const getMonthName = (key) => {
    const monthNames = [
        i18n.t('January'),
        i18n.t('February'),
        i18n.t('March'),
        i18n.t('April'),
        i18n.t('May'),
        i18n.t('June'),
        i18n.t('July'),
        i18n.t('August'),
        i18n.t('September'),
        i18n.t('October'),
        i18n.t('November'),
        i18n.t('December'),
    ]

    return monthNames[key]
}

/**
 * Initialise a Date instance with Date.now() for Jest mocking.
 * This can be removed once we upgrade Jest to a verion which
 * supports `jest.setSystemTime`.
 */
export const getCurrentDate = () => new Date(Date.now())

export const getYearWithOffset = (offset) => {
    const offsetInt = parseInt(offset, 10) || 0
    return getCurrentDate().getFullYear() + offsetInt
}

const getDailyPeriodType = (formatYyyyMmDd, fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`01 Jan ${year}`)

        while (date.getFullYear() === year) {
            const period = {}
            period.startDate = formatYyyyMmDd(date)
            period.endDate = period.startDate
            period.displayName = period.startDate
            period.iso = period.startDate.replace(/-/g, '')
            period.id = period.iso
            periods.push(period)
            date.setDate(date.getDate() + 1)
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods.reverse() : periods

        return periods
    }
}

const getWeeklyPeriodType = (formatYyyyMmDd, weekObj, fnFilter) => {
    // Calculate the first date of an EPI year base on ISO standard  ( first week always contains 4th Jan )
    const getEpiWeekStartDay = (year, startDayOfWeek = 1) => {
        const jan4 = new Date(year, 0, 4)
        const jan4DayOfWeek = jan4.getDay()
        const startDate = jan4
        const dayDiff = jan4DayOfWeek - startDayOfWeek

        if (dayDiff > 0) {
            startDate.setDate(jan4.getDate() - dayDiff)
        } else if (dayDiff < 0) {
            startDate.setDate(jan4.getDate() - dayDiff)
            startDate.setDate(startDate.getDate() - 7)
        }

        return startDate
    }

    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = getEpiWeekStartDay(year, weekObj.startDay)
        let week = 1

        while (date.getFullYear() <= year) {
            const period = {}
            period.startDate = formatYyyyMmDd(date)
            period.iso = `${year}${weekObj.shortName}W${week}`
            period.id = period.iso
            date.setDate(date.getDate() + 6)
            period.endDate = formatYyyyMmDd(date)

            const weekNumber = week
            period.displayName = `${i18n.t('Week {{weekNumber}}', {
                weekNumber,
            })} - ${period.startDate} - ${period.endDate}`

            // if end date is Jan 4th or later, week belongs to next year
            if (date.getFullYear() > year && date.getDate() >= 4) {
                break
            }

            periods.push(period)
            date.setDate(date.getDate() + 1)

            week += 1
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods.reverse() : periods

        return periods
    }
}

const getBiWeeklyPeriodType = (formatYyyyMmDd, fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`01 Jan ${year}`)
        const day = date.getDay()
        let biWeek = 1

        if (day <= 4) {
            date.setDate(date.getDate() - (day - 1))
        } else {
            date.setDate(date.getDate() + (8 - day))
        }

        while (date.getFullYear() <= year) {
            const period = {}

            period.iso = `${year}BiW${biWeek}`
            period.id = period.iso
            period.startDate = formatYyyyMmDd(date)
            date.setDate(date.getDate() + 13)

            period.endDate = formatYyyyMmDd(date)
            const biWeekNumber = biWeek
            period.displayName = `${i18n.t('Bi-Week {{biWeekNumber}}', {
                biWeekNumber,
            })} - ${period.startDate} - ${period.endDate}`

            // if end date is Jan 4th or later, biweek belongs to next year
            if (date.getFullYear() > year && date.getDate() >= 4) {
                break
            }

            periods.push(period)

            date.setDate(date.getDate() + 1)

            biWeek += 1
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods.reverse() : periods

        return periods
    }
}

const getMonthlyPeriodType = (formatYyyyMmDd, fnFilter) => {
    const formatIso = (date) => {
        const y = date.getFullYear()
        let m = String(date.getMonth() + 1)

        m = m.length < 2 ? `0${m}` : m

        return y + m
    }

    return (config) => {
        let periods = []

        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`31 Dec ${year}`)

        while (date.getFullYear() === year) {
            const period = {}

            period.endDate = formatYyyyMmDd(date)
            date.setDate(1)
            period.startDate = formatYyyyMmDd(date)
            const monthName = getMonthName(date.getMonth())
            period.displayName = `${monthName} ${year}`
            period.iso = formatIso(date)
            period.id = period.iso

            periods.push(period)
            date.setDate(0)
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods : periods.reverse()
        // Months are collected backwards. If isReverse is true, then do nothing. Else reverse to correct order and return.

        return periods
    }
}

const getBiMonthlyPeriodType = (formatYyyyMmDd, fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`31 Dec ${year}`)
        let index = 6

        while (date.getFullYear() === year) {
            const period = {}

            period.endDate = formatYyyyMmDd(date)
            date.setDate(0)
            date.setDate(1)
            period.startDate = formatYyyyMmDd(date)
            const monthStart = getMonthName(date.getMonth())
            const monthEnd = getMonthName(date.getMonth() + 1)
            const fullYear = date.getFullYear()
            period.displayName = `${monthStart} - ${monthEnd} ${fullYear}`
            period.iso = `${year}0${index}B`
            period.id = period.iso
            periods.push(period)
            date.setDate(0)

            index--
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods : periods.reverse()
        // Bi-months are collected backwards. If isReverse is true, then do nothing. Else reverse to correct order and return.

        return periods
    }
}

const getQuarterlyPeriodType = (formatYyyyMmDd, fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`31 Dec ${year}`)
        let quarter = 4

        while (date.getFullYear() === year) {
            const period = {}
            period.endDate = formatYyyyMmDd(date)
            date.setDate(0)
            date.setDate(0)
            date.setDate(1)
            period.startDate = formatYyyyMmDd(date)
            const monthStart = getMonthName(date.getMonth())
            const monthEnd = getMonthName(date.getMonth() + 2)
            const fullYear = date.getFullYear()
            period.displayName = `${monthStart} - ${monthEnd} ${fullYear}`
            period.iso = `${year}Q${quarter}`
            period.id = period.iso
            periods.push(period)
            date.setDate(0)
            quarter -= 1
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods : periods.reverse()
        // Quarters are collected backwards. If isReverse is true, then do nothing. Else reverse to correct order and return.

        return periods
    }
}

const getSixMonthlyPeriodType = (fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)

        let period = {}
        period.startDate = `${year}-01-01`
        period.endDate = `${year}-06-30`
        period.displayName = `${getMonthName(0)} - ${getMonthName(5)} ${year}`
        period.iso = `${year}S1`
        period.id = period.iso
        periods.push(period)

        period = {}
        period.startDate = `${year}-07-01`
        period.endDate = `${year}-12-31`
        period.displayName = `${getMonthName(6)} - ${getMonthName(11)} ${year}`
        period.iso = `${year}S2`
        period.id = period.iso
        periods.push(period)

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods.reverse() : periods

        return periods
    }
}

const getSixMonthlyAprilPeriodType = (fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)

        let period = {}
        period.startDate = `${year}-04-01`
        period.endDate = `${year}-09-30`
        period.displayName = `${getMonthName(3)} - ${getMonthName(8)} ${year}`
        period.iso = `${year}AprilS1`
        period.id = period.iso
        periods.push(period)

        period = {}
        period.startDate = `${year}-10-01`
        period.endDate = `${year + 1}-03-31`
        period.displayName = `${getMonthName(9)} ${year} - ${getMonthName(2)} ${
            year + 1
        }`
        period.iso = `${year}AprilS2`
        period.id = period.iso
        periods.push(period)

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods.reverse() : periods

        return periods
    }
}

const getYearlyPeriodType = (formatYyyyMmDd, fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`31 Dec ${year}`)

        while (year - date.getFullYear() < 10) {
            const period = {}
            period.endDate = formatYyyyMmDd(date)
            date.setMonth(0, 1)
            period.startDate = formatYyyyMmDd(date)
            const dateString = date.getFullYear().toString()
            period.displayName = dateString
            period.iso = date.getFullYear().toString()
            period.id = period.iso.toString()
            periods.push(period)
            date.setDate(0)
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods : periods.reverse()
        // Years are collected backwards. If isReverse is true, then do nothing. Else reverse to correct order and return.

        return periods
    }
}

const getFinancialOctoberPeriodType = (formatYyyyMmDd, fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`30 Sep ${year + 1}`)

        for (let i = 0; i < 10; i++) {
            const period = {}
            period.endDate = formatYyyyMmDd(date)
            date.setYear(date.getFullYear() - 1)
            date.setDate(date.getDate() + 1)
            period.startDate = formatYyyyMmDd(date)
            const yearStart = date.getFullYear()
            const yearEnd = date.getFullYear() + 1
            period.displayName = `${getMonthName(
                9
            )} ${yearStart} - ${getMonthName(8)} ${yearEnd}`
            period.id = `${date.getFullYear()}Oct`
            periods.push(period)
            date.setDate(date.getDate() - 1)
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods : periods.reverse()
        // FinancialOctober periods are collected backwards. If isReverse is true, then do nothing. Else reverse to correct order and return.

        return periods
    }
}

const getFinancialNovemberPeriodType = (formatYyyyMmDd, fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`31 Oct ${year + 1}`)

        for (let i = 0; i < 10; i++) {
            const period = {}
            period.endDate = formatYyyyMmDd(date)
            date.setYear(date.getFullYear() - 1)
            date.setDate(date.getDate() + 1)
            period.startDate = formatYyyyMmDd(date)
            const yearStart = date.getFullYear()
            const yearEnd = date.getFullYear() + 1
            period.displayName = `${getMonthName(
                10
            )} ${yearStart} - ${getMonthName(9)} ${yearEnd}`
            period.id = `${date.getFullYear()}Nov`
            periods.push(period)
            date.setDate(date.getDate() - 1)
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods : periods.reverse()
        // FinancialNovember periods are collected backwards. If isReverse is true, then do nothing. Else reverse to correct order and return.

        return periods
    }
}

const getFinancialJulyPeriodType = (formatYyyyMmDd, fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`30 Jun ${year + 1}`)

        for (let i = 0; i < 10; i++) {
            const period = {}
            period.endDate = formatYyyyMmDd(date)
            date.setYear(date.getFullYear() - 1)
            date.setDate(date.getDate() + 1)
            period.startDate = formatYyyyMmDd(date)
            const yearStart = date.getFullYear()
            const yearEnd = date.getFullYear() + 1
            period.displayName = `${getMonthName(
                6
            )} ${yearStart} - ${getMonthName(5)} ${yearEnd}`
            period.id = `${date.getFullYear()}July`
            periods.push(period)
            date.setDate(date.getDate() - 1)
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods : periods.reverse()
        // FinancialJuly periods are collected backwards. If isReverse is true, then do nothing. Else reverse to correct order and return.

        return periods
    }
}

const getFinancialAprilPeriodType = (formatYyyyMmDd, fnFilter) => {
    return (config) => {
        let periods = []
        const isFilter = config.filterFuturePeriods
        const isReverse = config.reversePeriods
        const year = getYearWithOffset(config.offset)
        const date = new Date(`31 Mar ${year + 1}`)

        for (let i = 0; i < 10; i++) {
            const period = {}
            period.endDate = formatYyyyMmDd(date)
            date.setYear(date.getFullYear() - 1)
            date.setDate(date.getDate() + 1)
            period.startDate = formatYyyyMmDd(date)
            const yearStart = date.getFullYear()
            const yearEnd = date.getFullYear() + 1
            period.displayName = `${getMonthName(
                3
            )} ${yearStart} - ${getMonthName(2)} ${yearEnd}`
            period.id = `${date.getFullYear()}April`
            periods.push(period)
            date.setDate(date.getDate() - 1)
        }

        periods = isFilter ? fnFilter(periods) : periods
        periods = isReverse ? periods : periods.reverse()
        // FinancialApril periods are collected backwards. If isReverse is true, then do nothing. Else reverse to correct order and return.

        return periods
    }
}

export const defaultFormatYyyyMmDd = (date) => {
    const y = date.getFullYear()
    let m = String(date.getMonth() + 1)
    let d = String(date.getDate())

    m = m.length < 2 ? `0${m}` : m
    d = d.length < 2 ? `0${d}` : d

    return `${y}-${m}-${d}`
}

const defaultFilterFuturePeriods = (periods) => {
    const array = []
    const now = getCurrentDate()

    for (let i = 0; i < periods.length; i++) {
        if (new Date(periods[i].startDate) <= now) {
            array.push(periods[i])
        }
    }

    return array
}

export const getFixedPeriodTypes = ({
    formatYyyyMmDd = defaultFormatYyyyMmDd,
    filterFuturePeriods = defaultFilterFuturePeriods,
} = {}) => [
    {
        type: DAILY,
        regex: /^([0-9]{4})([0-9]{2})([0-9]{2})$/, // YYYYMMDD
        getPeriods: getDailyPeriodType(formatYyyyMmDd, filterFuturePeriods),
        displayName: i18n.t('Daily'),
    },
    {
        type: WEEKLY,
        regex: /^([0-9]{4})()W([0-9]{1,2})$/, // YYYY"W"[1-53]
        getPeriods: getWeeklyPeriodType(
            formatYyyyMmDd,
            { shortName: '', startDay: 1 },
            filterFuturePeriods
        ),
        displayName: i18n.t('Weekly'),
    },
    {
        type: WEEKLY_WEDNESDAY,
        regex: /^([0-9]{4})(Wed)W([0-9]{1,2})$/, // YYYY"WedW"[1-53]
        getPeriods: getWeeklyPeriodType(
            formatYyyyMmDd,
            { shortName: 'Wed', startDay: 3 },
            filterFuturePeriods
        ),
        displayName: i18n.t('Weekly (Start Wednesday)'),
    },
    {
        type: WEEKLY_THURSDAY,
        regex: /^([0-9]{4})(Thu)W([0-9]{1,2})$/, // YYYY"ThuW"[1-53]
        getPeriods: getWeeklyPeriodType(
            formatYyyyMmDd,
            { shortName: 'Thu', startDay: 4 },
            filterFuturePeriods
        ),
        displayName: i18n.t('Weekly (Start Thursday)'),
    },
    {
        type: WEEKLY_SATURDAY,
        regex: /^([0-9]{4})(Sat)W([0-9]{1,2})$/, // YYYY"SatW"[1-53]
        getPeriods: getWeeklyPeriodType(
            formatYyyyMmDd,
            { shortName: 'Sat', startDay: 6 },
            filterFuturePeriods
        ),
        displayName: i18n.t('Weekly (Start Saturday)'),
    },
    {
        type: WEEKLY_SUNDAY,
        regex: /^([0-9]{4})(Sun)W([0-9]{1,2})$/, // YYYY"SunW"[1-53]
        getPeriods: getWeeklyPeriodType(
            formatYyyyMmDd,
            { shortName: 'Sun', startDay: 7 },
            filterFuturePeriods
        ),
        displayName: i18n.t('Weekly (Start Sunday)'),
    },
    {
        type: BI_WEEKLY,
        regex: /^([0-9]{4})BiW([0-9]{1,2})$/, // YYYY"BiW"[1-27]
        getPeriods: getBiWeeklyPeriodType(formatYyyyMmDd, filterFuturePeriods),
        displayName: i18n.t('Bi-weekly'),
    },
    {
        type: MONTHLY,
        regex: /^([0-9]{4})([0-9]{2})$/, // YYYYMM
        getPeriods: getMonthlyPeriodType(formatYyyyMmDd, filterFuturePeriods),
        displayName: i18n.t('Monthly'),
    },
    {
        type: BI_MONTHLY,
        regex: /^([0-9]{4})([0-9]{2})B$/, // YYYY0[1-6]"B"
        getPeriods: getBiMonthlyPeriodType(formatYyyyMmDd, filterFuturePeriods),
        displayName: i18n.t('Bi-monthly'),
    },
    {
        type: QUARTERLY,
        regex: /^([0-9]{4})Q([1234])$/, // YYYY"Q"[1-4]
        getPeriods: getQuarterlyPeriodType(formatYyyyMmDd, filterFuturePeriods),
        displayName: i18n.t('Quarterly'),
    },
    {
        type: SIX_MONTHLY,
        regex: /^([0-9]{4})S([12])$/, // YYYY"S"[1/2]
        getPeriods: getSixMonthlyPeriodType(filterFuturePeriods),
        displayName: i18n.t('Six-monthly'),
    },
    {
        type: SIX_MONTHLY_APRIL,
        regex: /^([0-9]{4})AprilS([12])$/, // YYYY"AprilS"[1/2]
        getPeriods: getSixMonthlyAprilPeriodType(filterFuturePeriods),
        displayName: i18n.t('Six-monthly April'),
    },
    {
        type: YEARLY,
        regex: /^([0-9]{4})$/, // YYYY
        getPeriods: getYearlyPeriodType(formatYyyyMmDd, filterFuturePeriods),
        displayName: i18n.t('Yearly'),
    },
    {
        type: FINANCIAL_NOV,
        regex: /^([0-9]{4})Nov$/, // YYYY"Nov"
        getPeriods: getFinancialNovemberPeriodType(
            formatYyyyMmDd,
            filterFuturePeriods
        ),
        displayName: i18n.t('Financial year (Start November)'),
    },
    {
        type: FINANCIAL_OCT,
        regex: /^([0-9]{4})Oct$/, // YYYY"Oct"
        getPeriods: getFinancialOctoberPeriodType(
            formatYyyyMmDd,
            filterFuturePeriods
        ),
        displayName: i18n.t('Financial year (Start October)'),
    },
    {
        type: FINANCIAL_JULY,
        regex: /^([0-9]{4})July$/, // YYYY"July"
        getPeriods: getFinancialJulyPeriodType(
            formatYyyyMmDd,
            filterFuturePeriods
        ),
        displayName: i18n.t('Financial year (Start July)'),
    },

    {
        type: FINANCIAL_APRIL,
        regex: /^([0-9]{4})April$/, // YYYY"April"
        getPeriods: getFinancialAprilPeriodType(
            formatYyyyMmDd,
            filterFuturePeriods
        ),
        displayName: i18n.t('Financial year (Start April)'),
    },
]

export const getFixedPeriodType = ({
    periodType,
    formatYyyyMmDd,
    filterFuturePeriods,
}) => {
    if (!isValidPeriodType(periodType)) {
        throw new Error(
            `Invalid period type "${periodType}" supplied to "getFixedPeriodType"`
        )
    }
    const periodTypeObj = getFixedPeriodTypes({
        formatYyyyMmDd,
        filterFuturePeriods,
    }).find(({ type }) => type === periodType)

    if (!periodTypeObj) {
        /**
         * This error suggests the list of period types at the top of this file
         * contains a period type name which has not been implemented yet in
         * getFixedPeriodTypes
         */
        throw new Error(`Could not find periodType object for "${periodType}"`)
    }

    return periodTypeObj
}

export const getYearOffsetFromNow = (year) => {
    const yearInt = parseInt(year, 10)
    if (!Number.isInteger(yearInt)) {
        throw new Error(
            `Invalid year "${year}" passed to "getYearOffsetFromNow"`
        )
    }

    return yearInt - getCurrentDate().getFullYear()
}

export const getFixedPeriodsByTypeAndYear = ({
    periodType,
    year,
    formatYyyyMmDd,
    filterFuturePeriods,
    config,
}) => {
    const fixedPeriod = getFixedPeriodType({
        periodType,
        formatYyyyMmDd,
        filterFuturePeriods,
    })
    const offset = getYearOffsetFromNow(year)

    return fixedPeriod && Number.isInteger(offset)
        ? fixedPeriod.getPeriods({ ...config, offset })
        : []
}

export const parsePeriodId = (id, allowedTypes) => {
    if (!id) {
        return null
    }

    const periodTypes = allowedTypes
        ? getFixedPeriodTypes().filter(({ type }) =>
              allowedTypes.some((allowedType) => allowedType === type)
          )
        : getFixedPeriodTypes()
    let i = 0
    let periodType = undefined
    let match = undefined

    while (i < periodTypes.length && !match) {
        periodType = periodTypes[i]
        match = id.match(periodType.regex)
        i++
    }

    if (!match) {
        return null
    }

    const year = parseInt(match[1], 10)
    const offset = getYearOffsetFromNow(year)
    const periods = periodType.getPeriods({ offset })
    const period = periods.find((period) => period.id === id)

    return {
        ...period,
        /*
         * Add year and periodType so a parsed period code
         * can be use for a multitude of purposes
         */
        year,
        periodType,
    }
}

export const getFixedPeriodsForTypeAndDateRange = ({
    periodType,
    startDate,
    endDate,
    formatYyyyMmDd,
    config,
}) => {
    // Allow dates and date-strings
    startDate = new Date(startDate)
    endDate = new Date(endDate)

    if (!isValidDate(startDate)) {
        throw new Error(
            'Invalid startDate provided to getFixedPeriodsForTypeAndDateRange'
        )
    }
    if (!isValidDate(endDate)) {
        throw new Error(
            'Invalid endDate provided to getFixedPeriodsForTypeAndDateRange'
        )
    }

    let year = endDate.getFullYear()
    let startDateReached = false
    const convertedPeriods = []

    while (!startDateReached) {
        getFixedPeriodsByTypeAndYear({ periodType, year, formatYyyyMmDd, config })
            .reverse()
            .forEach((period) => {
                const periodEnd = new Date(period.endDate)
                // exclude periods that end before start date
                const endsAfterPeriodStart = periodEnd >= startDate
                // exclude periods that end after end date
                const endsBeforePeriodEnd = periodEnd <= endDate

                if (!endsAfterPeriodStart) {
                    startDateReached = true
                }

                if (endsAfterPeriodStart && endsBeforePeriodEnd) {
                    convertedPeriods.push(period)
                }
            })

        --year
    }

    return convertedPeriods.reverse()
}
