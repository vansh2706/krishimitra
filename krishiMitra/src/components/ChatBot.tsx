'use client'

import React, { useState, useRef, useEffect } from 'react'
// ChatBot component for AI-powered agricultural advice
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { MessageSquare, Send, Mic, MicOff, Volume2, Bot, User, Lightbulb, WifiOff } from 'lucide-react'
import { geminiChat, type ChatMessage as GeminiMessage } from '../lib/gemini-api'
import { useLanguage } from '../hooks/useLanguage'
import { addOfflineChatMessage, getOfflineData, addSearchHistory, addFavoriteAdvice } from '../lib/offlineStorage'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    citations?: string[]
}

interface ChatBotProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

export function ChatBot({ voiceEnabled, onSpeak }: ChatBotProps) {
    const { t, language, isOnline } = useLanguage()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const recognitionRef = useRef<any>(null) // Using any for cross-browser compatibility

    // Enhanced sample questions based on language
    const getSampleQuestions = () => {
        const questions: Record<string, string[]> = {
            hi: [
                'मेरी गेहूं की फसल के लिए कौन सा उर्वरक सबसे अच्छा है?',
                'बारिश के मौसम में टमाटर की देखभाल कैसे करें?',
                'कपास की फसल में कीट नियंत्रण के तरीके क्या हैं?',
                'मिट्टी की उर्वरता प्राकृतिक तरीके से कैसे बढ़ाएं?',
                'सिंचाई का सबसे अच्छा समय कब है?',
                'जैविक खेती कैसे शुरू करें?',
                'फसल की कटाई के बाद भंडारण कैसे करें?'
            ],
            en: [
                'What is the best fertilizer for my wheat crop?',
                'How to care for tomatoes during rainy season?',
                'What are effective pest control methods for cotton farming?',
                'How to improve soil fertility using organic methods?',
                'When is the best time for irrigation?',
                'How to start organic farming practices?',
                'What are proper post-harvest storage techniques?'
            ],
            ta: [
                'என் கோதுமை பயிருக்கு எந்த உரம் சிறந்தது?',
                'மழைக்காலத்தில் தக்காளியை எப்படி பராமரிக்க வேண்டும்?',
                'பருத்திப் பயிரில் பூச்சி கட்டுப்பாடு முறைகள் என்ன?'
            ],
            te: [
                'నా గోధుమ పంటకు ఏ ఎరువు ఉత్తమం?',
                'వర్షాకాలంలో టమాటాలను ఎలా చూసుకోవాలి?',
                'పత్తి వ్యవసాయంలో చీడపురుగుల నియంత్రణ పద్ధతులు ఏమిటి?'
            ]
        }

        return questions[language] || questions.en
    }

    const sampleQuestions = getSampleQuestions()

    // Initialize speech recognition with improved language support
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            const recognition = new SpeechRecognition()
            recognition.continuous = false
            recognition.interimResults = false

            // Enhanced language mapping
            const langMap: Record<string, string> = {
                hi: 'hi-IN',
                en: 'en-IN',
                ta: 'ta-IN',
                te: 'te-IN',
                bn: 'bn-IN',
                gu: 'gu-IN',
                mr: 'mr-IN',
                pa: 'pa-IN'
            }

            recognition.lang = langMap[language] || 'en-IN'

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setInput(transcript)
                setIsListening(false)
            }

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error)
                setIsListening(false)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current = recognition
        }
    }, [language])

    // Load offline messages on component mount
    useEffect(() => {
        const offlineData = getOfflineData()
        if (offlineData.chatMessages.length > 0) {
            setMessages(offlineData.chatMessages.slice(-10)) // Show last 10 messages
        }
    }, [])

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [messages])

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true)
            recognitionRef.current.start()
        }
    }

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop()
        }
    }

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            // Enhanced system message based on language with specific agricultural knowledge
            const getSystemMessage = () => {
                const messages: Record<string, string> = {
                    hi: 'आप एक अनुभवी कृषि विशेषज्ञ हैं जो भारतीय किसानों को फसल, मिट्टी, उर्वरक, कीट नियंत्रण, और आधुनिक खेती की तकनीकों के बारे में विस्तृत सलाह देते हैं। हमेशा व्यावहारिक, वैज्ञानिक आधार पर और समझने योग्य सलाह दें। भारतीय जलवायु और मिट्टी की स्थिति को ध्यान में रखें। हिंदी में स्पष्ट उत्तर दें।',
                    en: 'You are an experienced agricultural expert specializing in Indian farming conditions. Provide detailed, practical advice on crops, soil management, fertilizers, pest control, and modern farming techniques. Focus on sustainable practices suitable for Indian climate, soil types, and small-scale farming. Give scientifically accurate but easily understandable guidance.',
                    ta: 'நீங்கள் ஒரு அனுபவமிக்க வேளாண் நிபுணர், இந்திய விவசாய நிலைமைகளில் நிபுணத்துவம் பெற்றவர். பயிர்கள், மண் மேலாண்மை, உரங்கள், பூச்சி கட்டுப்பாடு மற்றும் நவீன வேளாண் நுட்பங்கள் குறித்து விரிவான, நடைமுறை ஆலோசனைகளை வழங்கவும்.',
                    te: 'మీరు భారతీయ వ్యవసాయ పరిస్థితులలో నిపుణుడైన అనుభవజ్ఞుడైన వ్యవసాయ నిపుణులు. పంటలు, నేల నిర్వహణ, ఎరువులు, చీడపురుగుల నియంత్రణ మరియు ఆధునిక వ్యవసాయ పద్ధతులపై వివరణాత్మక, ఆచరణాత్మక సలహాలు అందించండి.'
                }
                return messages[language] || messages.en
            }

            const systemMessage = getSystemMessage()

            const geminiMessages: GeminiMessage[] = [
                {
                    role: 'system',
                    content: systemMessage
                },
                {
                    role: 'user',
                    content: input.trim()
                }
            ]

            if (!isOnline) {
                throw new Error('No internet connection');
            }

            const response = await geminiChat(geminiMessages)

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response || t('error'),
                timestamp: new Date(),
                citations: []
            }

            setMessages(prev => [...prev, assistantMessage])

            // Save to offline storage
            addOfflineChatMessage(userMessage)
            addOfflineChatMessage(assistantMessage)
            addSearchHistory(input.trim())

            // Speak the response if voice is enabled
            if (voiceEnabled && assistantMessage.content) {
                onSpeak(assistantMessage.content)
            }

        } catch (error) {
            console.error('Error getting AI response:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: language === 'hi'
                    ? 'क्षमा करें, मुझे आपका उत्तर देने में कुछ समस्या हो रही है। कृपया फिर से प्रयास करें।'
                    : 'Sorry, I encountered an error while processing your request. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        }

        setIsLoading(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const useSampleQuestion = (question: string) => {
        setInput(question)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-6 h-6 text-blue-600" />
                        {t('aiAdvisor')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Chat Messages */}
                    <div className="h-96 w-full border rounded-lg p-4 overflow-auto" ref={scrollAreaRef}>
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg mb-2">{t('welcomeMessage')}</p>
                                <p className="text-sm">{t('askAnything')}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                                            }`}>
                                            {message.role === 'user' ? (
                                                <User className="w-4 h-4 text-white" />
                                            ) : (
                                                <Bot className="w-4 h-4 text-white" />
                                            )}
                                        </div>

                                        <div className={`rounded-lg p-3 ${message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                            {message.citations && message.citations.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-300">
                                                    <p className="text-xs opacity-75 mb-1">{language === 'hi' ? 'स्रोत:' : 'Sources:'}</p>
                                                    <div className="space-y-1">
                                                        {message.citations.slice(0, 3).map((citation, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={citation}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs underline opacity-75 hover:opacity-100 block"
                                                            >
                                                                {citation.length > 60 ? `${citation.substring(0, 60)}...` : citation}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`text-xs mt-2 opacity-60 ${message.role === 'user' ? 'text-right' : ''}`}>
                                                {message.timestamp.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>

                                        {message.role === 'assistant' && voiceEnabled && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="self-end"
                                                onClick={() => onSpeak(message.content)}
                                            >
                                                <Volume2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <span className="text-sm ml-2">{t('thinkingAI')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="space-y-3">
                        {/* Sample Questions */}
                        <div className="flex flex-wrap gap-2">
                            {sampleQuestions.map((question, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-gray-200"
                                    onClick={() => useSampleQuestion(question)}
                                >
                                    <Lightbulb className="w-3 h-3 mr-1" />
                                    {question.length > 50 ? `${question.substring(0, 50)}...` : question}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={t('typeMessage')}
                                className="min-h-[80px]"
                            />
                            <div className="flex flex-col gap-2">
                                {recognitionRef.current && (
                                    <Button
                                        variant={isListening ? "destructive" : "secondary"}
                                        size="icon"
                                        onClick={isListening ? stopListening : startListening}
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </Button>
                                )}
                                <Button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                    size="icon"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}