import PropTypes from 'prop-types'
import React from 'react'
import useCustomForm from '../../custom-forms/use-custom-form.js'
import { useMetadata } from '../../metadata/use-metadata.js'
import styles from './custom-form.module.css'
import { parseHtmlToReact } from './parse-html-to-react.js'

export const CustomForm = ({ dataSet }) => {
    const { data: customForm } = useCustomForm({
        id: dataSet.dataEntryForm.id,
        version: dataSet.version,
    })
    const { data: metadata } = useMetadata()

    return customForm ? (
        <div className={styles.customForm}>
            {parseHtmlToReact(customForm.htmlCode, metadata)}
        </div>
    ) : null
}

CustomForm.propTypes = {
    dataSet: PropTypes.shape({
        dataEntryForm: PropTypes.shape({
            id: PropTypes.string,
        }),
        version: PropTypes.number,
    }),
}
