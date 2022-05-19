import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader, NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import {
    useContextSelection,
    useIsValidSelection,
} from '../context-selection/index.js'
import { useMetadata, selectors } from '../metadata/index.js'
import { RightHandPanelPortal } from '../right-hand-panel/index.js'
import { dataDetailsSidebarId } from './constants.js'
import { DataDetailsSidebar } from './data-details-sidebar/index.js'
import styles from './data-workspace.module.css'
import { EntryForm } from './entry-form.js'
import { FinalFormWrapper } from './final-form-wrapper.js'
import { KeyboardNavManager } from './keyboard-nav-manager.js'
import { useDataValueSet } from './use-data-value-set.js'

export const DataWorkspace = ({ selectionHasNoFormMessage }) => {
    const [{ dataSetId }] = useContextSelection()
    const { data } = useMetadata()
    const initialDataValuesFetch = useDataValueSet()
    const isValidSelection = useIsValidSelection()

    if (selectionHasNoFormMessage) {
        const title = i18n.t('The current selection does not have a form')
        return <NoticeBox title={title}>{selectionHasNoFormMessage}</NoticeBox>
    }

    if (!isValidSelection) {
        return null
    }

    if (initialDataValuesFetch.isLoading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    if (initialDataValuesFetch.error) {
        return 'Error!'
    }

    if (!data || !dataSetId) {
        return null
    }

    const dataSet = selectors.getDataSetById(data, dataSetId)
    if (!dataSet) {
        console.warn('Could not find dataSet with ID', dataSetId)
        return 'Error!'
    }

    return (
        <>
            <KeyboardNavManager>
                <FinalFormWrapper dataValueSet={initialDataValuesFetch.data}>
                    <div className={styles.wrapper}>
                        <EntryForm dataSet={dataSet} />
                    </div>
                </FinalFormWrapper>
            </KeyboardNavManager>

            <RightHandPanelPortal id={dataDetailsSidebarId}>
                <DataDetailsSidebar />
            </RightHandPanelPortal>
        </>
    )
}

DataWorkspace.propTypes = {
    selectionHasNoFormMessage: PropTypes.string,
}
