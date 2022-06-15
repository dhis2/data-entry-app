import i18n from '@dhis2/d2-i18n'
import {
    CircularLoader,
    Button,
    ButtonStrip,
    TextAreaFieldFF,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { useContextSelection } from '../../context-selection/index.js'
import { useSetDataValueCommentMutation } from '../use-data-value-mutation/index.js'
import styles from './comment.module.css'
import LoadingError from './loading-error.js'

export default function CommentUnit({ item }) {
    const [{ dataSetId: ds, periodId: pe, orgUnitId: ou }] = useContextSelection()
    const [editing, setEditing] = useState(false)
    const setDataValueComment = useSetDataValueCommentMutation(
        () => setEditing(false)
    )

    if (setDataValueComment.isLoading) {
        return <CircularLoader small />
    }

    if (setDataValueComment.isError) {
        return (
            <LoadingError
                title={i18n.t(
                    'There was a problem loading the comment for this data item'
                )}
            />
        )
    }

    if (editing) {
        const onSubmit = values => {
            const variables = {
                ds,
                ou,
                pe,
                co: item.categoryOptionCombo,
                de: item.dataElement,
                comment: values.comment,
            }
            return setDataValueComment.mutate(variables)
        }

        return (
            <Form onSubmit={onSubmit}>
                {({ handleSubmit, submitting }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            name="comment"
                            component={TextAreaFieldFF}
                            className={styles.textArea}
                            initialValue={item.comment}
                            dense
                            autoGrow
                        />

                        <ButtonStrip>
                            <Button
                                small
                                primary
                                type="submit"
                                loading={submitting}
                            >
                                {submitting
                                    ? i18n.t('Saving...')
                                    : i18n.t('Save comment')}
                            </Button>

                            <Button
                                small
                                secondary
                                disabled={submitting}
                                onClick={() => setEditing(false)}
                            >
                                {i18n.t('Cancel')}
                            </Button>
                        </ButtonStrip>
                    </form>
                )}
            </Form>
        )
    }

    return (
        <>
            <p className={item.comment ? styles.comment : styles.placeholder}>
                <pre
                    // Using <pre /> so text area line
                    // breaks are displayed correctly
                    className={styles.commentValue}
                >
                    {item.comment ? item.comment : i18n.t('No comment for this data item.')}
                </pre>
            </p>
            <Button small secondary onClick={() => setEditing(true)}>
                {item.comment ? i18n.t('Edit comment') : i18n.t('Add comment')}
            </Button>
        </>
    )
}

CommentUnit.propTypes = {
    item: PropTypes.shape({
        categoryOptionCombo: PropTypes.string.isRequired,
        dataElement: PropTypes.string.isRequired,
        comment: PropTypes.string,
    }).isRequired,
}
