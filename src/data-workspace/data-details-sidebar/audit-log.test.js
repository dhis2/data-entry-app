import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { render } from '../../test-utils/index.js'
import AuditLog from './audit-log.js'
import useDataValueContext from './use-data-value-context.js'

jest.mock('./use-data-value-context.js', () => ({
    __esModule: true,
    default: jest.fn(),
}))

describe('<AuditLog />', () => {
    afterEach(() => {
        useDataValueContext.mockClear()
    })

    it('is collapsed by default', () => {
        useDataValueContext.mockImplementation(() => ({}))
        const { getByRole } = render(<AuditLog />)
        expect(getByRole('group')).not.toHaveAttribute('open')
    })

    it('renders a loading spinner whilst loading the item auditLog', async () => {
        useDataValueContext.mockImplementation(() => ({
            isLoading: true,
        }))

        const { getByRole, container } = render(<AuditLog />)

        // Expand
        userEvent.click(container.querySelector('summary'))
        await waitFor(() => {
            expect(getByRole('group')).toHaveAttribute('open')
        })

        expect(getByRole('progressbar')).toBeInTheDocument()
    })

    it('renders a placeholder if there are no audit log', async () => {
        useDataValueContext.mockImplementation(() => ({
            isLoading: false,
            data: { audits: [] },
        }))

        const { getByRole, queryByRole, getByText, container } = render(
            <AuditLog audits={[]} />
        )

        // Expand and wait for data to load
        userEvent.click(container.querySelector('summary'))
        await waitFor(() => {
            expect(getByRole('group')).toHaveAttribute('open')
            expect(queryByRole('progressbar')).not.toBeInTheDocument()
        })

        expect(
            getByText('No audit log for this data item.')
        ).toBeInTheDocument()
    })

    // @TODO: Enable and fix when working on:
    // https://dhis2.atlassian.net/browse/TECH-1281
    it.skip('renders the item audit log once loaded', async () => {
        const audits = [
            {
                auditType: 'UPDATE',
                created: new Date('2021-01-01').toISOString(),
                modifiedBy: 'Firstname Lastname',
                prevValue: '19',
                value: '21',
            },
            {
                auditType: 'UPDATE',
                created: new Date('2021-02-01').toISOString(),
                modifiedBy: 'Firstname2 Lastname2',
                value: '21',
            },
            {
                auditType: 'DELETE',
                created: new Date('2021-03-01').toISOString(),
                modifiedBy: 'Firstname3 Lastname3',
                value: '',
            },
        ]

        const data = { audits }
        useDataValueContext.mockImplementation(() => ({ isLoading: false, data }))

        const { getByRole, getAllByRole, queryByRole, getByText, container } =
            render(<AuditLog />)

        // Expand and wait for data to load
        userEvent.click(container.querySelector('summary'))
        await waitFor(() => {
            expect(getByRole('group')).toHaveAttribute('open')
            expect(queryByRole('progressbar')).not.toBeInTheDocument()
        })

        expect(getByRole('list')).toBeInTheDocument()
        expect(getAllByRole('listitem')).toHaveLength(audits.length)

        const firstChangeEl = getByText('Firstname Lastname set to 19', {
            selector: '.entry:nth-child(3):last-child .entryMessage',
        })
        expect(firstChangeEl).toBeInTheDocument()

        const secondChangeEl = getByText(
            'Firstname2 Lastname2 updated to 21 (was 19)',
            { selector: '.entry:nth-child(2) .entryMessage' }
        )
        expect(secondChangeEl).toBeInTheDocument()

        const thirdChangeEl = getByText(
            'Firstname3 Lastname3 deleted (was 21)',
            { selector: '.entry:nth-child(1) .entryMessage' }
        )
        expect(thirdChangeEl).toBeInTheDocument()
    })
})
