import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { validationLevelsConfig } from './validation-config.js'
import styles from './validation-priority-group.module.css'
import {
    ImportanceLevelPropTypes,
    ValidationRuleViolationWithMetaDataPropTypes,
} from './validation-result-prop-types.js'
import ValidationRuleExpression from './validation-rule-expression.js'

const ValidationPriortyGroup = ({ level, validationViolations = [] }) => {
    if (validationViolations?.length === 0) {
        return null
    }

    const validationConfig = validationLevelsConfig[level]

    const validationViolationBoxStyle = cx(
        styles.priorityGroupBox,
        styles[validationConfig.style]
    )

    const Icon = validationConfig.largeIcon
    const iconStyle = cx(styles.icon, styles[`${validationConfig.style}Icon`])

    const translationOptions = {
        level: validationConfig.text?.toLowerCase(),
        length: validationViolations.length,
    }

    return (
        <div data-test={`priority-group-${level}`}>
            <div className={styles.titleWrapper}>
                <div className={iconStyle}>
                    <Icon color={validationConfig.iconColor} />
                </div>
                <h1>
                    {validationViolations.length === 1
                        ? i18n.t(
                              '{{length}} {{level}} priority alert',
                              translationOptions
                          )
                        : i18n.t(
                              '{{length}} {{level}} priority alerts',
                              translationOptions
                          )}
                </h1>
            </div>
            {validationViolations.map((validationRule) => {
                return (
                    <div
                        className={validationViolationBoxStyle}
                        key={validationRule.metaData.id}
                    >
                        <div>{validationRule.metaData.displayInstruction}</div>
                        <div className={styles.formula}>
                            <ValidationRuleExpression
                                validationRule={validationRule}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

ValidationPriortyGroup.propTypes = {
    level: ImportanceLevelPropTypes.isRequired,
    validationViolations: PropTypes.arrayOf(
        ValidationRuleViolationWithMetaDataPropTypes
    ),
}
export default ValidationPriortyGroup
