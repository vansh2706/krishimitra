/**
 * Language-aware API helper functions
 * Provides consistent language handling across all API calls
 */

export interface ApiConfig {
    endpoint: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers?: Record<string, string>
    body?: any
    language: string
    fallbackToEnglish?: boolean
}

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    language: string
    fallbackUsed?: boolean
}

/**
 * Generic language-aware API call function
 */
export async function languageAwareApiCall<T = any>(config: ApiConfig): Promise<ApiResponse<T>> {
    const {
        endpoint,
        method = 'GET',
        headers = {},
        body,
        language,
        fallbackToEnglish = true
    } = config

    try {
        console.log(`Making ${method} request to ${endpoint} with language: ${language}`)
        
        // Add language parameter to URL
        const url = new URL(endpoint, window.location.origin)
        url.searchParams.set('lang', language)
        
        // Add language header
        const requestHeaders = {
            'Content-Type': 'application/json',
            'Accept-Language': language,
            ...headers
        }

        const requestConfig: RequestInit = {
            method,
            headers: requestHeaders,
            ...(body && { body: JSON.stringify(body) })
        }

        const response = await fetch(url.toString(), requestConfig)
        
        if (!response.ok) {
            // If request fails and fallback is enabled, try with English
            if (fallbackToEnglish && language !== 'en') {
                console.log(`Request failed for ${language}, falling back to English`)
                return languageAwareApiCall({
                    ...config,
                    language: 'en',
                    fallbackToEnglish: false // Prevent infinite recursion
                })
            }
            
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        return {
            success: true,
            data,
            language,
            fallbackUsed: false
        }

    } catch (error) {
        console.error('Language-aware API call failed:', error)
        
        // If original language failed and fallback is enabled, try English
        if (fallbackToEnglish && language !== 'en') {
            console.log(`API call failed for ${language}, attempting fallback to English`)
            try {
                const fallbackResult = await languageAwareApiCall({
                    ...config,
                    language: 'en',
                    fallbackToEnglish: false
                })
                
                return {
                    ...fallbackResult,
                    fallbackUsed: true
                }
            } catch (fallbackError) {
                console.error('Fallback to English also failed:', fallbackError)
            }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            language
        }
    }
}

/**
 * Soil data API call with language support
 */
export async function fetchSoilData(soilType: string, language: string) {
    return languageAwareApiCall({
        endpoint: `/api/soil/${soilType}`,
        method: 'GET',
        language
    })
}

/**
 * Pest detection API call with language support
 */
export async function fetchPestDetection(imageData: string, language: string) {
    return languageAwareApiCall({
        endpoint: '/api/pest-detection',
        method: 'POST',
        body: { image: imageData },
        language
    })
}

/**
 * Market prices API call with language support
 */
export async function fetchMarketPrices(city: string, crop: string, language: string) {
    return languageAwareApiCall({
        endpoint: `/api/market-prices`,
        method: 'GET',
        language,
        body: { city, crop }
    })
}

/**
 * Debug function to check Network tab calls
 */
export function debugApiCalls() {
    console.log('🔍 Debug: Check Network tab for API calls with lang parameter')
    console.log('Expected URL patterns:')
    console.log('- /api/soil/clay?lang=hi')
    console.log('- /api/pest-detection?lang=ta')
    console.log('- /api/market-prices?lang=en')
    console.log('Expected headers:')
    console.log('- Accept-Language: [selected language]')
    console.log('- Content-Type: application/json')
}

/**
 * Language change event dispatcher
 */
export function notifyLanguageChange(newLanguage: string, components: string[] = []) {
    const event = new CustomEvent('krishimitra:language-data-reload', {
        detail: {
            language: newLanguage,
            components,
            timestamp: new Date().toISOString()
        }
    })
    
    window.dispatchEvent(event)
    console.log(`Language change notification sent: ${newLanguage}`, components)
}