import i18n from '@dhis2/d2-i18n'
import useOrgUnit from './use-organisation-unit.js'
import useUserOrgUnits from './use-user-org-units.js'

export default function useSelectorBarItemValue() {
    const orgUnit = useOrgUnit()
    const userOrgUnits = useUserOrgUnits()
    // @TODO: Figure out how to only use org units that are connected to the
    // data set.
    // const dataSetOrgUnitPaths = useDataSetOrgUnitPaths()

    if (userOrgUnits.loading || orgUnit.loading) {
        return i18n.t('Fetching organisation unit info')
    }

    if (
        orgUnit.error ||
        userOrgUnits.error
        // || dataSetOrgUnitPaths.error
    ) {
        return i18n.t('Error occurred while loading organisation unit info')
    }

    return orgUnit.data?.displayName
}
