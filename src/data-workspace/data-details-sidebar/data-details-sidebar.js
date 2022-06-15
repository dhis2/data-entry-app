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
    useCurrentItemContext,
    SidebarProps,
} from '../../shared/index.js'
import * as queryKeyFactory from '../query-key-factory.js'
import { useDataValueSet } from '../use-data-value-set.js'
import AuditLog from './audit-log.js'
import BasicInformation from './basic-information.js'
import Comment from './comment.js'
import HistoryUnit from './history-unit.js'
import Limits from './limits.js'

export default function DataDetailsSidebar() {
    const dataValueSet = useDataValueSet()
    const { item } = useCurrentItemContext()
    const dataValue = {
        ...item,
        ...dataValueSet.data?.dataValues[item.dataElement]?.[item.categoryOptionCombo]
    }
    const onMarkForFollowup = () => null
    const onUnmarkForFollowup = () => null
    const [periodId] = usePeriodId()
    const [orgUnitId] = useOrgUnitId()
    const { attributeCombo, attributeOptions } = useApiAttributeParams()

    const isValidSelection = useIsValidSelection()
    const rightHandPanel = useRightHandPanelContext()

    const dataValueContextQueryKey = queryKeyFactory.dataValueContext.byParams({
        dataElementId: dataValue.dataElement,
        periodId: periodId,
        orgUnitId: orgUnitId,
        categoryOptionIds: attributeOptions,
        categoryComboId: attributeCombo,
        categoryOptionComboId: dataValue.categoryOptionCombo,
    })

    const dataValueContext = useQuery(dataValueContextQueryKey, {
        enabled: isValidSelection,
    })

    const minMaxValue = dataValueSet.data?.minMaxValues.find((curMinMaxValue) => (
        curMinMaxValue.categoryOptionCombo === dataValue.categoryOptionCombo &&
        curMinMaxValue.dataElement === dataValue.dataElement &&
        curMinMaxValue.orgUnit === orgUnitId
    )) || {}

    const limits = {
        min: minMaxValue.minValue,
        max: minMaxValue.maxValue,
    }

    return (
        <Sidebar>
            <Title onClose={rightHandPanel.hide}>{i18n.t('Details')}</Title>

            <BasicInformation
                item={dataValue}
                onMarkForFollowup={onMarkForFollowup}
                onUnmarkForFollowup={onUnmarkForFollowup}
            />

            <Comment comment={item.comment} />

            <ExpandableUnit
                title={i18n.t('Minimum and maximum limits')}
                disabled={!dataValue.canHaveLimits}
            >
                <Limits
                    valueType={dataValue.valueType}
                    dataElementId={dataValue.dataElement}
                    categoryOptionComboId={dataValue.categoryOptionCombo}
                    limits={limits}
                />
            </ExpandableUnit>

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
