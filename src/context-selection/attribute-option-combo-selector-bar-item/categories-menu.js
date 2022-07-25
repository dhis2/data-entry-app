import i18n from '@dhis2/d2-i18n'
import { Button, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { MenuSelect } from '../menu-select/index.js'
import css from './categories-menu.module.css'

export default function CategoriesMenu({
    categories,
    close,
    selected,
    onChange,
}) {
    if (categories.length === 1) {
        const category = categories[0]
        const values = category.categoryOptions.map(({ id, displayName }) => ({
            value: id,
            label: displayName,
        }))

        return (
            <MenuSelect
                values={values}
                selected={selected[category.id]}
                dataTest="data-set-selector-menu"
                onChange={({ selected: categoryOptionId }) => {
                    onChange({
                        categoryId: category.id,
                        selected: categoryOptionId,
                    })
                    close()
                }}
            />
        )
    }

    return (
        <div className={css.container}>
            <div className={css.inputs}>
                {categories.map(({ id, displayName, categoryOptions }) => (
                    <div className={css.input} key={id}>
                        <SingleSelectField
                            label={displayName}
                            selected={selected[id]}
                            onChange={({ selected }) =>
                                onChange({
                                    categoryId: id,
                                    selected,
                                })
                            }
                        >
                            {categoryOptions.map(({ id, displayName }) => (
                                <SingleSelectOption
                                    key={id}
                                    value={id}
                                    label={displayName}
                                />
                            ))}
                        </SingleSelectField>
                    </div>
                ))}
            </div>

            <Button
                secondary
                onClick={(_, evt) => {
                    // required as otherwise it'd trigger a `setOpen(true)` call as
                    // react thinks of this dropdown as being inside of the
                    // selector. A click on the selector opens the menu.
                    evt.stopPropagation()

                    close()
                }}
            >
                {i18n.t('Hide menu')}
            </Button>
        </div>
    )
}

CategoriesMenu.propTypes = {
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            categoryOptions: PropTypes.arrayOf(
                PropTypes.shape({
                    displayName: PropTypes.string.isRequired,
                    id: PropTypes.string.isRequired,
                })
            ).isRequired,
            displayName: PropTypes.string.isRequired,
            id: PropTypes.string.isRequired,
        })
    ).isRequired,
    close: PropTypes.func.isRequired,
    selected: PropTypes.objectOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
}
