import i18n from '@dhis2/d2-i18n'

export default function useSelectorBarItemLabel(categoryCombination) {
    if (categoryCombination?.isDefault) {
        return i18n.t('Default attribute combo')
    }

    return categoryCombination?.displayName
}
