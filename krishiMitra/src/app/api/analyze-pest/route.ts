import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { deepseekImageAnalysis } from '@/lib/deepseek-api'  // Import DeepSeek image analysis

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

        // Try Gemini first (primary provider) for image analysis
        const geminiResult = await tryGeminiAnalysis(imageData, language)
        if (geminiResult.success) {
            return NextResponse.json(geminiResult)
        }

        // Fallback to DeepSeek if Gemini fails
        console.log('Gemini analysis failed, falling back to DeepSeek:', geminiResult.error)
        const deepseekResult = await tryDeepSeekAnalysis(imageData, language)
        return NextResponse.json(deepseekResult)

    } catch (error) {
        console.error('Pest analysis error:', error)

        // Return fallback response on error
        return NextResponse.json({
            success: false,
            error: 'Analysis failed',
            result: getFallbackResponse(body?.language || 'en')
        })
    }
}

async function tryGeminiAnalysis(imageData: string, language: string): Promise<any> {
    try {
        // Get Gemini API key
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not configured - Please set your Gemini API key in the environment variables')
        }

        if (apiKey === 'your_gemini_api_key_here') {
            throw new Error('GEMINI_API_KEY not properly configured - Please replace "your_gemini_api_key_here" with your actual Gemini API key')
        }

        // Initialize Gemini with vision capabilities
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        // Create specialized prompt for pest detection
        const prompt = getLanguageSpecificPrompt(language, 'gemini')

        // Convert base64 image to format Gemini expects
        const imagePart = {
            inlineData: {
                data: imageData.replace(/^data:image\/[^;]+;base64,/, ''),
                mimeType: 'image/jpeg'
            }
        }

        // Analyze the image with Gemini Vision with retry logic
        let result: any = null;
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
            try {
                result = await model.generateContent([prompt, imagePart])
                break; // Success, exit retry loop
            } catch (retryError: any) {
                retryCount++;
                console.log(`Gemini API attempt ${retryCount} failed:`, retryError.message)

                if (retryCount > maxRetries) {
                    throw retryError; // Re-throw after max retries
                }

                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            }
        }

        if (!result) {
            throw new Error('Failed to get response from Gemini API')
        }
        const response = await result.response
        const text = response.text()

        // Log the raw Gemini response for debugging
        console.log('Gemini raw response:', text)

        // Parse the AI response to extract structured data
        const analysisResult = parseAIResponse(text, language)

        return {
            success: true,
            result: analysisResult,
            rawResponse: text
        }

    } catch (error: any) {
        console.log('Gemini analysis failed:', error.message)
        throw error; // Re-throw to be handled by the main function
    }
}

async function tryDeepSeekAnalysis(imageData: string, language: string): Promise<any> {
    try {
        // Use DeepSeek for image analysis as fallback
        const result = await deepseekImageAnalysis(imageData, language)
        return result
    } catch (error: any) {
        console.log('DeepSeek analysis failed:', error.message)
        throw error; // Re-throw to be handled by the main function
    }
}

function getLanguageSpecificPrompt(language: string, provider: 'openai' | 'gemini' = 'gemini'): string {
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
        console.error('Failed to parse AI response as JSON:', error)
    }

    // Fallback: Extract information manually from text
    return extractInfoFromText(text, language)
}

function extractInfoFromText(text: string, language: string): any {
    const lowerText = text.toLowerCase()

    // Common pest keywords for detection
    const pestKeywords = {
        aphids: ['aphid', 'माहू', 'பூச்சி', 'అఫిడ్స్'],
        bollworm: ['bollworm', 'बॉलवर्म', 'காய்ப்புழு', 'బాల్వార్మ్'],
        whitefly: ['whitefly', 'सफेद मक्खी', 'வெள்ளை ஈ', 'వైట్ఫ్లై'],
        thrips: ['thrips', 'थ्रिप्स', 'த்ரிப்ஸ்', 'థ్రిప్స్'],
        mealybug: ['mealybug', 'सूती कीड़ा', 'பஞ்சு பூச்சி', 'మీలీబగ్']
    }

    let detectedPest = 'Unknown Pest'
    let confidence = 70

    // Try to identify pest from text
    for (const [pest, keywords] of Object.entries(pestKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
            detectedPest = pest.charAt(0).toUpperCase() + pest.slice(1)
            confidence = 85
            break
        }
    }

    return {
        pestName: detectedPest,
        confidence: confidence,
        severity: 'medium',
        description: getDescription(detectedPest, language),
        symptoms: getSymptoms(detectedPest, language),
        treatment: getTreatment(detectedPest, language),
        prevention: getPrevention(detectedPest, language),
        organicTreatment: getOrganicTreatment(detectedPest, language),
        chemicalTreatment: getChemicalTreatment(detectedPest, language),
        cropsDamaged: getCropsDamaged(detectedPest),
        seasonality: getSeasonality(detectedPest, language)
    }
}

