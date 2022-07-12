import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader, NoticeBox } from '@dhis2/ui'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { MutationIndicator } from '../app/mutation-indicator/index.js'
import { BottomBar } from '../bottom-bar/index.js'
import {
    useContextSelection,
    useIsValidSelection,
} from '../context-selection/index.js'
import { useMetadata, selectors } from '../metadata/index.js'
import { useDataValueSet } from '../shared/index.js'
import styles from './data-workspace.module.css'
import { EntryForm } from './entry-form.js'
import { FinalFormWrapper } from './final-form-wrapper.js'

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

    const footerClasses = classNames(styles.footer, 'hide-for-print')

    return (
        <FinalFormWrapper
            dataValueSet={initialDataValuesFetch.data?.dataValues}
        >
            <div className={styles.wrapper}>
                <main id="data-workspace" className={styles.formWrapper}>
                    <div className={styles.formArea}>
                        <EntryForm dataSet={dataSet} />
                    </div>
                </main>

                <footer className={footerClasses}>
                    <div
                        // This div and its content will be removed
                        // once we can display this in the headerbar
                        className={styles.mutationIndicator}
                    >
                        <MutationIndicator />
                    </div>

                    <BottomBar />
                </footer>
            </div>
        </FinalFormWrapper>
    )
}

DataWorkspace.propTypes = {
    selectionHasNoFormMessage: PropTypes.string,
}
