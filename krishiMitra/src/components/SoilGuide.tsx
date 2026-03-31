'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import {
    Leaf,
    Beaker,
    Droplets,
    Sprout,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useLanguageData, useLanguageDebug } from '../hooks/useLanguageData'

interface SoilGuideProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

interface SoilData {
    type: string
    characteristics: string[]
    pH: string
    waterRetention: string
    drainage: string
    fertility: string
    suitableCrops: string[]
    fertilizers: {
        nitrogen: string
        phosphorus: string
        potassium: string
        organic: string[]
    }
    recommendations: string[]
    cautions: string[]
}

// New interface for soil analysis results
interface SoilAnalysisResult {
    healthRating: 'Good' | 'Moderate' | 'Poor'
    recommendedCrops: string[]
    fertilizers: {
        nitrogen: string
        phosphorus: string
        potassium: string
        micronutrients: string[]
    }
    irrigationAdvice: string
    improvementSuggestions: string[]
    pHManagement: string
    organicMatterAdvice: string
}

// Language-aware soil data function
const getSoilDataForLanguage = (soilType: string, lang: string): SoilData => {
    // Base soil data structure with language support - only clay type for demo
    const baseSoilData: Record<string, SoilData> = {
        clay: {
            type: lang === 'hi' ? 'चिकनी मिट्टी' : 'Clay Soil',
            characteristics: lang === 'hi' ?
                ['भारी बनावट', 'खराब जल निकासी', 'अधिक जल धारण', 'पोषक तत्वों से भरपूर'] :
                ['Heavy texture', 'Poor drainage', 'High water retention', 'Rich in nutrients'],
            pH: '6.5-7.5',
            waterRetention: lang === 'hi' ? 'उच्च' : 'High',
            drainage: lang === 'hi' ? 'खराब' : 'Poor',
            fertility: lang === 'hi' ? 'उच्च' : 'High',
            suitableCrops: lang === 'hi' ? ['धान', 'गेहूं', 'गन्ना', 'कपास', 'सोयाबीन'] : ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Soybean'],
            fertilizers: {
                nitrogen: '120-150 kg/ha',
                phosphorus: '60-80 kg/ha',
                potassium: '40-60 kg/ha',
                organic: lang === 'hi' ? ['गोबर की खाद', 'कम्पोस्ट', 'हरी खाद'] : ['यूरिया', 'डीएपी', 'एमओपी', 'कम्पोस्ट']
            },
            recommendations: lang === 'hi' ? [
                'जल निकासी सुधारने के लिए जैविक पदार्थ जोड़ें',
                'बेहतर जल प्रबंधन के लिए ऊंची क्यारियों का उपयोग करें',
                'शुष्क मौसम में गहरी जुताई करें',
                'मिट्टी की संरचना सुधारने के लिए जिप्सम डालें'
            ] : [
                'Add organic matter to improve drainage',
                'Use raised beds for better water management',
                'Deep plowing during dry season',
                'Apply gypsum to improve soil structure'
            ],
            cautions: lang === 'hi' ? [
                'मिट्टी गीली होने पर काम करने से बचें',
                'मानसून के दौरान जलभराव का खतरा',
                'सूखने पर कड़ी हो सकती है और दरार पड़ सकती है'
            ] : [
                'Avoid working when soil is wet',
                'Risk of waterlogging during monsoon',
                'May become hard and crack when dry'
            ]
        }
    }

    return baseSoilData[soilType] || soilDatabase[soilType]
}

