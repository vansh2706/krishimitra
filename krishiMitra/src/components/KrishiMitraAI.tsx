import { useState, useCallback, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sprout, Share2, Volume2, Mic, MicOff } from 'lucide-react'
import { copyToClipboard, selectAllAndCopy } from '@/utils/copyUtils'

// TypeScript declarations for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface SpeechRecognitionError extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
    emma?: Document;
}

interface VoiceState {
    isListening: boolean;
    error: string | null;
    supported: boolean;
}

interface TopicMapping {
    keywords: string[];
    agricultureContext: string;
    examples: string[];
}

const TOPIC_MAPPINGS: Record<string, TopicMapping> = {
    irrigation: {
        keywords: ['water', 'irrigation', 'drip', 'sprinkler', 'moisture', 'watering'],
        agricultureContext: 'water management and irrigation systems',
        examples: [
            'Drip irrigation setup',
            'Water conservation methods',
            'Irrigation scheduling',
            'Smart watering systems',
            'Rainwater harvesting',
            'Soil moisture monitoring',
            'Water-efficient farming',
            'Micro-irrigation techniques'
        ]
    },
    soilHealth: {
        keywords: ['soil', 'fertility', 'nutrient', 'organic', 'compost', 'fertilizer'],
        agricultureContext: 'soil health and fertility management',
        examples: [
            'Soil testing methods',
            'Organic fertilizers',
            'Composting techniques',
            'Nutrient management',
            'Soil pH balancing',
            'Cover cropping',
            'Natural amendments',
            'Soil conservation'
        ]
    },
    marketing: {
        keywords: ['market', 'price', 'sell', 'trade', 'export', 'retail', 'wholesale'],
        agricultureContext: 'agricultural marketing and sales',
        examples: [
            'Direct farm marketing',
            'Online crop selling',
            'Market price analysis',
            'Supply chain optimization',
            'Export opportunities',
            'Value addition',
            'Storage solutions',
            'Transportation logistics'
        ]
    },
    cropProtection: {
        keywords: ['disease', 'pest', 'protection', 'spray', 'treatment', 'prevention'],
        agricultureContext: 'crop protection and disease management',
        examples: [
            'Integrated pest management',
            'Disease identification',
            'Organic pest control',
            'Chemical safety',
            'Preventive measures',
            'Biological control',
            'Plant quarantine',
            'Disease resistance'
        ]
    },
    technology: {
        keywords: ['computer', 'internet', 'digital', 'software', 'app', 'mobile', 'tech', 'ai', 'robot', 'automation'],
        agricultureContext: 'precision agriculture and smart farming',
        examples: [
            'IoT sensors for soil monitoring',
            'Drone-based crop surveillance',
            'Smart irrigation systems',
            'Farm management apps',
            'Weather prediction technology',
            'AI-powered pest detection',
            'Automated harvesting systems',
            'Blockchain for supply chain'
        ]
    },
    health: {
        keywords: ['medical', 'disease', 'wellness', 'fitness', 'health', 'nutrition', 'diet', 'exercise', 'medicine'],
        agricultureContext: 'organic farming and food safety',
        examples: [
            'Organic farming practices',
            'Natural pest control methods',
            'Nutritional value of crops',
            'Food safety in agriculture',
            'Sustainable farming for better health',
            'Biofortified crop varieties',
            'Chemical-free farming',
            'Farm-to-table nutrition'
        ]
    },
    education: {
        keywords: ['study', 'school', 'college', 'learning', 'training', 'course', 'workshop', 'degree', 'skill'],
        agricultureContext: 'agricultural education and farmer training',
        examples: [
            'Farmer training programs',
            'Agricultural extension services',
            'Crop management workshops',
            'Sustainable farming practices',
            'Modern farming techniques',
            'Digital literacy for farmers',
            'Agricultural research programs',
            'Community farming education'
        ]
    },
    business: {
        keywords: ['money', 'profit', 'market', 'business', 'sell', 'buy', 'trade', 'price', 'investment'],
        agricultureContext: 'agribusiness and farm economics',
        examples: [
            'Agricultural marketing strategies',
            'Farm business management',
            'Crop pricing and markets',
            'Supply chain optimization',
            'Farm financial planning',
            'Agricultural exports',
            'Value-added farming',
            'Cooperative farming models'
        ]
    },
    climate: {
        keywords: ['weather', 'climate', 'rain', 'temperature', 'season', 'environment', 'sustainable', 'green'],
        agricultureContext: 'climate-smart agriculture',
        examples: [
            'Climate-resilient farming',
            'Weather-based crop planning',
            'Drought management',
            'Sustainable irrigation',
            'Carbon farming practices',
            'Climate adaptation strategies',
            'Greenhouse farming',
            'Rain water harvesting'
        ]
    },
    social: {
        keywords: ['community', 'social', 'people', 'culture', 'tradition', 'festival', 'family', 'society'],
        agricultureContext: 'community farming and agricultural traditions',
        examples: [
            'Community supported agriculture',
            'Traditional farming methods',
            'Farmer cooperatives',
            'Agricultural festivals',
            'Rural community development',
            'Family farming practices',
            'Indigenous agricultural knowledge',
            'Farm tourism'
        ]
    },
    research: {
        keywords: ['research', 'science', 'study', 'experiment', 'innovation', 'development', 'laboratory'],
        agricultureContext: 'agricultural research and innovation',
        examples: [
            'Crop breeding research',
            'Soil science studies',
            'Agricultural biotechnology',
            'Pest resistance research',
            'Yield improvement studies',
            'Sustainable farming research',
            'Agricultural genomics',
            'Farm technology innovation'
        ]
    },
    governmentSchemes: {
        keywords: ['scheme', 'subsidy', 'government', 'policy', 'loan', 'support', 'yojana', 'program'],
        agricultureContext: 'agricultural government schemes and subsidies',
        examples: [
            'PM Kisan Yojana',
            'Crop insurance schemes',
            'Agricultural loans',
            'Subsidy programs',
            'Equipment subsidies',
            'Irrigation schemes',
            'Storage facility schemes',
            'Organic farming incentives'
        ]
    },
    organicFarming: {
        keywords: ['organic', 'natural', 'bio', 'chemical-free', 'traditional', 'eco-friendly'],
        agricultureContext: 'organic and natural farming methods',
        examples: [
            'Natural pest control',
            'Organic certification',
            'Bio-fertilizers',
            'Traditional methods',
            'Crop rotation planning',
            'Organic market premium',
            'Natural composting',
            'Zero-budget farming'
        ]
    },
    weatherAdaptation: {
        keywords: ['weather', 'climate', 'adaptation', 'monsoon', 'drought', 'rainfall', 'temperature'],
        agricultureContext: 'weather-adaptive farming techniques',
        examples: [
            'Monsoon preparation',
            'Drought-resistant crops',
            'Rain forecasting',
            'Climate-smart agriculture',
            'Protected cultivation',
            'Water conservation',
            'Heat stress management',
            'Flood preparation'
        ]
    },
    cropDiversification: {
        keywords: ['diversification', 'mixed', 'intercrop', 'variety', 'alternative', 'rotation'],
        agricultureContext: 'crop diversification and planning',
        examples: [
            'Mixed cropping systems',
            'Seasonal planning',
            'Alternative crops',
            'High-value crops',
            'Intercropping benefits',
            'Crop rotation cycles',
            'Risk management',
            'Market demand crops'
        ]
    },
    valueAddition: {
        keywords: ['processing', 'value', 'product', 'storage', 'packaging', 'market'],
        agricultureContext: 'agricultural value addition and processing',
        examples: [
            'Post-harvest processing',
            'Product packaging',
            'Storage solutions',
            'Market linkages',
            'Food processing',
            'Quality standards',
            'Export preparation',
            'Brand development'
        ]
    }
}

