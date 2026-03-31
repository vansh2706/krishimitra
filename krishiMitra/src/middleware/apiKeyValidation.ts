// API Key validation middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper function to check if a key is valid
function isValidAPIKey(key: string | undefined): boolean {
    if (!key) return false
    // Check if it's a placeholder or empty value
    return !key.includes('your_') && !key.includes('placeholder') && key.length > 10
}

// Helper function to get the best available API key
export function getBestAvailableAPIKey(
    serverKey: string | undefined,
    publicKey: string | undefined,
    keyName: string
): string | null {
    // First try server-side key
    if (isValidAPIKey(serverKey)) {
        return serverKey as string
    }
    // Then try public key
    if (isValidAPIKey(publicKey)) {
        return publicKey as string
    }
    // Log the issue for debugging
    console.warn(`No valid ${keyName} found. Please check your environment variables.`)
    return null
}

// Middleware to validate API keys
export async function validateAPIKey(request: NextRequest) {
    const geminiKey = getBestAvailableAPIKey(
        process.env.GEMINI_API_KEY,
        process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        'Gemini API key'
    )

    const openaiKey = getBestAvailableAPIKey(
        process.env.OPENAI_API_KEY,
        process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        'OpenAI API key'
    )

    // If no valid keys are available
    if (!geminiKey && !openaiKey) {
        return NextResponse.json(
            {
                error: 'No valid API keys configured. Please check your environment variables.',
                missingKeys: {
                    gemini: !geminiKey,
                    openai: !openaiKey
                }
            },
            { status: 500 }
        )
    }

    // Attach the best available keys to the request
    const requestHeaders = new Headers(request.headers)
    if (geminiKey) {
        requestHeaders.set('X-Gemini-Key', geminiKey)
    }
    if (openaiKey) {
        requestHeaders.set('X-OpenAI-Key', openaiKey)
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

// Helper function to get API key from headers
export function getAPIKeyFromHeaders(headers: Headers, keyType: 'gemini' | 'openai'): string | null {
    const key = keyType === 'gemini' ?
        headers.get('X-Gemini-Key') :
        headers.get('X-OpenAI-Key')
    return key || null
}