import React from 'react'
import { ValidationRuleViolationWithMetaDataPropTypes } from './validation-result-prop-types.js'

const ValidationRuleExpression = ({ validationRule }) => {
    const {
        leftsideValue,
        rightsideValue,
        metaData: { leftSide, rightSide, operator } = {},
    } = validationRule

    // @ToDO: confirm the human readable equivalent for the operators
    const operatorDisplay = {
        equal_to: '==',
        not_equal_to: '!=',
        greater_than: '>',
        greater_than_or_equal_to: '>=',
        less_than: '<',
        less_than_or_equal_to: '<=',
        compulsory_pair: 'is compulsory with',
        exclusive_pair: 'is exclusive to',
    }
    return (
        <>
            {leftSide.displayDescription} ({leftsideValue}){' '}
            {operatorDisplay[operator] ?? operator}{' '}
            {rightSide.displayDescription} ({rightsideValue})
        </>
    )
}

ValidationRuleExpression.propTypes = {
    validationRule: ValidationRuleViolationWithMetaDataPropTypes,
}
export default ValidationRuleExpression
