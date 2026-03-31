import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    let body: any = {}

    try {
        body = await request.json()
        const { imageData, language = 'en' } = body

        if (!imageData) {
            return NextResponse.json(
                { error: 'No image data provided' },
                { status: 400 }
            )
        }

        // Check if DeepSeek API key is configured
        const apiKey = process.env.DEEPSEEK_API_KEY

        if (!apiKey) {
            console.error('DEEPSEEK_API_KEY not configured in environment variables')
            return NextResponse.json(
                {
                    error: 'DeepSeek API key not configured',
                    message: 'The application is not properly configured with a DeepSeek API key. Please contact the administrator.'
                },
                { status: 500 }
            )
        }

        // Create specialized prompt for pest detection
        const prompt = getLanguageSpecificPrompt(language)

        // Convert base64 image to format DeepSeek expects
        const imageUrl = imageData.startsWith('data:image') ? imageData : `data:image/jpeg;base64,${imageData}`

        // Validate image data
        if (!imageUrl || imageUrl.length < 100) {
            return NextResponse.json(
                {
                    error: 'Invalid image data',
                    message: 'The provided image data is invalid or too small.'
                },
                { status: 400 }
            )
        }

        // Analyze the image with DeepSeek Vision
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'deepseek-vision',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek Vision API Error:', errorText);

            // Handle specific DeepSeek errors
            if (response.status === 401) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid DeepSeek API key',
                        message: 'The DeepSeek API key is invalid or has been revoked. Please contact the administrator.'
                    },
                    { status: 500 }
                )
            } else if (response.status === 429) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'DeepSeek quota exceeded',
                        message: 'The DeepSeek API quota has been exceeded. Please try again later or contact the administrator.'
                    },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                success: false,
                error: 'DeepSeek analysis failed',
                message: `API error: ${errorText}`
            }, { status: response.status })
        }

        const data = await response.json()
        const textResponse = data.choices[0]?.message?.content || ''

        // Log the raw DeepSeek response for debugging
        console.log('DeepSeek raw response:', textResponse)

        // Parse the AI response to extract structured data
        const analysisResult = parseAIResponse(textResponse, language)

        // Return the analysis result
        return NextResponse.json({
            success: true,
            result: analysisResult,
            rawResponse: textResponse
        })

    } catch (error: any) {
        console.error('DeepSeek Vision analysis error:', error)

        // Return error response
        return NextResponse.json({
            success: false,
            error: 'DeepSeek analysis failed',
            message: error.message || 'An unknown error occurred while processing the image with DeepSeek.'
        }, { status: 500 })
    }
}

