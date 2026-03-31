import { NextResponse } from 'next/server'
import { geminiChat, type ChatMessage } from '@/lib/gemini-api'      // Make Gemini the primary provider
import { deepseekChat } from '@/lib/deepseek-api'  // Make DeepSeek the fallback provider

export async function POST(req: Request) {
    try {
        const { query, language = 'en' } = await req.json()

        // Agricultural context injection
        const agriPrompt = `
            You are KrishiMitra, an AI farming assistant. 
            Respond to this query in the context of agriculture and farming:
            "${query}"
            
            Requirements:
            1. Only provide farming/agriculture-related information
            2. Use simple language suitable for farmers
            3. Include practical, actionable advice
            4. Consider sustainable farming practices
            5. Focus on local agricultural conditions
            6. Keep responses clear and concise
            
            Response language: ${language}
        `

        const chatMessages: ChatMessage[] = [
            {
                role: 'system',
                content: getAgriculturalSystemPrompt(language)
            },
            {
                role: 'user',
                content: agriPrompt
            }
        ]

        // Use Gemini as the primary AI provider
        try {
            console.log('Attempting to use Gemini as primary provider')
            const response = await geminiChat(chatMessages)

            const content = response || 'Sorry, I could not generate a response.'

            if (content === 'Sorry, I could not generate a response.') {
                throw new Error('Gemini returned empty response')
            }

            console.log('Gemini response successful')
            return NextResponse.json({
                success: true,
                response: content
            })
        } catch (geminiError: any) {
            console.error('Gemini API Error, falling back to DeepSeek:', geminiError)

            // Fallback to DeepSeek
            try {
                console.log('Attempting to use DeepSeek as fallback provider')
                const response = await deepseekChat(chatMessages)

                const content = response || 'Sorry, I could not generate a response.'

                if (content === 'Sorry, I could not generate a response.') {
                    throw new Error('DeepSeek returned empty response')
                }

                console.log('DeepSeek response successful')
                return NextResponse.json({
                    success: true,
                    response: content
                })
            } catch (deepseekError: any) {
                console.error('DeepSeek API Error:', deepseekError)
                throw deepseekError
            }
        }

    } catch (error: any) {
        console.error('Agricultural AI Error:', error)
        return NextResponse.json({
            success: false,
            error: 'Could not process agricultural query: ' + (error.message || 'Unknown error')
        }, { status: 500 })
    }
}

function getAgriculturalSystemPrompt(language: string): string {
    const prompts = {
        hi: `आप एक विशेषज्ञ कृषि सलाहकार हैं जो भारतीय किसानों की मदद करते हैं। आपको फसलों, मिट्टी, सिंचाई, कीट नियंत्रण, और आधुनिक कृषि तकनीकों के बारे में व्यापक जानकारी है। हमेशा:

1. व्यावहारिक और लागू करने योग्य सलाह दें
2. स्थानीय परिस्थितियों को ध्यान में रखें
3. पारंपरिक और आधुनिक दोनों तरीकों का सुझाव दें
4. सुरक्षा और पर्यावरण के अनुकूल तरीकों को प्राथमिकता दें
5. हिंदी में स्पष्ट और समझने योग्य भाषा का उपयोग करें

किसान के सवालों का विस्तृत, संरचित जवाब दें।`,

        en: `You are an expert agricultural advisor helping Indian farmers. You have comprehensive knowledge about crops, soil, irrigation, pest control, and modern farming techniques. Always:

1. Provide practical and actionable advice
2. Consider local conditions and climate
3. Suggest both traditional and modern approaches
4. Prioritize safe and environmentally friendly methods
5. Structure responses clearly with numbered points
6. Include specific measurements, timings, and techniques
7. Mention relevant government schemes or subsidies when applicable

Provide detailed, well-structured answers to farmers' questions.`
    }

    return prompts[language as keyof typeof prompts] || prompts.en
}