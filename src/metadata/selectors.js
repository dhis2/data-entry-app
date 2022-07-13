import { createCachedSelector } from 're-reselect'
import { createSelector } from 'reselect'
import { parsePeriodId } from '../shared/index.js'

// Helper to group array items by an identifier

const groupBy = (input, getIdentifier) =>
    input.reduce((grouped, item) => {
        const identifier = getIdentifier(item)

        grouped[identifier] = grouped[identifier] ?? []
        grouped[identifier].push(item)

        return grouped
    }, {})

// Simple input selectors

export const getCategories = (metadata) => metadata.categories
export const getCategoryCombos = (metadata) => metadata.categoryCombos

export const getCategoryOptions = (metadata) => metadata.categoryOptions
export const getDataElements = (metadata) => metadata.dataElements
export const getIndicators = (metadata) => metadata.indicators
export const getDataSets = (metadata) => metadata.dataSets
export const getSections = (metadata) => metadata.sections
export const getOptionSets = (metadata) => metadata.optionSets
// Select by id

export const getCategoryById = (metadata, id) => getCategories(metadata)[id]
export const getOptionSetById = (metadata, id) => getOptionSets(metadata)[id]
export const getDataSetById = (metadata, id) => getDataSets(metadata)?.[id]
export const getDataElementById = (metadata, id) =>
    getDataElements(metadata)?.[id]

export const getSectionsByDataSetId = (metadata, dataSetId) => {
    const dataSetSections = getDataSetById(metadata, dataSetId)?.sections
    return dataSetSections ?? []
}

export const getCategoryComboById = (metadata, id) =>
    getCategoryCombos(metadata)[id]

/**
 *
 * @param {*} metadata
 * @param {*} categoryComboId
 * @returns categoryOptionCombos in catCombo. Returns null if catCombo with given id does not exist.
 * Returns undefined if catCombo is missing categoryOptionCombos-property, which may happen if
 * categoryCombo is an 'ATTRIBUTE'-combo.
 */
export const getCategoryOptionCombosByCategoryComboId = (
    metadata,
    categoryComboId
) => {
    const catCombo = getCategoryComboById(metadata, categoryComboId)
    return catCombo ? catCombo.categoryOptionCombos : null
}

/**
 * Memoized selectors
 * To clarify why some selectors are memoized and some aren't: only transformations
 * that are cpu intensive, or transformations that result in the selector returning
 * a new reference every time (.map for example) should be memoized.
 *
 * Selectors where a cache size of 1 is sufficient should be memoized with reselect,
 * selectors that should have a cache per parameter (say an id) should use re-reselect.
 */

export const getCategoryOptionsByCategoryOptionComboId = createCachedSelector(
    (metadata) => metadata,
    (_, categoryOptionComboId) => categoryOptionComboId,
    (metadata, categoryOptionComboId) => {
        const categoryCombos = Object.values(metadata.categoryCombos)

        for (const categoryCombo of categoryCombos) {
            const curCategoryOptionCombos =
                categoryCombo?.categoryOptionCombos || []
            for (const curCategoryOptionCombo of curCategoryOptionCombos) {
                if (curCategoryOptionCombo?.id === categoryOptionComboId) {
                    const categoryOptions = Object.values(
                        metadata.categoryOptions
                    )
                    const { categoryOptions: curCategoryOptions } =
                        curCategoryOptionCombo

                    return categoryOptions.filter(({ id }) =>
                        curCategoryOptions.includes(id)
                    )
                }
            }
        }

        return []
    }
)((_, categoryOptionComboId) => categoryOptionComboId)

/**
 * @param {*} metadata
 * @param {string} dataSetId
 * @param {string} sectionId
 */
export const getSection = createCachedSelector(
    getSectionsByDataSetId,
    (_, __, sectionId) => sectionId,
    (sections, sectionId) => sections.find((s) => s.id === sectionId)
)((_, dataSetId, sectionId) => `${dataSetId}:${sectionId}`)

/**
 * @param {*} metadata
 * @param {*} categoryComboId
 */
export const getCategoriesByCategoryComboId = createCachedSelector(
    getCategoryComboById,
    getCategories,
    (categoryCombo, categories) =>
        categoryCombo.categories.map((id) => categories[id])
)((_, categoryComboId) => categoryComboId)

/**
 * @param {*} metadata
 * @param {*} dataSetId
 */
