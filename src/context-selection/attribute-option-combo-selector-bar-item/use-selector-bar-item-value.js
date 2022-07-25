import i18n from '@dhis2/d2-i18n'
import { useMetadata, selectors } from '../../metadata/index.js'
import { useAttributeOptionComboSelection } from '../use-context-selection/index.js'

export default function useSelectorBarItemValue(categoryCombination) {
    const { data: metadata } = useMetadata()
    const [attributeOptionComboSelection] = useAttributeOptionComboSelection()

    if (categoryCombination?.isDefault) {
        return ''
    }

    if (
        !Object.values(attributeOptionComboSelection).length ||
        !categoryCombination
    ) {
        return i18n.t('0 selections')
    }

    if (categoryCombination?.categories.length === 1) {
        const categoryId = categoryCombination?.categories[0]
        const categoryOptionId = attributeOptionComboSelection[categoryId]
        const category = selectors.getCategoryOptionById(
            metadata,
            categoryOptionId
        )
        return category?.displayName
    }

    const amount = Object.values(attributeOptionComboSelection).length

    if (amount === 1) {
        return i18n.t('1 selection')
    }

    return i18n.t('{{amount}} selections', {
        amount: Object.values(attributeOptionComboSelection).length,
    })
}
