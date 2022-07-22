/**
 * The format we receive from the API and what we want to
 * display is actually different. For now we'll format
 * the values on the client. After the initial release we
 * can think about whether we want to move this to the
 * backend or not.
 * @TODO: Create an issue for this
 */
export default function processAudits(audits, currentItem) {
    const processedExistingAudits = [...audits].map((audit, index) => {
        const previousValue = audit.value
        const newValue =
            index === 0 ? currentItem.value : audits[index - 1].value

        return {
            ...audit,
            value: newValue,
            previousValue,
        }
    })

    return processedExistingAudits
}
