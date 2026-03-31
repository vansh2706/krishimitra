/**
 * Custom hook for language-aware data fetching
 * Automatically re-fetches data when language changes
 */

import { useEffect, useRef, useCallback } from 'react'
import { useLanguage } from './useLanguage'

export interface UseLanguageDataOptions {
    // Component identifier for debugging
    componentName: string
    // Whether to refetch data immediately when language changes
    refetchOnLanguageChange?: boolean
    // Debounce delay for rapid language changes (in ms)
    debounceDelay?: number
    // Whether to log debug information
    debug?: boolean
}

export function useLanguageData(
    fetchFunction: (language: string) => Promise<void>,
    options: UseLanguageDataOptions
) {
    const { language } = useLanguage()
    const {
        componentName,
        refetchOnLanguageChange = true,
        debounceDelay = 300,
        debug = false
    } = options

    const lastLanguageRef = useRef(language)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const fetchFunctionRef = useRef(fetchFunction)

    // Update the fetchFunction ref when it changes
    useEffect(() => {
        fetchFunctionRef.current = fetchFunction
    }, [fetchFunction])

    const debouncedFetch = useCallback((lang: string) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }

        debounceTimeoutRef.current = setTimeout(() => {
            if (debug) {
                console.log(`[${componentName}] Fetching data for language: ${lang}`)
            }
            fetchFunctionRef.current(lang)
        }, debounceDelay)
    }, [componentName, debounceDelay, debug])

    // Handle language changes
    useEffect(() => {
        if (language !== lastLanguageRef.current && refetchOnLanguageChange) {
            if (debug) {
                console.log(`[${componentName}] Language changed: ${lastLanguageRef.current} -> ${language}`)
            }
            debouncedFetch(language)
            lastLanguageRef.current = language
        }
    }, [language, componentName, refetchOnLanguageChange, debug, debouncedFetch])

    // Listen for global language reload events
    useEffect(() => {
        const handleLanguageReload = (event: CustomEvent) => {
            const { language: newLanguage, components } = event.detail
            
            // Check if this component should reload
            if (components && components.includes(componentName.toLowerCase())) {
                if (debug) {
                    console.log(`[${componentName}] Received language reload event for: ${newLanguage}`)
                }
                debouncedFetch(newLanguage)
            }
        }

        window.addEventListener('krishimitra:language-data-reload', handleLanguageReload as EventListener)

        return () => {
            window.removeEventListener('krishimitra:language-data-reload', handleLanguageReload as EventListener)
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [componentName, debug, debouncedFetch])

    return {
        currentLanguage: language,
        refetch: () => debouncedFetch(language)
    }
}

/**
 * Hook specifically for API calls that need language parameters
 */
export function useLanguageAwareApi() {
    const { language } = useLanguage()

    const makeApiCall = useCallback(async (
        endpoint: string,
        options: RequestInit = {},
        includeLanguage: boolean = true
    ) => {
        const url = new URL(endpoint, window.location.origin)
        
        if (includeLanguage) {
            url.searchParams.set('lang', language)
        }

        const headers = {
            'Accept-Language': language,
            'Content-Type': 'application/json',
            ...options.headers
        }

        console.log(`🌐 API Call: ${url.toString()}`)
        console.log(`📡 Headers:`, headers)

        return fetch(url.toString(), {
            ...options,
            headers
        })
    }, [language])

    return {
        makeApiCall,
        currentLanguage: language
    }
}

/**
 * Debug helper to track language-aware operations
 */
export function useLanguageDebug(componentName: string) {
    const { language } = useLanguage()

    useEffect(() => {
        console.log(`🔧 [${componentName}] Language context: ${language}`)
    }, [language, componentName])

    const logApiCall = useCallback((endpoint: string, params?: any) => {
        console.log(`📞 [${componentName}] API Call:`, {
            endpoint,
            language,
            params,
            timestamp: new Date().toISOString()
        })
    }, [componentName, language])

    const logDataReload = useCallback((reason: string) => {
        console.log(`🔄 [${componentName}] Data Reload:`, {
            reason,
            language,
            timestamp: new Date().toISOString()
        })
    }, [componentName, language])

    return {
        logApiCall,
        logDataReload
    }
}