import { CircularLoader, CenteredContent } from '@dhis2/ui'
import { node } from 'prop-types'
import React from 'react'
import { useCustomFormsPrefetch } from '../custom-forms/index.js'
import { useMetadata, useOptionSetsPrefetch } from '../metadata/index.js'
import css from './load-app.module.css'

const LoadApp = ({ children }) => {
    useCustomFormsPrefetch()
    useOptionSetsPrefetch()
    const { isLoading, isError, data } = useMetadata()

    if (isLoading) {
        return (
            <CenteredContent className={css.center} position={'top'}>
                <CircularLoader />
            </CenteredContent>
        )
    }

    if (isError) {
        console.error(data)
        return 'Error!'
    }

    return children
}

LoadApp.propTypes = {
    children: node,
}

export default LoadApp
