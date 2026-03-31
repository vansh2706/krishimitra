import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Only allow server-side access
        if (!process.env.DEEPSEEK_API_KEY) {
            return NextResponse.json(
                { error: 'DeepSeek API key not configured on server' },
                { status: 500 }
            )
        }

        const body = await request.json()
        const { messages, model, temperature, maxTokens } = body

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            )
        }

        // Call DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: model || 'deepseek-chat',
                messages: messages,
                temperature: temperature || 0.7,
                max_tokens: maxTokens || 1500,
            }),
        })

        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid DeepSeek API key configured on server' },
                    { status: 500 }
                )
            } else if (response.status === 404) {
                return NextResponse.json(
                    { error: 'DeepSeek model not found' },
                    { status: 404 }
                )
            } else if (response.status === 429) {
                return NextResponse.json(
                    {
                        error: 'DeepSeek rate limit exceeded',
                        message: 'You have exceeded your current quota. Please check your plan and billing details.'
                    },
                    { status: 429 }
                )
            }

            const errorText = await response.text();
            console.error('DeepSeek API Error:', errorText);

            return NextResponse.json(
                { error: `DeepSeek API error: ${errorText}` },
                { status: response.status }
            )
        }

        const data = await response.json()

        return NextResponse.json({
            choices: [{
                message: {
                    content: data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
                }
            }],
            citations: [
                'https://krishi.mit.gov.in/',
                'https://www.icar.org.in/',
                'https://agricoop.nic.in/'
            ]
        })

    } catch (error: any) {
        console.error('DeepSeek API Error:', error)

        return NextResponse.json(
            { error: 'Failed to generate response from DeepSeek API: ' + error.message },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'DeepSeek API proxy service',
        timestamp: new Date().toISOString()
    })
}