'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
    Camera,
    Upload,
    X,
    AlertTriangle,
    Bug,
    CheckCircle,
    Download,
    Share2,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/hooks/useLanguage'

import { 
    copyToClipboard,
    selectAllAndCopy,
    formatPestDetectionResult,
    formatSymptoms,
    formatTreatments,
    formatPrevention,
    formatAffectedCrops
} from '@/utils/copyUtils'
import { 
    isCameraSupported,
    isSecureContextAvailable,
    getCameraConstraints,
    normalizeCameraError,
    stopMediaStream,
    captureImageFromVideo
} from '@/utils/cameraUtils'

interface PestDetectionResult {
    pestName?: string;
    confidence?: number;
    severity?: 'low' | 'medium' | 'high' | string;
    description?: string;
    symptoms?: string[];
    treatment?: string[];
    prevention?: string[];
    organicTreatment?: string[];
    chemicalTreatment?: string[];
    cropsDamaged?: string[];
    seasonality?: string;
    processedWithLanguage?: string;
    timestamp?: string;
    isFallback?: boolean;
}

interface EnhancedPestDetectionProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

export function EnhancedPestDetection({ voiceEnabled, onSpeak }: EnhancedPestDetectionProps) {
    const { t, language, isOnline } = useLanguage()
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<PestDetectionResult | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [loading, setLoading] = useState(false)
    const [lastLanguage, setLastLanguage] = useState(language)
    const [isLowQuality, setIsLowQuality] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [analysisHistory, setAnalysisHistory] = useState<Array<{
        id: string
        image: string
        result: PestDetectionResult
        timestamp: Date
    }>>([])

    // Cleanup function to stop camera when component unmounts
    useEffect(() => {
        const video = videoRef.current
        
        return () => {
            // Clean up camera stream on unmount
            if (video?.srcObject) {
                stopMediaStream(video.srcObject as MediaStream)
            }
        }
    }, [])

    // Mock pest database for demonstration - Multilingual Support
    const getPestDatabase = (): PestDetectionResult[] => {
        const pestsData = {
            'Aphids': {
                en: {
                    pestName: 'Aphids',
                    description: 'Small, soft-bodied insects that feed on plant sap',
                    symptoms: ['Yellowing leaves', 'Stunted growth', 'Honeydew deposits', 'Curled leaves'],
                    treatment: ['Spray with water', 'Apply neem oil', 'Use insecticidal soap'],
                    prevention: ['Remove weeds', 'Encourage beneficial insects', 'Regular monitoring'],
                    organicTreatment: ['Neem oil spray', 'Ladybug release', 'Garlic spray'],
                    chemicalTreatment: ['Imidacloprid', 'Thiamethoxam', 'Acetamiprid'],
                    seasonality: 'Spring and summer'
                },
                hi: {
                    pestName: 'एफिड्स (माहू)',
                    description: 'छोटे कोमल शरीर वाले कीड़े जो पौधों का रस चूसते हैं',
                    symptoms: ['पत्तियों का पीला होना', 'बौनी वृद्धि', 'चिपचिपा पदार्थ', 'मुड़ी हुई पत्तियाँ'],
                    treatment: ['पानी का छिड़काव', 'नीम तेल लगाएं', 'कीटनाशक साबुन का उपयोग'],
                    prevention: ['Remove weeds', 'Encourage beneficial insects', 'Regular monitoring'],
                    organicTreatment: ['नीम तेल स्प्रे', 'लेडीबग छोड़ें', 'गरलिक स्प्रे'],
                    chemicalTreatment: ['इमिडाक्लोप्रिड', 'थायामेथॉक्साम', 'एसिटामिप्रिड'],
                    seasonality: 'वसंत और गर्मी'
                },
                ta: {
                    pestName: 'பசுமைப் பூச்சி',
                    description: 'தாவர சாற்றை உறிஞ்சும் சிறிய மென்மையான பூச்சிகள்',
                    symptoms: ['இலைகள் மஞ்சளாகுதல்', 'வளர்ச்சி குன்றுதல்', 'தேன் போன்ற பொருள்', 'சுருண்ட இலைகள்'],
                    treatment: ['நீர் தெளிப்பு', 'வேப்ப எண்ணெய்', 'பூச்சிக்கொல்லி சோப்பு'],
                    prevention: ['களைகளை அகற்றுதல்', 'நல்ல பூச்சிகளை ஊக்குவித்தல்', 'வழக்கமான கண்காணிப்பு'],
                    organicTreatment: ['வேப்ப எண்ணெய் தெளிப்பு', 'லேடிபேர்ட் வெளியீடு', 'பூண்டு தெளிப்பு'],
                    chemicalTreatment: ['இமிடாக்ளோப்ரிட்', 'தையாமெதாக்சம்', 'அசிடாமிப்ரிட்'],
                    seasonality: 'வசந்த மற்றும் கோடை காலம்'
                }
            },
            'Bollworm': {
                en: {
                    pestName: 'Bollworm',
                    description: 'Caterpillar pest that damages cotton bolls and other crops',
                    symptoms: ['Holes in bolls', 'Damaged fruits', 'Frass deposits', 'Wilting'],
                    treatment: ['Pheromone traps', 'Bt spray', 'Hand picking'],
                    prevention: ['Crop rotation', 'Border crops', 'Early harvesting'],
                    organicTreatment: ['Bacillus thuringiensis', 'Neem extract', 'Trichogramma release'],
                    chemicalTreatment: ['Chlorantraniliprole', 'Spinosad', 'Emamectin benzoate'],
                    seasonality: 'Monsoon season'
                },
                hi: {
                    pestName: 'बॉलवर्म (गुलाबी सुंडी)',
                    description: 'कैटरपिलर कीट जो कपास और अन्य फसलों को नुकसान पहुंचाता है',
                    symptoms: ['फलों में छेद', 'क्षतिग्रस्त फल', 'मल जमा', 'मुरझाना'],
                    treatment: ['फेरोमोन ट्रैप', 'बीटी स्प्रे', 'हाथ से चुनना'],
                    prevention: ['फसल चक्र', 'सीमांत फसलें', 'जल्दी कटाई'],
                    organicTreatment: ['बैसिलस थुरिंजेंसिस', 'नीम अर्क', 'ट्राइकोग्रामा छोड़ना'],
                    chemicalTreatment: ['क्लोरेंट्रानिलिप्रोल', 'स्पिनोसाड', 'इमामेक्टिन बेंजोएट'],
                    seasonality: 'मानसून का मौसम'
                },
                ta: {
                    pestName: 'பருத்தி புழு',
                    description: 'பருத்தி மற்றும் பிற பயிர்களை சேதப்படுத்தும் கம்பளிப்பூச்சி',
                    symptoms: ['காய்களில் துளைகள்', 'சேதமான பழங்கள்', 'மலம் படிவு', 'வாடுதல்'],
                    treatment: ['ஃபெரோமோன் பொறிகள்', 'பிடி தெளிப்பு', 'கை எடுத்தல்'],
                    prevention: ['பயிர் சுழற்சி', 'எல்லை பயிர்கள்', 'முன்கூட்டிய அறுவடை'],
                    organicTreatment: ['பேசிலஸ் துரிஞ்சியென்சிஸ்', 'வேப்ப சாறு', 'டிரைக்கோகிராமா வெளியீடு'],
                    chemicalTreatment: ['குளோரான்டிரானிலிப்ரோல்', 'ஸ்பிநோசாட்', 'இமாமெக்டின் பென்சோயேட்'],
                    seasonality: 'பருவமழை காலம்'
                }
            },
            'Whitefly': {
                en: {
                    pestName: 'Whitefly',
                    description: 'Small white flying insects that suck plant juices',
                    symptoms: ['Yellowing leaves', 'Sooty mold', 'Reduced vigor', 'Honeydew'],
                    treatment: ['Yellow sticky traps', 'Reflective mulch', 'Neem oil'],
                    prevention: ['Crop rotation', 'Remove infected plants', 'Companion planting'],
                    organicTreatment: ['Insecticidal soap', 'Reflective mulch', 'Beneficial insects'],
                    chemicalTreatment: ['Spiromesifen', 'Pyriproxyfen', 'Buprofezin'],
                    seasonality: 'Year-round in warm climates'
                },
                hi: {
                    pestName: 'व्हाइटफ्लाई (सफेद मक्खी)',
                    description: 'छोटी सफेद उड़ने वाली मक्खियाँ जो पौधों का रस चूसती हैं',
                    symptoms: ['पत्तियों का पीला होना', 'काली फफूंद', 'कम ताकत', 'चिपचिपा पदार्थ'],
                    treatment: ['पीले चिपकने वाले जाल', 'परावर्तक मल्च', 'नीम तेल'],
                    prevention: ['फसल चक्र', 'संक्रमित पौधों को हटाएं', 'साथी फसल'],
                    organicTreatment: ['कीटनाशक साबुन', 'परावर्तक मल्च', 'लाभकारी कीड़े'],
                    chemicalTreatment: ['स्पिरोमेसिफेन', 'पायरिप्रॉक्सिफेन', 'बुप्रोफेज़िन'],
                    seasonality: 'गर्म जलवायु में साल भर'
                },
                ta: {
                    pestName: 'வெள்ளை ஈ',
                    description: 'தாவர சாற்றை உறிஞ்சும் சிறிய வெள்ளை பறக்கும் பூச்சிகள்',
                    symptoms: ['இலைகள் மஞ்சளாகுதல்', 'கருப்பு பூஞ்சை', 'வீரியம் குறைதல்', 'தேன் போன்ற பொருள்'],
                    treatment: ['மஞ்சள் ஒட்டும் பொறிகள்', 'பிரதிபலிப்பு மல்ச்', 'வேப்ப எண்ணெய்'],
                    prevention: ['பயிர் சுழற்சி', 'பாதிக்கப்பட்ட செடிகளை அகற்றுதல்', 'துணை நடவு'],
                    organicTreatment: ['பூச்சிக்கொல்லி சோப்பு', 'பிரதிபலிப்பு மல்ச்', 'நன்மை பயக்கும் பூச்சிகள்'],
                    chemicalTreatment: ['ஸ்பைரோமெசிஃபென்', 'பைரிப்ராக்ஸிஃபென்', 'புப்ரோஃபெசின்'],
                    seasonality: 'வெப்பமான காலநிலையில் ஆண்டு முழுவதும்'
                }
            }
        }

        return Object.keys(pestsData).map(pestKey => {
            const pest = pestsData[pestKey as keyof typeof pestsData]
            const langData = pest[language as keyof typeof pest] || pest.en
            return {
                ...langData,
                confidence: Math.floor(Math.random() * 20) + 80,
                severity: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
                cropsDamaged: ['wheat', 'cotton', 'potato', 'tomato']
            }
        })
    }

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }, [])

    const validateImage = async (file: File): Promise<{ isValid: boolean, isLowQuality: boolean }> => {
        return new Promise((resolve) => {
            const img = new Image()
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height
                ctx?.drawImage(img, 0, 0)

                // Check if image has green colors (plants) and resolution
                const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
                if (!imageData) {
                    resolve({ isValid: false, isLowQuality: false })
                    return
                }

                // Check for low quality but still allow processing
                const isLowQuality = canvas.width < 200 || canvas.height < 200

                let greenPixels = 0
                const totalPixels = imageData.data.length / 4

                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i]
                    const g = imageData.data[i + 1]
                    const b = imageData.data[i + 2]

                    // Check for green-ish colors (plants/crops)
                    if (g > r && g > b && g > 50) {
                        greenPixels++
                    }
                }

                // If less than 5% green pixels, likely not a plant image
                const greenRatio = greenPixels / totalPixels
                if (greenRatio <= 0.05) {
                    alert('This doesn\'t appear to be a crop/plant image. Please upload a clear photo of affected crops or plants.')
                    resolve({ isValid: false, isLowQuality })
                } else {
                    resolve({ isValid: true, isLowQuality })
                }
            }

            img.onerror = () => {
                alert('Invalid image file. Please select a valid image.')
                resolve({ isValid: false, isLowQuality: false })
            }
            img.src = URL.createObjectURL(file)
        })
    }

    const handleFileUpload = async (file: File) => {
        if (file && file.type.startsWith('image/')) {
            // Show loading indicator
            setLoading(true)

            try {
                // Validate if image contains crop/plant content
                const validationResult = await validateImage(file)

                if (!validationResult.isValid) {
                    setLoading(false)
                    return
                }

                // Set low quality flag for warning display
                setIsLowQuality(validationResult.isLowQuality)

                const reader = new FileReader()
                reader.onload = (e) => {
                    const imageUrl = e.target?.result as string
                    setSelectedImage(imageUrl)
                    analyzePest(imageUrl)
                }
                reader.readAsDataURL(file)
            } catch (error) {
                console.error('Error processing image:', error)
                alert('Error processing image. Please try again.')
                setLoading(false)
            }
        } else {
            alert('Please upload a valid image file (JPG, PNG, etc.)')
        }
    }

    const analyzePest = async (imageUrl: string, lang: string = language) => {
        setAnalyzing(true)
        setResult(null)
        setLoading(true)

        try {
            if (process.env.NODE_ENV !== 'production') {
                console.log('Starting pest analysis with language:', lang)
            }

            // Call the pest analysis API route
            const response = await fetch('/api/analyze-pest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: imageUrl,
                    language: lang
                }),
            }).then(res => res.json())

            // Log the raw response for debugging in development
            if (process.env.NODE_ENV !== 'production') {
                console.log('Image Analysis API Response:', response)
            }

            if (!response?.success) {
                throw new Error(response?.error || 'Analysis failed with no error message')
            }

            const analysisResult = response.result

            if (!analysisResult) {
                throw new Error('No analysis result in response')
            }

            // Add language-specific processing metadata
            // Process confidence value - ensure it's a number between 0-100
            let confidenceValue = 0
            if (typeof analysisResult.confidence === 'number') {
                confidenceValue = analysisResult.confidence
                // If confidence is 0-1, convert to percentage
                if (confidenceValue <= 1) {
                    confidenceValue *= 100
                }
                // Ensure confidence is between 0-100
                confidenceValue = Math.max(0, Math.min(100, confidenceValue))
                // Round to 2 decimal places
                confidenceValue = Math.round(confidenceValue * 100) / 100
            }

            const enhancedResult = {
                pestName: analysisResult.pestName || 'Unknown Pest',
                confidence: confidenceValue,
                severity: analysisResult.severity ||
                    (confidenceValue >= 80 ? 'high' :
                        confidenceValue >= 50 ? 'medium' : 'low'),
                description: analysisResult.description || 'No description available',
                symptoms: Array.isArray(analysisResult.symptoms) ? analysisResult.symptoms : [],
                treatment: Array.isArray(analysisResult.treatment) ? analysisResult.treatment : [],
                prevention: Array.isArray(analysisResult.prevention) ? analysisResult.prevention : [],
                organicTreatment: Array.isArray(analysisResult.organicTreatment) ? analysisResult.organicTreatment : [],
                chemicalTreatment: Array.isArray(analysisResult.chemicalTreatment) ? analysisResult.chemicalTreatment : [],
                cropsDamaged: Array.isArray(analysisResult.cropsDamaged) ? analysisResult.cropsDamaged : [],
                seasonality: analysisResult.seasonality || 'No seasonality information',
                processedWithLanguage: lang,
                timestamp: new Date().toISOString()
            }

            // Log analysis result if not in production
            if (process.env.NODE_ENV !== 'production') {
                console.log('Enhanced result:', enhancedResult)
            }

            setResult(enhancedResult)

            // Add to history
            const historyItem = {
                id: Date.now().toString(),
                image: imageUrl,
                result: enhancedResult,
                timestamp: new Date()
            }
            setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 4)]) // Keep last 5

            if (voiceEnabled) {
                const announcement = `Pest detected: ${enhancedResult.pestName} with ${enhancedResult.confidence}% confidence. Severity level: ${enhancedResult.severity}.`
                onSpeak(announcement)
            }
        } catch (error) {
            console.error('Pest analysis failed:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            console.log('Falling back to mock data due to:', errorMessage)

            // Fallback to mock data if AI analysis fails
            const pestDatabase = getPestDatabase()
            const randomPest = pestDatabase[Math.floor(Math.random() * pestDatabase.length)]

            const fallbackResult = {
                ...randomPest,
                confidence: Math.floor(Math.random() * 20) + 80,
                processedWithLanguage: lang,
                timestamp: new Date().toISOString(),
                isFallback: true
            }

            setResult(fallbackResult)

            // Add to history
            const historyItem = {
                id: Date.now().toString(),
                image: imageUrl,
                result: fallbackResult,
                timestamp: new Date()
            }
            setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 4)])

            // Show error message to user
            alert(language === 'hi' ? 'विश्लेषण विफल हुआ। मॉक डेटा का उपयोग किया जा रहा है।' :
                language === 'ta' ? 'பகுப்பாய்வு தோல்வி. மாதிரி தரவு பயன்படுத்தப்படுகிறது.' :
                    language === 'te' ? 'విశ్లేషణ విఫలమైంది. నమూనా డేటా ఉపయోగించబడుతుంది.' :
                        'Analysis failed. Using mock data instead.')
        } finally {
            setAnalyzing(false)
            setLoading(false)
        }
    }

    const startCamera = async () => {
        try {
            // Show loading state immediately
            setCameraActive(true)
            setError(null)
            setLoading(true)
            
            // Check if we're in a secure context
            if (!isSecureContextAvailable()) {
                const error = new Error('Camera access requires a secure connection (HTTPS or localhost). Please ensure you are accessing this application through a secure connection.')
                throw error
            }

            // Check if mediaDevices is available
            if (!isCameraSupported()) {
                const error = new Error('Camera is not supported in your browser. Please try a modern browser like Chrome, Firefox, or Edge.')
                throw error
            }

            // Try to get camera access with preferred constraints
            let stream: MediaStream;
            
            try {
                stream = await navigator.mediaDevices.getUserMedia(getCameraConstraints('environment'))
            } catch (primaryError) {
                console.warn('Primary camera constraints failed, trying fallback:', primaryError)
                // Fallback to simpler constraints
                try {
                    stream = await navigator.mediaDevices.getUserMedia(getCameraConstraints('user'))
                } catch (fallbackError) {
                    console.warn('User-facing camera also failed, trying any camera:', fallbackError)
                    // Last resort - try any camera
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: true
                    })
                }
            }
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                // Add event listeners for better error handling
                videoRef.current.onloadedmetadata = () => {
                    console.log('Camera stream loaded successfully')
                    setLoading(false)
                }
                
                videoRef.current.onerror = (e) => {
                    console.error('Video element error:', e)
                    setError('Failed to display camera feed. Please try again.')
                    setLoading(false)
                }
            }
        } catch (error: any) {
            // Reset camera state on error
            setCameraActive(false)
            setLoading(false)
            
            console.error('Camera access failed:', error)
            const normalizedError = normalizeCameraError(error)
            setError(normalizedError.message)
            
            // Show error in an alert only if it's a user interaction error
            if (normalizedError.type === 'permission') {
                alert(normalizedError.message)
            }
        }
    }

    const stopCamera = () => {
        try {
            if (videoRef.current?.srcObject) {
                stopMediaStream(videoRef.current.srcObject as MediaStream)
                videoRef.current.srcObject = null
            }
        } catch (error) {
            console.error('Error stopping camera:', error)
        } finally {
            setCameraActive(false)
            setError(null)
        }
    }

    const capturePhoto = () => {
        if (!videoRef.current) {
            const errorMsg = t('videoNotReady') || 'Video is not ready yet. Please wait a moment and try again.'
            console.error('Video element not found')
            alert(errorMsg)
            return
        }

        // Check if video is actually playing
        if (!videoRef.current.srcObject) {
            const errorMsg = t('videoNotReady') || 'Video stream not available. Please start the camera first.'
            console.error('Video stream not available')
            alert(errorMsg)
            return
        }

        if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
            const errorMsg = t('videoNotReady') || 'Video is not ready yet. Please wait a moment and try again.'
            console.error('Video not ready, current state:', videoRef.current.readyState)
            alert(errorMsg)
            return
        }

        try {
            const imageUrl = captureImageFromVideo(videoRef.current)
            
            if (!imageUrl || imageUrl === 'data:,') {
                throw new Error('Failed to capture image from video stream')
            }
            
            setSelectedImage(imageUrl)
            stopCamera()
            analyzePest(imageUrl)
        } catch (error: any) {
            console.error('Photo capture failed:', error)
            const errorMsg = t('captureFailed') || `Failed to capture photo: ${error.message || 'Please try again'}`
            alert(errorMsg)
            stopCamera()
        }
    }

    const getSeverityColor = (severity: string | undefined) => {
        switch (severity?.toLowerCase()) {
            case 'high': return 'bg-red-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    const getSeverityIcon = (severity: string | undefined) => {
        switch (severity?.toLowerCase()) {
            case 'high': return <AlertTriangle className="h-4 w-4" />
            case 'medium': return <Bug className="h-4 w-4" />
            case 'low': return <CheckCircle className="h-4 w-4" />
            default: return <Bug className="h-4 w-4" />
        }
    }

    const deleteAnalysis = (idToDelete: string) => {
        setAnalysisHistory(prev => prev.filter(item => item.id !== idToDelete))
        // If deleting the currently displayed result, clear it
        if (result && analysisHistory.find(item => item.id === idToDelete && item.result === result)) {
            setResult(null)
            setSelectedImage(null)
        }
    }

    const downloadReport = () => {
        if (result && selectedImage) {
            // Create human-readable PDF-style report
            const reportContent = `
PEST ANALYSIS REPORT
===================

Analysis Date: ${new Date().toLocaleDateString()}
Analysis Time: ${new Date().toLocaleTimeString()}

PEST IDENTIFICATION
-------------------
Pest Name: ${result.pestName || 'Unknown'}
Confidence Level: ${result.confidence || 0}%
Severity: ${(result.severity || 'unknown').toUpperCase()}
Description: ${result.description || 'No description available'}
Seasonality: ${result.seasonality || 'Not specified'}

AFFECTED CROPS
--------------
${result.cropsDamaged?.map((crop, index) => `${index + 1}. ${crop}`).join('\n') || 'No crop data available'}

SYMPTOMS TO LOOK FOR
--------------------
${result.symptoms?.map((symptom, index) => `${index + 1}. ${symptom}`).join('\n') || 'No symptoms data available'}

ORGANIC TREATMENT OPTIONS
-------------------------
${result.organicTreatment?.map((treatment, index) => `${index + 1}. ${treatment}`).join('\n') || 'No organic treatment data available'}

CHEMICAL TREATMENT OPTIONS
--------------------------
${result.chemicalTreatment?.map((treatment, index) => `${index + 1}. ${treatment}`).join('\n') || 'No chemical treatment data available'}

SAFETY WARNING: Always follow safety guidelines and local regulations when using chemical pesticides.

PREVENTION STRATEGIES
--------------------
${result.prevention?.map((prevention, index) => `${index + 1}. ${prevention}`).join('\n') || 'No prevention data available'}

RECOMMENDATIONS
---------------
1. Implement integrated pest management (IPM) practices
2. Regular monitoring of crops for early detection
3. Use organic methods as first line of defense
4. Consult local agricultural experts for region-specific advice
5. Follow manufacturer instructions for all treatments

GENERATED BY: KrishiMitra AI Agricultural Assistant
For more information visit: https://krishimitra.com

---
This report is for informational purposes only. Please consult with agricultural experts for professional advice.`

            // Download as text file (which is more universally readable than JSON)
            const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `pest-analysis-report-${(result.pestName || 'unknown').replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            // Show success message
            if (voiceEnabled) {
                onSpeak('Report downloaded successfully. Check your downloads folder.')
            }
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5" />
                        {t('pestDetection')}
                        <Badge variant={isOnline ? 'default' : 'secondary'}>
                            {isOnline ? 'AI Powered' : t('offlineMode')}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Upload Section */}
                    {!selectedImage && (
                        <div className="space-y-4">
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-semibold mb-2">Upload Pest Image</h3>
                                <p className="text-gray-600 mb-4">
                                    Drag and drop an image or click to browse
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="outline"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose File
                                    </Button>
                                    <Button
                                        onClick={cameraActive ? stopCamera : startCamera}
                                        variant="outline"
                                    >
                                        <Camera className="h-4 w-4 mr-2" />
                                        {cameraActive ? 'Stop Camera' : 'Use Camera'}
                                    </Button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    className="hidden"
                                />
                            </div>

                            {/* Camera View */}
                            {cameraActive && (
                                <div className="relative">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                    />
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                                        <Button 
                                            onClick={capturePhoto} 
                                            size="lg" 
                                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                            disabled={loading}
                                        >
                                            <Camera className="h-5 w-5 mr-2" />
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            ) : null}
                                            {t('capturePhoto') || 'Capture Photo'}
                                        </Button>
                                        <Button 
                                            onClick={stopCamera} 
                                            size="lg" 
                                            variant="outline"
                                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                                        >
                                            <X className="h-5 w-5 mr-2" />
                                            {t('cancel') || 'Cancel'}
                                        </Button>
                                    </div>
                                    
                                    {/* Camera indicator */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm">{t('recording') || 'LIVE'}</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Camera loading state */}
                            {cameraActive && !videoRef.current?.srcObject && (
                                <div className="flex items-center justify-center p-4">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                                        <span>{t('cameraLoading') || 'Loading camera...'}</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Camera Error */}
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-red-800 dark:text-red-200">Camera Error</h4>
                                            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="mt-2 text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/30"
                                                onClick={() => setError(null)}
                                            >
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Selected Image and Analysis */}
                    {selectedImage && (
                        <div className="space-y-6">
                            <div className="relative">
                                <img
                                    src={selectedImage}
                                    alt="Selected for analysis"
                                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                                />
                                <Button
                                    onClick={() => {
                                        setSelectedImage(null)
                                        setResult(null)
                                        setAnalyzing(false)
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Analysis Progress */}
                            {analyzing && (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">Analyzing Image...</h3>
                                        <Progress value={Math.random() * 100} className="w-full max-w-sm mx-auto" />
                                        <p className="text-sm text-gray-600 mt-2">
                                            Using AI to detect pests and diseases
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Analysis Result */}
                            {result && !analyzing && (
                                <div className="space-y-4">
                                    {/* Low Quality Warning */}
                                    {isLowQuality && (
                                        <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm mb-1">
                                                            ⚠️ {t('imageQualityPoor')}
                                                        </p>
                                                        <p className="text-xs">
                                                            {t('lowQualityWarning')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getSeverityIcon(result.severity)}
                                                    {t('detectionResult')}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button onClick={downloadReport} size="sm" variant="outline">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Report
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={async () => {
                                                            const textToCopy = formatPestDetectionResult(result, language);
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
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={async (e) => {
                                                            const textToCopy = formatPestDetectionResult(result, language);
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
                                                    <Button size="sm" variant="outline">
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        Share
                                                    </Button>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold">{result.pestName}</h3>
                                                    <p className="text-gray-600">{result.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className={`${getSeverityColor(result.severity || 'unknown')} text-white`}>
                                                        {(result?.severity || 'unknown').toUpperCase()} RISK
                                                    </Badge>
                                                    <p className="text-sm mt-1">
                                                        {(result?.confidence ?? 0) > 0 ? `${result.confidence}% Confidence` : 'Analyzing...'}
                                                    </p>
                                                </div>
                                            </div>

                                            <Progress value={result.confidence} className="w-full" />
                                        </CardContent>
                                    </Card>

                                    {/* Detailed Information */}
                                    <Tabs defaultValue="symptoms" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4">
                                            <TabsTrigger value="symptoms">{t('symptoms')}</TabsTrigger>
                                            <TabsTrigger value="treatment">{t('treatment')}</TabsTrigger>
                                            <TabsTrigger value="prevention">{t('prevention')}</TabsTrigger>
                                            <TabsTrigger value="details">{t('details')}</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="symptoms" className="space-y-2">
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <CardTitle className="text-lg">{t('symptomsToLookFor')}</CardTitle>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async () => {
                                                                const symptomsText = formatSymptoms(result.symptoms || []);
                                                                await copyToClipboard(symptomsText);
                                                            }}
                                                            title="Copy symptoms to clipboard"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </Button>
                                                        {/* Select All button for symptoms */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async (e) => {
                                                                const symptomsText = formatSymptoms(result.symptoms || []);
                                                                const button = e.currentTarget;
                                                                const originalContent = button.innerHTML;
                                                                const success = await selectAllAndCopy(symptomsText, (isCopying) => {
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
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {result.symptoms?.map((symptom, index) => (
                                                            <li key={index} className="flex items-center gap-2">
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                                {symptom}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="treatment" className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Card>
                                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <CardTitle className="text-lg text-green-600">{t('organicTreatment')}</CardTitle>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={async () => {
                                                                    const organicTreatmentText = formatTreatments(result.organicTreatment || []);
                                                                    await copyToClipboard(organicTreatmentText);
                                                                }}
                                                                title="Copy organic treatments to clipboard"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </Button>
                                                            {/* Select All button for organic treatment */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={async (e) => {
                                                                    const organicTreatmentText = formatTreatments(result.organicTreatment || []);
                                                                    const button = e.currentTarget;
                                                                    const originalContent = button.innerHTML;
                                                                    const success = await selectAllAndCopy(organicTreatmentText, (isCopying) => {
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
                                                    </CardHeader>
                                                    <CardContent>
                                                        <ul className="space-y-2">
                                                            {result.organicTreatment?.map((treatment, index) => (
                                                                <li key={index} className="flex items-center gap-2">
                                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    {treatment}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <CardTitle className="text-lg text-blue-600">{t('chemicalTreatment')}</CardTitle>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const chemicalTreatmentText = result.chemicalTreatment?.join('\n') || '';
                                                                    navigator.clipboard.writeText(chemicalTreatmentText);
                                                                }}
                                                                title="Copy chemical treatments to clipboard"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </Button>
                                                            {/* Select All button for chemical treatment */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    const chemicalTreatmentText = result.chemicalTreatment?.join('\n') || '';
                                                                    const textArea = document.createElement('textarea');
                                                                    textArea.value = chemicalTreatmentText;
                                                                    textArea.style.position = 'fixed';
                                                                    textArea.style.left = '-999999px';
                                                                    textArea.style.top = '-999999px';
                                                                    document.body.appendChild(textArea);
                                                                    textArea.focus();
                                                                    textArea.select();
                                                                    try {
                                                                        document.execCommand('copy');
                                                                        // Show visual feedback
                                                                        const button = e.currentTarget;
                                                                        const originalContent = button.innerHTML;
                                                                        button.innerHTML = '✓';
                                                                        setTimeout(() => {
                                                                            button.innerHTML = originalContent;
                                                                        }, 1000);
                                                                    } catch (err) {
                                                                        console.error('Failed to copy text: ', err);
                                                                    }
                                                                    document.body.removeChild(textArea);
                                                                }}
                                                                title="Select all and copy"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                                </svg>
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <ul className="space-y-2">
                                                            {result.chemicalTreatment?.map((treatment, index) => (
                                                                <li key={index} className="flex items-center gap-2">
                                                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                                    {treatment}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <Alert className="mt-4">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            <AlertDescription>
                                                                Always follow safety guidelines and local regulations when using chemical pesticides.
                                                            </AlertDescription>
                                                        </Alert>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="prevention" className="space-y-2">
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <CardTitle className="text-lg">{t('preventionStrategies')}</CardTitle>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const preventionText = result.prevention?.join('\n') || '';
                                                                navigator.clipboard.writeText(preventionText);
                                                            }}
                                                            title="Copy prevention strategies to clipboard"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </Button>
                                                        {/* Select All button for prevention */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                const preventionText = result.prevention?.join('\n') || '';
                                                                const textArea = document.createElement('textarea');
                                                                textArea.value = preventionText;
                                                                textArea.style.position = 'fixed';
                                                                textArea.style.left = '-999999px';
                                                                textArea.style.top = '-999999px';
                                                                document.body.appendChild(textArea);
                                                                textArea.focus();
                                                                textArea.select();
                                                                try {
                                                                    document.execCommand('copy');
                                                                    // Show visual feedback
                                                                    const button = e.currentTarget;
                                                                    const originalContent = button.innerHTML;
                                                                    button.innerHTML = '✓';
                                                                    setTimeout(() => {
                                                                        button.innerHTML = originalContent;
                                                                    }, 1000);
                                                                } catch (err) {
                                                                    console.error('Failed to copy text: ', err);
                                                                }
                                                                document.body.removeChild(textArea);
                                                            }}
                                                            title="Select all and copy"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {result.prevention?.map((prevention, index) => (
                                                            <li key={index} className="flex items-center gap-2">
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                                {prevention}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="details" className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Card>
                                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <CardTitle className="text-lg">{t('affectedCrops')}</CardTitle>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const cropsText = result.cropsDamaged?.join(', ') || '';
                                                                    navigator.clipboard.writeText(cropsText);
                                                                }}
                                                                title="Copy affected crops to clipboard"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </Button>
                                                            {/* Select All button for affected crops */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    const cropsText = result.cropsDamaged?.join(', ') || '';
                                                                    const textArea = document.createElement('textarea');
                                                                    textArea.value = cropsText;
                                                                    textArea.style.position = 'fixed';
                                                                    textArea.style.left = '-999999px';
                                                                    textArea.style.top = '-999999px';
                                                                    document.body.appendChild(textArea);
                                                                    textArea.focus();
                                                                    textArea.select();
                                                                    try {
                                                                        document.execCommand('copy');
                                                                        // Show visual feedback
                                                                        const button = e.currentTarget;
                                                                        const originalContent = button.innerHTML;
                                                                        button.innerHTML = '✓';
                                                                        setTimeout(() => {
                                                                            button.innerHTML = originalContent;
                                                                        }, 1000);
                                                                    } catch (err) {
                                                                        console.error('Failed to copy text: ', err);
                                                                    }
                                                                    document.body.removeChild(textArea);
                                                                }}
                                                                title="Select all and copy"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                                </svg>
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex flex-wrap gap-2">
                                                            {result.cropsDamaged?.map((crop, index) => (
                                                                <Badge key={index} variant="outline">
                                                                    {t(crop)}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <CardTitle className="text-lg">{t('seasonality')}</CardTitle>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(result.seasonality || '');
                                                                }}
                                                                title="Copy seasonality information to clipboard"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </Button>
                                                            {/* Select All button for seasonality */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    const textToCopy = result.seasonality || '';
                                                                    const textArea = document.createElement('textarea');
                                                                    textArea.value = textToCopy;
                                                                    textArea.style.position = 'fixed';
                                                                    textArea.style.left = '-999999px';
                                                                    textArea.style.top = '-999999px';
                                                                    document.body.appendChild(textArea);
                                                                    textArea.focus();
                                                                    textArea.select();
                                                                    try {
                                                                        document.execCommand('copy');
                                                                        // Show visual feedback
                                                                        const button = e.currentTarget;
                                                                        const originalContent = button.innerHTML;
                                                                        button.innerHTML = '✓';
                                                                        setTimeout(() => {
                                                                            button.innerHTML = originalContent;
                                                                        }, 1000);
                                                                    } catch (err) {
                                                                        console.error('Failed to copy text: ', err);
                                                                    }
                                                                    document.body.removeChild(textArea);
                                                                }}
                                                                title="Select all and copy"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                                </svg>
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p>{result.seasonality}</p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analysis History */}
                    {analysisHistory.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{t('recentAnalyses') || 'Recent Analyses'}</CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setAnalysisHistory([])
                                            if (result) {
                                                setResult(null)
                                                setSelectedImage(null)
                                            }
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {analysisHistory.slice(0, 3).map((item) => (
                                        <div
                                            key={item.id}
                                            className="border rounded-lg p-3 relative hover:shadow-md transition-shadow"
                                        >
                                            {/* Delete button - always visible with hover effect */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteAnalysis(item.id)
                                                }}
                                                className="absolute top-2 right-2 p-1 h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 shadow-sm border border-red-200 hover:border-red-400"
                                                title={t('delete') || 'Delete'}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>

                                            <div
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setSelectedImage(item.image)
                                                    setResult(item.result)
                                                }}
                                            >
                                                <img
                                                    src={item.image}
                                                    alt="Analysis history"
                                                    className="w-full h-24 object-cover rounded mb-2"
                                                />
                                                <p className="text-sm font-medium">{item.result.pestName}</p>
                                                <p className="text-xs text-gray-600">
                                                    {item.timestamp.toLocaleDateString()}
                                                </p>
                                                <Badge
                                                    className={`text-xs mt-1 ${getSeverityColor(item.result.severity)} text-white`}
                                                >
                                                    {item.result.confidence}% • {item.result.severity}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {analysisHistory.length > 3 && (
                                    <p className="text-sm text-gray-500 mt-3 text-center">
                                        {t('showingRecent') || 'Showing 3 most recent analyses'} • {analysisHistory.length} {t('totalAnalyses') || 'total'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}