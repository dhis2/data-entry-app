import { composeValidators } from '@dhis2/ui-forms'
import PropTypes from 'prop-types'
import React from 'react'
import { Form } from 'react-final-form'
import { useOrgUnitId } from '../../context-selection/index.js'
import { createLessThan, validatorsByValueType } from '../inputs/index.js'
import { useUpdateLimits } from '../min-max-limits-mutations/index.js'
import limitInputLabelsByName from './limits-input-labels-by-name.js'

export default function LimitsFormWrapper({
    categoryOptionComboId,
    dataElementId,
    valueType,
    onDone,
    children,
}) {
    const [orgUnitId] = useOrgUnitId()
    const { mutate: updateLimits } = useUpdateLimits(onDone)

    const onSubmit = async ({ min, max }) => {
        await updateLimits({
            categoryOptionCombo: categoryOptionComboId,
            dataElement: dataElementId,
            orgUnit: orgUnitId,
            minValue: min,
            maxValue: max,
        })
    }

    const validator = validatorsByValueType[valueType]
    const validateMin = composeValidators(validator, createLessThan('max', limitInputLabelsByName.max))
    const validate = values => {
        let errors = undefined

        const minError = validateMin(values.min, values)
        if (minError) {
            if (!errors) {
                errors = {}
            }

            errors.min = minError
        }

        // No need to check whether this is really more
        // than "min" as "min" is already checking
        // whether it's less than "max"
        const maxError = validator(values.max, values)
        if (maxError) {
            if (!errors) {
                errors = {}
            }

            errors.max = maxError
        }

        return errors
    }

    return (
        <Form onSubmit={onSubmit} validate={validate}>
            {() => children}
        </Form>
    )
}

LimitsFormWrapper.propTypes = {
    categoryOptionComboId: PropTypes.string.isRequired,
    children: PropTypes.any.isRequired,
    dataElementId: PropTypes.string.isRequired,
    valueType: PropTypes.string.isRequired,
    onDone: PropTypes.func.isRequired,
}
