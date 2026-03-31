'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
    TrendingUp,
    TrendingDown,
    RefreshCw,
    MapPin,
    Calendar,
    IndianRupee,
    BarChart3
} from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import {
    selectAllAndCopy,
    formatMarketPrices,
    formatCostBenefitAnalysis,
    formatMarketInsights,
    formatPriceSummary
} from '@/utils/copyUtils'

interface MarketPricesProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

interface CropPrice {
    crop: string
    variety: string
    price: number
    unit: string
    change: number
    changePercent: number
    market: string
    date: string
    quality: string
}

// Enhanced market data with more cities and recent dates
const mockPrices: CropPrice[] = [
    // Delhi prices
    {
        crop: 'Wheat',
        variety: 'HD-2967',
        price: 2280,
        unit: 'per quintal',
        change: 80,
        changePercent: 3.64,
        market: 'Delhi',
        date: '2024-12-08',
        quality: 'FAQ'
    },
    {
        crop: 'Rice',
        variety: 'Basmati-1121',
        price: 5850,
        unit: 'per quintal',
        change: 150,
        changePercent: 2.63,
        market: 'Delhi',
        date: '2024-12-08',
        quality: 'Grade-A'
    },
    {
        crop: 'Onion',
        variety: 'Red',
        price: 1800,
        unit: 'per quintal',
        change: 200,
        changePercent: 12.50,
        market: 'Delhi',
        date: '2024-12-08',
        quality: 'Medium'
    },

    // Mumbai prices
    {
        crop: 'Cotton',
        variety: 'MCU-5',
        price: 7200,
        unit: 'per quintal',
        change: 200,
        changePercent: 2.86,
        market: 'Mumbai',
        date: '2024-12-08',
        quality: 'Kapas'
    },
    {
        crop: 'Sugarcane',
        variety: 'Co-238',
        price: 380,
        unit: 'per quintal',
        change: 25,
        changePercent: 7.04,
        market: 'Mumbai',
        date: '2024-12-08',
        quality: 'Good'
    },
    {
        crop: 'Tomato',
        variety: 'Hybrid',
        price: 2200,
        unit: 'per quintal',
        change: 400,
        changePercent: 22.22,
        market: 'Mumbai',
        date: '2024-12-08',
        quality: 'Grade-1'
    },

    // Bangalore prices
    {
        crop: 'Potato',
        variety: 'Jyoti',
        price: 950,
        unit: 'per quintal',
        change: 50,
        changePercent: 5.56,
        market: 'Bangalore',
        date: '2024-12-08',
        quality: 'Good'
    },
    {
        crop: 'Maize',
        variety: 'Hybrid',
        price: 1950,
        unit: 'per quintal',
        change: 75,
        changePercent: 4.0,
        market: 'Bangalore',
        date: '2024-12-08',
        quality: 'FAQ'
    },
    {
        crop: 'Chilli',
        variety: 'Red',
        price: 8500,
        unit: 'per quintal',
        change: -300,
        changePercent: -3.41,
        market: 'Bangalore',
        date: '2024-12-08',
        quality: 'Good'
    },

    // Jaipur prices
    {
        crop: 'Mustard',
        variety: 'Yellow',
        price: 5400,
        unit: 'per quintal',
        change: 200,
        changePercent: 3.85,
        market: 'Jaipur',
        date: '2024-12-08',
        quality: 'FAQ'
    },
    {
        crop: 'Barley',
        variety: 'Local',
        price: 1650,
        unit: 'per quintal',
        change: -50,
        changePercent: -2.94,
        market: 'Jaipur',
        date: '2024-12-08',
        quality: 'Good'
    },
    {
        crop: 'Groundnut',
        variety: 'Bold',
        price: 6200,
        unit: 'per quintal',
        change: 150,
        changePercent: 2.48,
        market: 'Jaipur',
        date: '2024-12-08',
        quality: 'FAQ'
    },

    // Hyderabad prices
    {
        crop: 'Soybean',
        variety: 'JS-335',
        price: 4450,
        unit: 'per quintal',
        change: 100,
        changePercent: 2.30,
        market: 'Hyderabad',
        date: '2024-12-08',
        quality: 'FAQ'
    },
    {
        crop: 'Turmeric',
        variety: 'Salem',
        price: 12500,
        unit: 'per quintal',
        change: 300,
        changePercent: 2.46,
        market: 'Hyderabad',
        date: '2024-12-08',
        quality: 'Good'
    },

    // Chennai prices
    {
        crop: 'Sunflower',
        variety: 'Hybrid',
        price: 6800,
        unit: 'per quintal',
        change: -100,
        changePercent: -1.45,
        market: 'Chennai',
        date: '2024-12-08',
        quality: 'Good'
    },
    {
        crop: 'Chickpea',
        variety: 'Desi',
        price: 5900,
        unit: 'per quintal',
        change: 150,
        changePercent: 2.61,
        market: 'Chennai',
        date: '2024-12-08',
        quality: 'FAQ'
    },

    // Pune prices
    {
        crop: 'Lentil',
        variety: 'Masoor',
        price: 8200,
        unit: 'per quintal',
        change: 200,
        changePercent: 2.50,
        market: 'Pune',
        date: '2024-12-08',
        quality: 'Good'
    },
    {
        crop: 'Pigeon Pea',
        variety: 'Tur',
        price: 9500,
        unit: 'per quintal',
        change: -150,
        changePercent: -1.55,
        market: 'Pune',
        date: '2024-12-08',
        quality: 'FAQ'
    },

    // Ahmedabad prices
    {
        crop: 'Millet',
        variety: 'Pearl',
        price: 2800,
        unit: 'per quintal',
        change: 100,
        changePercent: 3.70,
        market: 'Ahmedabad',
        date: '2024-12-08',
        quality: 'Good'
    },
    {
        crop: 'Sorghum',
        variety: 'Local',
        price: 3200,
        unit: 'per quintal',
        change: 50,
        changePercent: 1.59,
        market: 'Ahmedabad',
        date: '2024-12-08',
        quality: 'FAQ'
    },

    // Kolkata prices
    {
        crop: 'Jute',
        variety: 'TD-5',
        price: 4800,
        unit: 'per quintal',
        change: -100,
        changePercent: -2.04,
        market: 'Kolkata',
        date: '2024-12-08',
        quality: 'Good'
    },
    {
        crop: 'Potato',
        variety: 'Local',
        price: 1200,
        unit: 'per quintal',
        change: 150,
        changePercent: 14.29,
        market: 'Kolkata',
        date: '2024-12-08',
        quality: 'Medium'
    }
]