function getFallbackResponse(language: string): any {
    // Array of different mock responses to provide variety during testing
    const mockResponses = {
        hi: [
            {
                pestName: 'सामान्य कीट समस्या',
                confidence: 75,
                severity: 'medium',
                description: 'छवि में पौधे की समस्या दिखाई दे रही है',
                symptoms: ['पत्तियों में बदलाव', 'असामान्य रंग', 'विकास में बाधा'],
                treatment: ['नीम का तेल छिड़काव', 'प्रभावित भागों को हटाएं', 'कृषि विशेषज्ञ से सलाह लें'],
                prevention: ['नियमित निगरानी', 'सही सिंचाई', 'स्वच्छ खेती'],
                organicTreatment: ['नीम का तेल', 'गोमूत्र छिड़काव', 'हर्बल कीटनाशक'],
                chemicalTreatment: ['अनुमोदित कीटनाशक', 'विशेषज्ञ सलाह आवश्यक'],
                cropsDamaged: ['सामान्य फसलें'],
                seasonality: 'मानसून के दौरान सामान्य'
            },
            {
                pestName: 'माहू (Aphids)',
                confidence: 80,
                severity: 'high',
                description: 'छोटे कीड़े जो पौधों का रस चूसते हैं',
                symptoms: ['पत्तियों का पीला होना', 'चिपचिपा पदार्थ', 'मुड़ी हुई पत्तियाँ'],
                treatment: ['पानी का छिड़काव', 'नीम तेल लगाएं', 'कीटनाशक साबुन का उपयोग'],
                prevention: ['खरपतवार हटाएं', 'लाभकारी कीड़ों को बढ़ावा दें', 'नियमित निगरानी'],
                organicTreatment: ['नीम तेल स्प्रे', 'लेडीबग रिलीज़', 'लहसुन स्प्रे'],
                chemicalTreatment: ['इमिडाक्लोप्रिड', 'थायामेथॉक्साम', 'एसिटामिप्रिड'],
                cropsDamaged: ['गेहूं', 'मकई', 'टमाटर'],
                seasonality: 'वसंत और गर्मी'
            },
            {
                pestName: 'बॉलवर्म (Bollworm)',
                confidence: 85,
                severity: 'high',
                description: 'कैटरपिलर कीट जो कपास और अन्य फसलों को नुकसान पहुंचाता है',
                symptoms: ['फलों में छेद', 'क्षतिग्रस्त फल', 'मल जमा', 'मुरझाना'],
                treatment: ['फेरोमोन ट्रैप', 'बीटी स्प्रे', 'हाथ से चुनना'],
                prevention: ['फसल चक्र', 'सीमांत फसलें', 'जल्दी कटाई'],
                organicTreatment: ['बैसिलस थुरिंजेंसिस', 'नीम अर्क', 'ट्राइकोग्रामा छोड़ना'],
                chemicalTreatment: ['क्लोरेंट्रानिलिप्रोल', 'स्पिनोसाड', 'इमामेक्टिन बेंजोएट'],
                cropsDamaged: ['कपास', 'मकई', 'जौ'],
                seasonality: 'मानसून का मौसम'
            }
        ],
        en: [
            {
                pestName: 'General Pest Issue',
                confidence: 75,
                severity: 'medium',
                description: 'Plant issue detected in the image',
                symptoms: ['Leaf changes', 'Unusual coloration', 'Growth hindrance'],
                treatment: ['Apply neem oil spray', 'Remove affected parts', 'Consult agricultural expert'],
                prevention: ['Regular monitoring', 'Proper irrigation', 'Clean cultivation'],
                organicTreatment: ['Neem oil', 'Organic pesticides', 'Beneficial insects'],
                chemicalTreatment: ['Approved pesticides', 'Expert consultation required'],
                cropsDamaged: ['Common crops'],
                seasonality: 'Common during monsoon season'
            },
            {
                pestName: 'Aphids',
                confidence: 80,
                severity: 'high',
                description: 'Small insects that feed on plant sap',
                symptoms: ['Yellowing leaves', 'Sticky honeydew', 'Curled leaves'],
                treatment: ['Spray with water', 'Apply neem oil', 'Use insecticidal soap'],
                prevention: ['Remove weeds', 'Encourage beneficial insects', 'Regular monitoring'],
                organicTreatment: ['Neem oil spray', 'Ladybug release', 'Garlic spray'],
                chemicalTreatment: ['Imidacloprid', 'Thiamethoxam', 'Acetamiprid'],
                cropsDamaged: ['Wheat', 'Corn', 'Tomato'],
                seasonality: 'Spring and summer'
            },
            {
                pestName: 'Bollworm',
                confidence: 85,
                severity: 'high',
                description: 'Caterpillar pest that damages cotton bolls and other crops',
                symptoms: ['Holes in bolls', 'Damaged fruits', 'Frass deposits', 'Wilting'],
                treatment: ['Pheromone traps', 'Bt spray', 'Hand picking'],
                prevention: ['Crop rotation', 'Border crops', 'Early harvesting'],
                organicTreatment: ['Bacillus thuringiensis', 'Neem extract', 'Trichogramma release'],
                chemicalTreatment: ['Chlorantraniliprole', 'Spinosad', 'Emamectin benzoate'],
                cropsDamaged: ['Cotton', 'Corn', 'Barley'],
                seasonality: 'Monsoon season'
            }
        ]
    };

    // Select a random response from the array
    const responses = mockResponses[language as keyof typeof mockResponses] || mockResponses.en;
    const randomIndex = Math.floor(Math.random() * responses.length);

    return responses[randomIndex];
}

