'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Sprout,
    DollarSign,
    BarChart3,
    Info,
    Lightbulb
} from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'

interface CostBenefitAnalysisProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

interface CropData {
    name: string
    costPerAcre: number
    expectedYieldPerAcre: number
    averagePricePerKg: number
    seasonLength: number
}

const cropDatabase: Record<string, CropData> = {
    wheat: {
        name: 'Wheat',
        costPerAcre: 15000,
        expectedYieldPerAcre: 2500,
        averagePricePerKg: 2.5,
        seasonLength: 120
    },
    rice: {
        name: 'Rice',
        costPerAcre: 18000,
        expectedYieldPerAcre: 3000,
        averagePricePerKg: 3.0,
        seasonLength: 150
    },
    cotton: {
        name: 'Cotton',
        costPerAcre: 25000,
        expectedYieldPerAcre: 400,
        averagePricePerKg: 45,
        seasonLength: 180
    },
    sugarcane: {
        name: 'Sugarcane',
        costPerAcre: 35000,
        expectedYieldPerAcre: 40000,
        averagePricePerKg: 0.35,
        seasonLength: 365
    },
    maize: {
        name: 'Maize',
        costPerAcre: 12000,
        expectedYieldPerAcre: 2800,
        averagePricePerKg: 2.2,
        seasonLength: 90
    },
    soybean: {
        name: 'Soybean',
        costPerAcre: 16000,
        expectedYieldPerAcre: 1800,
        averagePricePerKg: 4.5,
        seasonLength: 120
    },
    groundnut: {
        name: 'Groundnut',
        costPerAcre: 14000,
        expectedYieldPerAcre: 1200,
        averagePricePerKg: 6.0,
        seasonLength: 110
    },
    mustard: {
        name: 'Mustard',
        costPerAcre: 8000,
        expectedYieldPerAcre: 800,
        averagePricePerKg: 8.0,
        seasonLength: 100
    },
    sunflower: {
        name: 'Sunflower',
        costPerAcre: 10000,
        expectedYieldPerAcre: 900,
        averagePricePerKg: 7.5,
        seasonLength: 95
    },
    chickpea: {
        name: 'Chickpea',
        costPerAcre: 12000,
        expectedYieldPerAcre: 1000,
        averagePricePerKg: 9.0,
        seasonLength: 120
    },
    pigeon_pea: {
        name: 'Pigeon Pea',
        costPerAcre: 11000,
        expectedYieldPerAcre: 800,
        averagePricePerKg: 8.5,
        seasonLength: 150
    },
    lentil: {
        name: 'Lentil',
        costPerAcre: 10000,
        expectedYieldPerAcre: 700,
        averagePricePerKg: 12.0,
        seasonLength: 110
    }
}

