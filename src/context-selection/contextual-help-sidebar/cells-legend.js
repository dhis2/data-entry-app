import i18n from '@dhis2/d2-i18n'
import { Divider } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { ExpandableUnit } from '../../shared/index.js'
import Cell from './cell.js'
import styles from './cells-legend.module.css'

function CellsLegendSymbol({ name, state }) {
    return (
        <div className={styles.helpItem}>
            <div>{name}</div>
            <div>
                <Cell value="10" state={state} />
            </div>
        </div>
    )
}

CellsLegendSymbol.propTypes = {
    name: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
}

export default function CellsLegend() {
    const [open, setOpen] = useState(true)

    return (
        <ExpandableUnit
            title={i18n.t('Cell reference')}
            open={open}
            onToggle={setOpen}
        >
            <CellsLegendSymbol
                name={i18n.t('Saved and synced to server')}
                state="SYNCED"
            />
            <Divider />
            <CellsLegendSymbol
                name={i18n.t('Waiting to sync, saved locally')}
                state="LOADING"
            />
            <Divider />
            <CellsLegendSymbol
                name={i18n.t('Data item has a comment')}
                state="HAS_COMMENT"
            />
            <Divider />
            <CellsLegendSymbol
                name={i18n.t('Invalid value, not saved')}
                state="INVALID"
            />
            <Divider />
            <CellsLegendSymbol
                name={i18n.t('Locked, not editable')}
                state="LOCKED"
            />
        </ExpandableUnit>
    )
}
