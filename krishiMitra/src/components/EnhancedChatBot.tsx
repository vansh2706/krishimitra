'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Loader2, Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLanguage } from '@/hooks/useLanguage'
import { geminiChat, checkGeminiServices, playTTSAudio, type ChatMessage } from '@/lib/gemini-api'
import { deepseekChat } from '@/lib/deepseek-api'  // Import DeepSeek API
import { getLanguageDisplayName } from '@/utils/languageDetection'
import { copyToClipboard } from '@/utils/copyUtils'

interface Message {
    id: string
    type: 'user' | 'bot'
    content: string
    timestamp: Date
    lang: string
}

interface EnhancedChatBotProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

const EnhancedChatBot = ({ voiceEnabled, onSpeak }: EnhancedChatBotProps) => {
    const { t, language, isOnline, detectAndSuggestLanguage, autoSetLanguageFromInput } = useLanguage()
    const [messages, setMessages] = useState<Message[]>([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [voiceSupported, setVoiceSupported] = useState(false)
    const [serviceStatus, setServiceStatus] = useState({ chatbot: false, speechToText: false, textToSpeech: false })
    const [languageSuggestion, setLanguageSuggestion] = useState<{
        show: boolean;
        detectedLang: string;
        confidence: number;
    }>({ show: false, detectedLang: '', confidence: 0 })
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const recognitionRef = useRef<any>(null)

    // Initialize speech recognition and update language
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            recognitionRef.current = new SpeechRecognition()

            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false
            recognitionRef.current.lang = getVoiceLang(language)

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setInputValue(transcript)
                setIsListening(false)
            }

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error)
                setIsListening(false)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }

            setVoiceSupported(true)
        }

        // Update language for existing recognition instance
        if (recognitionRef.current) {
            recognitionRef.current.lang = getVoiceLang(language)
        }
    }, [language])

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [messages])

    // Add welcome message on mount only
    useEffect(() => {
        const checkServices = async () => {
            // Since we're using API routes, chatbot is always available
            const services = {
                chatbot: true, // API routes handle Gemini/DeepSeek
                speechToText: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
                textToSpeech: 'speechSynthesis' in window
            }
            setServiceStatus(services)

            // Only add welcome message if no messages exist (first mount)
            if (messages.length === 0 && !isInitialized) {
                const welcomeMessage: Message = {
                    id: '1',
                    type: 'bot',
                    content: services.chatbot
                    ? language === 'hi'
                        ? `🌾 नमस्ते! मैं आपका स्मार्ट कृषि सहायक हूं।

✨ **नई सुविधा**: अब मैं आपकी भाषा को समझकर उसी में जवाब दूंगा!

💬 आप मुझसे किसी भी भाषा में पूछ सकते हैं:
• हिंदी में: "गेहूं की खेती कैसे करें?"
• English में: "How to grow wheat?"
• தமிழ் में: "கோதுமை விவசாயம் எப்படி?"

🚀 बस टाइप करें, मैं समझ जाऊंगा!`
                        : `🌾 Hello! I'm your intelligent agricultural assistant.

✨ **New Feature**: I can now understand and respond in your preferred language!

💬 You can ask me in any language:
• English: "How to grow wheat?"
• हिंदी में: "गेहूं की खेती कैसे करें?"
• தமிழ் में: "கோதுமை விவசாயம் எப்படி?"
• తెలుగులో: "గోధుమ వ్యవసాయం ఎలా?"

🚀 Just type in your preferred language, I'll understand!`
                    : language === 'hi'
                        ? `नमस्ते! मैं आपका कृषि सहायक हूं। 🌾

💬 मुझसे कृषि से संबंधित कोई भी प्रश्न पूछें। मैं यहाँ आपकी मदद के लिए हूं!

🌱 उदाहरण:
• "गेहूं की खेती कैसे करें?"
• "टमाटर के रोग और उपचार"
• "इस मौसम में कौन सी फसल उगाएं?"

मैं किसी भी भारतीय भाषा में जवाब दे सकता हूं! 💪`
                        : `Hello! I'm your agricultural assistant. 🌾

💬 Ask me anything related to farming and agriculture. I'm here to help!

🌱 Examples:
• "How to grow wheat?"
• "Tomato diseases and treatment"
• "Which crops to plant this season?"

I can respond in any Indian language! 💪`,
                timestamp: new Date(),
                lang: language
            }
                setMessages([welcomeMessage])
                setIsInitialized(true)
            }
        }
        
        checkServices()
    }, []) // Remove language dependency to prevent clearing history

    // Separate effect to update service status when language changes
    useEffect(() => {
        const updateServices = async () => {
            const geminiAvailable = await checkGeminiServices()
            const services = {
                chatbot: geminiAvailable,
                speechToText: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
                textToSpeech: 'speechSynthesis' in window
            }
            setServiceStatus(services)
        }
        updateServices()
    }, [language])

    const getVoiceLang = (lang: string): string => {
        const langMap: { [key: string]: string } = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'bn': 'bn-IN',
            'gu': 'gu-IN',
            'mr': 'mr-IN',
            'pa': 'pa-IN'
        }
        return langMap[lang] || 'en-US'
    }

    const startVoiceRecognition = () => {
        if (recognitionRef.current && voiceSupported) {
            recognitionRef.current.lang = getVoiceLang(language)
            setIsListening(true)
            recognitionRef.current.start()
        }
    }

    const stopVoiceRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }

    const generateAIResponse = async (userMessage: string, responseLanguage: string = language): Promise<string> => {
        try {
            // Enhanced: Detect input language for more natural interaction
            const detectedLang = detectAndSuggestLanguage(userMessage).detectedLanguage
            const confidence = detectAndSuggestLanguage(userMessage).confidence

            // Handle code-mixed languages (like Hinglish) intelligently
            const isCodeMixed = confidence < 70 && confidence > 30

            // Use detected language if confidence is high, or use bilingual approach for code-mixed
            let aiResponseLanguage = responseLanguage
            if (confidence > 70 && detectedLang !== 'en') {
                aiResponseLanguage = detectedLang
            } else if (isCodeMixed && (detectedLang === 'hi' || responseLanguage === 'hi')) {
                // For Hinglish or mixed languages, use a bilingual approach
                aiResponseLanguage = 'hi'
            }

            const getSystemMessage = (lang: string) => {
                const messages: Record<string, string> = {
                    hi: `आप भारतीय कृषि विशेषज्ञ हैं। आकर्षक और संरचित उत्तर दें:

✅ हमेशा emoji से शुरुआत करें
📋 मुख्य बिंदुओं को bullet points में दें
💰 लागत/मात्रा शामिल करें (₹ में)
🌱 व्यावहारिक कदमों की सूची दें
📞 स्थानीय कृषि विभाग से संपर्क करने का सुझाव दें

उत्तर अवश्य हिंदी में होना चाहिए!`,
                    en: `You are an Indian agricultural expert. Provide engaging and structured responses:

✅ Always start with an emoji
📋 Use bullet points for main points
💰 Include costs/quantities (in ₹)
🌱 Provide practical step-by-step guidance
📞 Suggest contacting local agricultural departments

Response must be in English!`,
                    ta: `நீங்கள் இந்திய வேளாண் நிபுணர். கவர்ச்சிகரமான பதில்:

✅ emoji உடன் தொடங்கவும்
📋 bullet points பயன்படுத்தவும்
💰 விலை/அளவு (₹ இல்)
🌱 வ்யவஹாரிக கடம்பங்கள் உள்ளிடுவும்
📞 மேல வேளாண் வகைகளுடன் தொடர்பு கொள்ளுவதன் பரிநிபாதனை

பதில் தமிழில் இருக்க வேண்டும்!`,
                    te: `మీరు భారతీయ వ్యవసాయ నిపుణులు. ఆకర్షక సమాధానం:

✅ emoji తో ప్రారంభించండి
📋 bullet points వాడండి
💰 విలువలు/పరిమాణాలు (₹ లో)
🌱 వ్యవహారిక కదంబాల ప్రత్యార్థికం
📞 స్థానిక వేళాణ విాగాలతో సంపర్క కోరుంది

ప్రత్యుత్తరం తెలుగులో ఉండాలి!`,
                    bn: `আপনি ভারতীয় কৃষি বিশেষজ্ঞ। আকর্ষণীয় উত্তর:

✅ emoji দিয়ে শুরু করুন
📋 bullet points ব্যবহার করুন
💰 দাম/পরিমাণ (₹ এ)
🌱 প্রায়োগিক ধাপ-ধাপি নির্দেশনা
📞 স্থানীয় কৃষি বিভাগের সাথে যোগাযোগ করার পরামর্শ

উত্তর বাংলায় হতে হবে!`,
                    gu: `તમે ભારતીય કૃષિ નિષ્ણાત છો। આકર્ષક જવાબ:

✅ emoji થી શરૂ કરો
📋 bullet points વાપરો
💰 દર/માત્રા (₹ માં)
🌱 પ્રયોગિક ધાપ-ધાપી નિર્દેશ
📞 સ્થાનિક કૃષિ વિભાગ સાથે યોજાયો

જવાબ ગુજરાતીમાં હોવો જરૂરી!`,
                    mr: `तुम्ही भारतीय कृषी तज्ञ आहात. आकर्षक उत्तर:

✅ emoji ने सुरू करा
📋 bullet points वापरा
💰 खर्च/प्रमाण (₹ मध्ये)
🌱 प्रायोगिक धाप-धापी निर्देश
📞 स्थानिक कृषि विभाग साथी योगायो

उत्तर मराठीमध्ये होवा आवश्यक!`,
                    pa: `ਤੁਸੀਂ ਭਾਰਤੀ ਖੇਤੀ ਮਾਹਰ ਹੋ। ਦਿਲਚਸਪ ਜਵਾਬ:

✅ emoji ਨਾਲ ਸ਼ੁਰੂ ਕਰੋ
📋 bullet points ਵਰਤੋ
💰 ਕੀਮਤ/ਮਾਤਰਾ (₹ ਵਿੱਚ)
🌱 ਪ੍ਰਾਯੋਗਿਕ ਧਾਪ-ਧਾਪੀ ਨਿਰਦੇਸ਼
📞 ਸਥਾਨਿਕ ਖੇਤੀ ਵਿਭਾਗ ਨਾਲ ਯੋਜਾਯੋਗ

ਜਵਾਬ ਪੰਜਾਬੀ ਵਿੱਚ ਹੋਵਾ ਜਾਵੇ!`
                }
                return messages[lang] || messages.en
            }

            // Try Gemini first (primary) with better error handling
            try {
                console.log('Attempting to use Gemini as primary provider')
                const systemMessage = getSystemMessage(aiResponseLanguage)

                // Enhanced context: Include user's input language for better understanding
                const enhancedUserMessage = confidence > 70 && detectedLang !== responseLanguage
                    ? `[User is communicating in ${getLanguageName(detectedLang)}] ${userMessage}`
                    : isCodeMixed
                        ? `[User is using mixed language/Hinglish] ${userMessage}`
                        : userMessage

                const chatMessages: ChatMessage[] = [
                    {
                        role: 'system',
                        content: systemMessage
                    },
                    {
                        role: 'user',
                        content: enhancedUserMessage
                    }
                ]

                // Call Gemini via API route instead of directly
                const apiResponse = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: chatMessages,
                        language: aiResponseLanguage
                    }),
                })

                if (!apiResponse.ok) {
                    throw new Error(`Gemini API returned ${apiResponse.status}`)
                }

                const apiData = await apiResponse.json()
                const content = apiData.choices?.[0]?.message?.content || ''

                // Check if we got a valid response
                if (content && content !== 'Sorry, I could not generate a response.') {
                    console.log('Gemini response successful')
                    return content
                } else {
                    throw new Error('Gemini returned empty or default response')
                }
            } catch (geminiError) {
                console.error('Gemini API Error, falling back to DeepSeek:', geminiError)

                // Fallback to DeepSeek with better error handling
                try {
                    console.log('Attempting to use DeepSeek as fallback provider')
                    const systemMessage = getSystemMessage(aiResponseLanguage)

                    // Enhanced context: Include user's input language for better understanding
                    const enhancedUserMessage = confidence > 70 && detectedLang !== responseLanguage
                        ? `[User is communicating in ${getLanguageName(detectedLang)}] ${userMessage}`
                        : isCodeMixed
                            ? `[User is using mixed language/Hinglish] ${userMessage}`
                            : userMessage

                    const chatMessages: ChatMessage[] = [
                        {
                            role: 'system',
                            content: systemMessage
                        },
                        {
                            role: 'user',
                            content: enhancedUserMessage
                        }
                    ]

                    // Call DeepSeek via API route
                    const apiResponse = await fetch('/api/deepseek', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            messages: chatMessages,
                            language: aiResponseLanguage
                        }),
                    })

                    if (!apiResponse.ok) {
                        throw new Error(`DeepSeek API returned ${apiResponse.status}`)
                    }

                    const apiData = await apiResponse.json()
                    const content = apiData.choices?.[0]?.message?.content || ''

                    // Check if we got a valid response
                    if (content && content !== 'Sorry, I could not generate a response.') {
                        console.log('DeepSeek response successful')
                        return content
                    } else {
                        throw new Error('DeepSeek returned empty or default response')
                    }
                } catch (deepseekError) {
                    console.error('DeepSeek API Error:', deepseekError)
                    // If both providers fail, return fallback response
                    return getFallbackResponse(userMessage, aiResponseLanguage)
                }
            }
        } catch (error) {
            console.error('AI response error:', error)
            // Return fallback response on any error
            return getFallbackResponse(userMessage, responseLanguage)
        }
    }

    const getLanguageName = (langCode: string): string => {
        const names: Record<string, string> = {
            'en': 'English',
            'hi': 'Hindi',
            'ta': 'Tamil',
            'te': 'Telugu',
            'bn': 'Bengali',
            'gu': 'Gujarati',
            'mr': 'Marathi',
            'pa': 'Punjabi'
        }
        return names[langCode] || 'English'
    }

    const getFallbackResponse = (userMessage: string, lang: string = language): string => {
        const lowerMessage = userMessage.toLowerCase()

        // Enhanced mock responses with agricultural knowledge
        if (lowerMessage.includes('wheat') || lowerMessage.includes('गेहूं')) {
            return lang === 'hi'
                ? `🌾 गेहूं की खेती के लिए संपूर्ण गाइड:

1. **बुवाई का समय**: अक्टूबर-नवंबर (रबी सीजन)
2. **बीज दर**: 100-120 किलो प्रति हेक्टेयर
3. **उर्वरक**: NPK (120:60:40) किलो प्रति हेक्टेयर
4. **सिंचाई**: 4-6 सिंचाई की आवश्यकता
5. **कीट नियंत्रण**: नियमित निगरानी, नीम का तेल
6. **कटाई**: 120-130 दिन में तैयार

💡 उत्पादन: 25-30 क्विंटल प्रति हेक्टेयर
📞 सलाह: स्थानीय कृषि विभाग से संपर्क करें।`
                : `Wheat Cultivation Guide:

1. **Sowing Time**: October-November (Rabi season)
2. **Seed Rate**: 100-120 kg per hectare
3. **Fertilizer**: NPK (120:60:40) kg per hectare
4. **Irrigation**: 4-6 irrigations needed
5. **Pest Control**: Regular monitoring, neem oil spray
6. **Harvesting**: Ready in 120-130 days

💡 Yield: 25-30 quintals per hectare
📞 Advice: Contact local agricultural department.`
        }

        if (lowerMessage.includes('tomato') || lowerMessage.includes('टमाटर')) {
            return lang === 'hi'
                ? `🍅 टमाटर की संपूर्ण देखभाल:

1. **मौसम**: साल भर (सिंचित क्षेत्र)
2. **तापमान**: 20-25°C आदर्श
3. **मिट्टी**: दोमट मिट्टी, pH 6.0-7.0
4. **पानी प्रबंधन**: ड्रिप सिंचाई सर्वोत्तम
5. **मुख्य रोग**: अगेती झुलसा, पछेती झुलसा
6. **कीट नियंत्रण**: नीम का तेल छिड़काव
7. **कटाई**: 70-80 दिन में फल तैयार

💰 उत्पादन: 300-500 क्विंटल प्रति हेक्टेयर
✨ सफल खेती के लिए नियमित देखभाल जरूरी है।`
                : `Tomato Cultivation:

🍅 Sowing: Year-round (irrigated areas)
🌡️ Temperature: 20-25°C ideal
💧 Water Management: Drip irrigation best
🦠 Major Diseases: Early blight, late blight
📈 Yield: 300-500 quintals/hectare`
        }

        return lang === 'hi'
            ? `आपका सवाल: ${userMessage}

AI सुविधा उपलब्ध नहीं है, लेकिन यहाँ कुछ सामान्य कृषि सलाह है:

• नियमित मिट्टी जांच कराएं
• फसल चक्र अपनाएं
• जैविक खाद का उपयोग करें
• एकीकृत कीट प्रबंधन अपनाएं
• मौसम आधारित सलाह लें

अधिक जानकारी के लिए अन्य टूल्स का उपयोग करें।`
            : `Your question: ${userMessage}

AI feature unavailable, but here's general agricultural advice:

• Conduct regular soil testing
• Practice crop rotation
• Use organic fertilizers
• Implement integrated pest management
• Follow weather-based advisories

Use other tools for more specific information.`
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        // Enhanced: Detect input language for intelligent response
        const inputDetection = detectAndSuggestLanguage(inputValue)
        const detectedLang = inputDetection.detectedLanguage
        const confidence = inputDetection.confidence

        // Use detected language if confidence is high, otherwise use current app language
        const messageLanguage = (confidence > 70 && detectedLang !== 'en') ? detectedLang : language

        // Show language suggestion only for significant language switches
        if (inputDetection.shouldSuggest && confidence > 80 && detectedLang !== language) {
            setLanguageSuggestion({
                show: true,
                detectedLang: detectedLang,
                confidence: confidence
            })
        } else {
            setLanguageSuggestion({ show: false, detectedLang: '', confidence: 0 })
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
            lang: detectedLang // Store detected language with message
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        try {
            // Generate AI response in the detected/preferred language
            const aiResponse = await generateAIResponse(userMessage.content, messageLanguage)

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: aiResponse,
                timestamp: new Date(),
                lang: messageLanguage // AI responds in the same language
            }

            setMessages(prev => [...prev, botMessage])

            // Manual speech output - only speak when user clicks the speech button
            if (voiceEnabled && aiResponse) {
                // Don't auto-speak, let user control when to hear the response
                // onSpeak(aiResponse)
            }
        } catch (error) {
            console.error('Error generating response:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
                lang: language
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleCopyMessage = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    const handleShareMessage = async (content: string) => {
        // Create a more complete share payload
        const shareData = {
            title: 'KrishiMitra AI Advisor Response',
            text: content,
            url: window.location.href // Include current page URL
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Sharing failed', err);
                // Fallback to copy if sharing fails
                await handleCopyMessage(content);
            }
        } else {
            // Fallback to copy for browsers that don't support Web Share API
            await handleCopyMessage(content);
        }
    }

    const getQuickQuestions = () => {
        const questions: Record<string, string[]> = {
            hi: [
                'इस मौसम में कौन सी फसल बोनी चाहिए?',
                'कीट नुकसान से कैसे बचाव करें?',
                'गेहूं के लिए सबसे अच्छा उर्वरक?',
                'चावल की कटाई कब करें?',
                'कपास की सिंचाई का समय?',
                'मिट्टी तैयार करने के तरीके?'
            ],
            en: [
                'What crops should I plant this season?',
                'How to prevent pest damage?',
                'Best fertilizer for wheat?',
                'When to harvest rice?',
                'Irrigation schedule for cotton?',
                'Soil preparation tips?'
            ],
            ta: [
                'இந்த பருவத்தில் எந்த பயிர் நடவேண்டும்?',
                'பூச்சி தாக்குதலை எப்படி தடுப்பது?',
                'கோதுமைக்கு சிறந்த உரம்?',
                'நெல் அறுவடை எப்போது?',
                'பருத்திக்கு நீர்ப்பாசன அட்டவணை?',
                'மண் தயாரிப்பு வழிகள்?'
            ],
            te: [
                'ఈ సీజన్‌లో ఏ పంట వేయాలి?',
                'పురుగుల నష్టాన్ని ఎలా నివారించాలి?',
                'గోధుమకు ఉత్తమ ఎరువు?',
                'వరిని ఎప్పుడు కోయాలి?',
                'పత్తికి నీటిపారుదల కాలక్రమం?',
                'మట్టి తయారీ చిట్కాలు?'
            ],
            bn: [
                'এই মৌসুমে কোন ফসল বপন করব?',
                'পোকার ক্ষতি থেকে কীভাবে রক্ষা পাব?',
                'গমের জন্য সেরা সার?',
                'ধান কাটার সময় কখন?',
                'তুলার সেচের সময়সূচী?',
                'মাটি প্রস্তুতির উপায়?'
            ],
            gu: [
                'આ મૌસમમાં કઈ ફસલ બોની આવે?',
                'પૂચ્ચિની નષ્ટાન્ની થી રક્ષણ કેવી રીતે?',
                'ગોધુમ માટે સર્વોત્તમ ઉર્વરક?',
                'ચાવલની કટાઈ ક્યારે?',
                'કપાસ માટે સિંચાઈ સમયરી?',
                'મિટ્ટી તૈયારી ટિપ્સ?'
            ],
            mr: [
                'हा मौसमात आणि कोणती फसल बोनी आवे?',
                'कीटांची नुकसानांसाठी कसे रक्षण करावे?',
                'गेहूंच्या लागी सर्वोत्तम उर्वरक?',
                'चावलची कटाई कधी करावे?',
                'कपासच्या लागी सिंचाई कालक्रम?',
                'मिट्टीची तैयारी टिप्स?'
            ],
            pa: [
                'ਇਸ ਮੌਸਮ ਵਿੱਚ ਕਿਸ ਫਸਲ ਨਾਲ ਬੋਨੀ ਆਵੇ?',
                'ਕੀਟ ਨੁਕਸਾਨ ਤੋਂ ਕਿਵੇਂ ਰਕਸਾ ਪਾਵੇ?',
                'ਗੋਧੁਮ ਲਈ ਸਹੀ ਉਰਵਰਕ?',
                'ਚਾਵਲ ਕਟਾਉਣ ਦਾ ਸਮਾਨ?',
                'ਕਪਾਸ ਲਈ ਸੀਂਚਾਈ ਸਮਾਨ?',
                'ਮਿਟਟੀ ਤਿਆਰੀ ਟਿਪਸ?'
            ]
        }
        return questions[language] || questions.en
    }

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <Card className="flex flex-col flex-1">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">KrishiMitra AI Advisor</h2>
                                <p className="text-sm text-green-100">Your intelligent farming assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                {getLanguageDisplayName(language)}
                            </Badge>
                            <Badge variant={isOnline ? "default" : "destructive"} className={isOnline ? "bg-green-500" : ""}>
                                {isOnline ? 'Online' : 'Offline'}
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 p-0">
                    <ScrollArea className="flex flex-col flex-1 p-4 h-[500px]" ref={scrollAreaRef}>
                        {messages.map((message) => (
                            <div key={message.id} className={`flex mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mx-2 my-1 ${message.type === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-green-500 text-white'
                                        }`}>
                                        {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                    </div>
                                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${message.type === 'user'
                                        ? 'bg-blue-500 text-white rounded-tr-none'
                                        : 'bg-gray-100 dark:bg-gray-700 rounded-tl-none'
                                        }`}>
                                        <div className="prose prose-sm max-w-none dark:prose-invert">
                                            {message.type === 'bot' ? (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: message.content
                                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                            .replace(/\n/g, '<br/>')
                                                            .replace(/• /g, '<br/>• ')
                                                            .replace(/💰 /g, '<br/>💰 ')
                                                            .replace(/🌱 /g, '<br/>🌱 ')
                                                            .replace(/💧 /g, '<br/>💧 ')
                                                            .replace(/🧪 /g, '<br/>🧪 ')
                                                            .replace(/🦗 /g, '<br/>🦗 ')
                                                            .replace(/📈 /g, '<br/>📈 ')
                                                            .replace(/💡 /g, '<br/>💡 ')
                                                            .replace(/📅 /g, '<br/>📅 ')
                                                            .replace(/⚠️ /g, '<br/>⚠️ ')
                                                            .replace(/🏛️ /g, '<br/>🏛️ ')
                                                            .replace(/📋 /g, '<br/>📋 ')
                                                    }}
                                                />
                                            ) : (
                                                <p>{message.content}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center mt-2 text-xs opacity-70">
                                            <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {message.type === 'bot' && (
                                                <div className="flex ml-2 space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 hover:bg-white/20"
                                                        onClick={() => handleCopyMessage(message.content)}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 hover:bg-white/20"
                                                        onClick={() => handleShareMessage(message.content)}
                                                    >
                                                        <Share2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mx-2 my-1">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-3">
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Quick Questions Section */}
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Quick Questions:</h3>
                <div className="flex flex-wrap gap-2">
                    {getQuickQuestions().slice(0, 4).map((question, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => setInputValue(question)}
                        >
                            {question}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="flex items-center space-x-2 mt-4">
                <div className="flex-1 relative">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about farming, crops, pests, weather..."
                        className="pr-12 py-3"
                        disabled={isLoading}
                    />
                    {voiceEnabled && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                            disabled={isLoading}
                        >
                            {isListening ? (
                                <MicOff className="h-5 w-5 text-red-500" />
                            ) : (
                                <Mic className="h-5 w-5 text-blue-500" />
                            )}
                        </Button>
                    )}
                </div>
                <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
            </div>

            {/* Language Suggestion */}
            {languageSuggestion.show && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-sm">
                            Switch to {getLanguageName(languageSuggestion.detectedLang)} for better understanding?
                        </p>
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                onClick={() => {
                                    autoSetLanguageFromInput(inputValue || messages[messages.length - 2]?.content || '')
                                    setLanguageSuggestion({ show: false, detectedLang: '', confidence: 0 })
                                }}
                            >
                                Yes
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLanguageSuggestion({ show: false, detectedLang: '', confidence: 0 })}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EnhancedChatBot
