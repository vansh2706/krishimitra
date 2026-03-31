import { NextRequest, NextResponse } from 'next/server';
import { predictCropYield, predictPestOutbreaks, generateIrrigationSchedule } from '@/services/external';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case 'predictYield':
                const yieldResult = await predictCropYield(data);
                return NextResponse.json(yieldResult);

            case 'predictPests':
                const pestResult = await predictPestOutbreaks(data);
                return NextResponse.json(pestResult);

            case 'generateIrrigation':
                const irrigationResult = await generateIrrigationSchedule(data);
                return NextResponse.json(irrigationResult);

            default:
                return NextResponse.json(
                    { error: 'Invalid action specified' },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('Predictive Analytics API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Predictive Analytics API service',
        actions: ['predictYield', 'predictPests', 'generateIrrigation'],
        timestamp: new Date().toISOString()
    });
}