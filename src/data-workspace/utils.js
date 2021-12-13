// Computes the cartesian product of a matrix (array of array)
export const cartesian = (args) => {
    const result = []
    const lim = args.length - 1

    function add(row, i) {
        const len = args[i].length
        for (let j = 0; j < len; j++) {
            const a = [...row]
            a.push(args[i][j])
            if (i === lim) {
                result.push(a)
            } else {
                add(a, i + 1)
            }
        }
    }
    add([], 0)
    return result
}
