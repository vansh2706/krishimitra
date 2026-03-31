'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, MapPin, Calendar, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/hooks/useLanguage'

interface MarketPrice {
    crop: string
    price: number
    unit: string
    change: number
    changePercent: number
    market: string
    lastUpdated: string
    quality: string
    trend: 'up' | 'down' | 'stable'
}

interface EnhancedMarketPricesProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai',
    'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Bhopal'
]

const majorCrops = [
    'wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'soybean',
    'groundnut', 'mustard', 'sunflower', 'chickpea', 'pigeon_pea',
    'lentil', 'barley', 'millet', 'sorghum', 'onion', 'potato',
    'tomato', 'chilli', 'turmeric'
]

export function EnhancedMarketPrices({ voiceEnabled, onSpeak }: EnhancedMarketPricesProps) {
    const { t, language, isOnline } = useLanguage()
    const [prices, setPrices] = useState<MarketPrice[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedCity, setSelectedCity] = useState('Mumbai')
    const [selectedCrop, setSelectedCrop] = useState('all')
    const [sortBy, setSortBy] = useState<'price' | 'change' | 'crop'>('crop')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Generate mock data for demonstration
    const generateMockPrices = (city: string): MarketPrice[] => {
        return majorCrops.map(crop => {
            const basePrice = Math.random() * 5000 + 1000
            const change = (Math.random() - 0.5) * 200
            const changePercent = (change / basePrice) * 100

            // Determine trend based on change value
            let trend: 'up' | 'down' | 'stable' = 'stable'
            if (change > 10) {
                trend = 'up'
            } else if (change < -10) {
                trend = 'down'
            }

            return {
                crop,
                price: Math.round(basePrice),
                unit: 'per quintal',
                change: Math.round(change),
                changePercent: Math.round(changePercent * 100) / 100,
                market: `${city} Market`,
                lastUpdated: new Date().toISOString(),
                quality: Math.random() > 0.5 ? 'Grade A' : 'Grade B',
                trend
            }
        })
    }

    const fetchMarketPrices = async () => {
        setLoading(true)
        try {
            // In a real implementation, this would fetch from government APIs
            // For now, we'll use mock data
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

            const mockPrices = generateMockPrices(selectedCity)
            setPrices(mockPrices)
            setLastUpdated(new Date())

            if (voiceEnabled) {
                const announcement = `Market prices updated for ${selectedCity}. ${mockPrices.length} crops available.`
                onSpeak(announcement)
            }
        } catch (error) {
            console.error('Failed to fetch market prices:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMarketPrices()
    }, [selectedCity])

    const filteredPrices = prices.filter(price =>
        selectedCrop === 'all' || price.crop === selectedCrop
    ).sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return b.price - a.price
            case 'change':
                return b.change - a.change
            case 'crop':
            default:
                return t(a.crop).localeCompare(t(b.crop))
        }
    })

    const getPriceAnalysis = () => {
        if (prices.length === 0) return null

        const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length
        const pricesUp = prices.filter(p => p.change > 0).length
        const pricesDown = prices.filter(p => p.change < 0).length
        const topGainer = prices.reduce((max, p) => p.changePercent > max.changePercent ? p : max)
        const topLoser = prices.reduce((min, p) => p.changePercent < min.changePercent ? p : min)

        return {
            avgPrice: Math.round(avgPrice),
            pricesUp,
            pricesDown,
            topGainer,
            topLoser
        }
    }

    const analysis = getPriceAnalysis()

    const handleCropSelect = (crop: string) => {
        setSelectedCrop(crop)
        if (voiceEnabled && crop !== 'all') {
            const priceData = prices.find(p => p.crop === crop)
            if (priceData) {
                const announcement = `${t(crop)} price in ${selectedCity} is ${priceData.price} rupees per quintal, ${priceData.change > 0 ? 'up' : 'down'
                    } by ${Math.abs(priceData.changePercent)}%`
                onSpeak(announcement)
            }
        }
    }

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-500" />
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-500" />
            default:
                return <div className="h-4 w-4" />
        }
    }

    const getTrendColor = (change: number) => {
        if (change > 0) return 'text-green-600'
        if (change < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            {t('marketPrices')} - {selectedCity}
                        </div>
                        <Button
                            onClick={fetchMarketPrices}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <Select value={selectedCity} onValueChange={setSelectedCity}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {indianCities.map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <Select value={selectedCrop} onValueChange={handleCropSelect}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Crops</SelectItem>
                                    {majorCrops.map(crop => (
                                        <SelectItem key={crop} value={crop}>{t(crop)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="crop">By Crop</SelectItem>
                                <SelectItem value="price">By Price</SelectItem>
                                <SelectItem value="change">By Change</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Market Analysis */}
                    {analysis && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">₹{analysis.avgPrice}</p>
                                        <p className="text-sm text-gray-600">Average Price</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{analysis.pricesUp}</p>
                                        <p className="text-sm text-gray-600">Prices Up</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-red-600">{analysis.pricesDown}</p>
                                        <p className="text-sm text-gray-600">Prices Down</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-green-600">
                                            {t(analysis.topGainer.crop)}
                                        </p>
                                        <p className="text-sm text-gray-600">Top Gainer</p>
                                        <p className="text-xs text-green-600">+{analysis.topGainer.changePercent}%</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Price List */}
                    <Tabs defaultValue="list" className="w-full">
                        <TabsList>
                            <TabsTrigger value="list">List View</TabsTrigger>
                            <TabsTrigger value="grid">Grid View</TabsTrigger>
                        </TabsList>

                        <TabsContent value="list" className="space-y-2">
                            {filteredPrices.map((price, index) => (
                                <Card key={index} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getTrendIcon(price.trend)}
                                                <div>
                                                    <h3 className="font-semibold">{t(price.crop)}</h3>
                                                    <p className="text-sm text-gray-600">{price.quality}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold">₹{price.price}</p>
                                                <p className="text-xs text-gray-600">{price.unit}</p>
                                            </div>

                                            <div className="text-right">
                                                <p className={`text-sm font-medium ${getTrendColor(price.change)}`}>
                                                    {price.change > 0 ? '+' : ''}₹{price.change}
                                                </p>
                                                <p className={`text-xs ${getTrendColor(price.change)}`}>
                                                    {price.changePercent > 0 ? '+' : ''}{price.changePercent}%
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        <TabsContent value="grid">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredPrices.map((price, index) => (
                                    <Card key={index} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center justify-between">
                                                {t(price.crop)}
                                                {getTrendIcon(price.trend)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-2xl font-bold">₹{price.price}</span>
                                                    <Badge variant="outline">{price.quality}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600">{price.unit}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-sm ${getTrendColor(price.change)}`}>
                                                        {price.change > 0 ? '+' : ''}₹{price.change}
                                                    </span>
                                                    <span className={`text-sm ${getTrendColor(price.change)}`}>
                                                        {price.changePercent > 0 ? '+' : ''}{price.changePercent}%
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {lastUpdated && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            Last updated: {lastUpdated.toLocaleString()}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}