const soilDatabase: Record<string, SoilData> = {
    clay: {
        type: 'Clay Soil / चिकनी मिट्टी',
        characteristics: ['Heavy texture', 'Poor drainage', 'High water retention', 'Rich in nutrients'],
        pH: '6.5-7.5',
        waterRetention: 'High',
        drainage: 'Poor',
        fertility: 'High',
        suitableCrops: ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Soybean'],
        fertilizers: {
            nitrogen: 'यूरिया 120-150 kg/ha (Urea)',
            phosphorus: 'डीएपी 60-80 kg/ha (DAP)',
            potassium: 'एमओपी 40-60 kg/ha (MOP)',
            organic: ['गोबर की खाद 20-25 टन/हेक्टेयर', 'कम्पोस्ट 15-20 टन/हेक्टेयर', 'जिप्सम 2-3 टन/हेक्टेयर', 'हरी खाद']
        },
        recommendations: [
            'Deep plowing during summer',
            'Add organic matter to improve drainage',
            'Apply gypsum to improve soil structure',
            'Avoid working when wet'
        ],
        cautions: [
            'Avoid working when soil is wet',
            'Risk of waterlogging during monsoon',
            'May become hard and crack when dry'
        ]
    },
    sandy: {
        type: 'Sandy Soil / बलुई मिट्टी',
        characteristics: ['Light texture', 'Excellent drainage', 'Low water retention', 'Quick warming'],
        pH: '6.0-7.0',
        waterRetention: 'Low',
        drainage: 'Excellent',
        fertility: 'Low',
        suitableCrops: ['Millets', 'Groundnut', 'Watermelon', 'Carrot', 'Onion'],
        fertilizers: {
            nitrogen: 'यूरिया 180-200 kg/ha (Urea)',
            phosphorus: 'सुपर फॉस्फेट 40-60 kg/ha (SSP)',
            potassium: 'एमओपी 80-100 kg/ha (MOP)',
            organic: ['वर्मी कम्पोस्ट 8-12 टन/हेक्टेयर', 'हड्डी का चूर्ण', 'हरी खाद (सनई)', 'नीम की खली']
        },
        recommendations: [
            'Frequent irrigation with small amounts',
            'Use mulching to retain moisture',
            'Regular addition of organic matter',
            'Split application of fertilizers'
        ],
        cautions: [
            'Nutrients leach away quickly',
            'Requires frequent irrigation',
            'Low natural fertility'
        ]
    },
    loamy: {
        type: 'Loamy Soil / दोमट मिट्टी',
        characteristics: ['Ideal texture', 'Balanced drainage', 'Good water retention', 'High fertility'],
        pH: '6.0-7.5',
        waterRetention: 'Good',
        drainage: 'Good',
        fertility: 'High',
        suitableCrops: ['Wheat', 'Maize', 'Vegetables', 'Fruits', 'Pulses'],
        fertilizers: {
            nitrogen: 'यूरिया 100-140 kg/ha (Urea)',
            phosphorus: 'डीएपी 50-70 kg/ha (DAP)',
            potassium: 'एमओपी 60-80 kg/ha (MOP)',
            organic: ['गोबर की खाद 15-20 टन/हेक्टेयर', 'कम्पोस्ट 10-15 टन/हेक्टेयर', 'बायो-फर्टिलाइजर (राइजोबियम, PSB)', 'नीम की खली 500 kg/हेक्टेयर']
        },
        recommendations: [
            'Maintain organic matter levels',
            'Crop rotation for nutrient management',
            'Balanced fertilization',
            'Regular soil testing'
        ],
        cautions: [
            'Monitor pH levels regularly',
            'Prevent soil compaction'
        ]
    },
    black: {
        type: 'Black Soil / काली मिट्टी',
        characteristics: ['High clay content', 'Self-plowing', 'Rich in iron', 'High water retention'],
        pH: '7.5-8.5',
        waterRetention: 'Very High',
        drainage: 'Poor',
        fertility: 'Very High',
        suitableCrops: ['Cotton', 'Sugarcane', 'Wheat', 'Jowar', 'Tur'],
        fertilizers: {
            nitrogen: 'High (140-180 kg/ha)',
            phosphorus: 'Very High (80-100 kg/ha)',
            potassium: 'Low (30-50 kg/ha)',
            organic: ['Well-rotted manure', 'Gypsum', 'Sulphur']
        },
        recommendations: [
            'Deep summer plowing',
            'Drainage management critical',
            'Use of gypsum for better tilth',
            'Avoid working when wet'
        ],
        cautions: [
            'Becomes sticky when wet',
            'Hard when dry',
            'May have drainage issues'
        ]
    },
    red: {
        type: 'Red Soil / लाल मिट्टी',
        characteristics: ['Iron-rich', 'Well-drained', 'Acidic nature', 'Low fertility'],
        pH: '5.5-6.5',
        waterRetention: 'Moderate',
        drainage: 'Good',
        fertility: 'Moderate',
        suitableCrops: ['Rice', 'Millets', 'Groundnut', 'Cotton', 'Pulses'],
        fertilizers: {
            nitrogen: 'High (160-200 kg/ha)',
            phosphorus: 'High (70-90 kg/ha)',
            potassium: 'High (80-120 kg/ha)',
            organic: ['Lime', 'Organic manure', 'Green manure']
        },
        recommendations: [
            'Liming to reduce acidity',
            'Regular organic matter addition',
            'Micronutrient supplementation',
            'Terracing on slopes'
        ],
        cautions: [
            'Prone to erosion',
            'Low in lime and magnesia',
            'May need pH correction'
        ]
    },
    alluvial: {
        type: 'Alluvial Soil / जलोढ़ मिट्टी',
        characteristics: ['River-deposited', 'Variable texture', 'High fertility', 'Well-balanced nutrients'],
        pH: '6.5-7.5',
        waterRetention: 'Good',
        drainage: 'Good',
        fertility: 'Very High',
        suitableCrops: ['Rice', 'Wheat', 'Sugarcane', 'Maize', 'Pulses'],
        fertilizers: {
            nitrogen: 'Moderate (120-160 kg/ha)',
            phosphorus: 'Moderate (50-70 kg/ha)',
            potassium: 'Moderate (60-80 kg/ha)',
            organic: ['Farmyard manure', 'Compost', 'Bio-fertilizers']
        },
        recommendations: [
            'Balanced fertilization',
            'Good irrigation management',
            'Crop diversification',
            'Soil health monitoring'
        ],
        cautions: [
            'May vary in different areas',
            'Monitor salinity in coastal areas'
        ]
    },
    laterite: {
        type: 'Laterite Soil / लैटेराइट मिट्टी',
        characteristics: ['High iron and aluminum content', 'Low fertility', 'Acidic nature', 'Good drainage'],
        pH: '5.0-6.0',
        waterRetention: 'Low',
        drainage: 'Excellent',
        fertility: 'Low',
        suitableCrops: ['Cashew', 'Coconut', 'Tea', 'Coffee', 'Rubber'],
        fertilizers: {
            nitrogen: 'Very High (200-250 kg/ha)',
            phosphorus: 'Very High (100-120 kg/ha)',
            potassium: 'High (100-150 kg/ha)',
            organic: ['Heavy organic manure', 'Lime', 'Rock phosphate']
        },
        recommendations: [
            'Heavy liming required',
            'Continuous organic matter addition',
            'Use of cover crops',
            'Micronutrient management'
        ],
        cautions: [
            'Very acidic nature',
            'Low nutrient holding capacity',
            'Requires intensive management'
        ]
    },
    saline: {
        type: 'Saline Soil / लवणीय मिट्टी',
        characteristics: ['High salt content', 'Poor plant growth', 'White salt crust', 'Alkaline reaction'],
        pH: '8.0-10.0',
        waterRetention: 'Variable',
        drainage: 'Poor to moderate',
        fertility: 'Very Low',
        suitableCrops: ['Salt-tolerant varieties', 'Barley', 'Date palm', 'Tamarix'],
        fertilizers: {
            nitrogen: 'Moderate (100-120 kg/ha)',
            phosphorus: 'Moderate (40-60 kg/ha)',
            potassium: 'Low (30-40 kg/ha)',
            organic: ['Gypsum', 'Sulphur', 'Organic acids']
        },
        recommendations: [
            'Install proper drainage system',
            'Leach salts with good quality water',
            'Apply gypsum for reclamation',
            'Use salt-tolerant crops'
        ],
        cautions: [
            'High salinity affects crop growth',
            'Requires soil reclamation',
            'Poor water infiltration'
        ]
    },
    alkaline: {
        type: 'Alkaline Soil / क्षारीय मिट्टी',
        characteristics: ['High pH', 'Poor structure', 'Sodium accumulation', 'Crusting tendency'],
        pH: '8.5-10.5',
        waterRetention: 'High',
        drainage: 'Very Poor',
        fertility: 'Low',
        suitableCrops: ['Alkali-tolerant varieties', 'Dhaincha', 'Lentil', 'Mustard'],
        fertilizers: {
            nitrogen: 'Moderate (120-150 kg/ha)',
            phosphorus: 'High (80-100 kg/ha)',
            potassium: 'Low (40-50 kg/ha)',
            organic: ['Gypsum', 'Acid forming fertilizers', 'Iron pyrites']
        },
        recommendations: [
            'Apply gypsum for sodium replacement',
            'Improve drainage system',
            'Use acid-forming fertilizers',
            'Grow alkali-tolerant crops'
        ],
        cautions: [
            'Very high pH restricts nutrient availability',
            'Poor physical properties',
            'Requires chemical reclamation'
        ]
    },
    acidic: {
        type: 'Acidic Soil / अम्लीय मिट्टी',
        characteristics: ['Low pH', 'High aluminum', 'Nutrient deficiency', 'Poor microbial activity'],
        pH: '4.5-5.5',
        waterRetention: 'Moderate',
        drainage: 'Good',
        fertility: 'Low to Moderate',
        suitableCrops: ['Tea', 'Coffee', 'Potato', 'Sweet potato', 'Pineapple'],
        fertilizers: {
            nitrogen: 'High (150-180 kg/ha)',
            phosphorus: 'Very High (100-120 kg/ha)',
            potassium: 'High (80-100 kg/ha)',
            organic: ['Lime', 'Dolomite', 'Wood ash', 'Organic matter']
        },
        recommendations: [
            'Apply lime to raise pH',
            'Use phosphorus-rich fertilizers',
            'Add organic matter regularly',
            'Monitor aluminum toxicity'
        ],
        cautions: [
            'Aluminum toxicity risk',
            'Poor nutrient availability',
            'May need frequent liming'
        ]
    },
    organic: {
        type: 'Organic Soil / जैविक मिट्टी',
        characteristics: ['High organic matter', 'Dark color', 'Spongy texture', 'High water retention'],
        pH: '5.5-7.0',
        waterRetention: 'Very High',
        drainage: 'Variable',
        fertility: 'Very High',
        suitableCrops: ['Vegetables', 'Herbs', 'Berries', 'Ornamental plants'],
        fertilizers: {
            nitrogen: 'Low (50-80 kg/ha)',
            phosphorus: 'Moderate (40-60 kg/ha)',
            potassium: 'Moderate (60-80 kg/ha)',
            organic: ['Balanced compost', 'Bone meal', 'Seaweed extract']
        },
        recommendations: [
            'Maintain organic matter levels',
            'Ensure proper aeration',
            'Balance nutrient ratios',
            'Monitor moisture levels'
        ],
        cautions: [
            'May have drainage issues',
            'Monitor for over-fertilization',
            'Maintain proper pH'
        ]
    },
    rocky: {
        type: 'Rocky Soil / पथरीली मिट्टी',
        characteristics: ['High stone content', 'Shallow depth', 'Good drainage', 'Low water retention'],
        pH: '6.0-8.0',
        waterRetention: 'Very Low',
        drainage: 'Excellent',
        fertility: 'Low',
        suitableCrops: ['Olive', 'Grapes', 'Pomegranate', 'Cactus', 'Hardy herbs'],
        fertilizers: {
            nitrogen: 'Moderate (100-130 kg/ha)',
            phosphorus: 'High (70-90 kg/ha)',
            potassium: 'Moderate (60-80 kg/ha)',
            organic: ['Deep organic matter', 'Mulching', 'Drip irrigation']
        },
        recommendations: [
            'Use terracing techniques',
            'Apply heavy mulching',
            'Install drip irrigation',
            'Choose drought-resistant varieties'
        ],
        cautions: [
            'Very low water retention',
            'Limited root depth',
            'Requires frequent irrigation'
        ]
    },
    volcanic: {
        type: 'Volcanic Soil / ज्वालामुखी मिट्टी',
        characteristics: ['Rich in minerals', 'Dark color', 'High fertility', 'Good structure'],
        pH: '6.0-7.5',
        waterRetention: 'Good',
        drainage: 'Good',
        fertility: 'Very High',
        suitableCrops: ['Coffee', 'Tea', 'Spices', 'Fruits', 'Vegetables'],
        fertilizers: {
            nitrogen: 'Moderate (80-120 kg/ha)',
            phosphorus: 'Low (30-50 kg/ha)',
            potassium: 'Low (40-60 kg/ha)',
            organic: ['Organic compost', 'Bio-fertilizers', 'Micronutrients']
        },
        recommendations: [
            'Maintain natural fertility',
            'Use minimal chemical inputs',
            'Focus on micronutrient balance',
            'Practice sustainable farming'
        ],
        cautions: [
            'Monitor for heavy metal content',
            'May have micronutrient imbalances',
            'Avoid over-fertilization'
        ]
    },
    coastal: {
        type: 'Coastal Soil / तटीय मिट्टी',
        characteristics: ['Sandy texture', 'Salt influence', 'High drainage', 'Moderate fertility'],
        pH: '7.0-8.5',
        waterRetention: 'Low to Moderate',
        drainage: 'Excellent',
        fertility: 'Moderate',
        suitableCrops: ['Coconut', 'Cashew', 'Betel nut', 'Banana', 'Mango'],
        fertilizers: {
            nitrogen: 'High (150-200 kg/ha)',
            phosphorus: 'Moderate (60-80 kg/ha)',
            potassium: 'High (100-120 kg/ha)',
            organic: ['Coconut husk', 'Seaweed extract', 'Salt-tolerant composts']
        },
        recommendations: [
            'Use salt-tolerant varieties',
            'Install windbreaks',
            'Apply organic mulching',
            'Monitor salinity levels'
        ],
        cautions: [
            'Salt spray damage risk',
            'High wind exposure',
            'Nutrient leaching issues'
        ]
    },
    mountain: {
        type: 'Mountain Soil / पहाड़ी मिट्टी',
        characteristics: ['Variable depth', 'Steep slopes', 'Good drainage', 'Cool temperatures'],
        pH: '5.5-7.0',
        waterRetention: 'Moderate',
        drainage: 'Excellent',
        fertility: 'Moderate',
        suitableCrops: ['Apple', 'Cherry', 'Potato', 'Cabbage', 'Hill millets'],
        fertilizers: {
            nitrogen: 'Moderate (100-150 kg/ha)',
            phosphorus: 'High (60-80 kg/ha)',
            potassium: 'Moderate (70-90 kg/ha)',
            organic: ['Farmyard manure', 'Compost', 'Green manure']
        },
        recommendations: [
            'Practice contour farming',
            'Use terracing methods',
            'Prevent soil erosion',
            'Choose slope-suitable crops'
        ],
        cautions: [
            'High erosion risk',
            'Temperature variations',
            'Limited mechanization'
        ]
    },
    forest: {
        type: 'Forest Soil / वन मिट्टी',
        characteristics: ['Rich organic layer', 'Acidic nature', 'High biodiversity', 'Good structure'],
        pH: '4.5-6.5',
        waterRetention: 'High',
        drainage: 'Good',
        fertility: 'High',
        suitableCrops: ['Medicinal plants', 'Shade crops', 'Mushrooms', 'Bamboo'],
        fertilizers: {
            nitrogen: 'Low (50-100 kg/ha)',
            phosphorus: 'Moderate (40-60 kg/ha)',
            potassium: 'Moderate (50-70 kg/ha)',
            organic: ['Leaf mold', 'Forest compost', 'Natural mulch']
        },
        recommendations: [
            'Maintain forest ecosystem',
            'Use minimal interventions',
            'Preserve natural biodiversity',
            'Practice sustainable harvesting'
        ],
        cautions: [
            'May be acidic',
            'Ecosystem disturbance risk',
            'Limited commercial farming'
        ]
    }
}

