import { SelectorBar } from '@dhis2/ui'
import React from 'react'
import { AttributeOptionComboSelectorBarItem } from '../attribute-option-combo-selector-bar-item/index.js'
import { DataSetSelectorBarItem } from '../data-set-selector-bar-item/index.js'
import { OptionsButton } from '../options-button/index.js'
import { OrgUnitSetSelectorBarItem } from '../org-unit-selector-bar-item/index.js'
import { PeriodSelectorBarItem } from '../period-selector-bar-item/index.js'
import { SectionFilterSelectorBarItem } from '../section-filter-selector-bar-item/index.js'
import { useClearEntireSelection } from '../use-context-selection/index.js'
import styles from './context-selection.module.css'
import useShouldHideClearButton from './use-should-hide-clear-button.js'

export default function ContextSelection() {
    const hideClearButton = useShouldHideClearButton()
    const clearEntireSelection = useClearEntireSelection()
    const onClearSelectionClick = hideClearButton
        ? undefined
        : clearEntireSelection

    return (
        <SelectorBar
            className={styles.selectorBar}
            onClearSelectionClick={onClearSelectionClick}
        >
            <div className={styles.selectorBarItems}>
                <DataSetSelectorBarItem />
                <OrgUnitSetSelectorBarItem />
                <PeriodSelectorBarItem />
                <AttributeOptionComboSelectorBarItem />
                <SectionFilterSelectorBarItem />
            </div>
            <div className={styles.optionsButton}>
                <OptionsButton />
            </div>
        </SelectorBar>
    )
}
