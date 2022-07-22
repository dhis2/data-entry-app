import i18n from '@dhis2/d2-i18n'
import { Button, Tooltip, IconFlag16, IconFlag24, colors } from '@dhis2/ui'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './basic-information.module.css'
import ItemPropType from './item-prop-type.js'

const BasicInformation = ({ item, onMarkForFollowup, onUnmarkForFollowup }) => (
    <div className={styles.unit}>
        <h1 className={styles.title}>{item.name}</h1>
        <ul className={styles.elements}>
            {item.code && (
                <li>
                    {i18n.t('Code: {{code}}', {
                        code: item.code,
                        nsSeparator: '-:-',
                    })}
                </li>
            )}
            <li>
                {i18n.t('ID: {{id}}', {
                    id: item.dataElement,
                    nsSeparator: '-:-',
                })}
            </li>
            <li>
                {item.lastUpdated && (
                    <Tooltip content={item.lastUpdated.toString()}>
                        {i18n.t('Last updated {{- timeAgo}} by {{- name}}', {
                            timeAgo: moment.utc(item.lastUpdated).fromNow(),
                            name: item.storedBy,
                        })}
                    </Tooltip>
                )}
            </li>

            {item.followup ? (
                <li className={styles.markedForFollowup}>
                    <IconFlag16 color={colors.yellow700} />
                    {i18n.t('Marked for follow-up')}
                </li>
            ) : null}
        </ul>
        {item.followup ? (
            <Button small secondary onClick={onUnmarkForFollowup}>
                {i18n.t('Unmark for follow-up')}
            </Button>
        ) : (
            <Button
                small
                secondary
                icon={<IconFlag24 color={colors.grey600} />}
                onClick={onMarkForFollowup}
            >
                {i18n.t('Mark for follow-up')}
            </Button>
        )}
    </div>
)

BasicInformation.propTypes = {
    item: ItemPropType.isRequired,
    onMarkForFollowup: PropTypes.func.isRequired,
    onUnmarkForFollowup: PropTypes.func.isRequired,
}

export default BasicInformation
