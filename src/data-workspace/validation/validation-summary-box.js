import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { validationLevelsConfig } from './validation-config.js'
import { ImportanceLevelPropTypes } from './validation-result-prop-types.js'
import styles from './validation-summary-box.module.css'

const ValidationSummaryBox = ({ level, count, hideCounts }) => {
    const {
        icon: Icon,
        iconColor,
        text,
        style: styleName,
    } = validationLevelsConfig[level]
    const style = styles[styleName]
    const classNames = cx(styles.summaryBox, style, {
        [styles.hideCounts]: hideCounts,
    })
    return (
        <div data-test={`count-${level}`} className={classNames}>
            <div className={styles.title}>
                <Icon color={iconColor} />
                <span>{text}</span>
            </div>
            <div className={styles.count}>{count}</div>
        </div>
    )
}
ValidationSummaryBox.propTypes = {
    count: PropTypes.number.isRequired,
    hideCounts: PropTypes.bool.isRequired,
    level: ImportanceLevelPropTypes.isRequired,
}
export default ValidationSummaryBox
