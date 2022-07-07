import PropTypes from 'prop-types'
import React from 'react'
import { useRightHandPanelContext } from '../../right-hand-panel/index.js'
import { useSetCurrentItemContext } from '../../shared/index.js'
import { focusNext, focusPrev } from '../focus-utils/index.js'
import {
    GenericInput,
    BooleanRadios,
    FileResourceInput,
    LongText,
    OptionSet,
    TrueOnlyCheckbox,
} from '../inputs/index.js'
import { useDataValueSet } from '../use-data-value-set.js'
import { useDataValueParams } from './use-data-value-params.js'
import { VALUE_TYPES } from './value-types.js'

function canItemHaveLimits(de) {
    if (de.optionSetValue) {
        return false
    }

    return [
        VALUE_TYPES.INTEGER,
        VALUE_TYPES.INTEGER_NEGATIVE,
        VALUE_TYPES.INTEGER_POSITIVE,
        VALUE_TYPES.INTEGER_ZERO_OR_POSITIVE,
        VALUE_TYPES.UNIT_INTERVAL,
        VALUE_TYPES.NUMBER,
        VALUE_TYPES.PERCENTAGE,
    ].includes(de.valueType)
}

function createCurrentItem({ de, coc, dataValueSet }) {
    const dataValue = dataValueSet?.data.dataValues[de.id]?.[coc.id]
    const canHaveLimits = canItemHaveLimits(de)

    if (dataValue) {
        const limits = !canHaveLimits ? {} : {
            min: dataValue.min,
            max: dataValue.min,
        }

        return {
            ...dataValue,
            categoryOptionCombo: coc.id,
            name: de.displayName,
            code: de.code,
            canHaveLimits,
            valueType: de.valueType,
            limits,
        }
    }

    return {
        categoryOptionCombo: coc.id,
        dataElement: de.id,
        name: de.displayName,
        lastUpdated: '',
        followup: false,
        comment: null,
        storedBy: null,
        code: null,
        canHaveLimits,
        valueType: de.valueType,
        limits: { min: undefined, max: undefined },
    }
}

function InputComponent({ sharedProps, de }) {
    // If this is an option set, return OptionSet component
    if (de.optionSet) {
        return <OptionSet {...sharedProps} optionSetId={de.optionSet.id} />
    }

    // Otherwise, check for the valueType
    switch (de.valueType) {
        case VALUE_TYPES.BOOLEAN: {
            return <BooleanRadios {...sharedProps} />
        }
        case VALUE_TYPES.FILE_RESOURCE: {
            return <FileResourceInput {...sharedProps} />
        }
        case VALUE_TYPES.IMAGE: {
            return <FileResourceInput {...sharedProps} image />
        }
        case VALUE_TYPES.LONG_TEXT: {
            return <LongText {...sharedProps} />
        }
        case VALUE_TYPES.TRUE_ONLY: {
            return <TrueOnlyCheckbox {...sharedProps} />
        }
        default: {
            return <GenericInput {...sharedProps} valueType={de.valueType} />
        }
    }
}

InputComponent.propTypes = {
    de: PropTypes.shape({
        optionSet: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        optionSetValue: PropTypes.any,
        valueType: PropTypes.string,
    }).isRequired,
    sharedProps: PropTypes.object.isRequired,
}

export function EntryFieldInput({
    fieldname,
    dataElement: de,
    categoryOptionCombo: coc,
    setSyncStatus,
    disabled,
}) {
    const setCurrentItem = useSetCurrentItemContext()
    const rightHandPanel = useRightHandPanelContext()
    const { id: deId } = de
    const { id: cocId } = coc
    const dataValueParams = useDataValueParams({ deId, cocId })
    const dataValueSet = useDataValueSet()
    const currentItem = createCurrentItem({
        fieldname,
        de,
        coc,
        dataValueSet,
    })

    const onKeyDown = (event) => {
        const { key, ctrlKey, metaKey } = event
        const ctrlOrMetaKey = ctrlKey ^ metaKey

        if (ctrlOrMetaKey && key === 'Enter') {
            rightHandPanel.show('data-details')
        } else if (key === 'ArrowDown' || key === 'Enter') {
            event.preventDefault()
            focusNext()
        } else if (key === 'ArrowUp') {
            event.preventDefault()
            focusPrev()
        }
    }

    const onFocus = () => {
        setCurrentItem(currentItem)
    }

    const sharedProps = {
        fieldname,
        dataValueParams,
        disabled,
        setSyncStatus,
        onFocus,
        onKeyDown,
    }

    return <InputComponent sharedProps={sharedProps} de={de} />
}

EntryFieldInput.propTypes = {
    categoryOptionCombo: PropTypes.shape({
        id: PropTypes.string,
    }),
    dataElement: PropTypes.shape({
        id: PropTypes.string,
        optionSet: PropTypes.shape({
            id: PropTypes.string,
        }),
        optionSetValue: PropTypes.bool,
        valueType: PropTypes.string,
    }),
    disabled: PropTypes.bool,
    fieldname: PropTypes.string,
    setSyncStatus: PropTypes.func,
}