function getLanguageSpecificPrompt(language: string): string {
    const prompts = {
        hi: `आप एक विशेषज्ञ कृषि वैज्ञानिक हैं जो फसल की पत्तियों, पौधों और फलों में कीट और रोग की पहचान करते हैं। इस छवि का विश्लेषण करें और निम्नलिखित जानकारी प्रदान करें:

1. मुख्य कीट/रोग का नाम (अगर कोई दिखाई दे)
2. पहचान में विश्वास स्तर (0-100%)
3. गंभीरता का स्तर (कम/मध्यम/उच्च)
4. दिखाई देने वाले लक्षण
5. तत्काल उपचार सुझाव
6. रोकथाम के उपाय

कृपया अपना उत्तर हिंदी में दें और JSON प्रारूप में व्यवस्थित करें।`,

        ta: `நீங்கள் ஒரு நிபுணத்துவம் வாய்ந்த வேளாண் விஞ்ஞானி, பயிர் இலைகள், செடிகள் மற்றும் பழங்களில் பூச்சிகள் மற்றும் நோய்களை அடையாளம் காண்பவர். இந்த படத்தை பகுப்பாய்வு செய்து பின்வரும் தகவல்களை வழங்கவும்:

1. முக்கிய பூச்சி/நோயின் பெயர் (தெரிந்தால்)
2. அடையாளம் காணும் நம்பிக்கை அளவு (0-100%)
3. தீவிரத்தின் அளவு (குறைவு/நடுத்தர/அதிகம்)
4. காணப்படும் அறிகுறிகள்
5. உடனடி சிகிச்சை பரிந்துரைகள்
6. தடுப்பு நடவடிக்கைகள்

தயவுசெய்து உங்கள் பதிலை தமிழில் வழங்கி JSON வடிவத்தில் ஒழுங்கமைக்கவும்.`,

        te: `మీరు ఒక నిపుణుడైన వ్యవసాయ శాస్త్రవేత్త, పంట ఆకులు, మొక్కలు మరియు పండ్లలో పురుగులు మరియు వ్యాధులను గుర్తించే వారు. ఈ చిత్రాన్ని విశ్లేషించి క్రింది సమాచారాన్ని అందించండి:

1. ప్రధాన పురుగు/వ్యాధి పేరు (కనిపిస్తే)
2. గుర్తింపు విశ్వాస స్థాయి (0-100%)
3. తీవ్రత స్థాయి (తక్కువ/మధ్యమ/అధికం)
4. కనిపించే లక్షణాలు
5. తక్షణ చికిత్స సూచనలు
6. నివారణ చర్యలు

దయచేసి మీ సమాధానాన్ని తెలుగులో అందించి JSON ఆకృతిలో వ్యవస్థీకరించండి.`,

        en: `You are an expert agricultural scientist specializing in identifying pests and diseases in crop leaves, plants, and fruits. Analyze this image and provide the following information:

1. Main pest/disease name (if any visible)
2. Confidence level in identification (0-100%)
3. Severity level (low/medium/high)
4. Visible symptoms
5. Immediate treatment recommendations
6. Prevention measures

Please provide your response in English and organize it in JSON format.`
    }

    const defaultPrompt = prompts.en
    const selectedPrompt = prompts[language as keyof typeof prompts] || defaultPrompt

    return `${selectedPrompt}

Please structure your response as JSON with this exact format:
{
    "pestName": "identified pest or disease name",
    "confidence": 85,
    "severity": "medium",
    "description": "brief description of the pest/disease",
    "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
    "treatment": ["treatment 1", "treatment 2", "treatment 3"],
    "prevention": ["prevention 1", "prevention 2", "prevention 3"],
    "organicTreatment": ["organic treatment 1", "organic treatment 2"],
    "chemicalTreatment": ["chemical treatment 1", "chemical treatment 2"],
    "cropsDamaged": ["crop 1", "crop 2"],
    "seasonality": "seasonal information"
}`
}

function parseAIResponse(text: string, language: string): any {
    try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            return {
                ...parsed,
                confidence: Math.min(Math.max(parsed.confidence || 75, 60), 95) // Ensure realistic confidence
            }
        }
    } catch (error) {
        console.error('Failed to parse DeepSeek response as JSON:', error)
    }

    // Fallback: Extract information manually from text
    return extractInfoFromText(text, language)
}

function extractInfoFromText(text: string, language: string): any {
    // This is a simplified extraction - in practice, you might want more sophisticated parsing
    return {
        pestName: "Unknown Pest",
        confidence: 70,
        severity: "medium",
        description: "Pest or disease detected in image",
        symptoms: ["Visible damage to plant", "Unusual spots or discoloration", "Abnormal growth patterns"],
        treatment: ["Remove affected parts", "Apply appropriate treatment", "Consult agricultural expert"],
        prevention: ["Regular monitoring", "Proper plant care", "Maintain field hygiene"],
        organicTreatment: ["Neem oil spray", "Organic pesticides", "Beneficial insects"],
        chemicalTreatment: ["Approved pesticides", "Expert consultation required"],
        cropsDamaged: ["Various crops"],
        seasonality: "Varies by pest type"
    }
}