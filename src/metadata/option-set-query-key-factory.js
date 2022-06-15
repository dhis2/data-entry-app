const optionSetFields = 'id,version,options[id,displayFormName]'

const queryKeyFactory = {
    allVersions: [
        'optionSets',
        {
            params: {
                fields: 'id,version',
                paging: false,
            },
        },
    ],
    all: [
        'optionSets',
        {
            params: {
                fields: optionSetFields,
                paging: false,
            },
        },
    ],
    byId: (id) => [
        'optionSets',
        {
            id,
            params: {
                fields: optionSetFields,
                paging: false,
            },
        },
    ],
    byIds: (ids) => [
        'optionSets',
        {
            params: {
                fields: optionSetFields,
                filter: ids?.length > 0 ? `id:in:[${ids.join()}]` : undefined,
                paging: false,
            },
        },
    ],
}

export default queryKeyFactory
