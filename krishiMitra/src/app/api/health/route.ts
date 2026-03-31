import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'KrishiMitra Health Check',
        version: '1.0.0'
    })
}

export async function POST() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'KrishiMitra Health Check',
        version: '1.0.0'
    })
}

export async function HEAD(request: NextRequest) {
    return new NextResponse(null, { status: 200 })
}