import { Menu, MenuItem } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import css from './menu-select.module.css'

export default function MenuSelect({ values, selected, dataTest, onChange }) {
    return (
        <div className={css.menuSelect} data-test={dataTest}>
            <Menu>
                {values.map(({ value, label }) => (
                    <MenuItem
                        key={value || label}
                        dataValue={value}
                        label={<span data-value={value}>{label}</span>}
                        active={selected === value}
                        onClick={() => onChange({ selected: value })}
                    />
                ))}
            </Menu>
        </div>
    )
}

MenuSelect.defaultProps = {
    dataTest: 'menu-select',
}

MenuSelect.propTypes = {
    values: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.string,
        })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    dataTest: PropTypes.string,
    selected: PropTypes.string,
}

