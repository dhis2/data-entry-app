import i18n from '@dhis2/d2-i18n'
import {
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import { useMetadata, selectors } from '../../metadata/index.js'
import { cartesian } from '../../shared/utils.js'
import {
    DataEntryCell,
    DataEntryField,
    useActiveCell,
} from '../data-entry-cell/index.js'
import { getFieldId } from '../get-field-id.js'
import styles from './category-combo-table.module.css'
import { TotalHeader, ColumnTotals, RowTotal } from './total-cells.js'

export const CategoryComboTable = ({
    categoryCombo,
    dataElements,
    filterText,
    globalFilterText,
    greyedFields,
    maxColumnsInSection,
    renderRowTotals,
    renderColumnTotals,
}) => {
    const { data: metadata } = useMetadata()
    // const { deId: activeDeId, cocId: activeCocId } = useActiveCell()
    const activeDeId = ''
    const activeCocId = ''

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
    // Computes the span and repeats for each columns in a category-row.
    // Repeats are the number of times the options in a category needs to be rendered per category-row
    let catColSpan = sortedCOCs.length
    const rowToColumnsMap = categories.map((c) => {
        const categoryOptions = selectors.getCategoryOptionsByCategoryId(
            metadata,
            c.id
        )
        const nrOfOptions = c.categoryOptions.length
        if (nrOfOptions > 0 && catColSpan >= nrOfOptions) {
            catColSpan = catColSpan / nrOfOptions
            const repeat = sortedCOCs.length / (catColSpan * nrOfOptions)

            const columnsToRender = new Array(repeat)
                .fill(0)
                .flatMap(() => categoryOptions)

            return {
                span: catColSpan,
                columns: columnsToRender,
                category: c,
            }
        } else {
            console.warn(
                `Category ${c.displayFormName} malformed. Number of options: ${nrOfOptions}, span: ${catColSpan}`
            )
        }
        return c
    })

    const renderPaddedCells =
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
    const itemsHiddenCnt = dataElements.length - filteredDataElements.length

    // Is the active cell in this cat-combo table? Check to see if active
    // data element is in this CCT
    const isThisTableActive = dataElements.some(({ id }) => id === activeDeId)

    // Find if this column header includes the active cell's column
    const isHeaderActive = (headerIdx, headerColSpan) => {
        const activeCellColIdx = sortedCOCs.findIndex(
            (coc) => activeCocId === coc.id
        )
        const idxDiff = activeCellColIdx - headerIdx * headerColSpan
        return isThisTableActive && idxDiff < headerColSpan && idxDiff >= 0
    }

    return (
        <TableBody>
            {rowToColumnsMap.map((colInfo, colInfoIndex) => {
                const { span, columns, category } = colInfo
                return (
                    <TableRowHead key={category.id}>
                        <TableCellHead
                            className={styles.categoryNameHeader}
                            colSpan={'1'}
                        >
                            {category.displayFormName !== 'default' &&
                                category.displayFormName}
                        </TableCellHead>
                        {columns.map((co, columnIndex) => {
                            return (
                                <TableCellHead
                                    key={columnIndex}
                                    className={cx(styles.tableHeader, {
                                        [styles.active]: isHeaderActive(
                                            columnIndex,
                                            span
                                        ),
                                    })}
                                    colSpan={span.toString()}
                                >
                                    {co.isDefault
                                        ? i18n.t('Value')
                                        : co.displayFormName}
                                </TableCellHead>
                            )
                        })}
                        {renderPaddedCells.map((_, i) => (
                            <PaddingCell key={i} />
                        ))}
                        {renderRowTotals && colInfoIndex === 0 && (
                            <TotalHeader rowSpan={categories.length} />
                        )}
                    </TableRowHead>
                )
            })}
            {filteredDataElements.map((de, i) => {
                return (
                    <TableRow key={de.id}>
                        <TableCell
                            className={cx(styles.dataElementName, {
                                [styles.active]: de.id === activeDeId,
                            })}
                        >
                            {de.displayFormName}
                        </TableCell>
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
                        {renderPaddedCells.map((_, i) => (
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
                    paddedCells={renderPaddedCells}
                    renderTotalSum={renderRowTotals && renderColumnTotals}
                    dataElements={dataElements}
                    categoryOptionCombos={sortedCOCs}
                />
            )}
            {itemsHiddenCnt > 0 && (
                <TableRow>
                    <TableCell
                        className={styles.hiddenByFilterCell}
                        colSpan="100%"
                    >
                        {itemsHiddenCnt === 1
                            ? i18n.t('1 item hidden by filter')
                            : i18n.t('{{count}} items hidden by filter', {
                                  count: itemsHiddenCnt,
                              })}
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    )
}

CategoryComboTable.propTypes = {
    categoryCombo: PropTypes.shape({
        id: PropTypes.string.isRequired,
        categoryOptionCombos: PropTypes.array,
    }).isRequired,
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
