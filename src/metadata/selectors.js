import { createCachedSelector } from 're-reselect'
import { createSelector } from 'reselect'

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
export const getCategoryOptionCombos = (metadata) =>
    metadata.categoryOptionCombos
export const getCategoryOptions = (metadata) => metadata.categoryOptions
export const getDataElements = (metadata) => metadata.dataElements
export const getDataSets = (metadata) => metadata.dataSets
export const getSections = (metadata) => metadata.sections
export const getOptionSets = (metadata) => metadata.optionSets

// Select by id

export const getCategoryById = (metadata, id) => getCategories(metadata)[id]
export const getOptionSetById = (metadata, id) => getOptionSets(metadata)[id]
export const getSectionById = (metadata, id) => getSections(metadata)[id]
export const getDataSetById = (metadata, id) => getDataSets(metadata)?.[id]
export const getCategoryComboById = (metadata, id) =>
    getCategoryCombos(metadata)[id]

/**
 * Memoized selectors
 * To clarify why some selectors are memoized and some aren't: only transformations
 * that are cpu intensive, or transformations that result in the selector returning
 * a new reference every time (.map for example) should be memoized.
 *
 * Selectors where a cache size of 1 is sufficient should be memoized with reselect,
 * selectors that should have a cache per parameter (say an id) should use re-reselect.
 */

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
 * @param {*} categoryId
 */
export const getCategoryOptionsByCategoryId = createCachedSelector(
    getCategoryById,
    getCategoryOptions,
    (category, categoryOptions) =>
        category.categoryOptions.map((id) => categoryOptions[id])
)((_, categoryId) => categoryId)

/**
 * @param {*} metadata
 * @param {*} categoryComboId
 */
export const getCategoryOptionCombosByCategoryComboId = createCachedSelector(
    getCategoryComboById,
    getCategoryOptionCombos,
    (categoryCombo, categoryOptionCombos) =>
        categoryCombo?.categoryOptionCombos.map(
            (id) => categoryOptionCombos[id]
        )
)((_, categoryComboId) => categoryComboId)

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
 * This selector needs the dataSetId so it can use the getDataElementsByDataSetId selector,
 * which will apply the correct categoryCombo overrides.
 * @param {*} metadata
 * @param {*} dataSetId
 * @param {*} sectionId
 */
export const getDataElementsBySection = createCachedSelector(
    (metadata, _, sectionId) => getSectionById(metadata, sectionId),
    getDataElementsByDataSetId,
    (section, dataElements) =>
        section.dataElements.map((id) =>
            dataElements.find((de) => de.id === id)
        )
)((_, dataSetId, sectionId) => `${dataSetId}:${sectionId}`)

/**
 * Returns an array of objects with dataElements and their associated categoryCombos. They
 * are grouped by categoryComboId, every time the categoryComboId changes a new group is
 * created.
 * @param {*} metadata
 * @param {*} dataElements
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
