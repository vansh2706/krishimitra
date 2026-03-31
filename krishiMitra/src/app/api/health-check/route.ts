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
    // Check if required environment variables are set
    const geminiApiKey = process.env.GEMINI_API_KEY
    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY

    const response = NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: {
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'production',
        },
        apiKeys: {
            gemini: !!geminiApiKey,
            openWeather: !!openWeatherApiKey,
        },
        // Don't expose actual keys in response for security
        keyStatus: {
            gemini: geminiApiKey ? 'Configured' : 'Missing',
            openWeather: openWeatherApiKey ? 'Configured' : 'Missing',
        },
        services: {
            gemini: geminiApiKey ? 'Available' : 'Unavailable',
            openWeather: openWeatherApiKey ? 'Available' : 'Unavailable',
        }
    })

    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
}