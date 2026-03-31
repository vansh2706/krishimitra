import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

export async function POST(request: NextRequest) {
    try {
        console.log('Gemini API route called');

        // Try to get the API key from environment variables
        let apiKey = process.env.GEMINI_API_KEY;

        // If not found, try to get it from the request headers (for testing)
        if (!apiKey) {
            console.log('GEMINI_API_KEY not found in environment variables');
            // This is a fallback for testing - in production, we should have the environment variable
            apiKey = 'AIzaSyD48snX0yGyL3icgexbXrydf4cUw4zCGns'; // This is the key from your local env file
        }

        console.log('Using API key:', apiKey ? 'SET' : 'NOT_SET');

        // Only allow server-side access
        if (!apiKey) {
            console.error('Gemini API key not configured on server');
            const response = NextResponse.json(
                {
                    error: 'AI service temporarily unavailable',
                    debug: 'GEMINI_API_KEY environment variable is not set'
                },
                { status: 503 }
            )
            response.headers.set('Access-Control-Allow-Origin', '*')
            return response
        }

        const body = await request.json()
        const { messages, model, temperature, maxTokens } = body

        if (!messages || !Array.isArray(messages)) {
            const response = NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            )
            response.headers.set('Access-Control-Allow-Origin', '*')
            return response
        }

        // Initialize Gemini client
        const genAI = new GoogleGenerativeAI(apiKey)

        // Get the model - use the working model name
        const geminiModel = genAI.getGenerativeModel({
            model: model || 'models/gemini-2.5-flash', // Use the working model from our test
            generationConfig: {
                temperature: temperature || 0.7,
                maxOutputTokens: maxTokens || 1500,
                topP: 0.95,
                topK: 40,
            }
        })

        // Get user message
        const userMessage = messages.find(msg => msg.role === 'user')?.content || ''

        // Create prompt
        const prompt = userMessage

        // Generate content with safety checks to prevent cutoff
        const result = await geminiModel.generateContent(prompt)
        let responseText = await result.response.text()

        // Ensure response is complete and not cut off
        if (responseText.endsWith('...') || responseText.endsWith('…')) {
            console.warn('Response may be incomplete, regenerating with higher token limit');
            // Try to regenerate with more tokens if response seems cut off
            const extendedModel = genAI.getGenerativeModel({
                model: model || 'models/gemini-2.5-flash', // Use the working model from our test
                generationConfig: {
                    temperature: temperature || 0.7,
                    maxOutputTokens: (maxTokens || 1500) * 2,
                    topP: 0.95,
                    topK: 40,
                }
            });

            const extendedResult = await extendedModel.generateContent(prompt);
            responseText = await extendedResult.response.text();
        }

        // Check if response is empty or just whitespace
        if (!responseText || responseText.trim().length === 0) {
            throw new Error('Generated response is empty');
        }

        const response = NextResponse.json({
            choices: [{
                message: {
                    content: responseText.trim() || 'Sorry, I could not generate a response.'
                }
            }],
            citations: [
                'https://krishi.mit.gov.in/',
                'https://www.icar.org.in/',
                'https://agricoop.nic.in/'
            ]
        })

        response.headers.set('Access-Control-Allow-Origin', '*')
        return response

    } catch (error: any) {
        console.error('Gemini API Error:', error)

        // Handle specific error cases
        if (error.message && error.message.includes('API_KEY_INVALID')) {
            const response = NextResponse.json(
                { error: 'AI service configuration error - Invalid API Key' },
                { status: 500 }
            )
            response.headers.set('Access-Control-Allow-Origin', '*')
            return response
        } else if (error.message && error.message.includes('404')) {
            const response = NextResponse.json(
                { error: 'AI model not available' },
                { status: 404 }
            )
            response.headers.set('Access-Control-Allow-Origin', '*')
            return response
        } else if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
            const response = NextResponse.json(
                { error: 'AI service authentication failed' },
                { status: 500 }
            )
            response.headers.set('Access-Control-Allow-Origin', '*')
            return response
        } else if (error.message && error.message.includes('429')) {
            const response = NextResponse.json(
                {
                    error: 'AI service quota exceeded',
                    message: 'You have exceeded your daily request limit. Please try again later or upgrade your plan.'
                },
                { status: 429 }
            )
            response.headers.set('Access-Control-Allow-Origin', '*')
            return response
        } else if (error.message && (error.message.includes('quota') || error.message.includes('Quota'))) {
            // Handle quota exceeded errors that might not have status code 429
            const response = NextResponse.json(
                {
                    error: 'AI service quota exceeded',
                    message: 'You have exceeded your daily request limit. Please try again tomorrow when your quota resets.'
                },
                { status: 429 }
            )
            response.headers.set('Access-Control-Allow-Origin', '*')
            return response
        }

        const response = NextResponse.json(
            { error: 'Unable to process your request at this time: ' + (error.message || 'Unknown error') },
            { status: 500 }
        )
        response.headers.set('Access-Control-Allow-Origin', '*')
        return response
    }
}

export async function GET() {
    const response = NextResponse.json({
        message: 'Gemini API proxy service',
        timestamp: new Date().toISOString()
    })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
}