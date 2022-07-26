/* eslint-disable react/prop-types */
import { CustomDataProvider, Provider } from '@dhis2/app-runtime'
import { render as renderOrig } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { OuterComponents } from '../app/app-wrapper.js'
import { useTestQueryClient } from './use-test-query-client.js'

export function TestWrapper({
    wrapper: WrapperFromOptions,
    router = MemoryRouter,
    queryClient,
    children,
}) {
    const defaultTestQueryClient = useTestQueryClient()

    const content = (
        <OuterComponents
            queryClient={queryClient ?? defaultTestQueryClient}
            router={router}
        >
            {children}
        </OuterComponents>
    )

    if (!WrapperFromOptions) {
        return content
    }

    return <WrapperFromOptions>{content}</WrapperFromOptions>
}

export function render(ui, options = {}) {
    const { dataForCustomProvider, ...restOptions } = options
    return renderOrig(ui, {
        ...options,
        wrapper: ({ children }) => (
            <Provider baseUrl="http://dhis2-tests.org" apiVersion="39">
                <CustomDataProvider data={dataForCustomProvider}>
                    <TestWrapper {...restOptions}>{children}</TestWrapper>
                </CustomDataProvider>
            </Provider>
        ),
    })
}
