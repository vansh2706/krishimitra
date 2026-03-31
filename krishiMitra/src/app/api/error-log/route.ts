import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { error, timestamp, userAgent } = body

        // Log the error (in production, you might want to send this to a logging service)
        console.error(`Client Error [${timestamp}]:`, error, 'User Agent:', userAgent)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error logging failed:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Error logging service',
        timestamp: new Date().toISOString()
    })
}