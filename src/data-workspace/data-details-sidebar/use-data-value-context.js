import { useQuery } from 'react-query'
import {
    useOrgUnitId,
    usePeriodId,
    useIsValidSelection,
} from '../../context-selection/index.js'
import { useApiAttributeParams } from '../../shared/index.js'
import * as queryKeyFactory from '../query-key-factory.js'
import processAudits from './process-audits.js'

/**
 * @returns PropTypes.shape({
 *     data: PropTypes.shape({
 *         audits: PropTypes.arrayOf(
 *             PropTypes.shape({
 *                 auditType: PropTypes.oneOf(['UPDATE', 'DELETE']).isRequired,
 *                 created: PropTypes.string,
 *                 modifiedBy: PropTypes.string,
 *                 prevValue: PropTypes.string,
 *                 value: PropTypes.string,
 *             })
 *         ),
 *         history: PropTypes.arrayOf(
 *             PropTypes.shape({
 *                 attribute: PropTypes.shape({
 *                     combo: PropTypes.string.isRequired,
 *                     options: PropTypes.arrayOf(PropTypes.string).isRequired,
 *                 }).isRequired,
 *                 categoryOptionCombo: PropTypes.string.isRequired,
 *                 dataElement: PropTypes.string.isRequired,
 *                 followUp: PropTypes.bool.isRequired,
 *                 orgUnit: PropTypes.string.isRequired,
 *                 period: PropTypes.string.isRequired,
 *                 value: PropTypes.string.isRequired,
 *             })
 *         ),
 *     }),
 * })
 */
export default function useDataValueContext(item, enabled) {
    const [periodId] = usePeriodId()
    const [orgUnitId] = useOrgUnitId()
    const { attributeCombo, attributeOptions } = useApiAttributeParams()
    const isValidSelection = useIsValidSelection()

    const dataValueContextQueryKey = queryKeyFactory.dataValueContext.byParams({
        dataElementId: item.dataElement,
        periodId: periodId,
        orgUnitId: orgUnitId,
        categoryOptionIds: attributeOptions,
        categoryComboId: attributeCombo,
        categoryOptionComboId: item.categoryOptionCombo,
    })

    return useQuery(dataValueContextQueryKey, {
        enabled: enabled && isValidSelection,
        select: (data) => {
            const { audits } = data

            return {
                ...data,
                audits: processAudits(audits, item),
            }
        },
    })
}