// Helper functions for context-aware responses
const getCurrentSeason = (): string => {
    const month = new Date().getMonth()
    // Indian agricultural seasons
    if (month >= 6 && month <= 9) return 'Kharif (Monsoon)'
    if (month >= 10 || month <= 1) return 'Rabi (Winter)'
    return 'Zaid (Summer)'
}

const getTimeOfDay = (): string => {
    const hour = new Date().getHours()
    if (hour < 6) return 'Night'
    if (hour < 12) return 'Morning'
    if (hour < 17) return 'Afternoon'
    if (hour < 20) return 'Evening'
    return 'Night'
}

interface FormattedResponse {
    text: string;
    recommendations?: string[];
    warnings?: string[];
    relatedTopics?: string[];
    timestamp: number;
}

interface QueryHistoryItem {
    query: string;
    response: FormattedResponse;
    timestamp: number;
}

export function KrishiMitraAI() {
    const { t, language } = useLanguage()
    const [query, setQuery] = useState('')
    const [response, setResponse] = useState<FormattedResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [voiceState, setVoiceState] = useState<VoiceState>({
        isListening: false,
        error: null,
        supported: typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    })
    const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('krishimitra_history')
            return saved ? JSON.parse(saved) : []
        }
        return []
    })
    const [responseContext, setResponseContext] = useState({
        season: getCurrentSeason(),
        timeOfDay: getTimeOfDay()
    })

    // Voice recognition setup
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && voiceState.supported) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.lang = language;
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;

            recognitionInstance.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                handleSubmit(new Event('submit') as any);
            };

            recognitionInstance.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setVoiceState(prev => ({
                    ...prev,
                    error: event.error,
                    isListening: false
                }));
            };

            recognitionInstance.onend = () => {
                setVoiceState(prev => ({
                    ...prev,
                    isListening: false
                }));
            };

            setRecognition(recognitionInstance);
        }
    }, [language]);    // Voice synthesis setup
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;
            window.speechSynthesis.speak(utterance);
        }
    };

    const detectTopicContext = (input: string): string => {
        const lowercaseInput = input.toLowerCase()

        for (const [category, mapping] of Object.entries(TOPIC_MAPPINGS)) {
            if (mapping.keywords.some(keyword => lowercaseInput.includes(keyword))) {
                return category
            }
        }

        return 'general'
    }

    const generateAgricultureResponse = async (userQuery: string) => {
        const topic = detectTopicContext(userQuery)
        const mapping = TOPIC_MAPPINGS[topic]
        const currentSeason = getCurrentSeason()
        const timeOfDay = getTimeOfDay()

        let contextPrompt = ''
        if (mapping) {
            contextPrompt = `
                Context: ${mapping.agricultureContext}
                Relevant Agricultural Topics: ${mapping.examples.join('; ')}
                Current Season: ${currentSeason}
                Time of Day: ${timeOfDay}
            `
        }

        // Construct agricultural focused prompt with enhanced context
        const prompt = `
            You are KrishiMitra, a specialized agricultural AI assistant.
            ${contextPrompt}
            
            Farmer Query: "${userQuery}"
            
            Response Requirements:
            1. Agricultural Focus:
               - Transform any non-farming topic into relevant agricultural advice
               - Link all responses to farming practices or rural development
               - Include specific crop or livestock examples when relevant
            
            2. Practical Application:
               - Provide actionable, step-by-step advice
               - Include traditional and modern farming methods
               - Suggest locally applicable solutions
               - Consider seasonal and weather factors
            
            3. Language and Format:
               - Use simple, farmer-friendly language
               - Avoid technical jargon unless necessary
               - Include local agricultural terms when possible
               - Structure response with clear sections
            
            4. Sustainability & Economics:
               - Emphasize sustainable farming practices
               - Include cost-effective solutions
               - Mention potential economic benefits
               - Consider resource efficiency
            
            5. Safety & Best Practices:
               - Include relevant safety precautions
               - Mention proper tool/chemical handling if applicable
               - Reference standard agricultural practices
               - Suggest expert consultation when needed

            Response Language: ${language}
            Format: Clear, concise paragraphs with practical examples
        `

        try {
            const response = await fetch('/api/agriculture-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: prompt,
                    language
                })
            })

            const data = await response.json()
            if (!data.success) {
                throw new Error(data.error)
            }

            return data.response
        } catch (error) {
            console.error('Error generating response:', error)
            return 'I apologize, but I can only provide farming-related assistance. How can I help you with your agricultural needs?'
        }
    }

    // Save to local storage
    const saveToHistory = (item: QueryHistoryItem) => {
        const updatedHistory = [item, ...queryHistory].slice(0, 10) // Keep last 10 queries
        setQueryHistory(updatedHistory)
        if (typeof window !== 'undefined') {
            localStorage.setItem('krishimitra_history', JSON.stringify(updatedHistory))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const agricultureResponse = await generateAgricultureResponse(query)
            const formattedResponse: FormattedResponse = {
                text: agricultureResponse,
                recommendations: [],
                warnings: [],
                relatedTopics: Object.values(TOPIC_MAPPINGS)
                    .flatMap(mapping => mapping.examples)
                    .slice(0, 5),
                timestamp: Date.now()
            }
            setResponse(formattedResponse)

            // Save to history
            saveToHistory({
                query,
                response: formattedResponse,
                timestamp: Date.now()
            })

            // Speak response if in voice mode
            if (voiceState.isListening) {
                speak(formattedResponse.text)
            }
        } catch (error) {
            const errorResponse: FormattedResponse = {
                text: 'I can only assist with farming-related questions. How can I help you with agriculture?',
                timestamp: Date.now()
            }
            setResponse(errorResponse)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-green-600" />
                    {t('krishiMitraAI')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Context Display */}
                <div className="flex gap-2 text-sm text-gray-600">
                    <span className="flex items-center">
                        <span className="font-medium mr-1">{t('season')}:</span>
                        {responseContext.season}
                    </span>
                    <span className="flex items-center">
                        <span className="font-medium mr-1">{t('timeOfDay')}:</span>
                        {responseContext.timeOfDay}
                    </span>
                </div>

                {/* Query Input Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('askAboutFarming')}
                            className="flex-1 p-2 border rounded-md"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : t('ask')}
                        </Button>
                    </div>

                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            'Best crops for current season',
                            'Weather impact on crops',
                            'Pest management tips',
                            'Market prices today',
                            'Water management'
                        ].map((suggestion) => (
                            <Button
                                key={suggestion}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setQuery(suggestion)}
                                className="text-sm"
                            >
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                </form>                {response && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-md border border-green-200">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="text-green-800 whitespace-pre-wrap">{response.text}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async (e) => {
                                            const success = await copyToClipboard(response.text);
                                            if (success) {
                                                // Show visual feedback that text was copied
                                                const button = e.currentTarget as HTMLButtonElement;
                                                const originalText = button.innerHTML;
                                                button.innerHTML = '✓ Copied';
                                                setTimeout(() => {
                                                    button.innerHTML = originalText;
                                                }, 2000);
                                            }
                                        }}
                                        title="Copy to clipboard"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </Button>
                                    {/* Select All button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async (e) => {
                                            const button = e.currentTarget as HTMLButtonElement;
                                            const originalText = button.innerHTML;
                                            const success = await selectAllAndCopy(response.text, (isCopying) => {
                                                button.innerHTML = isCopying ? '✓ Selected' : originalText;
                                            });
                                            if (!success) {
                                                console.error('Failed to select text');
                                            }
                                        }}
                                        title="Select all and copy"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                        </svg>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: 'KrishiMitra AI Advice',
                                                    text: response.text,
                                                    url: window.location.href
                                                });
                                            } else {
                                                navigator.clipboard.writeText(response.text);
                                                alert(t('copiedToClipboard'));
                                            }
                                        }}
                                    >
                                        <Share2 className="h-4 w-4 mr-1" />
                                        {t('share')}
                                    </Button>
                                    {voiceState.supported && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => speak(response.text)}
                                        >
                                            <Volume2 className="h-4 w-4 mr-1" />
                                            {t('speak')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Related Topics */}
                            <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">{t('relatedTopics')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(TOPIC_MAPPINGS).map(mapping =>
                                        mapping.examples.slice(0, 2).map(example => (
                                            <Badge
                                                key={example}
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-green-100"
                                                onClick={() => setQuery(example)}
                                            >
                                                {example}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}