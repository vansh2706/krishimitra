'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, RefreshCw, Copy, Share2 } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { getBestAvailablePrices, type CropPriceData } from '@/services/external'

interface CropPriceSelectorProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

interface CropPrice {
    crop: string
    price: number
    change: number
    changePercent: number
    lastUpdated: string
}

// Define the structure for crop data
interface CropInfo {
    name: string
    emoji: string
    color: string
}

interface CropData {
    [key: string]: {
        hi: CropInfo
        en: CropInfo
        ta: CropInfo
        te: CropInfo
        bn: CropInfo
        gu: CropInfo
        mr: CropInfo
        pa: CropInfo
    }
}

// Define crop data with translations
const cropData: CropData = {
    wheat: {
        hi: { name: 'गेहूं', emoji: '🌾', color: 'bg-yellow-100 text-yellow-800' },
        en: { name: 'Wheat', emoji: '🌾', color: 'bg-yellow-100 text-yellow-800' },
        ta: { name: 'கோதுமை', emoji: '🌾', color: 'bg-yellow-100 text-yellow-800' },
        te: { name: 'గోధుమలు', emoji: '🌾', color: 'bg-yellow-100 text-yellow-800' },
        bn: { name: 'গম', emoji: '🌾', color: 'bg-yellow-100 text-yellow-800' },
        gu: { name: 'ઘઉં', emoji: '🌾', color: 'bg-yellow-100 text-yellow-800' },
        mr: { name: 'गहू', emoji: '🌾', color: 'bg-yellow-100 text-yellow-800' },
        pa: { name: 'ਕਣਕ', emoji: '🌾', color: 'bg-yellow-100 text-yellow-800' }
    },
    rice: {
        hi: { name: 'चावल', emoji: '🌾', color: 'bg-green-100 text-green-800' },
        en: { name: 'Rice', emoji: '🌾', color: 'bg-green-100 text-green-800' },
        ta: { name: 'அரிசி', emoji: '🌾', color: 'bg-green-100 text-green-800' },
        te: { name: 'వరి', emoji: '🌾', color: 'bg-green-100 text-green-800' },
        bn: { name: 'ধান', emoji: '🌾', color: 'bg-green-100 text-green-800' },
        gu: { name: 'ચોખા', emoji: '🌾', color: 'bg-green-100 text-green-800' },
        mr: { name: 'भात', emoji: '🌾', color: 'bg-green-100 text-green-800' },
        pa: { name: 'ਚਾਵਲ', emoji: '🌾', color: 'bg-green-100 text-green-800' }
    },
    cotton: {
        hi: { name: 'कपास', emoji: '🌿', color: 'bg-blue-100 text-blue-800' },
        en: { name: 'Cotton', emoji: '🌿', color: 'bg-blue-100 text-blue-800' },
        ta: { name: 'பருத்தி', emoji: '🌿', color: 'bg-blue-100 text-blue-800' },
        te: { name: 'పత్తి', emoji: '🌿', color: 'bg-blue-100 text-blue-800' },
        bn: { name: 'তুলা', emoji: '🌿', color: 'bg-blue-100 text-blue-800' },
        gu: { name: 'કપાસ', emoji: '🌿', color: 'bg-blue-100 text-blue-800' },
        mr: { name: 'कापूस', emoji: '🌿', color: 'bg-blue-100 text-blue-800' },
        pa: { name: 'ਕਪਾਹ', emoji: '🌿', color: 'bg-blue-100 text-blue-800' }
    },
    sugarcane: {
        hi: { name: 'गन्ना', emoji: '🌱', color: 'bg-purple-100 text-purple-800' },
        en: { name: 'Sugarcane', emoji: '🌱', color: 'bg-purple-100 text-purple-800' },
        ta: { name: 'கரும்பு', emoji: '🌱', color: 'bg-purple-100 text-purple-800' },
        te: { name: 'చెరకు', emoji: '🌱', color: 'bg-purple-100 text-purple-800' },
        bn: { name: 'আখ', emoji: '🌱', color: 'bg-purple-100 text-purple-800' },
        gu: { name: 'શેરડી', emoji: '🌱', color: 'bg-purple-100 text-purple-800' },
        mr: { name: 'ऊस', emoji: '🌱', color: 'bg-purple-100 text-purple-800' },
        pa: { name: 'ਗੰਨਾ', emoji: '🌱', color: 'bg-purple-100 text-purple-800' }
    },
    maize: {
        hi: { name: 'मक्का', emoji: '🌽', color: 'bg-orange-100 text-orange-800' },
        en: { name: 'Maize', emoji: '🌽', color: 'bg-orange-100 text-orange-800' },
        ta: { name: 'சோளம்', emoji: '🌽', color: 'bg-orange-100 text-orange-800' },
        te: { name: 'మొక్కజొన్న', emoji: '🌽', color: 'bg-orange-100 text-orange-800' },
        bn: { name: 'ভুট্টা', emoji: '🌽', color: 'bg-orange-100 text-orange-800' },
        gu: { name: 'મકાઈ', emoji: '🌽', color: 'bg-orange-100 text-orange-800' },
        mr: { name: 'मका', emoji: '🌽', color: 'bg-orange-100 text-orange-800' },
        pa: { name: 'ਮੱਕੀ', emoji: '🌽', color: 'bg-orange-100 text-orange-800' }
    },
    soybean: {
        hi: { name: 'सोयाबीन', emoji: '🫘', color: 'bg-indigo-100 text-indigo-800' },
        en: { name: 'Soybean', emoji: '🫘', color: 'bg-indigo-100 text-indigo-800' },
        ta: { name: 'சோயாபீன்', emoji: '🫘', color: 'bg-indigo-100 text-indigo-800' },
        te: { name: 'సోయాబీన్', emoji: '🫘', color: 'bg-indigo-100 text-indigo-800' },
        bn: { name: 'সয়াবিন', emoji: '🫘', color: 'bg-indigo-100 text-indigo-800' },
        gu: { name: 'સોયાબીન', emoji: '🫘', color: 'bg-indigo-100 text-indigo-800' },
        mr: { name: 'सोयाबीन', emoji: '🫘', color: 'bg-indigo-100 text-indigo-800' },
        pa: { name: 'ਸੋਇਆਬੀਨ', emoji: '🫘', color: 'bg-indigo-100 text-indigo-800' }
    },
    tomato: {
        hi: { name: 'टमाटर', emoji: '🍅', color: 'bg-red-100 text-red-800' },
        en: { name: 'Tomato', emoji: '🍅', color: 'bg-red-100 text-red-800' },
        ta: { name: 'தக்காளி', emoji: '🍅', color: 'bg-red-100 text-red-800' },
        te: { name: 'టమాటో', emoji: '🍅', color: 'bg-red-100 text-red-800' },
        bn: { name: 'টমেটো', emoji: '🍅', color: 'bg-red-100 text-red-800' },
        gu: { name: 'ટમેટા', emoji: '🍅', color: 'bg-red-100 text-red-800' },
        mr: { name: 'टोमेटो', emoji: '🍅', color: 'bg-red-100 text-red-800' },
        pa: { name: 'ਟਮਾਟਰ', emoji: '🍅', color: 'bg-red-100 text-red-800' }
    },
    onion: {
        hi: { name: 'प्याज', emoji: '🧅', color: 'bg-pink-100 text-pink-800' },
        en: { name: 'Onion', emoji: '🧅', color: 'bg-pink-100 text-pink-800' },
        ta: { name: 'வெங்காயம்', emoji: '🧅', color: 'bg-pink-100 text-pink-800' },
        te: { name: 'ఉల్లిపాయ', emoji: '🧅', color: 'bg-pink-100 text-pink-800' },
        bn: { name: 'পেঁয়াজ', emoji: '🧅', color: 'bg-pink-100 text-pink-800' },
        gu: { name: 'ડુંગળી', emoji: '🧅', color: 'bg-pink-100 text-pink-800' },
        mr: { name: 'कांदा', emoji: '🧅', color: 'bg-pink-100 text-pink-800' },
        pa: { name: 'ਪਿਆਜ਼', emoji: '🧅', color: 'bg-pink-100 text-pink-800' }
    },
    potato: {
        hi: { name: 'आलू', emoji: '🥔', color: 'bg-amber-100 text-amber-800' },
        en: { name: 'Potato', emoji: '🥔', color: 'bg-amber-100 text-amber-800' },
        ta: { name: 'உருளைக்கிழங்கு', emoji: '🥔', color: 'bg-amber-100 text-amber-800' },
        te: { name: 'బంగాళాదుంప', emoji: '🥔', color: 'bg-amber-100 text-amber-800' },
        bn: { name: 'আলু', emoji: '🥔', color: 'bg-amber-100 text-amber-800' },
        gu: { name: 'બટાકા', emoji: '🥔', color: 'bg-amber-100 text-amber-800' },
        mr: { name: 'बटाटा', emoji: '🥔', color: 'bg-amber-100 text-amber-800' },
        pa: { name: 'ਆਲੂ', emoji: '🥔', color: 'bg-amber-100 text-amber-800' }
    },
    mustard: {
        hi: { name: 'सरसों', emoji: '🌼', color: 'bg-lime-100 text-lime-800' },
        en: { name: 'Mustard', emoji: '🌼', color: 'bg-lime-100 text-lime-800' },
        ta: { name: 'கடுகு', emoji: '🌼', color: 'bg-lime-100 text-lime-800' },
        te: { name: 'ఆవాలు', emoji: '🌼', color: 'bg-lime-100 text-lime-800' },
        bn: { name: 'সরিষা', emoji: '🌼', color: 'bg-lime-100 text-lime-800' },
        gu: { name: 'રાઈ', emoji: '🌼', color: 'bg-lime-100 text-lime-800' },
        mr: { name: 'मोहरी', emoji: '🌼', color: 'bg-lime-100 text-lime-800' },
        pa: { name: 'ਸਰੋਂ', emoji: '🌼', color: 'bg-lime-100 text-lime-800' }
    },
    groundnut: {
        hi: { name: 'मूंगफली', emoji: '🥜', color: 'bg-rose-100 text-rose-800' },
        en: { name: 'Groundnut', emoji: '🥜', color: 'bg-rose-100 text-rose-800' },
        ta: { name: 'நிலக்கடலை', emoji: '🥜', color: 'bg-rose-100 text-rose-800' },
        te: { name: 'వేరుశనగ', emoji: '🥜', color: 'bg-rose-100 text-rose-800' },
        bn: { name: 'চিনাবাদাম', emoji: '🥜', color: 'bg-rose-100 text-rose-800' },
        gu: { name: 'મગફળી', emoji: '🥜', color: 'bg-rose-100 text-rose-800' },
        mr: { name: 'भुईमूग', emoji: '🥜', color: 'bg-rose-100 text-rose-800' },
        pa: { name: 'ਮੂੰਗਫਲੀ', emoji: '🥜', color: 'bg-rose-100 text-rose-800' }
    },
    chilli: {
        hi: { name: 'मिर्च', emoji: '🌶️', color: 'bg-red-100 text-red-800' },
        en: { name: 'Chilli', emoji: '🌶️', color: 'bg-red-100 text-red-800' },
        ta: { name: 'மிளகாய்', emoji: '🌶️', color: 'bg-red-100 text-red-800' },
        te: { name: 'మిర్చి', emoji: '🌶️', color: 'bg-red-100 text-red-800' },
        bn: { name: 'লঙ্কা', emoji: '🌶️', color: 'bg-red-100 text-red-800' },
        gu: { name: 'મરચું', emoji: '🌶️', color: 'bg-red-100 text-red-800' },
        mr: { name: 'मिरची', emoji: '🌶️', color: 'bg-red-100 text-red-800' },
        pa: { name: 'ਮਿਰਚ', emoji: '🌶️', color: 'bg-red-100 text-red-800' }
    }
}