export function CostBenefitAnalysis({ voiceEnabled, onSpeak }: CostBenefitAnalysisProps) {
    const { t, language } = useLanguage()
    const [selectedCrop, setSelectedCrop] = useState('')
    const [landArea, setLandArea] = useState('')
    const [marketPrice, setMarketPrice] = useState('')
    const [analysis, setAnalysis] = useState<any>(null)
    const [isCalculating, setIsCalculating] = useState(false)

    const calculateProfit = () => {
        if (!selectedCrop || !landArea || !marketPrice) return

        setIsCalculating(true)

        // Simulate calculation delay
        setTimeout(() => {
            const crop = cropDatabase[selectedCrop]
            const area = parseFloat(landArea)
            const price = parseFloat(marketPrice)

            const totalCost = crop.costPerAcre * area
            const totalYield = crop.expectedYieldPerAcre * area
            const totalRevenue = totalYield * price
            const netProfit = totalRevenue - totalCost
            const profitMargin = (netProfit / totalRevenue) * 100
            const roiPercentage = (netProfit / totalCost) * 100

            const result = {
                crop: crop.name,
                area,
                totalCost,
                totalYield,
                totalRevenue,
                netProfit,
                profitMargin,
                roiPercentage,
                costPerKg: totalCost / totalYield,
                revenuePerKg: price,
                profitPerKg: price - (totalCost / totalYield),
                breakEvenPrice: totalCost / totalYield,
                seasonLength: crop.seasonLength
            }

            setAnalysis(result)
            setIsCalculating(false)

            // Speak result if voice is enabled
            if (voiceEnabled) {
                let message = ''

                // Create appropriate message based on language
                switch (language) {
                    case 'hi':
                        message = `${getCropNameInLanguage(crop.name)} की फसल से आपकानीत लाभ ₹${netProfit.toFixed(0)} होगा।`
                        break
                    case 'ta':
                        message = `${getCropNameInLanguage(crop.name)} பயிரிலிருந்து உங்கள் மதிப்பிடப்பட்ட லாபம் ₹${netProfit.toFixed(0)} ஆக இருக்கும்.`
                        break
                    case 'te':
                        message = `${getCropNameInLanguage(crop.name)} పంట నుండి మీ అంచనా లాభం ₹${netProfit.toFixed(0)} ఉంటుంది.`
                        break
                    case 'bn':
                        message = `${getCropNameInLanguage(crop.name)} ফসল থেকে আপনার অনুমানিত লাভ ₹${netProfit.toFixed(0)} হবে।`
                        break
                    case 'gu':
                        message = `${getCropNameInLanguage(crop.name)} પાક માંથી તમારો અંદાજિત નફો ₹${netProfit.toFixed(0)} હશે.`
                        break
                    case 'mr':
                        message = `${getCropNameInLanguage(crop.name)} पिकापासून तुमचा अंदाजित नफा ₹${netProfit.toFixed(0)} असेल.`
                        break
                    case 'pa':
                        message = `${getCropNameInLanguage(crop.name)} ਫਸਲ ਤੋਂ ਤੁਹਾਡਾ ਅਨੁਮਾਨਿਤ ਲਾਭ ₹${netProfit.toFixed(0)} ਹੋਵੇਗਾ।`
                        break
                    default:
                        message = `Your estimated profit from ${getCropNameInLanguage(crop.name)} crop will be ₹${netProfit.toFixed(0)}.`
                }

                onSpeak(message)
            }
        }, 1000)
    }

    const formatCurrency = (amount: number) => {
        // Map language codes to locale codes for proper number formatting
        const localeMap: Record<string, string> = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'bn': 'bn-IN',
            'gu': 'gu-IN',
            'mr': 'mr-IN',
            'pa': 'pa-IN'
        }

        // Use the appropriate locale based on selected language
        const locale = localeMap[language] || 'en-IN'

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    // Use the translation system to get crop names in the selected language
    const getCropNameInLanguage = (crop: string) => {
        // Convert crop name to lowercase and remove spaces for use as a translation key
        const cropKey = crop.toLowerCase().replace(/ /g, '_')
        // Use the translation system
        return t(cropKey) || crop
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-green-600" />
                        {t('profitCalculator')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Crop Selection */}
                        <div className="space-y-2">
                            <Label>{t('selectCrop')}</Label>
                            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectCrop')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(cropDatabase).map(([key, crop]) => (
                                        <SelectItem key={key} value={key}>
                                            {getCropNameInLanguage(crop.name)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Land Area */}
                        <div className="space-y-2">
                            <Label>{t('landArea')}</Label>
                            <Input
                                type="number"
                                placeholder={t('areaInAcres')}
                                value={landArea}
                                onChange={(e) => setLandArea(e.target.value)}
                            />
                        </div>

                        {/* Market Price */}
                        <div className="space-y-2">
                            <Label>{t('marketPrice')}</Label>
                            <Input
                                type="number"
                                step="0.1"
                                placeholder={t('pricePerKg')}
                                value={marketPrice}
                                onChange={(e) => setMarketPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={calculateProfit}
                        disabled={!selectedCrop || !landArea || !marketPrice || isCalculating}
                        className="w-full md:w-auto"
                    >
                        {isCalculating ? (
                            <>
                                <Calculator className="w-4 h-4 mr-2 animate-spin" />
                                {t('calculating')}
                            </>
                        ) : (
                            <>
                                <Calculator className="w-4 h-4 mr-2" />
                                {t('calculateProfit')}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysis && (
                <>
                    {/* Profit Summary */}
                    <Card className={`border-2 ${analysis.netProfit >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5" />
                                    {t('profitSummary')}
                                </span>
                                <Badge variant={analysis.netProfit >= 0 ? 'default' : 'destructive'} className="text-lg px-3 py-1">
                                    {analysis.netProfit >= 0 ? '✓ ' : '✗ '}
                                    {formatCurrency(analysis.netProfit)}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="text-center p-3 bg-white rounded-lg border">
                                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                    <div className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(analysis.totalRevenue)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {t('totalRevenue')}
                                    </div>
                                </div>

                                <div className="text-center p-3 bg-white rounded-lg border">
                                    <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-600" />
                                    <div className="text-2xl font-bold text-red-600">
                                        {formatCurrency(analysis.totalCost)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {t('totalCost')}
                                    </div>
                                </div>

                                <div className="text-center p-3 bg-white rounded-lg border">
                                    <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${analysis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                    <div className={`text-2xl font-bold ${analysis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(analysis.netProfit)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {t('netProfit')}
                                    </div>
                                </div>

                                <div className="text-center p-3 bg-white rounded-lg border">
                                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                                    <div className="text-2xl font-bold text-purple-600">
                                        {analysis.roiPercentage.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {t('roi')}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Analysis */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Cost Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                    {t('costAnalysis')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span>{t('costPerAcre')}:</span>
                                    <span className="font-medium">{formatCurrency(analysis.totalCost / analysis.area)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('costPerKg')}:</span>
                                    <span className="font-medium">{formatCurrency(analysis.costPerKg)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('totalArea')}:</span>
                                    <span className="font-medium">{analysis.area} {t('acres')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('seasonLength')}:</span>
                                    <span className="font-medium">{analysis.seasonLength} {t('days')}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Revenue Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    {t('revenueAnalysis')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span>{t('totalYield')}:</span>
                                    <span className="font-medium">{analysis.totalYield.toLocaleString()} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('sellingPrice')}:</span>
                                    <span className="font-medium">{formatCurrency(analysis.revenuePerKg)}/kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('profitPerKg')}:</span>
                                    <span className={`font-medium ${analysis.profitPerKg >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(analysis.profitPerKg)}/kg
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('profitMargin')}:</span>
                                    <span className={`font-medium ${analysis.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {analysis.profitMargin.toFixed(1)}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-600" />
                                {t('recommendations')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {/* Break-even Analysis */}
                                <Alert>
                                    <Info className="w-4 h-4" />
                                    <AlertDescription>
                                        <strong>{t('breakEvenPrice')}:</strong> {formatCurrency(analysis.breakEvenPrice)}/kg
                                        <br />
                                        <span className="text-sm text-gray-600">
                                            {t('breakEvenDescription')}
                                        </span>
                                    </AlertDescription>
                                </Alert>

                                {/* Profitability Status */}
                                <Alert className={analysis.netProfit >= 0 ? 'border-green-200' : 'border-red-200'}>
                                    <TrendingUp className="w-4 h-4" />
                                    <AlertDescription>
                                        <strong>{t('profitability')}:</strong>
                                        <br />
                                        <span className={`font-medium ${analysis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {analysis.netProfit >= 0
                                                ? t('profitableCrop')
                                                : t('lossMakingCrop')}
                                        </span>
                                    </AlertDescription>
                                </Alert>

                                {/* Tips */}
                                <Alert className="border-blue-200">
                                    <Lightbulb className="w-4 h-4" />
                                    <AlertDescription>
                                        <strong>{t('tips')}:</strong>
                                        <br />
                                        <span className="text-sm">
                                            {analysis.roiPercentage > 20
                                                ? t('greatInvestment')
                                                : analysis.roiPercentage > 10
                                                    ? t('moderateRisk')
                                                    : t('considerAlternatives')}
                                        </span>
                                    </AlertDescription>
                                </Alert>
                            </div>

                            {/* Additional Tips */}
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium mb-2 text-blue-800">
                                    {t('waysToIncreaseProfit')}:
                                </h4>
                                <ul className="text-sm space-y-1 text-blue-700">
                                    <li>• {t('betterSeeds')}</li>
                                    <li>• {t('improveQuality')}</li>
                                    <li>• {t('marketTiming')}</li>
                                    <li>• {t('improveIrrigation')}</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}