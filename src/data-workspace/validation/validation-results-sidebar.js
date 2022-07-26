import i18n from '@dhis2/d2-i18n'
import { Button, CircularLoader, NoticeBox } from '@dhis2/ui'
import React from 'react'
import { useRightHandPanelContext } from '../../right-hand-panel/index.js'
import { Sidebar, Title, SidebarProps } from '../../shared/index.js'
import { useValidationResult } from './use-validation-result.js'
import { validationLevels } from './validation-config.js'
import ValidationPriortyGroup from './validation-priority-group.js'
import styles from './validation-results-sidebar.module.css'
import ValidationSummaryBox from './validation-summary-box.js'

export default function ValidationResultsSidebar() {
    const rightHandPanel = useRightHandPanelContext()
    const { isLoading, isRefetching, error, data, refetch } =
        useValidationResult()
    const showLoader = isLoading || isRefetching

    const isEmpty =
        data &&
        Object.values(data).every(
            (ruleViolations) => ruleViolations.length === 0
        )

    return (
        <Sidebar>
            <Title onClose={rightHandPanel.hide}>{i18n.t('Validation')}</Title>

            <div className={styles.wrapper}>
                <div className={styles.buttons}>
                    <Button disabled={showLoader} small onClick={refetch}>
                        {i18n.t('Run validation again')}
                    </Button>
                    <Button small disabled>
                        {i18n.t('Export output')}
                    </Button>
                </div>
                <h1 className={styles.title}>{i18n.t('Alert summary')}</h1>
                <div className={styles.summaryBoxes}>
                    {validationLevels.map((level) => {
                        return (
                            <ValidationSummaryBox
                                key={level}
                                level={level}
                                count={data?.[level]?.length || 0}
                                hideCounts={Boolean(showLoader || error)}
                            />
                        )
                    })}
                </div>
                {!showLoader &&
                    validationLevels.map((level) => {
                        return (
                            <ValidationPriortyGroup
                                key={level}
                                level={level}
                                validationViolations={data?.[level]}
                            />
                        )
                    })}
                {!showLoader && isEmpty && (
                    <div className={styles.noAlerts}>
                        {i18n.t('No validation alerts for this data.')}
                    </div>
                )}
                {showLoader && (
                    <div className={styles.loading}>
                        <CircularLoader small />
                        <span className={styles.text}>
                            {i18n.t('Running validation...')}
                        </span>
                    </div>
                )}
                {!showLoader && error && (
                    <NoticeBox
                        error
                        title={i18n.t('There was a problem running validation')}
                    >
                        <p>
                            {i18n.t(
                                'Validation could not be run for this data. Try again or contact your system administrator.'
                            )}
                        </p>
                    </NoticeBox>
                )}
            </div>
        </Sidebar>
    )
}
ValidationResultsSidebar.propTypes = SidebarProps
