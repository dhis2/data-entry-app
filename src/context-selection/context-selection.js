import { SelectorBar } from '@dhis2/ui'
import React from 'react'
import { CategoryOptionComboSelectorBarItem } from './category-option-combo-selector-bar-item/index.js'
import { DataSetSelectorBarItem } from './data-set-selector-bar-item/index.js'
import { OrgUnitSetSelectorBarItem } from './org-unit-selector-bar-item/index.js'
import { PeriodSelectorBarItem } from './period-selector-bar-item/index.js'
import { SectionFilterSelectorBarItem } from './section-filter-selector-bar-item/index.js'
import { useContextSelection } from './use-context-selection.js'

export default function ContextSelector() {
    const [, setSelectionContext] = useContextSelection()

    const onClearSelectionClick = () => {
        setSelectionContext({
            dataSetId: '',
            orgUnitId: '',
            periodId: '',
            categoryOptionIds: [],
            sectionFilter: '',
        })
    }

    return (
        <SelectorBar onClearSelectionClick={onClearSelectionClick}>
            <DataSetSelectorBarItem />
            <OrgUnitSetSelectorBarItem />
            <PeriodSelectorBarItem />
            <CategoryOptionComboSelectorBarItem />
            <SectionFilterSelectorBarItem />
        </SelectorBar>
    )
}