export function SoilGuide({ voiceEnabled, onSpeak }: SoilGuideProps) {
    const { t, language } = useLanguage()
    const [selectedSoil, setSelectedSoil] = useState('')
    const [selectedCrop, setSelectedCrop] = useState('')
    const [soilData, setSoilData] = useState({
        pH: '',
        moisture: '',
        organicMatter: '',
        nitrogen: '',
        phosphorus: '',
        potassium: ''
    })
    const [recommendations, setRecommendations] = useState<SoilData | null>(null)
    const [analysisResult, setAnalysisResult] = useState<SoilAnalysisResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [lastLanguage, setLastLanguage] = useState(language)

    // Debug helper
    const { logApiCall, logDataReload } = useLanguageDebug('SoilGuide')

    // Language-aware data fetching
    const fetchSoilDataForLanguage = useCallback(async (lang: string) => {
        if (!selectedSoil) return

        logApiCall('/api/soil', { soilType: selectedSoil, language: lang })
        handleAnalyze(lang)
    }, [selectedSoil])

    // Set up language data hook
    useLanguageData(fetchSoilDataForLanguage, {
        componentName: 'soil',
        refetchOnLanguageChange: true,
        debug: true
    })

    // Language change detection and re-fetch data
    useEffect(() => {
        // Check if language has changed
        if (language !== lastLanguage && recommendations) {
            console.log('Language changed in SoilGuide:', lastLanguage, '->', language)
            // Re-analyze with new language
            if (selectedSoil) {
                handleAnalyze(language)
            }
            setLastLanguage(language)
        }
    }, [language, lastLanguage, recommendations, selectedSoil])

    const handleAnalyze = (lang: string = language) => {
        if (!selectedSoil) return

        setLoading(true)

        // Prepare soil data for API call
        const soilInputData = {
            soilType: selectedSoil,
            crop: selectedCrop || undefined,
            pH: soilData.pH ? parseFloat(soilData.pH) : undefined,
            moisture: soilData.moisture ? parseFloat(soilData.moisture) : undefined,
            organicMatter: soilData.organicMatter ? parseFloat(soilData.organicMatter) : undefined,
            nitrogen: soilData.nitrogen ? parseFloat(soilData.nitrogen) : undefined,
            phosphorus: soilData.phosphorus ? parseFloat(soilData.phosphorus) : undefined,
            potassium: soilData.potassium ? parseFloat(soilData.potassium) : undefined
        }

        // Call soil analysis API
        const fetchSoilAnalysis = async () => {
            try {
                console.log('Analyzing soil data:', soilInputData)

                const response = await fetch('/api/soil-analysis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(soilInputData)
                })

                const result = await response.json()

                if (result.success && result.data) {
                    setAnalysisResult(result.data)

                    // Also get the existing soil database info for backward compatibility
                    const soilDatabaseInfo = getSoilDataForLanguage(selectedSoil, lang) || soilDatabase[selectedSoil]
                    setRecommendations(soilDatabaseInfo)

                    if (voiceEnabled) {
                        const summary = lang === 'hi'
                            ? `मिट्टी की स्थिति ${result.data.healthRating} है। ${result.data.recommendedCrops.slice(0, 3).join(', ')} उगाने की सिफारिश की जाती है।`
                            : `Soil health is ${result.data.healthRating}. Recommended crops: ${result.data.recommendedCrops.slice(0, 3).join(', ')}.`
                        onSpeak(summary)
                    }
                } else {
                    console.error('Soil analysis failed:', result.error)
                    // Fallback to existing behavior
                    const soilDatabaseInfo = getSoilDataForLanguage(selectedSoil, lang) || soilDatabase[selectedSoil]
                    setRecommendations(soilDatabaseInfo)
                }
            } catch (error) {
                console.error('Error analyzing soil:', error)
                // Fallback to existing behavior
                const soilDatabaseInfo = getSoilDataForLanguage(selectedSoil, lang) || soilDatabase[selectedSoil]
                setRecommendations(soilDatabaseInfo)
            } finally {
                setLoading(false)
            }
        }

        fetchSoilAnalysis()
    }

    const handleInputChange = (field: string, value: string) => {
        setSoilData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Soil Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Leaf className="w-6 h-6 text-green-600" />
                        {t('soilFertilizer')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                {t('soilType')}
                            </label>
                            <Select value={selectedSoil} onValueChange={setSelectedSoil}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectSoilType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="clay">{t('clay')}</SelectItem>
                                    <SelectItem value="sandy">{t('sandy')}</SelectItem>
                                    <SelectItem value="loamy">{t('loamy')}</SelectItem>
                                    <SelectItem value="black">{t('blackSoil')}</SelectItem>
                                    <SelectItem value="red">{t('redSoil')}</SelectItem>
                                    <SelectItem value="alluvial">{t('alluvialSoil')}</SelectItem>
                                    <SelectItem value="laterite">{t('lateriteSoil')}</SelectItem>
                                    <SelectItem value="saline">{t('salineSoil')}</SelectItem>
                                    <SelectItem value="alkaline">{t('alkalineSoil')}</SelectItem>
                                    <SelectItem value="acidic">{t('acidicSoil')}</SelectItem>
                                    <SelectItem value="organic">{t('organicSoil')}</SelectItem>
                                    <SelectItem value="rocky">{t('rockySoil')}</SelectItem>
                                    <SelectItem value="volcanic">{t('volcanicSoil')}</SelectItem>
                                    <SelectItem value="coastal">{t('coastalSoil')}</SelectItem>
                                    <SelectItem value="mountain">{t('mountainSoil')}</SelectItem>
                                    <SelectItem value="forest">{t('forestSoil')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                {t('cropSelection')} ({language === 'hi' ? 'वैकल्पिक' : 'Optional'})
                            </label>
                            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectCrop')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wheat">{t('wheat')}</SelectItem>
                                    <SelectItem value="rice">{t('rice')}</SelectItem>
                                    <SelectItem value="cotton">{t('cotton')}</SelectItem>
                                    <SelectItem value="sugarcane">{t('sugarcane')}</SelectItem>
                                    <SelectItem value="maize">{t('maize')}</SelectItem>
                                    <SelectItem value="soybean">{t('soybean')}</SelectItem>
                                    <SelectItem value="groundnut">{t('groundnut')}</SelectItem>
                                    <SelectItem value="mustard">{t('mustard')}</SelectItem>
                                    <SelectItem value="sunflower">{t('sunflower')}</SelectItem>
                                    <SelectItem value="chickpea">{t('chickpea')}</SelectItem>
                                    <SelectItem value="pigeon_pea">{t('pigeon_pea')}</SelectItem>
                                    <SelectItem value="lentil">{t('lentil')}</SelectItem>
                                    <SelectItem value="barley">{t('barley')}</SelectItem>
                                    <SelectItem value="millet">{t('millet')}</SelectItem>
                                    <SelectItem value="sorghum">{t('sorghum')}</SelectItem>
                                    <SelectItem value="onion">{t('onion')}</SelectItem>
                                    <SelectItem value="potato">{t('potato')}</SelectItem>
                                    <SelectItem value="tomato">{t('tomato')}</SelectItem>
                                    <SelectItem value="chilli">{t('chilli')}</SelectItem>
                                    <SelectItem value="turmeric">{t('turmeric')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Additional Soil Data Inputs */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                pH Level
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="14"
                                value={soilData.pH}
                                onChange={(e) => handleInputChange('pH', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="6.5"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                {t('soilMoisture')} (%)
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={soilData.moisture}
                                onChange={(e) => handleInputChange('moisture', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="45"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                {language === 'hi' ? 'जैविक पदार्थ (%)' : 'Organic Matter (%)'}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={soilData.organicMatter}
                                onChange={(e) => handleInputChange('organicMatter', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="3.5"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Nitrogen (N) (ppm)
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={soilData.nitrogen}
                                onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="120"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Phosphorus (P) (ppm)
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={soilData.phosphorus}
                                onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="45"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Potassium (K) (ppm)
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={soilData.potassium}
                                onChange={(e) => handleInputChange('potassium', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="200"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => handleAnalyze()}
                        disabled={!selectedSoil || loading}
                        className="w-full md:w-auto"
                    >
                        <Beaker className="w-4 h-4 mr-2" />
                        {loading ? t('loading') : t('getRecommendations')}
                    </Button>
                </CardContent>
            </Card>

            {/* Soil Analysis Results */}
            {analysisResult && (
                <>
                    {/* Soil Health Rating */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-green-600" />
                                {language === 'hi' ? 'मिट्टी की स्थिति' : 'Soil Health Rating'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center p-6">
                                <div className={`text-2xl font-bold px-6 py-3 rounded-full ${analysisResult.healthRating === 'Good'
                                        ? 'bg-green-100 text-green-800'
                                        : analysisResult.healthRating === 'Moderate'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                    {language === 'hi'
                                        ? analysisResult.healthRating === 'Good'
                                            ? 'अच्छी'
                                            : analysisResult.healthRating === 'Moderate'
                                                ? 'मामूली'
                                                : 'खराब'
                                        : analysisResult.healthRating}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommended Crops */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sprout className="w-5 h-5 text-green-600" />
                                {language === 'hi' ? 'अनुशंसित फसलें' : 'Recommended Crops'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.recommendedCrops.map((crop, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-sm">
                                        {crop}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fertilizer Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-purple-600" />
                                {language === 'hi' ? 'उर्वरक सुझाव' : 'Fertilizer Recommendations'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <h4 className="font-medium">{language === 'hi' ? 'रासायनिक उर्वरक' : 'Chemical Fertilizers'}:</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                            <span className="text-sm">
                                                {language === 'hi' ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'}
                                            </span>
                                            <span className="text-sm font-medium">{analysisResult.fertilizers.nitrogen}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                            <span className="text-sm">
                                                {language === 'hi' ? 'फॉस्फोरस (P)' : 'Phosphorus (P)'}
                                            </span>
                                            <span className="text-sm font-medium">{analysisResult.fertilizers.phosphorus}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                            <span className="text-sm">
                                                {language === 'hi' ? 'पोटेशियम (K)' : 'Potassium (K)'}
                                            </span>
                                            <span className="text-sm font-medium">{analysisResult.fertilizers.potassium}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium">{language === 'hi' ? 'सूक्ष्म पोषक तत्व' : 'Micronutrients'}:</h4>
                                    <div className="space-y-1">
                                        {analysisResult.fertilizers.micronutrients.map((micronutrient, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                                <Droplets className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="text-sm">{micronutrient}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Irrigation Advice */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Droplets className="w-5 h-5 text-blue-600" />
                                {language === 'hi' ? 'सिंचाई सलाह' : 'Irrigation Advice'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300">
                                {analysisResult.irrigationAdvice}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Soil Improvement Suggestions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                {language === 'hi' ? 'मिट्टी सुधार सुझाव' : 'Soil Improvement Suggestions'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {analysisResult.improvementSuggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* pH Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-600" />
                                {language === 'hi' ? 'pH प्रबंधन' : 'pH Management'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300">
                                {analysisResult.pHManagement}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Organic Matter Advice */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-green-600" />
                                {language === 'hi' ? 'जैविक पदार्थ सलाह' : 'Organic Matter Advice'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300">
                                {analysisResult.organicMatterAdvice}
                            </p>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Original Soil Database Info (Fallback) */}
            {recommendations && !analysisResult && (
                <>
                    {/* Basic Soil Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-600" />
                                {language === 'hi' ? 'मिट्टी की जानकारी' : 'Soil Information'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">{recommendations.type}</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">pH Level:</span>
                                            <Badge variant="outline">{recommendations.pH}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('soilMoisture')}:</span>
                                            <Badge variant="outline">{recommendations.waterRetention}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Drainage:</span>
                                            <Badge variant="outline">{recommendations.drainage}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'hi' ? 'उर्वरता' : 'Fertility'}:</span>
                                            <Badge variant="secondary">{recommendations.fertility}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">{language === 'hi' ? 'विशेषताएं' : 'Characteristics'}:</h4>
                                    <ul className="space-y-1">
                                        {recommendations.characteristics.map((char, idx) => (
                                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                                                {char}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Suitable Crops */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sprout className="w-5 h-5 text-green-600" />
                                {language === 'hi' ? 'उपयुक्त फसलें' : 'Suitable Crops'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {recommendations.suitableCrops.map((crop, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-sm">
                                        {crop}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fertilizer Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-purple-600" />
                                {language === 'hi' ? 'उर्वरक सुझाव' : 'Fertilizer Recommendations'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <h4 className="font-medium">{language === 'hi' ? 'रासायनिक उर्वरक' : 'Chemical Fertilizers'}:</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                            <span className="text-sm">
                                                {language === 'hi' ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'}
                                            </span>
                                            <span className="text-sm font-medium">{recommendations.fertilizers.nitrogen}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                            <span className="text-sm">
                                                {language === 'hi' ? 'फॉस्फोरस (P)' : 'Phosphorus (P)'}
                                            </span>
                                            <span className="text-sm font-medium">{recommendations.fertilizers.phosphorus}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                            <span className="text-sm">
                                                {language === 'hi' ? 'पोटेशियम (K)' : 'Potassium (K)'}
                                            </span>
                                            <span className="text-sm font-medium">{recommendations.fertilizers.potassium}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium">{language === 'hi' ? 'जैविक उर्वरक' : 'Organic Fertilizers'}:</h4>
                                    <div className="space-y-1">
                                        {recommendations.fertilizers.organic.map((organic, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                                <Droplets className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="text-sm">{organic}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations and Cautions */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    {language === 'hi' ? 'सुझाव' : 'Recommendations'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {recommendations.recommendations.map((rec, idx) => (
                                        <Alert key={idx} className="border-green-200 bg-green-50 dark:bg-green-900/20">
                                            <CheckCircle className="w-4 h-4" />
                                            <AlertDescription className="text-sm">
                                                {rec}
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    {language === 'hi' ? 'सावधानियां' : 'Cautions'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {recommendations.cautions.map((caution, idx) => (
                                        <Alert key={idx} className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                                            <AlertCircle className="w-4 h-4" />
                                            <AlertDescription className="text-sm">
                                                {caution}
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}