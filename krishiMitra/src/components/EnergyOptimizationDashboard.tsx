'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Sun,
    Wind,
    Zap,
    Battery,
    TrendingDown,
    Leaf,
    Loader2,
    MapPin
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { analyzeEnergyEfficiency } from '@/services/external/energyOptimizationService'

interface EnergyOptimizationDashboardProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

export function EnergyOptimizationDashboard({ voiceEnabled, onSpeak }: EnergyOptimizationDashboardProps) {
    const { t, language, isOnline } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [energyData, setEnergyData] = useState<any>(null)
    const [farmSize, setFarmSize] = useState(5) // Default 5 acres
    const [irrigationType, setIrrigationType] = useState('drip')
    const [solarAvailable, setSolarAvailable] = useState(true)
    const [windAvailable, setWindAvailable] = useState(false)
    const [currentEnergyUsage, setCurrentEnergyUsage] = useState(500) // kWh per month

    // Load real data from energy optimization service
    const loadData = async () => {
        if (!isOnline) {
            return
        }

        setLoading(true)

        try {
            const response = await analyzeEnergyEfficiency({
                farmSize,
                irrigationType: irrigationType as any,
                solarAvailable,
                windAvailable,
                currentEnergyUsage,
                location: {
                    lat: 28.6139, // Default to Delhi
                    lon: 77.2090
                }
            })

            if (response.success && response.data) {
                setEnergyData(response.data)

                // Speak summary if voice is enabled
                if (voiceEnabled) {
                    const summary = language === 'hi'
                        ? `आपके खेत के लिए ${response.data.recommendedSolutions.length} ऊर्जा दक्षता समाधान उपलब्ध हैं। वार्षिक बचत ${response.data.estimatedSavings.annual} रुपये हो सकती है।`
                        : `Found ${response.data.recommendedSolutions.length} energy efficiency solutions for your farm. Annual savings could be ${response.data.estimatedSavings.annual} rupees.`
                    onSpeak(summary)
                }
            }
        } catch (error) {
            console.error('Error loading energy data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const getSolutionCategoryColor = (category: string) => {
        switch (category) {
            case 'solar': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'wind': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'efficiency': return 'bg-green-100 text-green-800 border-green-200'
            case 'storage': return 'bg-purple-100 text-purple-800 border-purple-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getSolutionCategoryIcon = (category: string) => {
        switch (category) {
            case 'solar': return <Sun className="w-5 h-5" />
            case 'wind': return <Wind className="w-5 h-5" />
            case 'efficiency': return <Zap className="w-5 h-5" />
            case 'storage': return <Battery className="w-5 h-5" />
            default: return <Leaf className="w-5 h-5" />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'low': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            {/* Farm Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {language === 'hi' ? 'खेत जानकारी' : 'Farm Information'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {language === 'hi' ? 'खेत का आकार (एकड़)' : 'Farm Size (acres)'}
                            </label>
                            <input
                                type="number"
                                value={farmSize}
                                onChange={(e) => setFarmSize(Number(e.target.value))}
                                className="w-full p-2 border rounded-md"
                                min="1"
                                max="1000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {language === 'hi' ? 'सिंचाई प्रणाली' : 'Irrigation Type'}
                            </label>
                            <select
                                value={irrigationType}
                                onChange={(e) => setIrrigationType(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="drip">{language === 'hi' ? 'ड्रिप' : 'Drip'}</option>
                                <option value="sprinkler">{language === 'hi' ? 'स्प्रिंकलर' : 'Sprinkler'}</option>
                                <option value="flood">{language === 'hi' ? 'बाढ़' : 'Flood'}</option>
                                <option value="furrow">{language === 'hi' ? 'फरो' : 'Furrow'}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {language === 'hi' ? 'सौर ऊर्जा उपलब्ध' : 'Solar Available'}
                            </label>
                            <select
                                value={solarAvailable ? 'yes' : 'no'}
                                onChange={(e) => setSolarAvailable(e.target.value === 'yes')}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="yes">{language === 'hi' ? 'हाँ' : 'Yes'}</option>
                                <option value="no">{language === 'hi' ? 'नहीं' : 'No'}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {language === 'hi' ? 'पवन ऊर्जा उपलब्ध' : 'Wind Available'}
                            </label>
                            <select
                                value={windAvailable ? 'yes' : 'no'}
                                onChange={(e) => setWindAvailable(e.target.value === 'yes')}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="yes">{language === 'hi' ? 'हाँ' : 'Yes'}</option>
                                <option value="no">{language === 'hi' ? 'नहीं' : 'No'}</option>
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
            ) : energyData ? (
                <>
                    {/* Energy Potential Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                {language === 'hi' ? 'ऊर्जा क्षमता' : 'Energy Potential'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sun className="w-6 h-6 text-yellow-600" />
                                        <h3 className="font-medium">{language === 'hi' ? 'सौर क्षमता' : 'Solar Potential'}</h3>
                                    </div>
                                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                                        {energyData.solarPotential} kWh/day
                                    </div>
                                    <Progress value={energyData.solarPotential * 20} className="w-full" />
                                </div>
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wind className="w-6 h-6 text-blue-600" />
                                        <h3 className="font-medium">{language === 'hi' ? 'पवन क्षमता' : 'Wind Potential'}</h3>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600 mb-2">
                                        {energyData.windPotential} kWh/day
                                    </div>
                                    <Progress value={energyData.windPotential * 40} className="w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estimated Savings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="w-5 h-5" />
                                {language === 'hi' ? 'अनुमानित बचत' : 'Estimated Savings'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="text-center border-l-4 border-green-500">
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-green-600">
                                            ₹{energyData.estimatedSavings.monthly.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'मासिक बचत' : 'Monthly Savings'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="text-center border-l-4 border-blue-500">
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-blue-600">
                                            ₹{energyData.estimatedSavings.annual.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'वार्षिक बचत' : 'Annual Savings'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="text-center border-l-4 border-purple-500">
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {energyData.estimatedSavings.co2Reduction.toLocaleString()} kg
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language === 'hi' ? 'CO2 कमी' : 'CO2 Reduction'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommended Solutions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Leaf className="w-5 h-5" />
                                {language === 'hi' ? 'अनुशंसित समाधान' : 'Recommended Solutions'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {energyData.recommendedSolutions.map((solution: any, index: number) => (
                                    <Card key={solution.id} className="border-l-4 border-green-500">
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    {getSolutionCategoryIcon(solution.category)}
                                                    <h3 className="font-medium">{solution.name[language] || solution.name.en}</h3>
                                                </div>
                                                <Badge className={getPriorityColor(solution.priority)}>
                                                    {language === 'hi'
                                                        ? solution.priority === 'high' ? 'उच्च' :
                                                            solution.priority === 'medium' ? 'मध्यम' : 'कम'
                                                        : solution.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {solution.description[language] || solution.description.en}
                                            </p>
                                            <div className="flex justify-between items-center mb-3">
                                                <Badge className={getSolutionCategoryColor(solution.category)}>
                                                    {language === 'hi'
                                                        ? solution.category === 'solar' ? 'सौर' :
                                                            solution.category === 'wind' ? 'पवन' :
                                                                solution.category === 'efficiency' ? 'दक्षता' : 'भंडारण'
                                                        : solution.category}
                                                </Badge>
                                                <div className="text-sm">
                                                    <span className="font-medium">₹{solution.cost.toLocaleString()}</span>
                                                    <span className="text-gray-500"> | </span>
                                                    <span className="text-green-600">₹{solution.savingsPerYear.toLocaleString()}/yr</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {language === 'hi' ? 'कार्यान्वयन समय:' : 'Implementation Time:'} {solution.implementationTime}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Implementation Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Leaf className="w-5 h-5" />
                                {language === 'hi' ? 'कार्यान्वयन समयरेखा' : 'Implementation Timeline'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {energyData.implementationTimeline.map((item: string, index: number) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium">
                                            {index + 1}
                                        </div>
                                        <div className="flex-grow py-2 border-b border-gray-200">
                                            {item}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Zap className="w-12 h-12 text-yellow-500 mb-4" />
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