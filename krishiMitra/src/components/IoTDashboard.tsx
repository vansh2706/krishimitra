'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Wifi,
    WifiOff,
    Thermometer,
    Droplets,
    Leaf,
    Zap,
    Activity,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Play,
    Pause,
    Settings,
    MapPin,
    Satellite,
    Eye
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { getIoTFieldAnalysis, controlIrrigationSystem } from '@/services/external/iotService'

interface IoTDashboardProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

export function IoTDashboard({ voiceEnabled, onSpeak }: IoTDashboardProps) {
    const { t, language, isOnline } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [fieldData, setFieldData] = useState<any>(null)
    const [fieldId, setFieldId] = useState('field-001')
    const [controlLoading, setControlLoading] = useState(false)

    // Load real data from IoT service
    const loadData = async () => {
        if (!isOnline) {
            return
        }

        setLoading(true);

        try {
            const response = await getIoTFieldAnalysis(fieldId)

            if (response.success && response.data) {
                setFieldData(response.data)

                // Speak summary if voice is enabled
                if (voiceEnabled) {
                    const summary = language === 'hi'
                        ? `आपके खेत की स्थिति ${response.data.overallHealth} है। ${response.data.recommendations.length} सिफारिशें उपलब्ध हैं।`
                        : `Your field status is ${response.data.overallHealth}. ${response.data.recommendations.length} recommendations available.`
                    onSpeak(summary)
                }
            }
        } catch (error) {
            console.error('Error loading IoT data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [fieldId, isOnline])

    const handleIrrigationControl = async (action: 'start' | 'stop' | 'adjust') => {
        if (!isOnline || !fieldData?.irrigationData?.systemId) {
            return
        }

        setControlLoading(true)
        try {
            const response = await controlIrrigationSystem(
                fieldData.irrigationData.systemId,
                action,
                action === 'adjust' ? { moistureTarget: 45 } : undefined
            )

            if (response.success && response.data) {
                // Reload data to reflect changes
                loadData()

                // Speak confirmation if voice is enabled
                if (voiceEnabled) {
                    onSpeak(response.data.message)
                }
            }
        } catch (error) {
            console.error('Error controlling irrigation:', error)
        } finally {
            setControlLoading(false)
        }
    }

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'bg-green-100 text-green-800'
            case 'good': return 'bg-blue-100 text-blue-800'
            case 'fair': return 'bg-yellow-100 text-yellow-800'
            case 'poor': return 'bg-orange-100 text-orange-800'
            case 'critical': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            {/* Field Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {language === 'hi' ? 'खेत चयन' : 'Field Selection'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {language === 'hi' ? 'खेत आईडी' : 'Field ID'}
                            </label>
                            <select
                                value={fieldId}
                                onChange={(e) => setFieldId(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                disabled={!isOnline || loading}
                            >
                                <option value="field-001">Field 001</option>
                                <option value="field-002">Field 002</option>
                                <option value="field-003">Field 003</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={loadData}
                                disabled={!isOnline || loading}
                                className="w-full flex items-center gap-2"
                            >
                                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                {language === 'hi' ? 'डेटा रीफ्रेश करें' : 'Refresh Data'}
                            </Button>
                        </div>
                        <div className="flex items-end">
                            <div className="flex items-center gap-2 text-sm">
                                {isOnline ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <Wifi className="w-4 h-4" />
                                        <span>{language === 'hi' ? 'ऑनलाइन' : 'Online'}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-red-600">
                                        <WifiOff className="w-4 h-4" />
                                        <span>{language === 'hi' ? 'ऑफ़लाइन' : 'Offline'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        <p className="text-gray-600">{language === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading data...'}</p>
                    </div>
                </div>
            ) : fieldData ? (
                <>
                    {/* Overall Field Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    {language === 'hi' ? 'खेत की स्थिति' : 'Field Status'}
                                </div>
                                <Badge className={getHealthColor(fieldData.overallHealth)}>
                                    {language === 'hi'
                                        ? fieldData.overallHealth === 'excellent' ? 'उत्कृष्ट' :
                                            fieldData.overallHealth === 'good' ? 'अच्छा' :
                                                fieldData.overallHealth === 'fair' ? 'ठीक' :
                                                    fieldData.overallHealth === 'poor' ? 'खराब' : 'गंभीर'
                                        : fieldData.overallHealth.charAt(0).toUpperCase() + fieldData.overallHealth.slice(1)}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="text-center border-l-4 border-blue-500">
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {fieldData.soilData.length}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'सेंसर' : 'Sensors'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="text-center border-l-4 border-green-500">
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-green-600">
                                            {fieldData.droneData.affectedAreas.length}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'प्रभावित क्षेत्र' : 'Affected Areas'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="text-center border-l-4 border-purple-500">
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {fieldData.irrigationData.status === 'active' ? '✓' : '✗'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'सिंचाई स्थिति' : 'Irrigation Status'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="text-center border-l-4 border-yellow-500">
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {fieldData.recommendations.length}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'सिफारिशें' : 'Recommendations'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Soil Sensor Data */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Thermometer className="w-5 h-5 text-red-600" />
                                    {language === 'hi' ? 'मिट्टी की नमी और तापमान' : 'Soil Moisture & Temperature'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fieldData.soilData.map((sensor: any, index: number) => (
                                    <div key={sensor.sensorId} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="font-medium">
                                                {language === 'hi' ? 'सेंसर' : 'Sensor'} {index + 1}
                                            </div>
                                            <Badge variant="outline">
                                                {new Date(sensor.timestamp).toLocaleTimeString()}
                                            </Badge>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-600">
                                                        {language === 'hi' ? 'नमी' : 'Moisture'}
                                                    </span>
                                                    <span className="font-medium">{sensor.moisture}%</span>
                                                </div>
                                                <Progress value={sensor.moisture} className="w-full" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-600">
                                                        {language === 'hi' ? 'तापमान' : 'Temperature'}
                                                    </span>
                                                    <span className="font-medium">{sensor.temperature}°C</span>
                                                </div>
                                                <Progress value={(sensor.temperature / 50) * 100} className="w-full" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Drone Imagery Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Satellite className="w-5 h-5 text-blue-600" />
                                    {language === 'hi' ? 'ड्रोन छवि विश्लेषण' : 'Drone Image Analysis'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={fieldData.droneData.imageUrl}
                                            alt={language === 'hi' ? 'ड्रोन छवि' : 'Drone Image'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12L12 3L3 12M21 12L12 21M21 12H3"/></svg>';
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                            <Eye className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'NDVI' : 'NDVI'}
                                        </div>
                                        <div className="text-xl font-bold text-green-700">
                                            {fieldData.droneData.ndvi.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'EVI' : 'EVI'}
                                        </div>
                                        <div className="text-xl font-bold text-blue-700">
                                            {fieldData.droneData.evi.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">
                                        {language === 'hi' ? 'फसल की स्थिति' : 'Crop Health'}
                                    </h3>
                                    <Badge className={getHealthColor(fieldData.droneData.cropHealth)}>
                                        {language === 'hi'
                                            ? fieldData.droneData.cropHealth === 'excellent' ? 'उत्कृष्ट' :
                                                fieldData.droneData.cropHealth === 'good' ? 'अच्छा' :
                                                    fieldData.droneData.cropHealth === 'fair' ? 'ठीक' :
                                                        fieldData.droneData.cropHealth === 'poor' ? 'खराब' : 'गंभीर'
                                            : fieldData.droneData.cropHealth.charAt(0).toUpperCase() + fieldData.droneData.cropHealth.slice(1)}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Irrigation System Control */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-5 h-5 text-blue-600" />
                                    {language === 'hi' ? 'सिंचाई प्रणाली' : 'Irrigation System'}
                                </div>
                                <Badge variant={
                                    fieldData.irrigationData.status === 'active' ? 'default' :
                                        fieldData.irrigationData.status === 'error' ? 'destructive' : 'secondary'
                                }>
                                    {language === 'hi'
                                        ? fieldData.irrigationData.status === 'active' ? 'सक्रिय' :
                                            fieldData.irrigationData.status === 'inactive' ? 'निष्क्रिय' :
                                                fieldData.irrigationData.status === 'maintenance' ? 'रखरखाव' : 'त्रुटि'
                                        : fieldData.irrigationData.status}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="text-center border-l-4 border-blue-500">
                                    <CardContent className="pt-6">
                                        <div className="text-xl font-bold text-blue-600">
                                            {fieldData.irrigationData.waterFlowRate} L/min
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'पानी का प्रवाह' : 'Water Flow'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="text-center border-l-4 border-green-500">
                                    <CardContent className="pt-6">
                                        <div className="text-xl font-bold text-green-600">
                                            {fieldData.irrigationData.waterPressure} PSI
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'पानी का दबाव' : 'Water Pressure'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="text-center border-l-4 border-purple-500">
                                    <CardContent className="pt-6">
                                        <div className="text-xl font-bold text-purple-600">
                                            {fieldData.irrigationData.currentMoisture}%
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'वर्तमान नमी' : 'Current Moisture'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={() => handleIrrigationControl('start')}
                                    disabled={controlLoading || !isOnline || fieldData.irrigationData.status === 'active'}
                                    className="flex items-center gap-2"
                                >
                                    <Play className="w-4 h-4" />
                                    {language === 'hi' ? 'सिंचाई शुरू करें' : 'Start Irrigation'}
                                </Button>
                                <Button
                                    onClick={() => handleIrrigationControl('stop')}
                                    variant="destructive"
                                    disabled={controlLoading || !isOnline || fieldData.irrigationData.status !== 'active'}
                                    className="flex items-center gap-2"
                                >
                                    <Pause className="w-4 h-4" />
                                    {language === 'hi' ? 'सिंचाई बंद करें' : 'Stop Irrigation'}
                                </Button>
                                <Button
                                    onClick={() => handleIrrigationControl('adjust')}
                                    variant="outline"
                                    disabled={controlLoading || !isOnline}
                                    className="flex items-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    {language === 'hi' ? 'लक्ष्य समायोजित करें' : 'Adjust Target'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                {language === 'hi' ? 'सिफारिशें' : 'Recommendations'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {fieldData.recommendations.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {fieldData.recommendations.map((rec: string, index: number) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    {language === 'hi' ? 'कोई सिफारिशें उपलब्ध नहीं हैं' : 'No recommendations available'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {language === 'hi' ? 'डेटा उपलब्ध नहीं है' : 'No Data Available'}
                        </h3>
                        <p className="text-gray-600 text-center mb-4">
                            {language === 'hi'
                                ? 'कृपया ऑनलाइन होने की पुष्टि करें और डेटा लोड करने के लिए रीफ्रेश करें'
                                : 'Please ensure you are online and refresh to load data'}
                        </p>
                        <Button onClick={loadData} disabled={!isOnline}>
                            {language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}