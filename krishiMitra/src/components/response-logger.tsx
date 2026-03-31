'use client'

import { useEffect } from 'react'
import { logUserInteraction, logApiCall } from '@/lib/logger'

interface ResponseLoggerProps {
    component: string
    action?: string
    data?: any
}

export function ResponseLogger({ component, action, data }: ResponseLoggerProps) {
    useEffect(() => {
        if (action) {
            logUserInteraction(action, component, data)
        }
    }, [action, component, data])

    return null // This is a utility component that doesn't render anything
}

// Hook for logging API responses
export function useResponseLogger() {
    const logApiResponse = (
        endpoint: string,
        method: string,
        statusCode: number,
        duration: number,
        data?: any
    ) => {
        logApiCall(endpoint, method, statusCode, duration, data)
    }

    const logUserAction = (action: string, component: string, data?: any) => {
        logUserInteraction(action, component, data)
    }

    return { logApiResponse, logUserAction }
}

export default ResponseLogger