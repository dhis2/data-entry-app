import { render } from '@testing-library/react'
import React from 'react'
import Title from './title.js'
import userEvent from '@testing-library/user-event'

describe('<Title />', () => {
    it('renders a close button', () => {
        const handleCloseSpy = jest.fn()
        const { getByRole } = render(
            <Title onClose={handleCloseSpy} />
        )

        expect(getByRole('button')).toBeInTheDocument()
        userEvent.click(getByRole('button'))
        expect(handleCloseSpy).toHaveBeenCalled()
    })
})
