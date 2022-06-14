import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import LimitsDeleteButton from './limits-delete-button.js'
import styles from './limits.module.css'

export default function LimitsDisplay({
    categoryOptionComboId,
    dataElementId,
    min,
    max,
    onEditClick,
}) {
    return (
        <div className={styles.limits}>
            <div>
                {min !== null && (
                    <div className={styles.limit}>
                        <span className={styles.limitLabel}>
                            {i18n.t('Minimum')}
                        </span>
                        <span className={styles.limitValue}>{min}</span>
                    </div>
                )}

                {min !== null && max !== null && (
                    <div className={styles.spaceBetween}></div>
                )}

                {max !== null && (
                    <div className={styles.limit}>
                        <span className={styles.limitLabel}>
                            {i18n.t('Maximum')}
                        </span>
                        <span className={styles.limitValue}>{max}</span>
                    </div>
                )}
            </div>

            <ButtonStrip>
                <Button
                    small
                    primary
                    onClick={onEditClick}
                >
                    {i18n.t('Edit')}
                </Button>

                <LimitsDeleteButton
                    dataElementId={dataElementId}
                    categoryOptionComboId={categoryOptionComboId}
                    disabled={false}
                />
            </ButtonStrip>
        </div>
    )
}

LimitsDisplay.propTypes = {
    categoryOptionComboId: PropTypes.string.isRequired,
    dataElementId: PropTypes.string.isRequired,
    onEditClick: PropTypes.func.isRequired,
    max: PropTypes.number,
    min: PropTypes.number,
}
