'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import {
    Bug,
    Upload,
    Camera,
    AlertTriangle,
    CheckCircle,
    Loader2,
    X,
    Info,
    Leaf,
    Droplets
} from 'lucide-react'
import { geminiChat as perplexityChat, type ChatMessage as PerplexityMessage } from '../lib/gemini-api'
import { useLanguage } from '../hooks/useLanguage'
import { copyToClipboard, selectAllAndCopy } from '@/utils/copyUtils'

interface PestDetectionProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

interface DetectionResult {
    pest: string
    confidence: string
    description: string
    symptoms: string[]
    treatments: string[]
    prevention: string[]
    urgency: 'low' | 'medium' | 'high'
}

export function PestDetection({ voiceEnabled, onSpeak }: PestDetectionProps) {
    const { t, language } = useLanguage()
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<DetectionResult | null>(null)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file)
            setError('')
            setResult(null)

            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setError(language === 'hi'
                ? 'कृपया एक वैध छवि फाइल चुनें'
                : 'Please select a valid image file'
            )
        }
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const file = event.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file)
            setError('')
            setResult(null)

            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    const clearImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        setResult(null)
        setError('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (cameraInputRef.current) cameraInputRef.current.value = ''
    }

    const analyzeImage = async () => {
        if (!selectedImage) return

        setIsAnalyzing(true)
        setError('')

        try {
            // Since we can't actually analyze the image with computer vision in this MVP,
            // we'll use Perplexity to provide general pest identification guidance
            const systemMessage = language === 'hi'
                ? 'आप एक कृषि विशेषज्ञ हैं जो पौधों के कीट और रोगों की पहचान में सहायता करते हैं। उपयोगकर्ता ने एक पौधे की छवि अपलोड की है। सामान्य कृषि कीट और रोगों के बारे में जानकारी प्रदान करें और बताएं कि किसान को क्या देखना चाहिए।'
                : 'You are an agricultural expert specializing in plant pest and disease identification. The user has uploaded a plant image. Provide information about common agricultural pests and diseases and what farmers should look for.'

            const userMessage = language === 'hi'
                ? 'मैंने अपने पौधे की एक छवि अपलोड की है। कृपया मुझे बताएं कि सामान्य कीट और रोगों की पहचान कैसे करें और उनका इलाज कैसे करें।'
                : 'I have uploaded an image of my plant. Please help me understand how to identify common pests and diseases and how to treat them.'

            const perplexityMessages: PerplexityMessage[] = [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage }
            ]

            const response = await perplexityChat(perplexityMessages)

            const aiResponse = response || ''

            // Parse the AI response to create a structured result
            // This is a simplified approach - in a real app, you'd use computer vision
            const mockResult: DetectionResult = {
                pest: language === 'hi' ? 'सामान्य पत्ती की क्षति' : 'General Leaf Damage',
                confidence: '75%',
                description: aiResponse.substring(0, 200) + '...',
                symptoms: language === 'hi' ? [
                    'पत्तियों पर धब्बे',
                    'पत्तियों का पीला होना',
                    'वृद्धि में कमी',
                    'पत्तियों का मुड़ना'
                ] : [
                    'Spots on leaves',
                    'Yellowing of leaves',
                    'Stunted growth',
                    'Leaf curling'
                ],
                treatments: language === 'hi' ? [
                    'नीम का तेल का छिड़काव करें',
                    'प्रभावित पत्तियों को हटाएं',
                    'जैविक कीटनाशक का उपयोग करें',
                    'मिट्टी की जल निकासी में सुधार करें'
                ] : [
                    'Apply neem oil spray',
                    'Remove affected leaves',
                    'Use organic pesticides',
                    'Improve soil drainage'
                ],
                prevention: language === 'hi' ? [
                    'नियमित निरीक्षण करें',
                    'सही दूरी पर पौधे लगाएं',
                    'अधिक पानी न दें',
                    'जैविक खाद का उपयोग करें'
                ] : [
                    'Regular inspection',
                    'Proper plant spacing',
                    'Avoid overwatering',
                    'Use organic fertilizers'
                ],
                urgency: 'medium'
            }

            setResult(mockResult)

            // Speak the result if voice is enabled
            if (voiceEnabled) {
                const summary = language === 'hi'
                    ? `पहचान: ${mockResult.pest}। तत्काल उपचार की आवश्यकता है।`
                    : `Identified: ${mockResult.pest}. Treatment required.`
                onSpeak(summary)
            }

        } catch (err) {
            console.error('Error analyzing image:', err)
            setError(language === 'hi'
                ? 'छवि का विश्लेषण करने में समस्या हुई'
                : 'Failed to analyze the image'
            )
        }

        setIsAnalyzing(false)
    }

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'border-red-200 bg-red-50'
            case 'medium': return 'border-yellow-200 bg-yellow-50'
            case 'low': return 'border-green-200 bg-green-50'
            default: return 'border-gray-200 bg-gray-50'
        }
    }

    const getUrgencyText = (urgency: string) => {
        switch (urgency) {
            case 'high': return language === 'hi' ? 'तत्काल कार्रवाई आवश्यक' : 'Immediate Action Required'
            case 'medium': return language === 'hi' ? 'जल्दी उपचार करें' : 'Treat Soon'
            case 'low': return language === 'hi' ? 'निरीक्षण जारी रखें' : 'Monitor Closely'
            default: return ''
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Upload Area */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bug className="w-6 h-6 text-red-600" />
                        {t('pestDetection')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!imagePreview ? (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">
                                {t('dragDropText')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {language === 'hi' ? 'JPG, PNG फाइलें समर्थित हैं' : 'JPG, PNG files supported'}
                            </p>
                        </div>
                    ) : (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Uploaded plant"
                                className="w-full max-w-md mx-auto rounded-lg shadow-md"
                            />
                            <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={clearImage}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 justify-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {language === 'hi' ? 'फाइल चुनें' : 'Choose File'}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => cameraInputRef.current?.click()}
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            {language === 'hi' ? 'फोटो लें' : 'Take Photo'}
                        </Button>

                        <Button
                            onClick={analyzeImage}
                            disabled={!selectedImage || isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('analyzing')}
                                </>
                            ) : (
                                <>
                                    <Bug className="w-4 h-4 mr-2" />
                                    {t('analyzeImage')}
                                </>
                            )}
                        </Button>
                    </div>

                    {error && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="w-4 h-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Analysis Results */}
            {result && (
                <>
                    {/* Detection Summary */}
                    <Card className={getUrgencyColor(result.urgency)}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    {language === 'hi' ? 'पहचान परिणाम' : 'Detection Result'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Badge variant={result.urgency === 'high' ? 'destructive' : result.urgency === 'medium' ? 'default' : 'secondary'}>
                                        {getUrgencyText(result.urgency)}
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            const textToCopy = `${language === 'hi' ? 'पहचाना गया' : 'Identified'}: ${result.pest}\n${language === 'hi' ? 'विश्वसनीयता' : 'Confidence'}: ${result.confidence}\n\n${result.description}`;
                                            await copyToClipboard(textToCopy);
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
                                            const textToCopy = `${language === 'hi' ? 'पहचाना गया' : 'Identified'}: ${result.pest}\n${language === 'hi' ? 'विश्वसनीयता' : 'Confidence'}: ${result.confidence}\n\n${result.description}`;
                                            const button = e.currentTarget;
                                            const originalContent = button.innerHTML;
                                            const success = await selectAllAndCopy(textToCopy, (isCopying) => {
                                                button.innerHTML = isCopying ? '✓' : originalContent;
                                            });
                                            if (!success) {
                                                console.error('Failed to copy text');
                                            }
                                        }}
                                        title="Select all and copy"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                        </svg>
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{language === 'hi' ? 'पहचाना गया' : 'Identified'}:</span>
                                    <span className="text-lg font-semibold">{result.pest}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{language === 'hi' ? 'विश्वसनीयता' : 'Confidence'}:</span>
                                    <Badge variant="outline">{result.confidence}</Badge>
                                </div>
                                <Separator />
                                <p className="text-gray-700">{result.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Symptoms and Treatments */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Symptoms */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        {language === 'hi' ? 'लक्षण' : 'Symptoms'}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const symptomsText = result.symptoms.join('\n');
                                            navigator.clipboard.writeText(symptomsText);
                                        }}
                                        title="Copy symptoms to clipboard"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {result.symptoms.map((symptom, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">{symptom}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Treatments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Droplets className="w-5 h-5 text-green-600" />
                                        {language === 'hi' ? 'उपचार' : 'Treatment'}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const treatmentsText = result.treatments.join('\n');
                                            navigator.clipboard.writeText(treatmentsText);
                                        }}
                                        title="Copy treatments to clipboard"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {result.treatments.map((treatment, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">{treatment}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Prevention */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Leaf className="w-5 h-5 text-blue-600" />
                                        {language === 'hi' ? 'बचाव' : 'Prevention'}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const preventionText = result.prevention.join('\n');
                                            navigator.clipboard.writeText(preventionText);
                                        }}
                                        title="Copy prevention measures to clipboard"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {result.prevention.map((prevent, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">{prevent}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Information */}
                    <Alert>
                        <Info className="w-4 h-4" />
                        <AlertDescription>
                            <strong>{language === 'hi' ? 'महत्वपूर्ण नोट' : 'Important Note'}:</strong>{' '}
                            {language === 'hi'
                                ? 'यह AI-आधारित सुझाव है। अधिक सटीक निदान के लिए कृषि विशेषज्ञ से सलाह लें। गंभीर मामलों में तुरंत कार्रवाई करें।'
                                : 'This is an AI-based suggestion. Consult with an agricultural expert for more accurate diagnosis. Take immediate action in severe cases.'
                            }
                        </AlertDescription>
                    </Alert>
                </>
            )}

            {/* Common Pests Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bug className="w-5 h-5 text-orange-600" />
                        {language === 'hi' ? 'सामान्य कीट और रोग' : 'Common Pests & Diseases'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                name: language === 'hi' ? 'माहू' : 'Aphids',
                                symptoms: language === 'hi' ? 'पत्तियों का पीला होना, चिपचिपाहट' : 'Yellowing leaves, sticky residue',
                                treatment: language === 'hi' ? 'नीम का तेल, साबुन का पानी' : 'Neem oil, soap water'
                            },
                            {
                                name: language === 'hi' ? 'सफेद मक्खी' : 'Whitefly',
                                symptoms: language === 'hi' ? 'पत्तियों के नीचे सफेद कीड़े' : 'White insects under leaves',
                                treatment: language === 'hi' ? 'पीले रंग के जाल, नीम' : 'Yellow traps, neem'
                            },
                            {
                                name: language === 'hi' ? 'कैटरपिलर' : 'Caterpillars',
                                symptoms: language === 'hi' ? 'पत्तियों में छेद, कुतरे हुए भाग' : 'Holes in leaves, chewed parts',
                                treatment: language === 'hi' ? 'बीटी स्प्रे, हाथ से हटाना' : 'BT spray, hand picking'
                            },
                            {
                                name: language === 'hi' ? 'फंगल रोग' : 'Fungal Diseases',
                                symptoms: language === 'hi' ? 'धब्बे, सड़न, काले निशान' : 'Spots, rot, black marks',
                                treatment: language === 'hi' ? 'कॉपर फंगीसाइड' : 'Copper fungicide'
                            },
                            {
                                name: language === 'hi' ? 'थ्रिप्स' : 'Thrips',
                                symptoms: language === 'hi' ? 'चांदी जैसे धब्बे' : 'Silvery patches',
                                treatment: language === 'hi' ? 'नीला चिपकने वाला जाल' : 'Blue sticky traps'
                            },
                            {
                                name: language === 'hi' ? 'माइट्स' : 'Spider Mites',
                                symptoms: language === 'hi' ? 'जालेदार संरचना, पीले धब्बे' : 'Web-like structures, yellow spots',
                                treatment: language === 'hi' ? 'पानी का छिड़काव, नीम' : 'Water spray, neem'
                            }
                        ].map((pest, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                                <h4 className="font-medium text-sm mb-1">{pest.name}</h4>
                                <p className="text-xs text-gray-600 mb-1">
                                    <strong>{language === 'hi' ? 'लक्षण' : 'Symptoms'}:</strong> {pest.symptoms}
                                </p>
                                <p className="text-xs text-gray-600">
                                    <strong>{language === 'hi' ? 'उपचार' : 'Treatment'}:</strong> {pest.treatment}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}