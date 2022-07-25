import {
    useDataSetId,
    useOrgUnitId,
    usePeriodId,
} from '../use-context-selection/index.js'

export default function useShouldComponentRenderNull(
    categoryCombination,
    categoryWithNoOptionsExists
) {
    const [dataSetId] = useDataSetId()
    const [periodId] = usePeriodId()
    const [orgUnitId] = useOrgUnitId()

    return (
        categoryCombination.isDefault ||
        !dataSetId ||
        !periodId ||
        !orgUnitId ||
        categoryWithNoOptionsExists ||
        // if it is the default combo,
        // then it doesn't matter if there are categories or not
        (!categoryCombination.isDefault &&
            !categoryCombination.categories.length)
    )
}
