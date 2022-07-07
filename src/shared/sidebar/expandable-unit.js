import i18n from '@dhis2/d2-i18n'
import { IconChevronUp24, IconChevronDown24, colors } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './expandable-unit.module.css'

const ExpandableUnit = ({ title, children, disabled, open, onToggle }) => {
    const chevronColor = disabled ? colors.grey400 : colors.grey700
    const handleClick = (event) => {
        event.preventDefault()

        if (disabled) {
            return
        }

        onToggle(!open)
    }

    const Icon = open ? IconChevronUp24 : IconChevronDown24

    return (
        <details
            open={disabled ? false : open}
            className={cx(styles.toggleableUnit, {
                [styles.disabled]: disabled,
                [styles.open]: open,
            })}
        >
            <summary
                tabIndex={disabled ? '-1' : undefined}
                className={styles.title}
                onClick={handleClick}
            >
                {disabled ? i18n.t('{{title}} (disabled)', { title }) : title}
                <Icon color={chevronColor} />
            </summary>
            <div className={styles.content}>{open ? children : null}</div>
        </details>
    )
}

ExpandableUnit.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    onToggle: PropTypes.func.isRequired,
    children: PropTypes.node,
    disabled: PropTypes.bool,
}

ExpandableUnit.defaultProps = {
    initiallyOpen: false,
}

export default ExpandableUnit
