import i18n from '@dhis2/d2-i18n'
import {
    IconErrorFilled16,
    IconWarningFilled16,
    IconInfo16,
    IconErrorFilled24,
    IconWarningFilled24,
    IconInfo24,
} from '@dhis2/ui'

export const validationLevels = ['HIGH', 'MEDIUM', 'LOW']
export const validationLevelsConfig = {
    HIGH: {
        icon: IconErrorFilled16,
        iconColor: 'var(--colors-red600)',
        largeIcon: IconErrorFilled24,
        text: i18n.t('High'),
        style: 'error',
    },
    MEDIUM: {
        icon: IconWarningFilled16,
        iconColor: 'var(--colors-yellow500)',
        largeIcon: IconWarningFilled24,
        text: i18n.t('Medium'),
        style: 'warning',
    },
    LOW: {
        icon: IconInfo16,
        iconColor: 'var(--colors-grey600)',
        largeIcon: IconInfo24,
        text: i18n.t('Low'),
        style: 'info',
    },
}