export function CropPriceSelector({ voiceEnabled, onSpeak }: CropPriceSelectorProps) {
    const { t, language } = useLanguage()
    const [selectedCrop, setSelectedCrop] = useState('wheat')
    const [isLoading, setIsLoading] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const [shareSuccess, setShareSuccess] = useState(false)
    const [hasFetchedPrices, setHasFetchedPrices] = useState(false) // New state to track if we've fetched prices

    // Generate available crops based on current language
    const availableCrops = Object.keys(cropData).map(cropId => ({
        id: cropId,
        ...cropData[cropId][language as keyof typeof cropData[typeof cropId]]
    }))

    // Generate crop prices based on current language
    const [cropPrices, setCropPrices] = useState<Record<string, CropPrice>>(() => {
        const prices: Record<string, CropPrice> = {}
        Object.keys(cropData).forEach(cropId => {
            const cropInfo = cropData[cropId][language as keyof typeof cropData[typeof cropId]]
            // Use default prices, but with language-specific crop names
            const defaultPrices: Record<string, CropPrice> = {
                wheat: {
                    crop: cropData.wheat[language as keyof typeof cropData.wheat].name,
                    price: 2150,
                    change: 25,
                    changePercent: 1.2,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                rice: {
                    crop: cropData.rice[language as keyof typeof cropData.rice].name,
                    price: 3200,
                    change: -15,
                    changePercent: -0.5,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                cotton: {
                    crop: cropData.cotton[language as keyof typeof cropData.cotton].name,
                    price: 5800,
                    change: 120,
                    changePercent: 2.1,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                sugarcane: {
                    crop: cropData.sugarcane[language as keyof typeof cropData.sugarcane].name,
                    price: 280,
                    change: 5,
                    changePercent: 1.8,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                maize: {
                    crop: cropData.maize[language as keyof typeof cropData.maize].name,
                    price: 1800,
                    change: -30,
                    changePercent: -1.6,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                soybean: {
                    crop: cropData.soybean[language as keyof typeof cropData.soybean].name,
                    price: 4200,
                    change: 80,
                    changePercent: 1.9,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                tomato: {
                    crop: cropData.tomato[language as keyof typeof cropData.tomato].name,
                    price: 1200,
                    change: -50,
                    changePercent: -4.0,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                onion: {
                    crop: cropData.onion[language as keyof typeof cropData.onion].name,
                    price: 1800,
                    change: 100,
                    changePercent: 5.9,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                potato: {
                    crop: cropData.potato[language as keyof typeof cropData.potato].name,
                    price: 950,
                    change: 30,
                    changePercent: 3.3,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                mustard: {
                    crop: cropData.mustard[language as keyof typeof cropData.mustard].name,
                    price: 5400,
                    change: 150,
                    changePercent: 2.9,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                groundnut: {
                    crop: cropData.groundnut[language as keyof typeof cropData.groundnut].name,
                    price: 6200,
                    change: -100,
                    changePercent: -1.6,
                    lastUpdated: new Date().toLocaleTimeString()
                },
                chilli: {
                    crop: cropData.chilli[language as keyof typeof cropData.chilli].name,
                    price: 8500,
                    change: 200,
                    changePercent: 2.4,
                    lastUpdated: new Date().toLocaleTimeString()
                }
            }
            prices[cropId] = defaultPrices[cropId]
        })
        return prices
    })

    const currentPrice = cropPrices[selectedCrop]

    // Fetch real crop prices from external APIs
    const fetchRealCropPrices = async () => {
        setIsLoading(true)
        try {
            // Get prices for all crops (in a real implementation, you might filter by region)
            const response = await getBestAvailablePrices()

            if (response.success && response.data) {
                // Update prices with real data
                const updatedPrices = { ...cropPrices }

                response.data.forEach((priceData: CropPriceData) => {
                    // Find matching crop in our data
                    const cropKey = Object.keys(cropData).find(key =>
                        cropData[key][language as keyof typeof cropData[typeof key]].name.toLowerCase() ===
                        priceData.crop.toLowerCase()
                    )

                    if (cropKey && updatedPrices[cropKey]) {
                        // Calculate change from previous price
                        const previousPrice = updatedPrices[cropKey].price
                        const newPrice = priceData.modalPrice
                        const change = newPrice - previousPrice
                        const changePercent = (change / previousPrice) * 100

                        updatedPrices[cropKey] = {
                            crop: priceData.crop,
                            price: newPrice,
                            change: change,
                            changePercent: parseFloat(changePercent.toFixed(2)),
                            lastUpdated: new Date(priceData.date).toLocaleTimeString()
                        }
                    }
                })

                setCropPrices(updatedPrices)
                setHasFetchedPrices(true) // Mark that we've successfully fetched prices

                if (voiceEnabled) {
                    const message = language === 'hi'
                        ? `मूल्य अपडेट हो गए हैं। ${currentPrice.crop} का वर्तमान मूल्य ₹${updatedPrices[selectedCrop].price} प्रति क्विंटल है।`
                        : `Prices have been updated. Current ${currentPrice.crop} price is ₹${updatedPrices[selectedCrop].price} per quintal.`
                    onSpeak(message)
                }
            }
        } catch (error) {
            console.error('Error fetching real crop prices:', error)
            // Fallback to mock data if real data fails
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefreshPrices = async () => {
        await fetchRealCropPrices()
    }

    // Fetch real prices only when user interacts with the component, not on mount
    // useEffect(() => {
    //     fetchRealCropPrices()
    // }, [])

    // Handle copy to clipboard
    const handleCopyPrice = async () => {
        try {
            const textToCopy = language === 'hi'
                ? `${currentPrice.crop} का मूल्य: ₹${currentPrice.price} प्रति क्विंटल\nअपडेट किया गया: ${currentPrice.lastUpdated}`
                : `Price of ${currentPrice.crop}: ₹${currentPrice.price} per quintal\nUpdated: ${currentPrice.lastUpdated}`

            await navigator.clipboard.writeText(textToCopy)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    // Handle share
    const handleSharePrice = async () => {
        try {
            const textToShare = language === 'hi'
                ? `${currentPrice.crop} का मूल्य: ₹${currentPrice.price} प्रति क्विंटल\nअपडेट किया गया: ${currentPrice.lastUpdated}\n#KrishiMitra`
                : `Price of ${currentPrice.crop}: ₹${currentPrice.price} per quintal\nUpdated: ${currentPrice.lastUpdated}\n#KrishiMitra`

            if (navigator.share) {
                await navigator.share({
                    title: language === 'hi' ? 'फसल का मूल्य' : 'Crop Price',
                    text: textToShare,
                })
            } else {
                // Fallback to copy if Web Share API is not supported
                await navigator.clipboard.writeText(textToShare)
                setShareSuccess(true)
                setTimeout(() => setShareSuccess(false), 2000)
            }
        } catch (err) {
            console.error('Failed to share:', err)
        }
    }

    return (
        <Card className="p-3">
            <div className="space-y-3">
                {/* Crop Selection Toggle - Compact Circular Switch */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                        {language === 'hi' ? 'फसल मूल्य' : 'Crop Prices'}
                    </h3>

                    {/* Compact Circular Toggle Switch */}
                    <div className="flex items-center gap-2">
                        {/* Previous Crop Button */}
                        <button
                            onClick={() => {
                                const currentIndex = availableCrops.findIndex(crop => crop.id === selectedCrop);
                                const prevIndex = currentIndex > 0 ? currentIndex - 1 : availableCrops.length - 1;
                                setSelectedCrop(availableCrops[prevIndex].id);
                            }}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-200 shadow-sm"
                            aria-label="Previous crop"
                        >
                            <span className="text-xs">◀</span>
                        </button>

                        {/* Current Crop Display */}
                        <div className="flex items-center gap-2">
                            <span className="text-lg">
                                {cropData[selectedCrop][language as keyof typeof cropData[typeof selectedCrop]].emoji}
                            </span>
                            <span className="text-xs font-medium truncate max-w-[60px]">
                                {cropData[selectedCrop][language as keyof typeof cropData[typeof selectedCrop]].name}
                            </span>
                        </div>

                        {/* Next Crop Button */}
                        <button
                            onClick={() => {
                                const currentIndex = availableCrops.findIndex(crop => crop.id === selectedCrop);
                                const nextIndex = currentIndex < availableCrops.length - 1 ? currentIndex + 1 : 0;
                                setSelectedCrop(availableCrops[nextIndex].id);
                            }}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-200 shadow-sm"
                            aria-label="Next crop"
                        >
                            <span className="text-xs">▶</span>
                        </button>
                    </div>
                </div>

                {/* Price Display - Compact and Compatible */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <div className="text-sm">
                            <div className="font-bold text-green-600">
                                ₹{currentPrice.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                                {language === 'hi' ? 'प्रति क्विंटल' : 'per quintal'}
                            </div>
                        </div>
                    </div>

                    {/* Price Change */}
                    <Badge variant={currentPrice.change >= 0 ? "default" : "destructive"} className="text-xs py-1 px-2">
                        {currentPrice.change >= 0 ? '↗' : '↘'} {currentPrice.changePercent.toFixed(1)}%
                    </Badge>
                </div>

                {/* Action Buttons - Small and Compact */}
                <div className="flex justify-center">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRefreshPrices}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-2 py-1 text-xs h-7"
                    >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
                    </Button>
                </div>
            </div>
        </Card>
    )
}