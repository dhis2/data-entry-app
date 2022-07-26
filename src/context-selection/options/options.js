import i18n from '@dhis2/d2-i18n'
import { FlyoutMenu, MenuItem, MenuDivider, DropdownButton } from '@dhis2/ui'
import React, { useState } from 'react'
import { contextualHelpSidebarId } from '../../data-workspace/constants.js'
import { usePrintableArea } from '../../data-workspace/print-area/print-area-context.js'
import { useRightHandPanelContext } from '../../right-hand-panel/index.js'

export default function Options() {
    const rightHandPanel = useRightHandPanelContext()
    const { printForm } = usePrintableArea()

    const [showMenu, setShowMenu] = useState(false)

    const print = (isEmptyForm) => () => {
        setShowMenu(false)
        printForm(isEmptyForm)
    }
    const optionsMenu = (
        <FlyoutMenu>
            <MenuItem
                onClick={print(false)}
                label={i18n.t('Print form with values')}
            />
            <MenuItem
                onClick={print(true)}
                label={i18n.t('Print empty form')}
            />
            <MenuDivider />
            <MenuItem
                label={i18n.t('Help')}
                onClick={() => {
                    rightHandPanel.show(contextualHelpSidebarId)
                    setShowMenu(false)
                }}
            />
        </FlyoutMenu>
    )

    return (
        <>
            <DropdownButton
                small
                open={showMenu}
                onClick={() => setShowMenu(!showMenu)}
                secondary
                component={optionsMenu}
            >
                {i18n.t('Options')}
            </DropdownButton>
        </>
    )
}