export const getCategoryComboByDataSetId = createCachedSelector(
    getDataSetById,
    getCategoryCombos,
    (_, dataSetId) => dataSetId,
    (dataSet, categoryCombos, dataSetId) => {
        if (!dataSet?.categoryCombo?.id) {
            console.warn(
                `Data set with id ${dataSetId} does not have a category combo`
            )

            return undefined
        }

        const categoryCombo = categoryCombos[dataSet?.categoryCombo?.id]

        if (!categoryCombo) {
            console.warn(
                `Could not find a category combo for data set with id ${dataSetId}`
            )
        }

        return categoryCombo
    }
)((_, dataSetId) => dataSetId)

/**
 * @param {*} metadata
 * @param {*} dataSetId
 */
export const getCategoriesByDataSetId = createCachedSelector(
    (metadata) => metadata,
    getCategoryComboByDataSetId,
    (_, dataSetId) => dataSetId,
    (metadata, categoryCombo, dataSetId) => {
        if (!categoryCombo?.id) {
            console.warn(
                `Could not find categories for data set with id ${dataSetId}`
            )

            return []
        }

        return getCategoriesByCategoryComboId(metadata, categoryCombo.id)
    }
)((_, dataSetId) => dataSetId)

/**
 * @param {*} metadata
 * @param {*} categoryId
 */
export const getCategoryOptionsByCategoryId = createCachedSelector(
    getCategoryById,
    getCategoryOptions,
    (category, categoryOptions) =>
        category.categoryOptions.map((id) => categoryOptions[id])
)((_, categoryId) => categoryId)

/**
 * The categoryCombo for a dataElement can be overriden per dataSet. This selector
 * will apply that override.
 * @param {*} metadata
 * @param {*} dataSetId
 */
export const getDataElementsByDataSetId = createCachedSelector(
    getDataElements,
    getDataSetById,
    (dataElements, dataSet) => {
        if (!dataSet?.dataSetElements) {
            // To stay consistent with the way this selector behaved previously
            return undefined
        }

        return dataSet.dataSetElements.map((dse) => {
            const de = dataElements[dse.dataElement.id]

            const categoryCombo = dse.categoryCombo ?? de.categoryCombo

            return {
                ...de,
                categoryCombo,
            }
        })
    }
)((_, dataSetId) => dataSetId)

/**
 * @param {*} metadata
 * @param {*} dataSetId
 */
export const getIndicatorsByDataSetId = createCachedSelector(
    getIndicators,
    getDataSetById,
    (indicators, dataSet) => dataSet.indicators.map((id) => indicators[id])
)((_, dataSetId) => dataSetId)

/**
 * This selector needs the dataSetId so it can use the getDataElementsByDataSetId selector,
 * which will apply the correct categoryCombo overrides.
 * @param {*} metadata
 * @param {*} dataSetId
 * @param {*} sectionId
 */
export const getDataElementsBySection = createCachedSelector(
    getSection,
    getDataElementsByDataSetId,
    (section, dataElements) =>
        section.dataElements.map((id) =>
            dataElements.find((de) => de.id === id)
        )
)((_, dataSetId, sectionId) => `${dataSetId}:${sectionId}`)

/**
 * @param {*} metadata
 * @param {*} dataSetId
 * @param {*} sectionId
 */
export const getIndicatorsBySection = createCachedSelector(
    getSection,
    getIndicators,
    (section, indicators) => section.indicators.map((id) => indicators[id])
)((_, dataSetId, sectionId) => `${dataSetId}:${sectionId}`)

/**
 * Returns an array of objects with dataElements and their associated categoryCombos.
 * This keeps the defined dataElement order given, and groups neighbouring elements with the
 * same categoryCombo in the same group. This is used in form-sections
 * when `section.disableDataElementAutoGroup`is true
 * @param {*} metadata
 * @param {*} dataElements - a list of dataElement -objects (result of getDataElementsBySection)
 */
export const getGroupedDataElementsByCatComboInOrder = createSelector(
    (_, dataElements) => dataElements,
    getCategoryCombos,
    (dataElements, categoryCombos) => {
        const grouped = []

        dataElements.forEach((de, i) => {
            const previousDe = dataElements[i - 1]
            const lastGroup = grouped[grouped.length - 1]
            const matchingId =
                previousDe?.categoryCombo.id === de.categoryCombo.id

            if (!lastGroup || !matchingId) {
                grouped.push({
                    dataElements: [de],
                    categoryCombo: categoryCombos[de.categoryCombo.id],
                })
            } else {
                lastGroup.dataElements.push(de)
            }
        })

        return grouped
    }
)

