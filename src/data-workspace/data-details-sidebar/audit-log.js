import i18n from '@dhis2/d2-i18n'
import {
    CircularLoader,
    DataTable,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    NoticeBox,
    TableBody,
    TableHead,
    Tag,
    Tooltip,
} from '@dhis2/ui'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import {
    ExpandableUnit,
    useCurrentItemContext,
    useConnectionStatus,
} from '../../shared/index.js'
import styles from './audit-log.module.css'
import useDataValueContext from './use-data-value-context.js'
import useOpenState from './use-open-state.js'

const title = i18n.t('Audit log')

export default function AuditLog() {
    const { offline } = useConnectionStatus()
    const { item } = useCurrentItemContext()
    const { open, setOpen, openRef } = useOpenState(item)
    const dataValueContext = useDataValueContext(item, openRef.current)

    if (!offline && (!open || dataValueContext.isLoading)) {
        return (
            <ExpandableUnit title={title} open={open} onToggle={setOpen}>
                <CircularLoader small />
            </ExpandableUnit>
        )
    }

    if (!offline && dataValueContext.error) {
        return (
            <ExpandableUnit title={title} open={open} onToggle={setOpen}>
                <NoticeBox
                    title={i18n.t('Something went wrong loading the audit log')}
                >
                    <p>{dataValueContext.error.toString()}</p>
                </NoticeBox>
            </ExpandableUnit>
        )
    }

    if (offline && !dataValueContext.data) {
        return (
            <Tooltip content={i18n.t('Not available offline')}>
                <ExpandableUnit
                    disabled
                    title={title}
                    open={false}
                    onToggle={() => null}
                />
            </Tooltip>
        )
    }

    const audits = dataValueContext.data?.audits || []
    const isEmptyAuditLog = !Array.isArray(audits) || audits.length === 0

    if (isEmptyAuditLog) {
        return (
            <ExpandableUnit title={title} open={open} onToggle={setOpen}>
                <p className={styles.placeholder}>
                    {i18n.t('No audit log for this data item.')}
                </p>
            </ExpandableUnit>
        )
    }

    return (
        <ExpandableUnit title={title} open={open} onToggle={setOpen}>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Date</DataTableColumnHeader>
                        <DataTableColumnHeader>User</DataTableColumnHeader>
                        <DataTableColumnHeader>Change</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {audits.map((audit, index) => {
                        const {
                            modifiedBy: user,
                            previousValue,
                            value,
                            created,
                            auditType,
                        } = audit

                        return (
                            <DataTableRow key={index}>
                                <DataTableCell>
                                    {moment(created).format('YYYY-MM-DD HH:mm')}
                                </DataTableCell>
                                <DataTableCell>{user}</DataTableCell>
                                <DataTableCell>
                                    <div>
                                        {auditType === 'DELETE' && (
                                            <DeletedValue
                                                previousValue={previousValue}
                                            />
                                        )}
                                        {auditType === 'UPDATE' && (
                                            <UpdatedValue
                                                value={value}
                                                previousValue={previousValue}
                                            />
                                        )}
                                    </div>
                                </DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </TableBody>
            </DataTable>
        </ExpandableUnit>
    )
}

function DeletedValue({ previousValue }) {
    return (
        <>
            <Tag negative>
                <span style={{ textDecoration: 'line-through' }}>
                    {previousValue}
                </span>
            </Tag>
        </>
    )
}

DeletedValue.propTypes = {
    previousValue: PropTypes.string.isRequired,
}

function UpdatedValue({ value, previousValue }) {
    return (
        <>
            <Tag>{previousValue}</Tag>
            {/* space arrow-right space*/}
            &nbsp;&rarr;&nbsp;
            <Tag>{value}</Tag>
        </>
    )
}

UpdatedValue.propTypes = {
    previousValue: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
}
