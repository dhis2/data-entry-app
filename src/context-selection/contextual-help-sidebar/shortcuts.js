import i18n from '@dhis2/d2-i18n'
import { Divider } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { ExpandableUnit } from '../../shared/index.js'
import styles from './shortcuts.module.css'

const Action = ({ label, shortcuts }) => (
    <div className={styles.helpItem}>
        <div>{label}</div>
        <div className={styles.shortcutKeys}>
            {shortcuts.map((shortcut, index) => (
                <span key={index} className={styles.shortcutKey}>
                    {shortcut}
                </span>
            ))}
        </div>
    </div>
)

Action.propTypes = {
    label: PropTypes.string.isRequired,
    shortcuts: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default function Shortcuts() {
    const [open, setOpen] = useState(true)

    return (
        <ExpandableUnit
            title={i18n.t('Shortcuts')}
            open={open}
            onToggle={setOpen}
        >
            <Action
                label={i18n.t('Show details')}
                shortcuts={[
                    i18n.t('Ctrl + Enter'),
                    i18n.t('Cmd + Enter'),
                    i18n.t('Double click'),
                ]}
            />

            <Divider />

            <Action
                label={i18n.t('Go to next cell')}
                shortcuts={[i18n.t('Tab'), '↓']}
            />

            <Divider />

            <Action
                label={i18n.t('Go to previous cell')}
                shortcuts={[i18n.t('Shift + Tab'), '↑']}
            />
        </ExpandableUnit>
    )
}
