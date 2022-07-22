import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useField, useForm } from 'react-final-form'
import calculateAverage from './calculate-average.js'
import LimitsAverageValueInfo from './limits-average-value-info.js'
import LimitsDeleteButton from './limits-delete-button.js'
import LimitsFormWrapper from './limits-form-wrapper.js'
import limitInputLabelsByName from './limits-input-labels-by-name.js'
import LimitsInput from './limits-input.js'
import LimitsValidationErrorMessage from './limits-validation-error-message.js'
import styles from './limits.module.css'

function UpdateLimits({
    limits,
    categoryOptionComboId,
    dataElementId,
    onCancel,
}) {
    const form = useForm()
    const { submitting, errors } = form.getState()

    const minField = useField('min', {
        initialValue: limits.min,
        parse: (value) => (value === '' ? '' : parseInt(value, 10)),
        format: (value) => (value ? value.toString() : ''),
    })

    const maxField = useField('max', {
        initialValue: limits.max,
        parse: (value) => (value === '' ? '' : parseInt(value, 10)),
        format: (value) => (value ? value.toString() : ''),
    })

    const average = calculateAverage(minField.input.value, maxField.input.value)

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.submit()
            }}
        >
            <div className={styles.limits}>
                <LimitsAverageValueInfo avg={average} />

                <LimitsInput
                    {...minField.input}
                    label={limitInputLabelsByName.min}
                    error={!!minField.meta.error}
                />

                <div className={styles.spaceBetween}></div>

                <LimitsInput
                    {...maxField.input}
                    label={limitInputLabelsByName.max}
                    error={!!maxField.meta.error}
                />
            </div>

            <LimitsValidationErrorMessage errors={errors} />

            <ButtonStrip>
                <Button small primary type="submit" loading={submitting}>
                    {submitting ? i18n.t('Saving...') : i18n.t('Save limits')}
                </Button>

                <Button
                    small
                    secondary
                    disabled={submitting}
                    onClick={onCancel}
                >
                    {i18n.t('Cancel')}
                </Button>

                <LimitsDeleteButton
                    dataElementId={dataElementId}
                    categoryOptionComboId={categoryOptionComboId}
                    disabled={
                        typeof limits.min === 'undefined' &&
                        typeof limits.max === 'undefined'
                    }
                />
            </ButtonStrip>
        </form>
    )
}

UpdateLimits.propTypes = {
    categoryOptionComboId: PropTypes.string.isRequired,
    dataElementId: PropTypes.string.isRequired,
    limits: PropTypes.shape({
        avg: PropTypes.number,
        max: PropTypes.number,
        min: PropTypes.number,
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
}

// In order to be able to use `useForm` and `useField`,
// the `UpdateLimits` component needs to be a child of a component
// that wraps it with react final form's Form component
export default function UpdateLimitsWrapper({
    limits,
    categoryOptionComboId,
    dataElementId,
    valueType,
    onDone,
    onCancel,
}) {
    return (
        <LimitsFormWrapper
            categoryOptionComboId={categoryOptionComboId}
            dataElementId={dataElementId}
            valueType={valueType}
            onDone={onDone}
        >
            <UpdateLimits
                limits={limits}
                categoryOptionComboId={categoryOptionComboId}
                dataElementId={dataElementId}
                onCancel={onCancel}
            />
        </LimitsFormWrapper>
    )
}

UpdateLimitsWrapper.propTypes = {
    categoryOptionComboId: PropTypes.string.isRequired,
    dataElementId: PropTypes.string.isRequired,
    limits: PropTypes.shape({
        avg: PropTypes.number,
        max: PropTypes.number,
        min: PropTypes.number,
    }).isRequired,
    valueType: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
}
