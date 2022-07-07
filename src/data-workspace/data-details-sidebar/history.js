import i18n from '@dhis2/d2-i18n'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import React from 'react'
import { ExpandableUnit, useCurrentItemContext } from '../../shared/index.js'
import HistoryLineChart from './history-line-chart.js'
import useDataValueContext from './use-data-value-context.js'
import useOpenState from './use-open-state.js'

const title = i18n.t('History')

export default function History() {
    const { item } = useCurrentItemContext()
    const { open, setOpen, openRef } = useOpenState(item)
    const dataValueContext = useDataValueContext(item, openRef.current)

    if (!open || dataValueContext.isLoading) {
        return (
            <ExpandableUnit title={title} open={open} onToggle={setOpen}>
                <CircularLoader />
            </ExpandableUnit>
        )
    }

    if (dataValueContext.error) {
        return (
            <ExpandableUnit title={title} open={open} onToggle={setOpen}>
                <NoticeBox
                    title={i18n.t('Something went wrong loading the history')}
                >
                    <p>{dataValueContext.error.toString()}</p>
                </NoticeBox>
            </ExpandableUnit>
        )
    }

    const history = dataValueContext.data?.history || []

    if (!history.length) {
        return (
            <ExpandableUnit title={title} open={open} onToggle={setOpen}>
                <p>{'@TODO: ' + i18n.t('Show ui for no history')}</p>
            </ExpandableUnit>
        )
    }

    return (
        <ExpandableUnit
            title={i18n.t('History')}
            open={open}
            onToggle={setOpen}
        >
            <HistoryLineChart history={history} />
        </ExpandableUnit>
    )
}
