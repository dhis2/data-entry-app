import PropTypes from 'prop-types'
import React from 'react'
import limitInputLabelsByName from './limits-input-labels-by-name.js'
import styles from './limits-validation-error-message.module.css'

export default function LimitsValidationErrorMessage({ errors }) {
    if (!errors.min && !errors.max) {
        return null
    }

    return (
        <div className={styles.container}>
            {Object.entries(errors).map(([name, errorMsg]) => (
                <span key={name} className={styles.error}>
                    <span className={styles.errorLabel}>
                        {limitInputLabelsByName[name]}
                    </span>

                    <span className={styles.errorMessage}>{errorMsg}</span>
                </span>
            ))}
        </div>
    )
}

LimitsValidationErrorMessage.propTypes = {
    errors: PropTypes.object,
}
