import i18n from '@dhis2/d2-i18n'
import { IconInfo16, colors } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './limits.module.css'

export default function LimitsAverageValueInfo({ avg }) {
    if (!avg) {
        return null
    }

    return (
        <div className={styles.averageValue}>
            <IconInfo16 color={colors.grey600} />
            {i18n.t('Average value: {{avg}}', { avg, nsSeparator: '-:-' })}
        </div>
    )
}

LimitsAverageValueInfo.propTypes = {
    avg: PropTypes.number,
}
