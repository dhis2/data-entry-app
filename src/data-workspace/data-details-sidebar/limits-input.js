import { Box, Field, Input } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './limits-input.module.css'

// @TODO: Talk to @joe about this
// Not using the `InputField` component from @dhis2/ui
// because that one always shows the error.
// In this case we want to show the errors below the entire form,
// otherwise the text has very limited space
export default function LimitsInput({
    label,
    name,
    onChange,
    value,
    error,
}) {
    return (
        <Field label={label} name={name} className={styles.container}>
            <Box>
                <Input
                    dense
                    onChange={({ value }) => onChange(value)}
                    name={name}
                    value={value || ''}
                    error={error}
                />
            </Box>
        </Field>
    )
}

LimitsInput.propTypes = {
    error: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}
