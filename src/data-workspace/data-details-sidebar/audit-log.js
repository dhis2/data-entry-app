import i18n from '@dhis2/d2-i18n'
import {
    CircularLoader,
    DataTable,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    TableBody,
    TableHead,
    Tag,
} from '@dhis2/ui'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { ExpandableUnit } from '../../shared/index.js'
import styles from './audit-log.module.css'

const title = i18n.t('Audit log')

const AuditLogUnit = ({ loading, audits }) => {

    if (loading) {
        return (
            <ExpandableUnit title={title}>
                {loading && <CircularLoader small />}
            </ExpandableUnit>
        )
    }

    const isEmptyAuditLog = !Array.isArray(audits) || audits.length === 0

    if (isEmptyAuditLog) {
        return (
            <ExpandableUnit title={title}>
                <p className={styles.placeholder}>
                    {i18n.t('No audit log for this data item.')}
                </p>
            </ExpandableUnit>
        )
    }

    // Do not modify original array, sort mutates the array
    const newToOldAuditLog = [...audits].sort((left, right) => {
        const lCreated = new Date(left.created)
        const rCreated = new Date(right.created)
        return lCreated === rCreated ? 0 : lCreated < rCreated ? 1 : -1
    })

    if (!newToOldAuditLog.length) {
        return (
            <ExpandableUnit title={title}>
                <p className={styles.placeholder}>
                    {i18n.t('No audit log for this data item')}
                </p>
            </ExpandableUnit>
        )
    }

    return (
        <ExpandableUnit title={title}>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>
                            Date
                        </DataTableColumnHeader>
                        <DataTableColumnHeader>
                            User
                        </DataTableColumnHeader>
                        <DataTableColumnHeader>
                            New value
                        </DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {newToOldAuditLog.map((entry, index) => {
                        const { modifiedBy: user, value, created, auditType } = entry

                        return (
                            <DataTableRow key={index}>
                                <DataTableCell>
                                    {moment(created).format('YYYY-MM-DD HH:mm')}
                                </DataTableCell>
                                <DataTableCell>
                                    {user}
                                </DataTableCell>
                                <DataTableCell>
                                    <div style={{ textAlign: 'right' }}>
                                        {
                                            auditType === 'DELETE'
                                                ? <Tag negative>{i18n.t('Deleted')}</Tag>
                                                : value
                                        }
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

AuditLogUnit.defaultProps = {
    audits: [],
}

AuditLogUnit.propTypes = {
    audits: PropTypes.arrayOf(
        PropTypes.shape({
            auditType: PropTypes.oneOf(['UPDATE', 'DELETE']).isRequired,
            created: PropTypes.string,
            modifiedBy: PropTypes.string,
            prevValue: PropTypes.string,
            value: PropTypes.string,
        })
    ),
    loading: PropTypes.bool,
}

export default AuditLogUnit
