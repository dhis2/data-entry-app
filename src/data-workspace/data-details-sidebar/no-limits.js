import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './limits.module.css'

export default function NoLimits({ onAddLimitsClick }) {
    return (
        <div className={styles.limit}>
            {i18n.t('No limit set for this data item')}

            <Button onClick={onAddLimitsClick}>
                {i18n.t('Add limits')}
            </Button>
        </div>
    )
}

NoLimits.propTypes = {
    onAddLimitsClick: PropTypes.func.isRequried,
}
