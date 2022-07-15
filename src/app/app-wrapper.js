import { CssReset, CssVariables } from '@dhis2/ui'
import React from 'react'
import { ReactQueryDevtools } from 'react-query/dist/react-query-devtools.development'
import { HashRouter as Router, Route } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import PrintAreaProvider from '../data-workspace/print-area/print-area-provider.js'
import { RightHandPanelProvider } from '../right-hand-panel/index.js'
import { CurrentItemProvider } from '../shared/index.js'
import App from './app.js'
import { ConfiguredQueryClientProvider } from './query-client/configured-query-client-provider.js'

const AppWrapper = () => {
    return (
        <>
            <CssReset />
            <CssVariables colors spacers theme />
            <ConfiguredQueryClientProvider>
                <ReactQueryDevtools />
                <Router>
                    <QueryParamProvider ReactRouterRoute={Route}>
                        <CurrentItemProvider>
                            <RightHandPanelProvider>
                                <PrintAreaProvider>
                                    <App />
                                </PrintAreaProvider>
                            </RightHandPanelProvider>
                        </CurrentItemProvider>
                    </QueryParamProvider>
                </Router>
            </ConfiguredQueryClientProvider>
        </>
    )
}

export default AppWrapper
