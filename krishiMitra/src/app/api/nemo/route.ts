import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Only allow server-side access
        if (!process.env.NVIDIA_API_KEY) {
            return NextResponse.json(
                { error: 'OpenRouter API key not configured on server' },
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

        // Call OpenRouter API (using NVIDIA NeMo model through OpenRouter)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'accept': 'application/json',
                'HTTP-Referer': 'http://localhost:3000', // For openrouter tracking
                'X-Title': 'KrishiMitra', // For openrouter tracking
            },
            body: JSON.stringify({
                model: model || 'nvidia/nemotron-4-340b-instruct',
                messages: messages,
                temperature: temperature || 0.7,
                max_tokens: maxTokens || 1500,
            }),
        })

        if (!response.ok) {
            // Handle specific error cases
            // Get response text once
            const errorText = await response.text();
            console.log('OpenRouter API Error Response:', errorText);
            console.log('OpenRouter API Error Status:', response.status);

            if (response.status === 401) {
                console.error('OpenRouter API 401 Error:', errorText);
                return NextResponse.json(
                    {
                        error: 'Invalid OpenRouter API key configured on server',
                        details: errorText,
                        status: response.status
                    },
                    { status: 500 }
                )
            } else if (response.status === 404) {
                console.error('OpenRouter API 404 Error:', errorText);
                return NextResponse.json(
                    {
                        error: 'OpenRouter model not found',
                        details: errorText,
                        status: response.status
                    },
                    { status: 404 }
                )
            } else if (response.status === 429) {
                return NextResponse.json(
                    {
                        error: 'OpenRouter rate limit exceeded',
                        message: 'You have exceeded your current quota. Please check your plan and billing details.',
                        status: response.status
                    },
                    { status: 429 }
                )
            }

            console.error('OpenRouter API Error:', errorText);

            return NextResponse.json(
                {
                    error: `OpenRouter API error: ${response.status} ${response.statusText}`,
                    details: errorText,
                    status: response.status
                },
                { status: response.status }
            )
        }

        // Try to get the response text first for debugging
        const responseText = await response.text();
        console.log('OpenRouter API Raw Response:', responseText);
        console.log('OpenRouter API Response Status:', response.status);
        // Log headers safely
        const headersObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            headersObj[key] = value;
        });
        console.log('OpenRouter API Response Headers:', headersObj);

        // Try to parse the JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Raw response:', responseText);
            return NextResponse.json(
                {
                    error: 'Failed to parse response from OpenRouter API',
                    rawResponse: responseText,
                    parseError: (parseError as Error).message
                },
                { status: 500 }
            );
        }

        // Log the response for debugging
        console.log('OpenRouter API Response:', JSON.stringify(data, null, 2))

        return NextResponse.json({
            choices: [{
                message: {
                    content: data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content || 'Sorry, I could not generate a response.' : 'Sorry, I could not generate a response.'
                }
            }],
            citations: [
                'https://krishi.mit.gov.in/',
                'https://www.icar.org.in/',
                'https://agricoop.nic.in/'
            ]
        })

    } catch (error: any) {
        console.error('OpenRouter API Error:', error)

        // If it's a JSON parsing error, try to get the raw response
        if (error instanceof SyntaxError) {
            console.error('JSON Parsing Error - This might indicate an issue with the API response format')
            return NextResponse.json(
                { error: 'Failed to parse response from OpenRouter API. This might indicate an authentication issue or invalid API key.' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to generate response from OpenRouter API: ' + error.message },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'OpenRouter API proxy service (NVIDIA NeMo model)',
        timestamp: new Date().toISOString()
    })
}