'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    TrendingUp,
    Bug,
    Droplets,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Loader2,
    BarChart3,
    Leaf,
    Thermometer,
    CloudRain,
    RefreshCw,
    Info
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { predictCropYield, predictPestOutbreaks, generateIrrigationSchedule } from '@/services/external/predictiveAnalyticsService'

interface PredictiveAnalyticsDashboardProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

export function PredictiveAnalyticsDashboard({ voiceEnabled, onSpeak }: PredictiveAnalyticsDashboardProps) {
    const { t, language } = useLanguage()
    const [activeTab, setActiveTab] = useState<'yield' | 'pests' | 'irrigation'>('yield')
    const [loading, setLoading] = useState(false)
    const [yieldData, setYieldData] = useState<any>(null)
    const [pestData, setPestData] = useState<any>(null)
    const [irrigationData, setIrrigationData] = useState<any>(null)
    const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090 }) // Default to Delhi
    const [crop, setCrop] = useState('Wheat')
    const [area, setArea] = useState(2) // hectares
    const [plantingDate, setPlantingDate] = useState('2023-05-01')

    // Load real data from predictive analytics service
    const loadData = async () => {
        setLoading(true);

        try {
            // Prepare input data for predictions
            const yieldInput = {
                crop,
                location,
                area,
                plantingDate,
                soilType: 'loamy',
                weatherHistory: [
                    {
                        date: '2023-05-01',
                        temperature: { min: 22, max: 32, avg: 27 },
                        rainfall: 5,
                        humidity: 65,
                        windSpeed: 10
                    },
                    {
                        date: '2023-05-02',
                        temperature: { min: 24, max: 34, avg: 29 },
                        rainfall: 0,
                        humidity: 60,
                        windSpeed: 12
                    }
                ],
                soilData: {
                    pH: 6.5,
                    moisture: 45,
                    organicMatter: 3.2,
                    nitrogen: 120,
                    phosphorus: 35,
                    potassium: 150
                }
            };

            const pestInput = {
                crop,
                location,
                plantingDate,
                weatherForecast: [
                    {
                        date: '2023-06-15',
                        temperature: { min: 25, max: 35, avg: 30 },
                        rainfall: 8,
                        humidity: 75,
                        windSpeed: 8
                    },
                    {
                        date: '2023-06-16',
                        temperature: { min: 26, max: 36, avg: 31 },
                        rainfall: 12,
                        humidity: 82,
                        windSpeed: 10
                    }
                ],
                pestHistory: [
                    {
                        pest: 'Aphids',
                        date: '2023-05-20',
                        severity: 'moderate' as const
                    }
                ]
            };

            const irrigationInput = {
                crop,
                location,
                soilType: 'loamy',
                plantingDate,
                weatherForecast: [
                    {
                        date: '2023-06-12',
                        temperature: { min: 24, max: 34, avg: 29 },
                        rainfall: 0,
                        humidity: 55,
                        windSpeed: 12
                    },
                    {
                        date: '2023-06-13',
                        temperature: { min: 25, max: 35, avg: 30 },
                        rainfall: 0,
                        humidity: 50,
                        windSpeed: 15
                    }
                ],
                soilData: {
                    pH: 6.5,
                    moisture: 35,
                    organicMatter: 3.2,
                    nitrogen: 120,
                    phosphorus: 35,
                    potassium: 150
                }
            };

            // Make API calls
            const [yieldResult, pestResult, irrigationResult] = await Promise.all([
                predictCropYield(yieldInput),
                predictPestOutbreaks(pestInput),
                generateIrrigationSchedule(irrigationInput)
            ]);

            // Update state with real data
            if (yieldResult.success && yieldResult.data) {
                setYieldData(yieldResult.data);
            }

            if (pestResult.success && pestResult.data) {
                setPestData(pestResult.data);
            }

            if (irrigationResult.success && irrigationResult.data) {
                setIrrigationData(irrigationResult.data);
            }
        } catch (error) {
            console.error('Error loading predictive analytics data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const speakSummary = () => {
        if (!voiceEnabled) return

        let summary = ''

        switch (activeTab) {
            case 'yield':
                if (yieldData) {
                    summary = language === 'hi'
                        ? `अनुमानित फसल उत्पादन ${yieldData.predictedYield} किलोग्राम है, ${yieldData.confidence} प्रतिशत आत्मविश्वास के साथ।`
                        : `Predicted crop yield is ${yieldData.predictedYield} kilograms, with ${yieldData.confidence} percent confidence.`
                }
                break
            case 'pests':
                if (pestData) {
                    const highRiskPests = pestData.predictions.filter((p: any) => p.probability > 60)
                    summary = language === 'hi'
                        ? `कुल ${pestData.predictions.length} कीट चेतावनियाँ हैं, जिनमें ${highRiskPests.length} उच्च जोखिम वाले हैं।`
                        : `There are ${pestData.predictions.length} pest alerts, with ${highRiskPests.length} high-risk pests.`
                }
                break
            case 'irrigation':
                if (irrigationData) {
                    summary = language === 'hi'
                        ? `सप्ताहिक जल आवश्यकता ${irrigationData.waterRequirement} लीटर है, ${irrigationData.efficiency} प्रतिशत दक्षता के साथ।`
                        : `Weekly water requirement is ${irrigationData.waterRequirement} liters, with ${irrigationData.efficiency} percent efficiency.`
                }
                break
        }

        if (summary) {
            onSpeak(summary)
        }
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'bg-green-100 text-green-800'
            case 'moderate': return 'bg-yellow-100 text-yellow-800'
            case 'high': return 'bg-orange-100 text-orange-800'
            case 'severe': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'text-green-600'
            case 'moderate': return 'text-yellow-600'
            case 'high': return 'text-orange-600'
            case 'severe': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    return (
        <div className="space-y-6">
            {/* Input Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        {language === 'hi' ? 'फसल विवरण' : 'Crop Details'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {language === 'hi' ? 'फसल' : 'Crop'}
                        </label>
                        <select
                            value={crop}
                            onChange={(e) => setCrop(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="Wheat">Wheat</option>
                            <option value="Rice">Rice</option>
                            <option value="Maize">Maize</option>
                            <option value="Cotton">Cotton</option>
                            <option value="Soybean">Soybean</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {language === 'hi' ? 'क्षेत्र (हेक्टेयर)' : 'Area (Hectares)'}
                        </label>
                        <input
                            type="number"
                            value={area}
                            onChange={(e) => setArea(Number(e.target.value))}
                            className="w-full p-2 border rounded-md"
                            min="0.1"
                            step="0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {language === 'hi' ? 'बुवाई की तारीख' : 'Planting Date'}
                        </label>
                        <input
                            type="date"
                            value={plantingDate}
                            onChange={(e) => setPlantingDate(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={loadData}
                            disabled={loading}
                            className="w-full flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {language === 'hi' ? 'डेटा रीफ्रेश करें' : 'Refresh Data'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2 mb-4">
                <Button
                    variant={activeTab === 'yield' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('yield')}
                    className="flex items-center gap-2"
                >
                    <TrendingUp className="w-4 h-4" />
                    {language === 'hi' ? 'उत्पादन अनुमान' : 'Yield Prediction'}
                </Button>
                <Button
                    variant={activeTab === 'pests' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('pests')}
                    className="flex items-center gap-2"
                >
                    <Bug className="w-4 h-4" />
                    {language === 'hi' ? 'कीट चेतावनी' : 'Pest Alerts'}
                </Button>
                <Button
                    variant={activeTab === 'irrigation' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('irrigation')}
                    className="flex items-center gap-2"
                >
                    <Droplets className="w-4 h-4" />
                    {language === 'hi' ? 'सिंचाई अनुसूची' : 'Irrigation Schedule'}
                </Button>
                <Button
                    variant="outline"
                    onClick={speakSummary}
                    disabled={!voiceEnabled || loading}
                    className="flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {language === 'hi' ? 'सारांश सुनें' : 'Hear Summary'}
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        <p className="text-gray-600">{language === 'hi' ? 'विश्लेषण लोड हो रहा है...' : 'Loading analysis...'}</p>
                    </div>
                </div>
            ) : (
                <>
                    {activeTab === 'yield' && yieldData && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        {language === 'hi' ? 'उत्पादन अनुमान' : 'Yield Prediction'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="text-center border-l-4 border-green-500">
                                            <CardContent className="pt-6">
                                                <div className="text-3xl font-bold text-green-600">{yieldData.predictedYield}</div>
                                                <div className="text-sm text-gray-600">{language === 'hi' ? 'अनुमानित उत्पादन (किग्रा)' : 'Predicted Yield (kg)'}</div>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center border-l-4 border-blue-500">
                                            <CardContent className="pt-6">
                                                <div className="text-3xl font-bold text-blue-600">{yieldData.confidence}%</div>
                                                <div className="text-sm text-gray-600">{language === 'hi' ? 'आत्मविश्वास स्तर' : 'Confidence Level'}</div>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center border-l-4 border-purple-500">
                                            <CardContent className="pt-6">
                                                <div className="text-xl font-bold text-purple-600">
                                                    {yieldData.yieldRange.min} - {yieldData.yieldRange.max}
                                                </div>
                                                <div className="text-sm text-gray-600">{language === 'hi' ? 'उत्पादन श्रेणी (किग्रा)' : 'Yield Range (kg)'}</div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4" />
                                            {language === 'hi' ? 'प्रभाव डालने वाले कारक' : 'Influencing Factors'}
                                        </h3>
                                        <div className="space-y-3">
                                            {yieldData.factors.map((factor: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-sm transition-shadow">
                                                    <div className="flex-1">
                                                        <div className="font-medium flex items-center gap-2">
                                                            {factor.impact === 'positive' ?
                                                                <span className="w-3 h-3 rounded-full bg-green-500"></span> :
                                                                <span className="w-3 h-3 rounded-full bg-red-500"></span>}
                                                            {factor.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">{factor.description}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={factor.weight * 100} className="w-24" />
                                                        <Badge variant={factor.impact === 'positive' ? 'default' : 'destructive'}>
                                                            {factor.impact === 'positive' ? '+' : '-'}{(factor.weight * 100).toFixed(0)}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            {language === 'hi' ? 'अनुशंसाएँ' : 'Recommendations'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {yieldData.recommendations.map((rec: string, index: number) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm">{rec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'pests' && pestData && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Bug className="w-5 h-5 text-red-600" />
                                            {language === 'hi' ? 'कीट चेतावनी' : 'Pest Alerts'}
                                        </div>
                                        <Badge className={getRiskColor(pestData.riskLevel)}>
                                            {language === 'hi'
                                                ? pestData.riskLevel === 'low' ? 'कम जोखिम' :
                                                    pestData.riskLevel === 'moderate' ? 'मध्यम जोखिम' :
                                                        pestData.riskLevel === 'high' ? 'उच्च जोखिम' : 'गंभीर जोखिम'
                                                : pestData.riskLevel.charAt(0).toUpperCase() + pestData.riskLevel.slice(1) + ' Risk'}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            {language === 'hi' ? 'अनुमानित कीट चेतावनियाँ' : 'Predicted Pest Alerts'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {pestData.predictions.map((prediction: any, index: number) => (
                                                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="font-bold text-lg text-gray-900">{prediction.pest}</div>
                                                        <Badge className={getSeverityColor(prediction.severity)}>
                                                            {language === 'hi'
                                                                ? prediction.severity === 'low' ? 'कम' :
                                                                    prediction.severity === 'moderate' ? 'मध्यम' :
                                                                        prediction.severity === 'high' ? 'उच्च' : 'गंभीर'
                                                                : prediction.severity}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-600">{language === 'hi' ? 'तारीख' : 'Date'}:</span>
                                                            <span className="font-medium">{prediction.date}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-600">{language === 'hi' ? 'संभावना' : 'Probability'}:</span>
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={prediction.probability} className="w-20" />
                                                                <span className="font-medium">{prediction.probability}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            {language === 'hi' ? 'अनुशंसाएँ' : 'Recommendations'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {pestData.recommendations.map((rec: string, index: number) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                                    <CheckCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm">{rec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {language === 'hi' ? 'निगरानी अनुसूची' : 'Monitoring Schedule'}
                                        </h3>
                                        <div className="space-y-2">
                                            {pestData.monitoringSchedule.map((item: string, index: number) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                                    <Calendar className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'irrigation' && irrigationData && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Droplets className="w-5 h-5 text-blue-600" />
                                            {language === 'hi' ? 'सिंचाई अनुसूची' : 'Irrigation Schedule'}
                                        </div>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Droplets className="w-4 h-4" />
                                            {language === 'hi' ? 'दक्षता' : 'Efficiency'}: {irrigationData.efficiency}%
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="text-center border-l-4 border-blue-500">
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-blue-600">{irrigationData.waterRequirement}L</div>
                                                <div className="text-sm text-gray-600">{language === 'hi' ? 'साप्ताहिक जल आवश्यकता' : 'Bi-weekly Water Requirement'}</div>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center border-l-4 border-green-500">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Progress value={irrigationData.efficiency} className="w-full" />
                                                    <span className="text-sm font-medium">{irrigationData.efficiency}%</span>
                                                </div>
                                                <div className="text-sm text-gray-600">{language === 'hi' ? 'सिंचाई दक्षता' : 'Irrigation Efficiency'}</div>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center border-l-4 border-purple-500">
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-purple-600">{irrigationData.schedule.length}</div>
                                                <div className="text-sm text-gray-600">{language === 'hi' ? 'सिंचाई घटनाएँ' : 'Irrigation Events'}</div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {language === 'hi' ? 'अगली सिंचाई घटनाएँ' : 'Upcoming Irrigation Events'}
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border rounded-lg">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="text-left p-3 font-medium">{language === 'hi' ? 'तारीख' : 'Date'}</th>
                                                        <th className="text-left p-3 font-medium">{language === 'hi' ? 'समय' : 'Time'}</th>
                                                        <th className="text-left p-3 font-medium">{language === 'hi' ? 'अवधि' : 'Duration'}</th>
                                                        <th className="text-left p-3 font-medium">{language === 'hi' ? 'जल मात्रा' : 'Water'}</th>
                                                        <th className="text-left p-3 font-medium">{language === 'hi' ? 'विधि' : 'Method'}</th>
                                                        <th className="text-left p-3 font-medium">{language === 'hi' ? 'प्राथमिकता' : 'Priority'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {irrigationData.schedule.map((event: any, index: number) => (
                                                        <tr key={index} className="border-t hover:bg-gray-50">
                                                            <td className="p-3">{event.date}</td>
                                                            <td className="p-3">{event.startTime}</td>
                                                            <td className="p-3">{event.duration} {language === 'hi' ? 'मिनट' : 'min'}</td>
                                                            <td className="p-3">{event.waterAmount}L</td>
                                                            <td className="p-3">
                                                                <Badge variant="outline" className="capitalize">
                                                                    {event.method}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-3">
                                                                <Badge variant={event.priority === 'high' ? 'destructive' : event.priority === 'medium' ? 'default' : 'secondary'}>
                                                                    {language === 'hi'
                                                                        ? event.priority === 'high' ? 'उच्च' :
                                                                            event.priority === 'medium' ? 'मध्यम' : 'कम'
                                                                        : event.priority}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            {language === 'hi' ? 'अनुशंसाएँ' : 'Recommendations'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {irrigationData.recommendations.map((rec: string, index: number) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm">{rec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}