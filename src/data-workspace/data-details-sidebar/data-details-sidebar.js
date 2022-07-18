import i18n from '@dhis2/d2-i18n'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import React from 'react'
import { useQuery } from 'react-query'
import {
    useOrgUnitId,
    usePeriodId,
    useIsValidSelection,
} from '../../context-selection/index.js'
import { useRightHandPanelContext } from '../../right-hand-panel/index.js'
import {
    Sidebar,
    Title,
    ExpandableUnit,
    useApiAttributeParams,
    useHighlightedField,
    SidebarProps,
} from '../../shared/index.js'
import * as queryKeyFactory from '../query-key-factory.js'
import AuditLog from './audit-log.js'
import BasicInformation from './basic-information.js'
import Comment from './comment.js'
import HistoryUnit from './history-unit.js'

export default function DataDetailsSidebar() {
    const item = useHighlightedField()
    const onMarkForFollowup = () => null
    const onUnmarkForFollowup = () => null
    const [periodId] = usePeriodId()
    const [orgUnitId] = useOrgUnitId()
    const { attributeCombo, attributeOptions } = useApiAttributeParams()

    const isValidSelection = useIsValidSelection()
    const rightHandPanel = useRightHandPanelContext()

    const dataValueContextQueryKey = queryKeyFactory.dataValueContext.byParams({
        dataElementId: item.dataElement,
        periodId: periodId,
        orgUnitId: orgUnitId,
        categoryOptionIds: attributeOptions,
        categoryComboId: attributeCombo,
        categoryOptionComboId: item.categoryOptionCombo,
    })

    const dataValueContext = useQuery(dataValueContextQueryKey, {
        enabled: isValidSelection,
    })

    return (
        <Sidebar>
            <Title onClose={rightHandPanel.hide}>{i18n.t('Details')}</Title>

            <BasicInformation
                item={item}
                onMarkForFollowup={onMarkForFollowup}
                onUnmarkForFollowup={onUnmarkForFollowup}
            />

            <Comment comment={item.comment} />

            {/* <Limits itemId={item.id} itemType={item.type} /> */}

            {dataValueContext.isLoading && (
                <ExpandableUnit
                    title={i18n.t('History and audit')}
                    initiallyOpen
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContext: 'center',
                        }}
                    >
                        <CircularLoader small />
                    </div>
                </ExpandableUnit>
            )}

            {dataValueContext.error && (
                <ExpandableUnit
                    title={i18n.t('History and audit')}
                    initiallyOpen
                >
                    <NoticeBox
                        title={i18n.t(
                            'Something went wrong loading the history and audit log'
                        )}
                    >
                        <p>{dataValueContext.error.message}</p>
                    </NoticeBox>
                </ExpandableUnit>
            )}

            {dataValueContext.data && (
                <>
                    <HistoryUnit
                        loading={
                            dataValueContext.isIdle || dataValueContext.loading
                        }
                        history={dataValueContext.data?.history}
                    />

                    <AuditLog
                        loading={
                            dataValueContext.isIdle || dataValueContext.loading
                        }
                        audits={dataValueContext.data?.audits}
                    />
                </>
            )}
        </Sidebar>
    )
}
DataDetailsSidebar.propTypes = SidebarProps
