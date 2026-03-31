import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { level, message, meta } = body

        // Validate log level
        const validLevels = ['error', 'warn', 'info', 'debug']
        if (!validLevels.includes(level)) {
            return NextResponse.json(
                { error: 'Invalid log level' },
                { status: 400 }
            )
        }

        // Log the message
        logger.log(level, message, {
            ...meta,
            userAgent: request.headers.get('user-agent'),
            ip: request.ip || 'unknown',
            timestamp: new Date().toISOString()
        })

        return NextResponse.json({ status: 'logged' }, { status: 200 })
    } catch (error) {
        console.error('Logger API error:', error)
        return NextResponse.json(
            { error: 'Failed to log message' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        // Return recent logs (implement based on your logging strategy)
        return NextResponse.json({
            message: 'Logger endpoint is operational',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Logger service unavailable' },
            { status: 503 }
        )
    }
}