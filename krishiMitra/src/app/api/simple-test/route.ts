import { NextRequest, NextResponse } from 'next/server'

// Handle CORS preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400',
        },
    })
}

export async function GET() {
    const response = NextResponse.json({
        message: 'Simple test API route is working',
        timestamp: new Date().toISOString(),
        status: 'success'
    })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

    return response
}

export async function POST(request: NextRequest) {
    let body = {}
    try {
        body = await request.json()
    } catch (e) {
        // If parsing fails, continue with empty object
    }

    const response = NextResponse.json({
        message: 'Simple test POST API route is working',
        timestamp: new Date().toISOString(),
        status: 'success',
        receivedData: body
    })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

    return response
}