import {
    fireEvent,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '../../test-utils/render.js'
import ValidationResultsSidebar from './validation-results-sidebar.js'

describe('ValidationResultsSidebar', () => {
    const waitForLoaderToDisappear = async () => {
        await waitForElementToBeRemoved(() =>
            screen.queryByText('Running validation...')
        )
    }
    const renderComponent = (overrideDefaultData = {}) => {
        const dataForCustomProvider = {
            validationRules: () => {
                return validationMetadataMockResponse
            },
            'validation/dataSet/BfMAe6Itzgt': () => {
                return validationResultMockResponse
            },
            ...overrideDefaultData,
        }

        return render(<ValidationResultsSidebar />, {
            router: ({ children }) => (
                <MemoryRouter
                    initialEntries={[
                        '?dataSetId=BfMAe6Itzgt&orgUnitId=DiszpKrYNg8&periodId=202202',
                    ]}
                >
                    {children}
                </MemoryRouter>
            ),
            dataForCustomProvider,
        })
    }

    it('should render summary boxes with results', async () => {
        const { getByTestId } = renderComponent()

        await waitForLoaderToDisappear()

        expect(getByTestId('count-HIGH').textContent).toEqual('High1')
        expect(getByTestId('count-MEDIUM').textContent).toEqual('Medium2')
        expect(getByTestId('count-LOW').textContent).toEqual('Low0')
    })

    it('should render a unit for each priority group that has validation violations', async () => {
        const { findByText, queryByText } = renderComponent()

        await waitForLoaderToDisappear()

        expect(await findByText('2 medium priority alerts')).toBeDefined()
        expect(await findByText('1 high priority alert')).toBeDefined()
        expect(queryByText('low priority alert')).toBeNull()
    })

    it('should render the validation failures under each group', async () => {
        const { findByTestId } = renderComponent()

        await waitForLoaderToDisappear()

        const highPriorityGroup = await findByTestId('priority-group-HIGH')
        const mediumPriorityGroup = await findByTestId('priority-group-MEDIUM')
        expect(highPriorityGroup.textContent).toContain(
            'Slept under LLIN at measles (fixed < 1y) cannot be higher than measles doses given (fixed < 1y)'
        )
        expect(mediumPriorityGroup.textContent).toContain(
            'PCV 2 cannot be higher than PCV 1 doses given'
        )
        expect(mediumPriorityGroup.textContent).toContain(
            'Exclusive breastfeeding at time of penta 3 (outreach < 1y) cannot be higher than penta 3 doses given (outreach < 1y)'
        )
    })

    it('should render the validation failures the title and formula for each failure', async () => {
        const { findByTestId } = renderComponent()

        await waitForLoaderToDisappear()

        const highPriorityGroup = await findByTestId('priority-group-HIGH')
        const expectedValidationRule =
            '1 high priority alertSlept under LLIN at measles (fixed < 1y) cannot be higher than measles doses given (fixed < 1y)'
        const expectedFormula =
            'At Measles, slept under LLITN last night, <1 year Fixed (10) <= Measles, <1 year Fixed[34.292] (2)'

        expect(highPriorityGroup.textContent).toContain(expectedValidationRule)
        expect(highPriorityGroup.textContent).toContain(expectedFormula)
    })

    it('should display an error when validation fails', async () => {
        const overrideOptions = {
            validationRules: () => {
                return Promise.reject('some server-side error')
            },
        }
        const { getByText } = renderComponent(overrideOptions)

        await waitForLoaderToDisappear()
        expect(
            getByText('There was a problem running validation')
        ).toBeDefined()
        expect(
            getByText(
                'Validation could not be run for this data. Try again or contact your system administrator.'
            )
        ).toBeDefined()
    })
    it('should allow re-running validation', async () => {
        let count = 1
        const overrideOptions = {
            validationRules: () => {
                return new Promise((resolve, reject) => {
                    if (count++ === 1) {
                        return reject(
                            'server-side error the first time then it will pass on re-run'
                        )
                    } else {
                        return resolve(validationMetadataMockResponse)
                    }
                })
            },
        }
        const { queryByText, getByText, findByText } =
            renderComponent(overrideOptions)

        await waitForLoaderToDisappear()
        expect(
            getByText('There was a problem running validation')
        ).toBeDefined()

        fireEvent.click(getByText('Run validation again'))

        await findByText('Running validation...')
        expect(queryByText('There was a problem running validation')).toBeNull()
        expect(getByText('2 medium priority alerts')).toBeDefined()
    })
    it('should show empty data', async () => {
        const overrideOptions = {
            'validation/dataSet/BfMAe6Itzgt': () => {
                return {
                    validationRuleViolations: [],
                    commentRequiredViolations: [],
                }
            },
        }
        const { getByText } = renderComponent(overrideOptions)

        await waitForLoaderToDisappear()
        expect(getByText('No validation alerts for this data.')).toBeDefined()
    })
})

const validationMetadataMockResponse = {
    pager: {
        page: 1,
        total: 37,
        pageSize: 50,
        pageCount: 1,
    },
    validationRules: [
        {
            importance: 'HIGH',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{GCGfEY82Wz6.Prlt0C1RF0s}',
                description:
                    'At Measles, slept under LLITN last night, <1 year Fixed',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription:
                    'At Measles, slept under LLITN last night, <1 year Fixed',
            },
            rightSide: {
                translations: [],
                expression: '#{YtbsuPPo010.Prlt0C1RF0s}',
                description: 'Measles, <1 year Fixed[34.292]',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'Measles, <1 year Fixed[34.292]',
            },
            displayInstruction:
                'Slept under LLIN at measles (fixed < 1y) cannot be higher than measles doses given (fixed < 1y)',
            displayDescription: 'Question asked at Measles',
            displayName: 'Measles, Slept under LLITN last night, <1 year Fixed',
            id: 'sxamEpoUXb5',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{mGN1az8Xub6}',
                description: 'PCV 2',
                slidingWindow: false,
                missingValueStrategy: 'NEVER_SKIP',
                displayDescription: 'PCV 2',
            },
            rightSide: {
                translations: [],
                expression: '#{xc8gmAKfO95}',
                description: 'PCV 1',
                slidingWindow: false,
                missingValueStrategy: 'NEVER_SKIP',
                displayDescription: 'PCV 1',
            },
            displayInstruction: 'PCV 2 cannot be higher than PCV 1 doses given',
            displayDescription:
                'PCV 2 must be equal or lower than PCV 1 doses given',
            displayName: 'PCV 2 <= PCV 1',
            id: 'P2igXCbites',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{L2kxa2IA2cs}',
                description: 'PCV 3',
                slidingWindow: false,
                missingValueStrategy: 'NEVER_SKIP',
                displayDescription: 'PCV 3',
            },
            rightSide: {
                translations: [],
                expression: '#{mGN1az8Xub6}',
                description: 'PCV 2',
                slidingWindow: false,
                missingValueStrategy: 'NEVER_SKIP',
                displayDescription: 'PCV 2',
            },
            displayInstruction: 'PCV 3 cannot be higher than PCV 2 doses given',
            displayDescription:
                'PCV 3 must be equal or lower than PCV 2 doses given',
            displayName: 'PCV 3 <= PCV 2',
            id: 'aSo0d3XGZgY',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{pEOVd4Z3TAS.Prlt0C1RF0s}',
                description:
                    'People asked at Penta3 if Exclusive breastfeeding, <1 year Fixed',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription:
                    'People asked at Penta3 if Exclusive breastfeeding, <1 year Fixed',
            },
            rightSide: {
                translations: [],
                expression: '#{n6aMJNLdvep.Prlt0C1RF0s}',
                description: 'Penta3, <1 year Fixed[25.292]',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'Penta3, <1 year Fixed[25.292]',
            },
            displayInstruction:
                'Exclusive breastfeeding at time of penta 3 (fixed < 1y) cannot be higher than penta 3 doses given (fixed < 1y)',
            displayDescription: 'Question asked at Penta3 vs number of Penta3',
            displayName: 'Penta3, Exclusive breastfeeding, <1 year Fixed',
            id: 'B3cosSOA63b',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{pEOVd4Z3TAS.V6L425pT3A0}',
                description:
                    'People asked at Penta3 if Exclusive breastfeeding, <1 year Outreach',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription:
                    'People asked at Penta3 if Exclusive breastfeeding, <1 year Outreach',
            },
            rightSide: {
                translations: [],
                expression: '#{n6aMJNLdvep.V6L425pT3A0}',
                description: 'Penta3, <1 year Outreach[25.290]',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'Penta3, <1 year Outreach[25.290]',
            },
            displayInstruction:
                'Exclusive breastfeeding at time of penta 3 (outreach < 1y) cannot be higher than penta 3 doses given (outreach < 1y)',
            displayDescription: 'Question asked at Penta3 vs number of Penta3',
            displayName: 'Penta3, Exclusive breastfeeding, <1 year Outreach',
            id: 'O7I6pSSF79K',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{dU0GquGkGQr.Prlt0C1RF0s}',
                description: 'Question asked at BCG, < 12 m Fixed',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'Question asked at BCG, < 12 m Fixed',
            },
            rightSide: {
                translations: [],
                expression: '#{s46m5MS0hxu.Prlt0C1RF0s}',
                description: 'BCG doses given < 12 m Fixed',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'BCG doses given < 12 m Fixed',
            },
            displayInstruction:
                'Early breastfeeding at BCG (fixed) cannot be higher than BCG doses given (fixed)',
            displayDescription:
                'Early breastfeeding at BCG (fixed) cannot be higher than BCG doses given (fixed)',
            displayName: 'BCG, Early breastfeeding, <1 year Fixed',
            id: 'wVUSW5c5Pkp',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{GCGfEY82Wz6.psbwp3CQEhs}',
                description:
                    'At Measles, Slept under LLITN last night, >=1 year Fixed',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription:
                    'At Measles, Slept under LLITN last night, >=1 year Fixed',
            },
            rightSide: {
                translations: [],
                expression: '#{YtbsuPPo010.psbwp3CQEhs}',
                description: 'Measles, >=1 year Fixed[34.291]',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'Measles, >=1 year Fixed[34.291]',
            },
            displayInstruction:
                'Slept under LLIN at measles (fixed > 1y) cannot be higher than measles doses given (fixed > 1y)',
            displayDescription: 'Question asked at Measles',
            displayName:
                'Measles, Slept under LLITN last night, >=1 year Fixed',
            id: 'sWlF63K4G6c',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{pEOVd4Z3TAS.hEFKSsPV5et}',
                description:
                    'People asked at Penta3 if Exclusive breastfeeding, >=1 year Outreach',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription:
                    'People asked at Penta3 if Exclusive breastfeeding, >=1 year Outreach',
            },
            rightSide: {
                translations: [],
                expression: '#{n6aMJNLdvep.hEFKSsPV5et}',
                description: 'Penta3, >=1 year Outreach[25.289]',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'Penta3, >=1 year Outreach[25.289]',
            },
            displayInstruction:
                'Exclusive breastfeeding at time of penta 3 (outreach > 1y) cannot be higher than penta 3 doses given (outreach > 1y)',
            displayDescription: 'Question asked at Penta3 vs number of Penta3',
            displayName: 'Penta3, Exclusive breastfeeding, >=1 year Outreach',
            id: 'rdZFSe8Ay0r',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{GCGfEY82Wz6.hEFKSsPV5et}',
                description:
                    'At Measles, Slept under LLITN last night, >=1 year Outreach',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription:
                    'At Measles, Slept under LLITN last night, >=1 year Outreach',
            },
            rightSide: {
                translations: [],
                expression: '#{YtbsuPPo010.hEFKSsPV5et}',
                description: 'Measles, >=1 year Outreach[34.289]',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'Measles, >=1 year Outreach[34.289]',
            },
            displayInstruction:
                'Slept under LLIN at measles (outreach > 1y) cannot be higher than measles doses given (outreach > 1y)',
            displayDescription: 'Question asked at Measles',
            displayName:
                'Measles, Slept under LLITN last night, >=1 year Outreach',
            id: 'ZRLOcDaREUF',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{pEOVd4Z3TAS.psbwp3CQEhs}',
                description:
                    'People asked at Penta3 if Exclusive breastfeeding, >=1 year Fixed',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription:
                    'People asked at Penta3 if Exclusive breastfeeding, >=1 year Fixed',
            },
            rightSide: {
                translations: [],
                expression: '#{n6aMJNLdvep.psbwp3CQEhs}',
                description: 'Penta3, >=1 year Fixed[25.291]',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'Penta3, >=1 year Fixed[25.291]',
            },
            displayInstruction:
                'Exclusive breastfeeding at time of penta 3 (fixed > 1y) cannot be higher than penta 3 doses given (fixed > 1y)',
            displayDescription: 'Question asked at Penta3 vs number of Penta3',
            displayName: 'Penta3, Exclusive breastfeeding, >=1 year Fixed',
            id: 'UGR3QXRZZGL',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{dU0GquGkGQr.V6L425pT3A0}',
                description:
                    'Asked at BCG if early breastfeeding, < 12 m Outreach',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription:
                    'Asked at BCG if early breastfeeding, < 12 m Outreach',
            },
            rightSide: {
                translations: [],
                expression: '#{s46m5MS0hxu.V6L425pT3A0}',
                description: 'BCG doses given < 12 Outreach',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'BCG doses given < 12 Outreach',
            },
            displayInstruction:
                'Early breastfeeding at BCG (outreach) cannot be higher than BCG doses given (outreach)',
            displayDescription:
                'Early breastfeeding at BCG (outreach) cannot be higher than BCG doses given (outreach)',
            displayName: 'BCG, Early breastfeeding, <1 year Outreach',
            id: 'Xk6lYPtiA1e',
        },
        {
            importance: 'MEDIUM',
            operator: 'less_than_or_equal_to',
            leftSide: {
                translations: [],
                expression: '#{GCGfEY82Wz6.V6L425pT3A0}',
                description:
                    'At Measles, Slept under LLITN last night, <1 year Outreach',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription:
                    'At Measles, Slept under LLITN last night, <1 year Outreach',
            },
            rightSide: {
                translations: [],
                expression: '#{YtbsuPPo010.V6L425pT3A0}',
                description: 'Measles, <1 year Outreach[34.290]',
                slidingWindow: false,
                missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                displayDescription: 'Measles, <1 year Outreach[34.290]',
            },
            displayInstruction:
                'Slept under LLIN at measles (outreach <1y) cannot be higher than measles doses given (outreach <1y)',
            displayDescription: 'Question asked at Measles',
            displayName:
                'Measles, Slept under LLITN last night, <1 year Outreach',
            id: 'AtsPA2YokRq',
        },
    ],
}

