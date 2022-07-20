import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useConnectionStatus } from '../../shared/index.js'
import LimitsDeleteButton from './limits-delete-button.js'
import styles from './limits.module.css'

const editButtonLabel = i18n.t('Edit')

function EditButton({ onClick }) {
    const { offline } = useConnectionStatus()
    console.log('> offline', offline)

    if (offline) {
        return (
            <Tooltip content={i18n.t('Not available offline')}>
                <Button small primary disabled>
                    {editButtonLabel}
                </Button>
            </Tooltip>
        )
    }

    return (
        <Button small primary onClick={onClick}>
            {editButtonLabel}
        </Button>
    )
}

EditButton.propTypes = {
    onClick: PropTypes.func.isRequired,
}

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
                <EditButton onClick={onEditClick} />
                <LimitsDeleteButton
                    dataElementId={dataElementId}
                    categoryOptionComboId={categoryOptionComboId}
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