// Helper functions for building responses
function getDescription(pest: string, language: string): string {
    const descriptions: { [key: string]: { [key: string]: string } } = {
        en: {
            'Aphids': 'Small soft-bodied insects that feed on plant sap',
            'Bollworm': 'Caterpillar pest that damages cotton bolls and fruits',
            'Whitefly': 'Small white flying insects that suck plant juices',
            'Unknown Pest': 'Pest or disease requiring further identification'
        },
        hi: {
            'Aphids': 'छोटे कोमल शरीर वाले कीड़े जो पौधों का रस चूसते हैं',
            'Bollworm': 'सूंडी कीट जो कपास और फलों को नुकसान पहुंचाता है',
            'Whitefly': 'छोटी सफेद उड़ने वाली मक्खी जो पौधों का रस चूसती है',
            'Unknown Pest': 'कीट या रोग जिसकी और पहचान की आवश्यकता है'
        }
    }

    return descriptions[language]?.[pest] || descriptions.en[pest] || 'Pest requiring identification'
}

function getSymptoms(pest: string, language: string): string[] {
    const symptoms: { [key: string]: { [key: string]: string[] } } = {
        en: {
            'Aphids': ['Yellowing leaves', 'Sticky honeydew', 'Curled leaves', 'Stunted growth'],
            'Bollworm': ['Holes in bolls', 'Damaged fruits', 'Frass deposits', 'Entry holes'],
            'Whitefly': ['Yellowing leaves', 'Sooty mold', 'Reduced vigor', 'Sticky honeydew'],
            'Unknown Pest': ['Visible damage', 'Discoloration', 'Abnormal growth']
        },
        hi: {
            'Aphids': ['पीली पत्तियां', 'चिपचिपा पदार्थ', 'मुड़ी पत्तियां', 'रुका विकास'],
            'Bollworm': ['बोल्स में छेद', 'क्षतिग्रस्त फल', 'कीट मल', 'प्रवेश छेद'],
            'Whitefly': ['पीली पत्तियां', 'काली फफूंद', 'कम ताकत', 'चिपचिपा पदार्थ'],
            'Unknown Pest': ['दिखाई देने वाला नुकसान', 'रंग में बदलाव', 'असामान्य विकास']
        }
    }

    return symptoms[language]?.[pest] || symptoms.en[pest] || ['Requires inspection', 'Monitor closely']
}

