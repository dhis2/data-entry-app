import i18n from '@dhis2/d2-i18n'
import { Button, Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useConnectionStatus } from '../../shared/index.js'
import sharedStyles from './limits.module.css'
import noLimitsStyles from './no-limits.module.css'

const buttonLabel = i18n.t('Add limits')

function AddButton({ onAddLimitsClick }) {
    const { offline } = useConnectionStatus()

    if (offline) {
        return (
            <Tooltip content={i18n.t('Not available offline')}>
                <Button small disabled className={noLimitsStyles.addButton}>
                    {buttonLabel}
                </Button>
            </Tooltip>
        )
    }

    return (
        <Button small onClick={onAddLimitsClick}>
            {buttonLabel}
        </Button>
    )
}

AddButton.propTypes = {
    onAddLimitsClick: PropTypes.func.isRequired,
}

export default function NoLimits({ onAddLimitsClick }) {
    return (
        <div className={sharedStyles.limit}>
            <p className={noLimitsStyles.label}>
                {i18n.t('No limits set for this data item.')}
            </p>
            <AddButton onAddLimitsClick={onAddLimitsClick} />
        </div>
    )
}

NoLimits.propTypes = {
    onAddLimitsClick: PropTypes.func.isRequired,
}