export function MarketPrices({ voiceEnabled, onSpeak }: MarketPricesProps) {
    const { t, language } = useLanguage()
    const [prices, setPrices] = useState<CropPrice[]>(mockPrices)
    const [filteredPrices, setFilteredPrices] = useState<CropPrice[]>(mockPrices)
    const [selectedMarket, setSelectedMarket] = useState('')
    const [selectedCrop, setSelectedCrop] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const markets = Array.from(new Set(prices.map(p => p.market))).sort()
    const crops = Array.from(new Set(prices.map(p => p.crop))).sort()

    // Filter prices based on filters
    useEffect(() => {
        let filtered = prices

        if (selectedMarket) {
            filtered = filtered.filter(price => price.market === selectedMarket)
        }

        if (selectedCrop) {
            filtered = filtered.filter(price => price.crop === selectedCrop)
        }

        setFilteredPrices(filtered)
    }, [selectedMarket, selectedCrop, prices])

    const refreshPrices = async () => {
        setIsLoading(true)
        // Simulate API call with realistic price fluctuations
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Add realistic price variations
        const updatedPrices = prices.map(price => {
            const variation = Math.floor(Math.random() * 200) - 100
            const newPrice = Math.max(price.price + variation, price.price * 0.9)
            const changePercent = ((newPrice - price.price) / price.price) * 100

            return {
                ...price,
                price: Math.round(newPrice),
                change: Math.round(newPrice - price.price),
                changePercent: Math.round(changePercent * 100) / 100,
                date: new Date().toISOString().split('T')[0]
            }
        })

        setPrices(updatedPrices)
        setIsLoading(false)

        if (voiceEnabled) {
            const summary = language === 'hi'
                ? 'बाज़ार की कीमतें अपडेट हो गईं'
                : 'Market prices have been updated'
            onSpeak(summary)
        }
    }

    const clearFilters = () => {
        setSelectedMarket('')
        setSelectedCrop('')
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN')
    }

    const getCropNameInLanguage = (crop: string) => {
        const translations: Record<string, string> = {
            'Wheat': language === 'hi' ? 'गेहूं' : 'Wheat',
            'Rice': language === 'hi' ? 'चावल' : 'Rice',
            'Sugarcane': language === 'hi' ? 'गन्ना' : 'Sugarcane',
            'Cotton': language === 'hi' ? 'कपास' : 'Cotton',
            'Maize': language === 'hi' ? 'मक्का' : 'Maize',
            'Soybean': language === 'hi' ? 'सोयाबीन' : 'Soybean',
            'Onion': language === 'hi' ? 'प्याज' : 'Onion',
            'Potato': language === 'hi' ? 'आलू' : 'Potato',
            'Tomato': language === 'hi' ? 'टमाटर' : 'Tomato',
            'Groundnut': language === 'hi' ? 'मूंगफली' : 'Groundnut',
            'Mustard': language === 'hi' ? 'सरसों' : 'Mustard',
            'Sunflower': language === 'hi' ? 'सूरजमुखी' : 'Sunflower',
            'Chickpea': language === 'hi' ? 'चना' : 'Chickpea',
            'Pigeon Pea': language === 'hi' ? 'अरहर' : 'Pigeon Pea',
            'Lentil': language === 'hi' ? 'मसूर' : 'Lentil',
            'Barley': language === 'hi' ? 'जौ' : 'Barley',
            'Millet': language === 'hi' ? 'बाजरा' : 'Millet',
            'Sorghum': language === 'hi' ? 'ज्वार' : 'Sorghum',
            'Chilli': language === 'hi' ? 'मिर्च' : 'Chilli',
            'Turmeric': language === 'hi' ? 'हल्दी' : 'Turmeric',
            'Jute': language === 'hi' ? 'जूट' : 'Jute'
        }
        return translations[crop] || crop
    }

    // Cost-benefit analysis data
    const costBenefitAnalysis = () => {
        if (!filteredPrices.length) return null

        const avgPrice = filteredPrices.reduce((sum, p) => sum + p.price, 0) / filteredPrices.length
        const productionCostPerQuintal = avgPrice * 0.6 // Assuming 60% production cost
        const profitPerQuintal = avgPrice - productionCostPerQuintal
        const profitPerAcre = profitPerQuintal * 20 // Assuming 20 quintals per acre average yield

        return {
            avgPrice: Math.round(avgPrice),
            productionCost: Math.round(productionCostPerQuintal),
            profitPerQuintal: Math.round(profitPerQuintal),
            profitPerAcre: Math.round(profitPerAcre)
        }
    }

    const analysis = costBenefitAnalysis()

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header with Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                            {t('marketPrices')}
                        </span>
                        <Button
                            onClick={refreshPrices}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            {language === 'hi' ? 'रिफ्रेश' : 'Refresh'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                            <SelectTrigger>
                                <SelectValue placeholder={language === 'hi' ? 'फसल चुनें' : 'Select Crop'} />
                            </SelectTrigger>
                            <SelectContent>
                                {crops.map(crop => (
                                    <SelectItem key={crop} value={crop}>
                                        {getCropNameInLanguage(crop)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                            <SelectTrigger>
                                <SelectValue placeholder={language === 'hi' ? 'मार्केट चुनें' : 'Select Market'} />
                            </SelectTrigger>
                            <SelectContent>
                                {markets.map(market => (
                                    <SelectItem key={market} value={market}>
                                        {market}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="w-full"
                        >
                            {language === 'hi' ? 'साफ़ करें' : 'Clear Filters'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Cost-Benefit Analysis */}
            {analysis && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-green-600" />
                                {language === 'hi' ? 'लागत-लाभ विश्लेषण' : 'Cost-Benefit Analysis'}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    // Create a formatted text representation of the analysis
                                    const textToCopy = formatCostBenefitAnalysis(analysis, formatCurrency, language)

                                    const button = e.currentTarget;
                                    const originalText = button.innerHTML;
                                    selectAllAndCopy(textToCopy, (isCopying) => {
                                        button.innerHTML = isCopying ? (language === 'hi' ? '✓ चयनित' : '✓ Selected') : originalText;
                                    })
                                }}
                                title={language === 'hi' ? 'सभी चुनें और कॉपी करें' : 'Select all and copy'}
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                </svg>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-sm text-blue-600 font-medium">
                                    {language === 'hi' ? 'औसत बाजार मूल्य' : 'Average Market Price'}
                                </div>
                                <div className="text-2xl font-bold text-blue-700">
                                    {formatCurrency(analysis.avgPrice)}
                                </div>
                                <div className="text-xs text-blue-500">
                                    {language === 'hi' ? 'प्रति क्विंटल' : 'per quintal'}
                                </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="text-sm text-red-600 font-medium">
                                    {language === 'hi' ? 'उत्पादन लागत' : 'Production Cost'}
                                </div>
                                <div className="text-2xl font-bold text-red-700">
                                    {formatCurrency(analysis.productionCost)}
                                </div>
                                <div className="text-xs text-red-500">
                                    {language === 'hi' ? 'प्रति क्विंटल' : 'per quintal'}
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-sm text-green-600 font-medium">
                                    {language === 'hi' ? 'लाभ प्रति क्विंटल' : 'Profit per Quintal'}
                                </div>
                                <div className="text-2xl font-bold text-green-700">
                                    {formatCurrency(analysis.profitPerQuintal)}
                                </div>
                                <div className="text-xs text-green-500">
                                    {((analysis.profitPerQuintal / analysis.avgPrice) * 100).toFixed(1)}% {language === 'hi' ? 'मार्जिन' : 'margin'}
                                </div>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="text-sm text-purple-600 font-medium">
                                    {language === 'hi' ? 'लाभ प्रति एकड़' : 'Profit per Acre'}
                                </div>
                                <div className="text-2xl font-bold text-purple-700">
                                    {formatCurrency(analysis.profitPerAcre)}
                                </div>
                                <div className="text-xs text-purple-500">
                                    {language === 'hi' ? 'अनुमानित' : 'estimated'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>{language === 'hi' ? 'सुझाव:' : 'Recommendation:'}</strong>
                                {analysis.profitPerQuintal > 1000 ? (
                                    language === 'hi'
                                        ? ' अच्छा लाभ मार्जिन! यह फसल लगाना लाभदायक हो सकता है।'
                                        : ' Good profit margin! This crop could be profitable to grow.'
                                ) : (
                                    language === 'hi'
                                        ? ' कम लाभ मार्जिन। बाजार की स्थिति की जांच करें या अन्य फसलों पर विचार करें।'
                                        : ' Low profit margin. Check market conditions or consider other crops.'
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Price Summary Cards */}
            <div className="flex justify-between items-center">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 flex-grow">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'hi' ? 'उच्चतम मूल्य' : 'Highest Price'}
                                    </div>
                                    <div className="font-semibold">
                                        {formatCurrency(Math.max(...filteredPrices.map(p => p.price)))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'hi' ? 'न्यूनतम मूल्य' : 'Lowest Price'}
                                    </div>
                                    <div className="font-semibold">
                                        {formatCurrency(Math.min(...filteredPrices.map(p => p.price)))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'hi' ? 'औसत मूल्य' : 'Average Price'}
                                    </div>
                                    <div className="font-semibold">
                                        {formatCurrency(Math.round(filteredPrices.reduce((sum, p) => sum + p.price, 0) / filteredPrices.length) || 0)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-purple-600" />
                                <div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'hi' ? 'कुल मार्केट' : 'Total Markets'}
                                    </div>
                                    <div className="font-semibold">
                                        {Array.from(new Set(filteredPrices.map(p => p.market))).length}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="ml-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            // Create a formatted text representation of the summary
                            const textToCopy = formatPriceSummary(filteredPrices, formatCurrency, language)

                            const button = e.currentTarget;
                            const originalText = button.innerHTML;
                            selectAllAndCopy(textToCopy, (isCopying) => {
                                button.innerHTML = isCopying ? (language === 'hi' ? '✓ चयनित' : '✓ Selected') : originalText;
                            })
                        }}
                        title={language === 'hi' ? 'सभी चुनें और कॉपी करें' : 'Select all and copy'}
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                    </Button>
                </div>
            </div>

            {/* Price Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-green-600" />
                        {language === 'hi' ? 'वर्तमान मूल्य सूची' : 'Current Price List'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async (e) => {
                                // Create a formatted text representation of all prices
                                const textToCopy = formatMarketPrices(filteredPrices, getCropNameInLanguage, formatCurrency, language);

                                const button = e.currentTarget;
                                const originalText = button.innerHTML;
                                const success = await selectAllAndCopy(textToCopy, (isCopying) => {
                                    button.innerHTML = isCopying ? (language === 'hi' ? '✓ चयनित' : '✓ Selected') : originalText;
                                });
                                if (!success) {
                                    console.error('Failed to copy text');
                                }
                            }}
                            title={language === 'hi' ? 'सभी चुनें और कॉपी करें' : 'Select all and copy'}
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                            {language === 'hi' ? 'सभी चुनें' : 'Select All'}
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-w-full space-y-4">
                            {filteredPrices.map((price, idx) => (
                                <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="grid gap-4 md:grid-cols-6 items-center">
                                        {/* Crop Info */}
                                        <div className="md:col-span-2">
                                            <div className="font-semibold text-lg">
                                                {getCropNameInLanguage(price.crop)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {language === 'hi' ? 'किस्म' : 'Variety'}: {price.variety}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {language === 'hi' ? 'गुणवत्ता' : 'Quality'}: {price.quality}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-green-600">
                                                {formatCurrency(price.price)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {language === 'hi' ? 'प्रति क्विंटल' : price.unit}
                                            </div>
                                        </div>

                                        {/* Price Change */}
                                        <div className="text-center">
                                            <div className={`flex items-center justify-center gap-1 ${price.change >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {price.change >= 0 ? (
                                                    <TrendingUp className="w-4 h-4" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4" />
                                                )}
                                                <span className="font-medium">
                                                    {formatCurrency(Math.abs(price.change))}
                                                </span>
                                            </div>
                                            <div className={`text-sm ${price.change >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                ({price.changePercent > 0 ? '+' : ''}{price.changePercent.toFixed(2)}%)
                                            </div>
                                        </div>

                                        {/* Market */}
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">{price.market}</span>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(price.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {filteredPrices.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">
                                {language === 'hi' ? 'कोई मूल्य नहीं मिला' : 'No prices found'}
                            </p>
                            <p className="text-sm">
                                {language === 'hi'
                                    ? 'अपने फिल्टर बदलें या खोज शब्द को संशोधित करें'
                                    : 'Try changing your filters or search terms'
                                }
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Market Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            {language === 'hi' ? 'मार्केट अंतर्दृष्टि' : 'Market Insights'}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                // Create a formatted text representation of the market insights
                                const textToCopy = formatMarketInsights(filteredPrices, getCropNameInLanguage, language)

                                const button = e.currentTarget;
                                const originalText = button.innerHTML;
                                selectAllAndCopy(textToCopy, (isCopying) => {
                                    button.innerHTML = isCopying ? (language === 'hi' ? '✓ चयनित' : '✓ Selected') : originalText;
                                })
                            }}
                            title={language === 'hi' ? 'सभी चुनें और कॉपी करें' : 'Select all and copy'}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-2">
                                {language === 'hi' ? 'मूल्य वृद्धि' : 'Price Gainers'}
                            </h4>
                            {filteredPrices
                                .filter(p => p.change > 0)
                                .sort((a, b) => b.changePercent - a.changePercent)
                                .slice(0, 3)
                                .map((price, idx) => (
                                    <div key={idx} className="text-sm text-green-700 mb-1">
                                        {getCropNameInLanguage(price.crop)} ({price.market}): +{price.changePercent.toFixed(2)}%
                                    </div>
                                ))
                            }
                        </div>

                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-medium text-red-800 mb-2">
                                {language === 'hi' ? 'मूल्य गिरावट' : 'Price Decliners'}
                            </h4>
                            {filteredPrices
                                .filter(p => p.change < 0)
                                .sort((a, b) => a.changePercent - b.changePercent)
                                .slice(0, 3)
                                .map((price, idx) => (
                                    <div key={idx} className="text-sm text-red-700 mb-1">
                                        {getCropNameInLanguage(price.crop)} ({price.market}): {price.changePercent.toFixed(2)}%
                                    </div>
                                ))
                            }
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2">
                                {language === 'hi' ? 'मार्केट सुझाव' : 'Market Tips'}
                            </h4>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>{language === 'hi' ? '• नियमित मूल्य निगरानी करें' : '• Monitor prices regularly'}</p>
                                <p>{language === 'hi' ? '• कई मार्केट की तुलना करें' : '• Compare multiple markets'}</p>
                                <p>{language === 'hi' ? '• बेचने का सही समय चुनें' : '• Choose the right time to sell'}</p>
                                <p>{language === 'hi' ? '• लागत-लाभ का विश्लेषण करें' : '• Analyze cost-benefit ratios'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}