import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for data fetching with automatic cleanup and request cancellation.
 *
 * @param {Function} fetchFn - Async function that performs the fetch. Receives AbortSignal as argument.
 * @param {Array} deps - Dependency array that triggers refetch when changed
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to execute the fetch (default: true)
 * @returns {{data: any, loading: boolean, error: string|null, refetch: Function}}
 */
export function useApiQuery(fetchFn, deps = [], options = {}) {
    const { enabled = true } = options
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(enabled)
    const [error, setError] = useState(null)
    const abortControllerRef = useRef(null)
    const fetchFnRef = useRef(fetchFn)

    // Keep ref updated with latest fetchFn
    fetchFnRef.current = fetchFn

    const execute = useCallback(async (signal) => {
        setLoading(true)
        setError(null)

        try {
            const result = await fetchFnRef.current(signal)
            if (!signal?.aborted) {
                setData(result)
            }
        } catch (err) {
            if (!signal?.aborted) {
                if (err.name !== 'AbortError') {
                    setError(err.message)
                }
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        if (!enabled) {
            setLoading(false)
            return
        }

        // Abort any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        execute(abortController.signal)

        return () => {
            abortController.abort()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, execute, ...deps])

    const refetch = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        execute(abortController.signal)
    }, [execute])

    return { data, loading, error, refetch }
}
