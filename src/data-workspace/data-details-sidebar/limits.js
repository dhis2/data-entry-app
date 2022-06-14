import PropTypes from 'prop-types'
import React, { useState } from 'react'
import LimitsDisplay from './limits-display.js'
import NoLimits from './no-limits.js'
import UpdateLimits from './update-limits.js'

export default function Limits({
    valueType,
    categoryOptionComboId,
    dataElementId,
    limits,
}) {
    const [editing, setEditing] = useState(false)

    if (!editing && !limits.min && !limits.max) {
        const onAddLimitsClick = () => setEditing(true)
        return <NoLimits onAddLimitsClick={onAddLimitsClick} />
    }

    if (editing) {
        return (
            <UpdateLimits
                dataElementId={dataElementId}
                categoryOptionComboId={categoryOptionComboId}
                limits={limits}
                valueType={valueType}
                onCancel={() => setEditing(false)}
                onDone={() => setEditing(false)}
            />
        )
    }

    return (
        <LimitsDisplay
            dataElementId={dataElementId}
            categoryOptionComboId={categoryOptionComboId}
            max={limits.max}
            min={limits.min}
            onEditClick={() => setEditing(true)}
        />
    )
}

Limits.propTypes = {
    categoryOptionComboId: PropTypes.string.isRequired,
    dataElementId: PropTypes.string.isRequired,
    limits: PropTypes.shape({
        max: PropTypes.number,
        min: PropTypes.number,
    }).isRequired,
    valueType: PropTypes.string.isRequired,
}
