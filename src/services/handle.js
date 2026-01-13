export function objectToQueryString(obj, prefix = '') {
    if (!obj || Object.keys(obj).length === 0) return ''

    const queryParams = Object.keys(obj)
        .filter((key) => obj[key] !== undefined)
        .map((key) => {
            const value = obj[key]
            const queryKey = prefix ? `${prefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key)

            if (Array.isArray(value))
                return value.map((val) => `${queryKey}[]=${encodeURIComponent(val)}`).join('&')
            else if (typeof value === 'object' && value !== null)
                return objectToQueryString(value, queryKey)
            else return `${queryKey}=${encodeURIComponent(value)}`
        })
        .join('&')

    return queryParams
}