import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useOrgUnitId } from '../../context-selection/index.js'
import { useRightHandPanelContext } from '../../right-hand-panel/index.js'
import {
    Sidebar,
    Title,
    ExpandableUnit,
    useCurrentItemContext,
    SidebarProps,
} from '../../shared/index.js'
import { useDataValueSet } from '../use-data-value-set.js'
import AuditLog from './audit-log.js'
import BasicInformation from './basic-information.js'
import Comment from './comment.js'
import History from './history.js'
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

    const [orgUnitId] = useOrgUnitId()
    const rightHandPanel = useRightHandPanelContext()

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

            <ExpandableUnit initiallyOpen title={i18n.t('Comment')}>
                <Comment item={dataValue} />
            </ExpandableUnit>

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

            <History />
            <AuditLog />
        </Sidebar>
    )
}
DataDetailsSidebar.propTypes = SidebarProps
