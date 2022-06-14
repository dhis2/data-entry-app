import i18n from '@dhis2/d2-i18n'
import {
    Button,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useOrgUnitId } from '../../context-selection/index.js'
import { useDeleteLimits } from '../min-max-limits-mutations/index.js'

export default function LimitsDeleteButton({
    dataElementId,
    categoryOptionComboId,
    disabled,
}) {
    const [orgUnitId] = useOrgUnitId()
    const deleteLimit = useDeleteLimits()
    const onClick = async () => {
        await deleteLimit.mutate({
            categoryOptionCombo: categoryOptionComboId,
            dataElement: dataElementId,
            orgUnit: orgUnitId,
        })
    }

    return (
        <Button
            small
            secondary
            onClick={onClick}
            loading={deleteLimit.isLoading}
            disabled={disabled}
        >
            {i18n.t('Delete limits')}
        </Button>
    )
}

LimitsDeleteButton.propTypes = {
    categoryOptionComboId: PropTypes.string.isRequired,
    dataElementId: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
}