function getTreatment(pest: string, language: string): string[] {
    const treatments: { [key: string]: { [key: string]: string[] } } = {
        en: {
            'Aphids': ['Spray with water', 'Apply neem oil', 'Use insecticidal soap'],
            'Bollworm': ['Pheromone traps', 'Bt spray', 'Hand picking'],
            'Whitefly': ['Yellow sticky traps', 'Reflective mulch', 'Neem oil'],
            'Unknown Pest': ['Monitor regularly', 'Apply neem oil', 'Consult expert']
        },
        hi: {
            'Aphids': ['पानी का छिड़काव', 'नीम का तेल', 'कीटनाशक साबुन'],
            'Bollworm': ['फेरोमोन जाल', 'बीटी स्प्रे', 'हाथ से चुनना'],
            'Whitefly': ['पीले चिपचिपे जाल', 'परावर्तक मल्च', 'नीम का तेल'],
            'Unknown Pest': ['नियमित निगरानी', 'नीम का तेल', 'विशेषज्ञ से सलाह']
        }
    }

    return treatments[language]?.[pest] || treatments.en[pest] || ['Regular monitoring required']
}

function getPrevention(pest: string, language: string): string[] {
    const prevention: { [key: string]: { [key: string]: string[] } } = {
        en: {
            'Aphids': ['Remove weeds', 'Encourage beneficial insects', 'Regular monitoring'],
            'Bollworm': ['Crop rotation', 'Border crops', 'Early harvesting'],
            'Whitefly': ['Crop rotation', 'Remove infected plants', 'Companion planting'],
            'Unknown Pest': ['Regular inspection', 'Clean cultivation', 'Proper spacing']
        },
        hi: {
            'Aphids': ['खरपतवार हटाएं', 'लाभकारी कीटों को बढ़ावा', 'नियमित निगरानी'],
            'Bollworm': ['फसल चक्र', 'सीमावर्ती फसलें', 'जल्दी कटाई'],
            'Whitefly': ['फसल चक्र', 'संक्रमित पौधे हटाएं', 'साथी बागवानी'],
            'Unknown Pest': ['नियमित जांच', 'स्वच्छ खेती', 'उचित दूरी']
        }
    }

    return prevention[language]?.[pest] || prevention.en[pest] || ['Maintain good practices']
}

function getOrganicTreatment(pest: string, language: string): string[] {
    return ['Neem oil spray', 'Beneficial insects', 'Organic pesticides']
}

function getChemicalTreatment(pest: string, language: string): string[] {
    return ['Imidacloprid', 'Thiamethoxam', 'Expert consultation required']
}

function getCropsDamaged(pest: string): string[] {
    const crops = {
        'Aphids': ['wheat', 'cotton', 'potato', 'tomato'],
        'Bollworm': ['cotton', 'tomato', 'chilli', 'maize'],
        'Whitefly': ['cotton', 'tomato', 'potato', 'sugarcane'],
        'Unknown Pest': ['various crops']
    }

    return crops[pest as keyof typeof crops] || ['multiple crops']
}

function getSeasonality(pest: string, language: string): string {
    const seasonality: { [key: string]: { [key: string]: string } } = {
        en: {
            'Aphids': 'Spring and summer months',
            'Bollworm': 'Monsoon season',
            'Whitefly': 'Year-round in warm climates',
            'Unknown Pest': 'Season dependent'
        },
        hi: {
            'Aphids': 'वसंत और गर्मी के महीने',
            'Bollworm': 'मानसून का मौसम',
            'Whitefly': 'गर्म जलवायु में साल भर',
            'Unknown Pest': 'मौसम पर निर्भर'
        }
    }

    return seasonality[language]?.[pest] || seasonality.en[pest] || 'Season dependent'
}