import { CssReset, CssVariables } from '@dhis2/ui'
import React from 'react'
import { QueryClientProvider } from 'react-query'
import { HashRouter as Router, Route } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import PrintAreaProvider from '../data-workspace/print-area/print-area-provider.js'
import { RightHandPanelProvider } from '../right-hand-panel/index.js'
import { HighlightedFieldIdsProvider } from '../shared/index.js'
import App from './app.js'
import useQueryClient from './query-client/use-query-client.js'

const AppWrapper = () => {
    const queryClient = useQueryClient()

    return (
        <>
            <CssReset />
            <CssVariables colors spacers theme />
            <QueryClientProvider client={queryClient}>
                <Router>
                    <QueryParamProvider ReactRouterRoute={Route}>
                        <HighlightedFieldIdsProvider>
                            <RightHandPanelProvider>
                                <PrintAreaProvider>
                                    <App />
                                </PrintAreaProvider>
                            </RightHandPanelProvider>
                        </HighlightedFieldIdsProvider>
                    </QueryParamProvider>
                </Router>
            </QueryClientProvider>
        </>
    )
}

export default AppWrapper