/**
 * Returns an array of objects with dataElements and their associated categoryCombos. Unlike
 * getGroupedDataElementsByCatComboInOrder, this selector will group all dataElements with the
 * same categoryComboId together.
 * @param {*} metadata
 * @param {*} dataElements
 */
export const getGroupedDataElementsByCatCombo = createSelector(
    (_, dataElements) => dataElements,
    getCategoryCombos,
    (dataElements, categoryCombos) => {
        // Group dataElements by their categoryCombo id
        const grouped = groupBy(dataElements, (de) => de.categoryCombo.id)

        // Map to an array and include the associated categoryCombo
        return Object.entries(grouped).map(
            ([categoryComboId, dataElements]) => ({
                dataElements,
                categoryCombo: categoryCombos[categoryComboId],
            })
        )
    }
)

export const getNrOfColumnsInCategoryCombo = createCachedSelector(
    getCategoriesByCategoryComboId,
    (categories) =>
        (categories?.map((cat) => cat.categoryOptions.length) || [1]).reduce(
            (total, curr) => total * curr
        )
)((_, categoryComboId) => categoryComboId)

/**
 * Tries to find the categoryOptionCombo with the given categoryOptions within a category
 * combination.
 * @param {*} metadata
 * @param {*} categoryComboId
 * @param {*} categoryOptionIds
 */
export const getCoCByCategoryOptions = createCachedSelector(
    getCategoryOptionCombosByCategoryComboId,
    (_, categoryComboId) => categoryComboId,
    (_, __, categoryOptionIds) => categoryOptionIds,
    (categoryOptionCombos, categoryComboId, categoryOptionIds) => {
        const targetIds = categoryOptionIds

        for (const coc of categoryOptionCombos) {
            const currentIds = coc.categoryOptions
            const sameLength = targetIds.length === currentIds.length
            const sameIds = targetIds.every((id) => currentIds.includes(id))

            if (sameLength && sameIds) {
                return coc
            }
        }

        console.warn(
            `Could not find categoryOptionCombo for catCombo ${categoryComboId}, with categoryOptions: ${categoryOptionIds.join()}`
        )

        return null
    }
)((_, categoryComboId) => categoryComboId)

const isOptionWithinPeriod = ({
    periodStartDate,
    periodEndDate,
    categoryOption,
}) => {
    // option has not start and end dates
    if (!categoryOption.startDate && !categoryOption.endDate) {
        return true
    }

    if (categoryOption.startDate) {
        const startDate = new Date(categoryOption.startDate)
        if (periodStartDate < startDate) {
            // option start date is after period start date
            return false
        }
    }

    if (categoryOption.endDate) {
        const endDate = new Date(categoryOption.endDate)
        if (periodEndDate > endDate) {
            // option end date is before period end date
            return false
        }
    }

    // option spans over entire period
    return true
}

const resolveCategoryOptionIds = (categories, categoryOptions) => {
    return categories.map((category) => ({
        ...category,
        categoryOptions: category.categoryOptions.map(
            (id) => categoryOptions[id]
        ),
    }))
}

export const getCategoriesWithOptionsWithinPeriod = createCachedSelector(
    (metadata) => metadata,
    (_, dataSetId) => dataSetId,
    (_, __, periodId) => periodId,
    (metadata, dataSetId, periodId) => {
        if (!dataSetId || !periodId) {
            return []
        }

        const relevantCategories = getCategoriesByDataSetId(metadata, dataSetId)
        const categoryOptions = getCategoryOptions(metadata)
        const relevantCategoriesWithOptions = resolveCategoryOptionIds(
            relevantCategories,
            categoryOptions
        )
        const period = parsePeriodId(periodId)
        const periodStartDate = new Date(period.startDate)
        const periodEndDate = new Date(period.endDate)

        return relevantCategoriesWithOptions.map((category) => ({
            ...category,
            categoryOptions: category.categoryOptions.filter((categoryOption) =>
                isOptionWithinPeriod({
                    periodStartDate,
                    periodEndDate,
                    categoryOption,
                })
            ),
        }))
    }
)((_, dataSetId, periodId) => `${dataSetId}:${periodId}`)
