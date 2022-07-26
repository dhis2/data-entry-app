import { useCallback } from 'react'
import { useIsMutating, useQueries } from 'react-query'
import {
    useDataSetId,
    useOrgUnitId,
    usePeriodId,
} from '../../context-selection/index.js'
import { useApiAttributeParams } from '../../shared/index.js'
import {
    getValidationMetaDataQueryKey,
    getValidationQueryKey,
} from '../query-key-factory.js'

/** Returns validation rule violations grouped by importance */
export const useValidationResult = () => {
    const [dataSetId] = useDataSetId()
    const [periodId] = usePeriodId()
    const [orgUnitId] = useOrgUnitId()
    const {
        attributeCombo: categoryComboId,
        attributeOptions: categoryOptionIds,
    } = useApiAttributeParams()

    const validationQueryKey = getValidationQueryKey({
        dataSetId,
        periodId,
        orgUnitId,
        categoryComboId,
        categoryOptionIds,
    })
    const validationMetaDataQueryKey = getValidationMetaDataQueryKey(dataSetId)

    const activeMutations = useIsMutating({ mutationKey: validationQueryKey })
    const enabled = activeMutations === 0

    const results = useQueries({
        queries: [
            { queryKey: validationQueryKey, enabled },
            { queryKey: validationMetaDataQueryKey, enabled },
        ],
    })

    const refetch = useCallback(() => {
        results.forEach((result) => result.refetch())
    }, [results])

    const [validationQuery, metaDataQuery] = results

    return {
        refetch,
        error: validationQuery.error || metaDataQuery.error,
        isLoading: validationQuery.isLoading || metaDataQuery.isLoading,
        isRefetching:
            validationQuery.isRefetching || metaDataQuery.isRefetching,
        data:
            validationQuery.data && metaDataQuery.data
                ? groupValidationRuleViolationsByImportance(
                      validationQuery.data,
                      metaDataQuery.data
                  )
                : undefined,
    }
}

const groupValidationRuleViolationsByImportance = (
    validationRuleViolations = {},
    validationRulesMetaData = {}
) => {
    const ruleViolationsWithMetadata =
        validationRuleViolations.validationRuleViolations?.map((violation) => ({
            ...violation,
            metaData: validationRulesMetaData.validationRules?.find(
                (metadataRule) =>
                    metadataRule.id === violation.validationRule.id
            ),
        }))

    return ruleViolationsWithMetadata?.reduce((grouped, item) => {
        const identifier = item.metaData.importance

        grouped[identifier] = grouped[identifier] ?? []
        grouped[identifier].push(item)

        return grouped
    }, {})
}
