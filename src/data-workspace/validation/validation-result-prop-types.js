import PropTypes from 'prop-types'

export const ValidationRuleViolationWithMetaDataPropTypes = PropTypes.shape({
    metaData: PropTypes.shape({
        displayDescription: PropTypes.string.isRequired,
        displayInstruction: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        importance: PropTypes.string.isRequired,
        leftSide: PropTypes.shape({
            displayDescription: PropTypes.string.isRequired,
        }).isRequired,
        operator: PropTypes.string.isRequired,
        rightSide: PropTypes.shape({
            displayDescription: PropTypes.string.isRequired,
        }).isRequired,
    }),
    validationRule: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }),
})

export const ImportanceLevelPropTypes = PropTypes.oneOf([
    'LOW',
    'MEDIUM',
    'HIGH',
])