const validationResultMockResponse = {
    validationRuleViolations: [
        {
            id: 0,
            validationRule: {
                name: 'Measles, Slept under LLITN last night, <1 year Fixed',
                created: '2011-12-24T12:24:22.817',
                lastUpdated: '2014-03-04T01:43:47.165',
                translations: [],
                externalAccess: false,
                publicAccess: 'rw------',
                createdBy: {
                    id: 'GOLswS44mh8',
                    code: null,
                    name: 'Tom Wakiki',
                    displayName: 'Tom Wakiki',
                    username: 'system',
                },
                userGroupAccesses: [],
                userAccesses: [],
                favorites: [],
                sharing: {
                    owner: 'GOLswS44mh8',
                    external: false,
                    users: {},
                    userGroups: {},
                    public: 'rw------',
                },
                displayName:
                    'Measles, Slept under LLITN last night, <1 year Fixed',
                favorite: false,
                user: {
                    id: 'GOLswS44mh8',
                    code: null,
                    name: 'Tom Wakiki',
                    displayName: 'Tom Wakiki',
                    username: 'system',
                },
                id: 'sxamEpoUXb5',
                attributeValues: [],
            },
            period: {
                code: '202202',
                name: '202202',
                translations: [],
                externalAccess: false,
                userGroupAccesses: [],
                userAccesses: [],
                favorites: [],
                sharing: {
                    external: false,
                    users: {},
                    userGroups: {},
                },
                displayName: '202202',
                favorite: false,
                id: '202202',
                attributeValues: [],
            },
            organisationUnit: {
                code: 'OU_559',
                name: 'Ngelehun CHC',
                created: '2012-02-17T15:54:39.987',
                lastUpdated: '2022-03-04T10:34:36.220',
                translations: [
                    {
                        locale: 'en_GB',
                        property: 'SHORT_NAME',
                        value: 'Ngelehun CHC',
                    },
                    {
                        locale: 'en_GB',
                        property: 'NAME',
                        value: 'Ngelehun CHC',
                    },
                ],
                externalAccess: false,
                createdBy: {
                    id: 'GOLswS44mh8',
                    code: null,
                    name: 'Tom Wakiki',
                    displayName: 'Tom Wakiki',
                    username: 'system',
                },
                userGroupAccesses: [],
                userAccesses: [],
                favorites: [],
                lastUpdatedBy: {
                    id: 'xE7jOejl9FI',
                    code: null,
                    name: 'John Traore',
                    displayName: 'John Traore',
                    username: 'admin',
                },
                sharing: {
                    external: false,
                    users: {},
                    userGroups: {},
                },
                displayName: 'Ngelehun CHC',
                favorite: false,
                user: {
                    id: 'GOLswS44mh8',
                    code: null,
                    name: 'Tom Wakiki',
                    displayName: 'Tom Wakiki',
                    username: 'system',
                },
                id: 'DiszpKrYNg8',
                attributeValues: [
                    {
                        attribute: {
                            translations: [],
                            externalAccess: false,
                            userGroupAccesses: [],
                            userAccesses: [],
                            favorites: [],
                            sharing: {
                                external: false,
                                users: {},
                                userGroups: {},
                            },
                            mandatory: false,
                            unique: false,
                            dataElementAttribute: false,
                            dataElementGroupAttribute: false,
                            indicatorAttribute: false,
                            indicatorGroupAttribute: false,
                            dataSetAttribute: false,
                            organisationUnitAttribute: false,
                            organisationUnitGroupAttribute: false,
                            organisationUnitGroupSetAttribute: false,
                            userAttribute: false,
                            userGroupAttribute: false,
                            programAttribute: false,
                            programStageAttribute: false,
                            trackedEntityTypeAttribute: false,
                            trackedEntityAttributeAttribute: false,
                            categoryOptionAttribute: false,
                            categoryOptionGroupAttribute: false,
                            documentAttribute: false,
                            optionAttribute: false,
                            optionSetAttribute: false,
                            legendSetAttribute: false,
                            constantAttribute: false,
                            programIndicatorAttribute: false,
                            sqlViewAttribute: false,
                            categoryOptionComboAttribute: false,
                            sectionAttribute: false,
                            categoryOptionGroupSetAttribute: false,
                            dataElementGroupSetAttribute: false,
                            validationRuleAttribute: false,
                            validationRuleGroupAttribute: false,
                            categoryAttribute: false,
                            visualizationAttribute: false,
                            mapAttribute: false,
                            eventReportAttribute: false,
                            eventChartAttribute: false,
                            relationshipTypeAttribute: false,
                            favorite: false,
                            id: 'xqWyz9jNCA5',
                            attributeValues: [],
                        },
                        value: 'TZ01',
                    },
                    {
                        attribute: {
                            translations: [],
                            externalAccess: false,
                            userGroupAccesses: [],
                            userAccesses: [],
                            favorites: [],
                            sharing: {
                                external: false,
                                users: {},
                                userGroups: {},
                            },
                            mandatory: false,
                            unique: false,
                            dataElementAttribute: false,
                            dataElementGroupAttribute: false,
                            indicatorAttribute: false,
                            indicatorGroupAttribute: false,
                            dataSetAttribute: false,
                            organisationUnitAttribute: false,
                            organisationUnitGroupAttribute: false,
                            organisationUnitGroupSetAttribute: false,
                            userAttribute: false,
                            userGroupAttribute: false,
                            programAttribute: false,
                            programStageAttribute: false,
                            trackedEntityTypeAttribute: false,
                            trackedEntityAttributeAttribute: false,
                            categoryOptionAttribute: false,
                            categoryOptionGroupAttribute: false,
                            documentAttribute: false,
                            optionAttribute: false,
                            optionSetAttribute: false,
                            legendSetAttribute: false,
                            constantAttribute: false,
                            programIndicatorAttribute: false,
                            sqlViewAttribute: false,
                            categoryOptionComboAttribute: false,
                            sectionAttribute: false,
                            categoryOptionGroupSetAttribute: false,
                            dataElementGroupSetAttribute: false,
                            validationRuleAttribute: false,
                            validationRuleGroupAttribute: false,
                            categoryAttribute: false,
                            visualizationAttribute: false,
                            mapAttribute: false,
                            eventReportAttribute: false,
                            eventChartAttribute: false,
                            relationshipTypeAttribute: false,
                            favorite: false,
                            id: 'ihn1wb9eho8',
                            attributeValues: [],
                        },
                        value: '{"coordinates":[[[-11.4535,8.103299],[-11.4529,8.107199],[-11.4507,8.112599],[-11.45,8.1163],[-11.450199,8.120199],[-11.450899,8.122899],[-11.453199,8.1282],[-11.453399,8.132499],[-11.452399,8.1357],[-11.448199,8.142299],[-11.444199,8.1401],[-11.441999,8.14],[-11.439999,8.1409],[-11.4369,8.143399],[-11.434,8.144999],[-11.4298,8.145899],[-11.4273,8.146799],[-11.420599,8.1501],[-11.416599,8.1532],[-11.409599,8.1603],[-11.405599,8.163399],[-11.402599,8.164099],[-11.3982,8.163599],[-11.393799,8.161599],[-11.391299,8.160899],[-11.3859,8.1603],[-11.3833,8.1597],[-11.3779,8.1574],[-11.3736,8.156399],[-11.369499,8.152399],[-11.3657,8.1475],[-11.3638,8.1444],[-11.362299,8.140699],[-11.3589,8.1286],[-11.357399,8.121799],[-11.3525,8.1071],[-11.3509,8.1012],[-11.350499,8.096799],[-11.3504,8.091],[-11.3508,8.086799],[-11.351599,8.0819],[-11.355299,8.0796],[-11.3592,8.077899],[-11.3615,8.076399],[-11.3665,8.072399],[-11.373999,8.0686],[-11.3765,8.067799],[-11.3815,8.066599],[-11.385899,8.0644],[-11.3891,8.063099],[-11.393399,8.0607],[-11.3972,8.058899],[-11.399396,8.057203],[-11.404799,8.0523],[-11.407499,8.0501],[-11.411499,8.0482],[-11.414399,8.0461],[-11.416899,8.0434],[-11.4184,8.040599],[-11.4189,8.038399],[-11.419199,8.0331],[-11.42,8.0298],[-11.4236,8.024],[-11.4258,8.022799],[-11.4339,8.0207],[-11.438899,8.022199],[-11.441699,8.0235],[-11.4428,8.025299],[-11.446099,8.028099],[-11.447999,8.030699],[-11.448999,8.034399],[-11.449199,8.045399],[-11.449399,8.049399],[-11.4501,8.0522],[-11.4521,8.0567],[-11.4528,8.0595],[-11.453099,8.062499],[-11.453199,8.067699],[-11.4527,8.072699],[-11.4514,8.078599],[-11.452699,8.083599],[-11.453199,8.087399],[-11.453499,8.096399],[-11.4535,8.103299]]],"type":"Polygon"}',
                    },
                    {
                        attribute: {
                            translations: [],
                            externalAccess: false,
                            userGroupAccesses: [],
                            userAccesses: [],
                            favorites: [],
                            sharing: {
                                external: false,
                                users: {},
                                userGroups: {},
                            },
                            mandatory: false,
                            unique: false,
                            dataElementAttribute: false,
                            dataElementGroupAttribute: false,
                            indicatorAttribute: false,
                            indicatorGroupAttribute: false,
                            dataSetAttribute: false,
                            organisationUnitAttribute: false,
                            organisationUnitGroupAttribute: false,
                            organisationUnitGroupSetAttribute: false,
                            userAttribute: false,
                            userGroupAttribute: false,
                            programAttribute: false,
                            programStageAttribute: false,
                            trackedEntityTypeAttribute: false,
                            trackedEntityAttributeAttribute: false,
                            categoryOptionAttribute: false,
                            categoryOptionGroupAttribute: false,
                            documentAttribute: false,
                            optionAttribute: false,
                            optionSetAttribute: false,
                            legendSetAttribute: false,
                            constantAttribute: false,
                            programIndicatorAttribute: false,
                            sqlViewAttribute: false,
                            categoryOptionComboAttribute: false,
                            sectionAttribute: false,
                            categoryOptionGroupSetAttribute: false,
                            dataElementGroupSetAttribute: false,
                            validationRuleAttribute: false,
                            validationRuleGroupAttribute: false,
                            categoryAttribute: false,
                            visualizationAttribute: false,
                            mapAttribute: false,
                            eventReportAttribute: false,
                            eventChartAttribute: false,
                            relationshipTypeAttribute: false,
                            favorite: false,
                            id: 'l1VmqIHKk6t',
                            attributeValues: [],
                        },
                        value: 'KE01',
                    },
                ],
            },
            attributeOptionCombo: {
                code: 'default',
                name: 'default',
                created: '2011-12-24T12:24:25.319',
                lastUpdated: '2011-12-24T12:24:25.319',
                translations: [],
                externalAccess: false,
                userGroupAccesses: [],
                userAccesses: [],
                favorites: [],
                sharing: {
                    external: false,
                    users: {},
                    userGroups: {},
                },
                displayName: 'default',
                favorite: false,
                id: 'HllvX50cXC0',
                attributeValues: [],
            },
            leftsideValue: 10,
            rightsideValue: 2,
            dayInPeriod: 28,
            notificationSent: false,
        },
        {
            validationRule: {
                id: 'O7I6pSSF79K',
                name: 'Penta3, Exclusive breastfeeding, <1 year Outreach',
            },
        },
        {
            id: 0,
            validationRule: {
                name: 'PCV 2 <= PCV 1',
                created: '2014-07-16T12:56:42.441',
                lastUpdated: '2014-07-16T17:23:51.253',
                translations: [],
                externalAccess: false,
                publicAccess: 'rw------',
                createdBy: {
                    id: 'GOLswS44mh8',
                    code: null,
                    name: 'Tom Wakiki',
                    displayName: 'Tom Wakiki',
                    username: 'system',
                },
                userGroupAccesses: [],
                userAccesses: [],
                favorites: [],
                sharing: {
                    owner: 'GOLswS44mh8',
                    external: false,
                    users: {},
                    userGroups: {},
                    public: 'rw------',
                },
                displayName: 'PCV 2 <= PCV 1',
                favorite: false,
                user: {
                    id: 'GOLswS44mh8',
                    code: null,
                    name: 'Tom Wakiki',
                    displayName: 'Tom Wakiki',
                    username: 'system',
                },
                id: 'P2igXCbites',
                attributeValues: [],
            },
            period: {
                code: '202202',
                name: '202202',
                translations: [],
                externalAccess: false,
                userGroupAccesses: [],
                userAccesses: [],
                favorites: [],
                sharing: {
                    external: false,
                    users: {},
                    userGroups: {},
                },
                displayName: '202202',
                favorite: false,
                id: '202202',
                attributeValues: [],
            },
            organisationUnit: {
                code: 'OU_559',
                name: 'Ngelehun CHC',
                created: '2012-02-17T15:54:39.987',
                lastUpdated: '2022-03-04T10:34:36.220',
                translations: [
                    {
                        locale: 'en_GB',
                        property: 'SHORT_NAME',
                        value: 'Ngelehun CHC',
                    },
                    {
                        locale: 'en_GB',
                        property: 'NAME',
                        value: 'Ngelehun CHC',
                    },
                ],
                externalAccess: false,
                createdBy: {
                    id: 'GOLswS44mh8',
                    code: null,
                    name: 'Tom Wakiki',
                    displayName: 'Tom Wakiki',
                    username: 'system',
                },
                userGroupAccesses: [],
                userAccesses: [],
                favorites: [],
                lastUpdatedBy: {
                    id: 'xE7jOejl9FI',
                    code: null,
                    name: 'John Traore',
                    displayName: 'John Traore',
                    username: 'admin',
                },
                sharing: {
                    external: false,
                    users: {},
                    userGroups: {},
                },
                displayName: 'Ngelehun CHC',
                favorite: false,
                user: {
                    id: 'GOLswS44mh8',
                    code: null,
                    name: 'Tom Wakiki',
                    displayName: 'Tom Wakiki',
                    username: 'system',
                },
                id: 'DiszpKrYNg8',
                attributeValues: [
                    {
                        attribute: {
                            translations: [],
                            externalAccess: false,
                            userGroupAccesses: [],
                            userAccesses: [],
                            favorites: [],
                            sharing: {
                                external: false,
                                users: {},
                                userGroups: {},
                            },
                            mandatory: false,
                            unique: false,
                            dataElementAttribute: false,
                            dataElementGroupAttribute: false,
                            indicatorAttribute: false,
                            indicatorGroupAttribute: false,
                            dataSetAttribute: false,
                            organisationUnitAttribute: false,
                            organisationUnitGroupAttribute: false,
                            organisationUnitGroupSetAttribute: false,
                            userAttribute: false,
                            userGroupAttribute: false,
                            programAttribute: false,
                            programStageAttribute: false,
                            trackedEntityTypeAttribute: false,
                            trackedEntityAttributeAttribute: false,
                            categoryOptionAttribute: false,
                            categoryOptionGroupAttribute: false,
                            documentAttribute: false,
                            optionAttribute: false,
                            optionSetAttribute: false,
                            legendSetAttribute: false,
                            constantAttribute: false,
                            programIndicatorAttribute: false,
                            sqlViewAttribute: false,
                            categoryOptionComboAttribute: false,
                            sectionAttribute: false,
                            categoryOptionGroupSetAttribute: false,
                            dataElementGroupSetAttribute: false,
                            validationRuleAttribute: false,
                            validationRuleGroupAttribute: false,
                            categoryAttribute: false,
                            visualizationAttribute: false,
                            mapAttribute: false,
                            eventReportAttribute: false,
                            eventChartAttribute: false,
                            relationshipTypeAttribute: false,
                            favorite: false,
                            id: 'xqWyz9jNCA5',
                            attributeValues: [],
                        },
                        value: 'TZ01',
                    },
                    {
                        attribute: {
                            translations: [],
                            externalAccess: false,
                            userGroupAccesses: [],
                            userAccesses: [],
                            favorites: [],
                            sharing: {
                                external: false,
                                users: {},
                                userGroups: {},
                            },
                            mandatory: false,
                            unique: false,
                            dataElementAttribute: false,
                            dataElementGroupAttribute: false,
                            indicatorAttribute: false,
                            indicatorGroupAttribute: false,
                            dataSetAttribute: false,
                            organisationUnitAttribute: false,
                            organisationUnitGroupAttribute: false,
                            organisationUnitGroupSetAttribute: false,
                            userAttribute: false,
                            userGroupAttribute: false,
                            programAttribute: false,
                            programStageAttribute: false,
                            trackedEntityTypeAttribute: false,
                            trackedEntityAttributeAttribute: false,
                            categoryOptionAttribute: false,
                            categoryOptionGroupAttribute: false,
                            documentAttribute: false,
                            optionAttribute: false,
                            optionSetAttribute: false,
                            legendSetAttribute: false,
                            constantAttribute: false,
                            programIndicatorAttribute: false,
                            sqlViewAttribute: false,
                            categoryOptionComboAttribute: false,
                            sectionAttribute: false,
                            categoryOptionGroupSetAttribute: false,
                            dataElementGroupSetAttribute: false,
                            validationRuleAttribute: false,
                            validationRuleGroupAttribute: false,
                            categoryAttribute: false,
                            visualizationAttribute: false,
                            mapAttribute: false,
                            eventReportAttribute: false,
                            eventChartAttribute: false,
                            relationshipTypeAttribute: false,
                            favorite: false,
                            id: 'ihn1wb9eho8',
                            attributeValues: [],
                        },
                        value: '{"coordinates":[[[-11.4535,8.103299],[-11.4529,8.107199],[-11.4507,8.112599],[-11.45,8.1163],[-11.450199,8.120199],[-11.450899,8.122899],[-11.453199,8.1282],[-11.453399,8.132499],[-11.452399,8.1357],[-11.448199,8.142299],[-11.444199,8.1401],[-11.441999,8.14],[-11.439999,8.1409],[-11.4369,8.143399],[-11.434,8.144999],[-11.4298,8.145899],[-11.4273,8.146799],[-11.420599,8.1501],[-11.416599,8.1532],[-11.409599,8.1603],[-11.405599,8.163399],[-11.402599,8.164099],[-11.3982,8.163599],[-11.393799,8.161599],[-11.391299,8.160899],[-11.3859,8.1603],[-11.3833,8.1597],[-11.3779,8.1574],[-11.3736,8.156399],[-11.369499,8.152399],[-11.3657,8.1475],[-11.3638,8.1444],[-11.362299,8.140699],[-11.3589,8.1286],[-11.357399,8.121799],[-11.3525,8.1071],[-11.3509,8.1012],[-11.350499,8.096799],[-11.3504,8.091],[-11.3508,8.086799],[-11.351599,8.0819],[-11.355299,8.0796],[-11.3592,8.077899],[-11.3615,8.076399],[-11.3665,8.072399],[-11.373999,8.0686],[-11.3765,8.067799],[-11.3815,8.066599],[-11.385899,8.0644],[-11.3891,8.063099],[-11.393399,8.0607],[-11.3972,8.058899],[-11.399396,8.057203],[-11.404799,8.0523],[-11.407499,8.0501],[-11.411499,8.0482],[-11.414399,8.0461],[-11.416899,8.0434],[-11.4184,8.040599],[-11.4189,8.038399],[-11.419199,8.0331],[-11.42,8.0298],[-11.4236,8.024],[-11.4258,8.022799],[-11.4339,8.0207],[-11.438899,8.022199],[-11.441699,8.0235],[-11.4428,8.025299],[-11.446099,8.028099],[-11.447999,8.030699],[-11.448999,8.034399],[-11.449199,8.045399],[-11.449399,8.049399],[-11.4501,8.0522],[-11.4521,8.0567],[-11.4528,8.0595],[-11.453099,8.062499],[-11.453199,8.067699],[-11.4527,8.072699],[-11.4514,8.078599],[-11.452699,8.083599],[-11.453199,8.087399],[-11.453499,8.096399],[-11.4535,8.103299]]],"type":"Polygon"}',
                    },
                    {
                        attribute: {
                            translations: [],
                            externalAccess: false,
                            userGroupAccesses: [],
                            userAccesses: [],
                            favorites: [],
                            sharing: {
                                external: false,
                                users: {},
                                userGroups: {},
                            },
                            mandatory: false,
                            unique: false,
                            dataElementAttribute: false,
                            dataElementGroupAttribute: false,
                            indicatorAttribute: false,
                            indicatorGroupAttribute: false,
                            dataSetAttribute: false,
                            organisationUnitAttribute: false,
                            organisationUnitGroupAttribute: false,
                            organisationUnitGroupSetAttribute: false,
                            userAttribute: false,
                            userGroupAttribute: false,
                            programAttribute: false,
                            programStageAttribute: false,
                            trackedEntityTypeAttribute: false,
                            trackedEntityAttributeAttribute: false,
                            categoryOptionAttribute: false,
                            categoryOptionGroupAttribute: false,
                            documentAttribute: false,
                            optionAttribute: false,
                            optionSetAttribute: false,
                            legendSetAttribute: false,
                            constantAttribute: false,
                            programIndicatorAttribute: false,
                            sqlViewAttribute: false,
                            categoryOptionComboAttribute: false,
                            sectionAttribute: false,
                            categoryOptionGroupSetAttribute: false,
                            dataElementGroupSetAttribute: false,
                            validationRuleAttribute: false,
                            validationRuleGroupAttribute: false,
                            categoryAttribute: false,
                            visualizationAttribute: false,
                            mapAttribute: false,
                            eventReportAttribute: false,
                            eventChartAttribute: false,
                            relationshipTypeAttribute: false,
                            favorite: false,
                            id: 'l1VmqIHKk6t',
                            attributeValues: [],
                        },
                        value: 'KE01',
                    },
                ],
            },
            attributeOptionCombo: {
                code: 'default',
                name: 'default',
                created: '2011-12-24T12:24:25.319',
                lastUpdated: '2011-12-24T12:24:25.319',
                translations: [],
                externalAccess: false,
                userGroupAccesses: [],
                userAccesses: [],
                favorites: [],
                sharing: {
                    external: false,
                    users: {},
                    userGroups: {},
                },
                displayName: 'default',
                favorite: false,
                id: 'HllvX50cXC0',
                attributeValues: [],
            },
            leftsideValue: 123,
            rightsideValue: 48,
            dayInPeriod: 28,
            notificationSent: false,
        },
    ],
    commentRequiredViolations: [],
}
