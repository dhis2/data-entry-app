import { TableBody, TableRow, TableCell } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useMemo, useCallback } from 'react'
import { useMetadata, selectors } from '../../metadata/index.js'
import { cartesian } from '../../shared/utils.js'
import { DataEntryCell, DataEntryField } from '../data-entry-cell/index.js'
import { getFieldId } from '../get-field-id.js'
import { TableBodyHiddenByFiltersRow } from '../table-body-hidden-by-filter-row.js'
import styles from '../table-body.module.css'
import { CategoryComboTableBodyHeader } from './category-combo-table-body-header.js'
import { DataElementCell } from './data-element-cell.js'
import { ColumnTotals, RowTotal } from './total-cells.js'

export const CategoryComboTableBody = React.memo(
    function CategoryComboTableBody({
        categoryCombo,
        dataElements,
        filterText,
        globalFilterText,
        greyedFields,
        maxColumnsInSection,
        renderRowTotals,
        renderColumnTotals,
    }) {
        const { data: metadata } = useMetadata()

        const categories = selectors.getCategoriesByCategoryComboId(
            metadata,
            categoryCombo.id
        )

        const sortedCOCs = useMemo(() => {
            // each element is a combination of category-options for a particular column
            // this results in lists of category-options in the same order as headers are rendered
            // the result is a client side computation of categoryOption-combinations
            const optionsIdLists = categories.map((cat) => cat.categoryOptions)
            const computedCategoryOptions = cartesian(optionsIdLists)
            // find categoryOptionCombos by category-options
            return computedCategoryOptions
                .map((options) =>
                    selectors.getCoCByCategoryOptions(
                        metadata,
                        categoryCombo.id,
                        options
                    )
                )
                .filter((coc) => !!coc)
        }, [metadata, categories, categoryCombo])

        if (sortedCOCs.length !== categoryCombo.categoryOptionCombos?.length) {
            console.warn(
                `Computed combination of categoryOptions for catCombo(${categoryCombo.id}) is different from server.
                Please regenerate categoryOptionCombos.
                Computed: ${sortedCOCs.length}
                Server: ${categoryCombo.categoryOptionCombos.length})`
        )
    }

    const checkTableActive = useCallback(
        (activeDeId) => dataElements.some(({ id }) => id === activeDeId),
        [dataElements]
    )

    const paddingCells =
        maxColumnsInSection > 0
            ? new Array(maxColumnsInSection - sortedCOCs.length).fill(0)
            : []

    const filteredDataElements = dataElements.filter((de) => {
        const name = de.displayFormName.toLowerCase()
        return (
            (!filterText || name.includes(filterText.toLowerCase())) &&
            (!globalFilterText || name.includes(globalFilterText.toLowerCase()))
        )
    })
    const hiddenItemsCount = dataElements.length - filteredDataElements.length

    return (
        <TableBody>
            <CategoryComboTableBodyHeader
                categoryOptionCombos={sortedCOCs}
                categories={categories}
                renderRowTotals={renderRowTotals}
                paddingCells={paddingCells}
                checkTableActive={checkTableActive}
            />
            {filteredDataElements.map((de, i) => {
                return (
                    <TableRow key={de.id}>
                        <DataElementCell dataElement={de} />
                        {sortedCOCs.map((coc) => (
                            <DataEntryCell key={coc.id}>
                                <DataEntryField
                                    dataElement={de}
                                    categoryOptionCombo={coc}
                                    disabled={greyedFields?.has(
                                        getFieldId(de.id, coc.id)
                                    )}
                                />
                            </DataEntryCell>
                        ))}
                        {paddingCells.map((_, i) => (
                            <PaddingCell key={i} className={styles.tableCell} />
                        ))}
                        {renderRowTotals && (
                            <RowTotal
                                dataElements={dataElements}
                                categoryOptionCombos={sortedCOCs}
                                row={i}
                            />
                        )}
                    </TableRow>
                )
            })}
            {renderColumnTotals && (
                <ColumnTotals
                    paddingCells={paddingCells}
                    renderTotalSum={renderRowTotals && renderColumnTotals}
                    dataElements={dataElements}
                    categoryOptionCombos={sortedCOCs}
                />
            )}
            {hiddenItemsCount > 0 && (
                <TableBodyHiddenByFiltersRow
                    hiddenItemsCount={hiddenItemsCount}
                />
            )}
        </TableBody>
    )
}
)

CategoryComboTableBody.propTypes = {
    categoryCombo: PropTypes.shape({
        id: PropTypes.string.isRequired,
        categoryOptionCombos: PropTypes.array,
    }),
    dataElements: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            categoryCombo: PropTypes.shape({
                id: PropTypes.string,
            }),
            displayFormName: PropTypes.string,
            valueType: PropTypes.string,
        })
    ),
    filterText: PropTypes.string,
    globalFilterText: PropTypes.string,
    /** Greyed fields is a Set where .has(fieldId) is true if that field is greyed/disabled */
    greyedFields: PropTypes.instanceOf(Set),
    maxColumnsInSection: PropTypes.number,
    renderColumnTotals: PropTypes.bool,
    renderRowTotals: PropTypes.bool,
}

const PaddingCell = () => <TableCell className={styles.paddingCell}></TableCell>
