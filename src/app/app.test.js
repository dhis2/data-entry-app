import React from 'react'
import { QueryClient } from 'react-query'
import { render } from '../test-utils/index.js'
import App from './app.js'

describe('<App />', () => {
    it('renders without crashing', () => {
        render(<App />, { queryClient: new QueryClient() })
    })
})
