'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Camera, X, Loader2, Bug, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/hooks/useLanguage'

interface PestDetectionResult {
    pestName: string
    confidence: number
    severity: 'low' | 'medium' | 'high'
    description: string
    symptoms: string[]
    treatment: string[]
    prevention: string[]
    organicTreatment?: string[]
    chemicalTreatment?: string[]
    cropsDamaged?: string[]
    seasonality?: string
}

interface PestDetectionFixedProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

export function PestDetectionFixed({ voiceEnabled, onSpeak }: PestDetectionFixedProps) {
    const { t, language, isOnline } = useLanguage()
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<PestDetectionResult | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [cameraActive, setCameraActive] = useState(false)

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

    const validateImageQuality = (canvas: HTMLCanvasElement): boolean => {
        const minDimension = Math.min(canvas.width, canvas.height)
        if (minDimension < 300) {
            return false
        }

        const context = canvas.getContext('2d')
        if (!context) return false

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        let totalBrightness = 0
        const pixels = imageData.data.length / 4

        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i]
            const g = imageData.data[i + 1]
            const b = imageData.data[i + 2]
            const brightness = (r + g + b) / 3
            totalBrightness += brightness
        }

        const avgBrightness = totalBrightness / pixels
        return avgBrightness >= 50 && avgBrightness <= 200
    }

    const showQualityWarning = () => {
        const warnings = {
            en: 'Warning: Low quality image detected. Please ensure good lighting for better pest detection.',
            hi: 'चेतावनी: कम गुणवत्ता की छवि मिली। बेहतर कीट पहचान के लिए अच्छी रोशनी का उपयोग करें।',
            ta: 'எச்சரিக்கை: குறைந்த தர படம் கண்டறியப்பட்டது। சிறந்த பூச்சி கண்டறிதலுக்கு நல்ல வெளிச்சம் பயன்படுத्तवुम्.',
            te: 'హెచ్చరిక: తక్కువ నాణ్యత చిత్రం గుర్తించబడింది. మెరుగైన కీటక గుర్తింపు కోసం మంచి వెలుగు వాడండి.',
            bn: 'সতর্কতা: কম মানের ছবি শনাক্ত করা হয়েছে। ভাল পোকা সনাক্তকরণের জন্য ভাল আলো ব্যবহার করুন।',
            gu: 'ચેતવણી: ઓછી ગુણવત્તાની છબી મળી. સારી કીટ માન્યતા માટે સારો પ્રકાશ વાપરો.',
            mr: 'इशारा: कमी गुणवत्तेची प्रतिमा मिळाली. चांगल्या कीट ओळखणेसाठी चांगला प्रकाश वापरा.',
            pa: 'ਚੇਤਾਵਨੀ: ਘੱਟ ਗੁਣਵੱਤਾ ਵਾਲੀ ਤਸਵੀਰ ਮਿਲੀ। ਬਿਹਤਰ ਕੀੜੇ ਦੀ ਪਛਾਣ ਲਈ ਚੰਗੀ ਰੌਸ਼ਨੀ ਵਰਤੋ।'
        }
        alert(warnings[language as keyof typeof warnings] || warnings.en)
    }

    const handleFileUpload = async (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string
                setSelectedImage(imageUrl)
                analyzePest(imageUrl)
            }
            reader.readAsDataURL(file)
        } else {
            alert('Please upload a valid image file')
        }
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setCameraActive(true)
            }
        } catch (error) {
            console.error('Camera access failed:', error)
            alert('Camera access denied. Please allow camera permissions and try again.')
        }
    }

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
            tracks.forEach(track => track.stop())
            videoRef.current.srcObject = null
        }
        setCameraActive(false)
    }

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight

            if (context) {
                context.drawImage(videoRef.current, 0, 0)

                // Check image quality
                const isGoodQuality = validateImageQuality(canvas)
                if (!isGoodQuality) {
                    showQualityWarning()
                }

                const imageUrl = canvas.toDataURL('image/jpeg', 0.8)
                setSelectedImage(imageUrl)
                stopCamera()
                analyzePest(imageUrl)
            }
        }
    }

    const analyzePest = async (imageUrl: string) => {
        setAnalyzing(true)
        setResult(null)

        try {
            const response = await fetch('/api/analyze-pest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: imageUrl,
                    language: language
                })
            })

            if (!response.ok) {
                throw new Error('Analysis request failed')
            }

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Analysis failed')
            }

            const result: PestDetectionResult = {
                pestName: data.result.pestName,
                confidence: data.result.confidence,
                severity: data.result.severity as 'low' | 'medium' | 'high',
                description: data.result.description,
                symptoms: data.result.symptoms,
                treatment: data.result.treatment,
                prevention: data.result.prevention,
                organicTreatment: data.result.organicTreatment || [],
                chemicalTreatment: data.result.chemicalTreatment || [],
                cropsDamaged: data.result.cropsDamaged || [],
                seasonality: data.result.seasonality || ''
            }

            setResult(result)

            if (voiceEnabled) {
                const announcement = `Pest detected: ${result.pestName} with ${result.confidence}% confidence.`
                onSpeak(announcement)
            }
        } catch (error) {
            console.error('Analysis failed:', error)
            // Show user-friendly error message
            alert(language === 'hi' ? 'विश्लेषण विफल हुआ। कृपया पुनः प्रयास करें।' :
                language === 'ta' ? 'பகுப்பாய்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.' :
                    language === 'te' ? 'విశ్లేషణ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.' :
                        'Analysis failed. Please try again.')
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
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
                                <h3 className="text-lg font-semibold mb-2">
                                    {language === 'hi' ? 'कीट छवि अपलोड करें' :
                                        language === 'ta' ? 'பூச்சி படத்தை பதिவেற்றவुम्' :
                                            language === 'te' ? 'పురుగుల చిత్రాన్ని అప్‌లోడ్ చేయండి' :
                                                'Upload Pest Image'}
                                </h3>
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="outline"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {t('uploadPhoto')}
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

                            {cameraActive && (
                                <div className="relative">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full rounded-lg"
                                    />
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                        <Button onClick={capturePhoto} size="lg">
                                            <Camera className="h-5 w-5 mr-2" />
                                            Capture
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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

                            {analyzing && (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            {language === 'hi' ? 'छवि का विश्लेषण...' : 'Analyzing Image...'}
                                        </h3>
                                        <Progress value={Math.random() * 100} className="w-full max-w-sm mx-auto" />
                                    </CardContent>
                                </Card>
                            )}

                            {result && !analyzing && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            Detection Result
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Show a message if no pest detected or all fields are empty */}
                                        {(
                                            result.pestName === 'Unknown Pest' ||
                                            [result.symptoms, result.treatment, result.prevention, result.organicTreatment, result.chemicalTreatment, result.cropsDamaged].every(arr => !arr || arr.length === 0)
                                        ) ? (
                                            <div className="text-center text-gray-600 py-8">
                                                <p className="text-lg font-semibold">No pest or disease detected in the image.</p>
                                                <p className="text-sm mt-2">Try uploading a clearer image or a different part of the plant.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{result.pestName}</h3>
                                                        <p className="text-gray-600">{result.description || 'No description available.'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge className="bg-yellow-500 text-white">
                                                            {result.severity ? result.severity.toUpperCase() : 'UNKNOWN'} RISK
                                                        </Badge>
                                                        <p className="text-sm mt-1">{typeof result.confidence === 'number' ? result.confidence : '?'}% Confidence</p>
                                                    </div>
                                                </div>
                                                <Progress value={typeof result.confidence === 'number' ? result.confidence : 0} className="w-full" />

                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <div>
                                                        <h4 className="font-medium mb-2">Symptoms:</h4>
                                                        <ul className="text-sm space-y-1">
                                                            {result.symptoms?.length ? result.symptoms.map((symptom, idx) => (
                                                                <li key={idx} className="flex items-center gap-2">
                                                                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                                                                    {symptom}
                                                                </li>
                                                            )) : <li>No data</li>}
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-medium mb-2">Treatment:</h4>
                                                        <ul className="text-sm space-y-1">
                                                            {result.treatment?.length ? result.treatment.map((treatment, idx) => (
                                                                <li key={idx} className="flex items-center gap-2">
                                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                                    {treatment}
                                                                </li>
                                                            )) : <li>No data</li>}
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-medium mb-2">Prevention:</h4>
                                                        <ul className="text-sm space-y-1">
                                                            {result.prevention?.length ? result.prevention.map((prevention, idx) => (
                                                                <li key={idx} className="flex items-center gap-2">
                                                                    <CheckCircle className="h-3 w-3 text-blue-500" />
                                                                    {prevention}
                                                                </li>
                                                            )) : <li>No data</li>}
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* Additional fields from API */}
                                                <div className="grid gap-4 md:grid-cols-2 mt-6">
                                                    <div>
                                                        <h4 className="font-medium mb-2">Organic Treatment:</h4>
                                                        <ul className="text-sm space-y-1">
                                                            {result.organicTreatment?.length ? result.organicTreatment.map((item, idx) => (
                                                                <li key={idx}>{item}</li>
                                                            )) : <li>No data</li>}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium mb-2">Chemical Treatment:</h4>
                                                        <ul className="text-sm space-y-1">
                                                            {result.chemicalTreatment?.length ? result.chemicalTreatment.map((item, idx) => (
                                                                <li key={idx}>{item}</li>
                                                            )) : <li>No data</li>}
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="grid gap-4 md:grid-cols-2 mt-6">
                                                    <div>
                                                        <h4 className="font-medium mb-2">Crops Damaged:</h4>
                                                        <ul className="text-sm space-y-1">
                                                            {result.cropsDamaged?.length ? result.cropsDamaged.map((item, idx) => (
                                                                <li key={idx}>{item}</li>
                                                            )) : <li>No data</li>}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium mb-2">Seasonality:</h4>
                                                        <p className="text-sm">{result.seasonality || 'No data'}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}