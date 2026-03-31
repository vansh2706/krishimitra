import { NextRequest } from 'next/server';
import { analyzeSoil } from '@/services/external/soilService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Soil data is required'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Analyze soil data
        const result = await analyzeSoil(body);

        if (!result.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: result.error || 'Soil analysis failed'
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                data: result.data
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Soil analysis API error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Health check endpoint
export async function GET() {
    return new Response(
        JSON.stringify({
            success: true,
            message: 'Soil analysis API is running'
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}