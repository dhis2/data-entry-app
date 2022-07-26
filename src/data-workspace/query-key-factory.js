export const dataValueSets = {
    byIds: ({
        dataSetId,
        periodId,
        orgUnitId,
        categoryComboId,
        categoryOptionIds = [],
    }) => {
        const params = {
            ds: dataSetId,
            pe: periodId,
            ou: orgUnitId,
            cc: categoryComboId,
            cp: categoryOptionIds.join(';'),
        }

        return ['dataEntry/dataValues', { params }]
    },
}

export const dataValueContext = {
    byParams: ({
        dataElementId,
        periodId,
        orgUnitId,
        categoryOptionIds = [],
        categoryComboId,
        categoryOptionComboId,
    }) => [
        'dataEntry/dataValueContext',
        {
            params: {
                de: dataElementId,
                pe: periodId,
                ou: orgUnitId,
                co: categoryOptionComboId,
                cc: categoryComboId,
                cp: categoryOptionIds.join(','),
            },
        },
    ],
}

export const getValidationMetaDataQueryKey = (datasetId) => {
    const queryKey = [
        `validationRules`,
        {
            params: {
                dataSet: datasetId,
                fields: [
                    'id',
                    'importance',
                    'operator',
                    'leftSide',
                    'rightSide',
                    'displayInstruction',
                    'displayDescription',
                    'displayName',
                ],
            },
        },
    ]

    return queryKey
}

export const getValidationQueryKey = ({
    dataSetId,
    periodId,
    orgUnitId,
    categoryComboId,
    categoryOptionIds,
}) => {
    const params = {
        pe: periodId,
        ou: orgUnitId,
        cc: categoryComboId,
        cp: categoryOptionIds?.join(';'),
    }

    const validationQueryKey = [
        `validation/dataSet/${dataSetId}`,
        {
            params,
        },
    ]
    return validationQueryKey
}
