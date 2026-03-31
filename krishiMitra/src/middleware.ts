import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateAPIKey } from './middleware/apiKeyValidation'

export async function middleware(request: NextRequest) {
    // Handle preflight requests for CORS
    if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                'Access-Control-Max-Age': '86400',
            },
        })
        return response
    }

    // Validate API keys for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const apiKeyValidation = await validateAPIKey(request)

        // If it's an error response from validation, return it
        if (apiKeyValidation instanceof NextResponse && apiKeyValidation.status !== 200) {
            return apiKeyValidation
        }
    }

    // Add CORS headers to all responses
    const response = NextResponse.next()

    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Max-Age', '86400')

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
    ],
}