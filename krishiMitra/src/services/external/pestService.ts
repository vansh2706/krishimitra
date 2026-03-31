// External Pest and Disease Detection Service for KrishiMitra
// Integrates with AI/ML services for crop pest and disease identification

// Types for pest/disease data
export interface PestDiseaseInfo {
    id: string;
    name: string;
    scientificName?: string;
    type: 'pest' | 'disease';
    description: string;
    symptoms: string[];
    cropsAffected: string[];
    prevention: string[];
    organicTreatment: string[];
    chemicalTreatment?: string[];
    severity: 'low' | 'moderate' | 'high' | 'severe';
    seasonality?: string;
}

export interface PestDetectionResponse {
    success: boolean;
    data?: {
        detected: boolean;
        pestDisease?: PestDiseaseInfo;
        confidence?: number;
        recommendations?: string[];
        imageUrl?: string;
        timestamp: string;
    };
    error?: string;
}

// Mock pest and disease data for development/testing
const MOCK_PEST_DISEASE_DATA: PestDiseaseInfo[] = [
    {
        id: 'pd001',
        name: 'Aphids',
        scientificName: 'Aphidoidea',
        type: 'pest',
        description: 'Small sap-sucking insects that can cause leaves to yellow and stunt plant growth.',
        symptoms: [
            'Curling or yellowing leaves',
            'Sticky residue on leaves (honeydew)',
            'Black sooty mold growth',
            'Stunted plant growth'
        ],
        cropsAffected: ['Wheat', 'Rice', 'Tomato', 'Potato', 'Onion'],
        prevention: [
            'Introduce natural predators like ladybugs',
            'Use reflective mulches',
            'Keep garden clean and weed-free',
            'Spray plants with strong water jets'
        ],
        organicTreatment: [
            'Neem oil spray',
            'Insecticidal soap',
            'Diatomaceous earth',
            'Companion planting with marigolds'
        ],
        chemicalTreatment: [
            'Imidacloprid-based insecticides',
            'Pyrethroid sprays'
        ],
        severity: 'moderate',
        seasonality: 'Spring and early summer'
    },
    {
        id: 'pd002',
        name: 'Bollworm',
        scientificName: 'Helicoverpa armigera',
        type: 'pest',
        description: 'Caterpillars that bore into fruits and buds, causing significant crop damage.',
        symptoms: [
            'Holes in fruits and buds',
            'Frass (insect droppings) around entry holes',
            'Wilting of affected plant parts',
            'Visible caterpillars on plants'
        ],
        cropsAffected: ['Cotton', 'Tomato', 'Chilli', 'Maize'],
        prevention: [
            'Crop rotation',
            'Use of pheromone traps',
            'Regular field monitoring',
            'Removal of plant debris'
        ],
        organicTreatment: [
            'Bacillus thuringiensis (Bt) spray',
            'Neem-based formulations',
            'Handpicking of larvae',
            'Beneficial insect release'
        ],
        chemicalTreatment: [
            'Spinosad-based insecticides',
            'Synthetic pyrethroids'
        ],
        severity: 'high',
        seasonality: 'Monsoon season'
    },
    {
        id: 'pd003',
        name: 'Rice Blast',
        scientificName: 'Magnaporthe oryzae',
        type: 'disease',
        description: 'Fungal disease causing lesions on leaves, necks, and panicles of rice plants.',
        symptoms: [
            'Diamond-shaped lesions on leaves',
            'Gray-green spots that turn white or gray',
            'Dark lesions on rice necks',
            'Empty or partially filled grains'
        ],
        cropsAffected: ['Rice'],
        prevention: [
            'Use resistant varieties',
            'Proper water management',
            'Balanced fertilization',
            'Crop rotation'
        ],
        organicTreatment: [
            'Trichoderma-based biocontrol agents',
            'Neem cake application',
            'Proper field sanitation',
            'Silicon supplementation'
        ],
        chemicalTreatment: [
            'Triazole fungicides',
            'Strobilurin fungicides'
        ],
        severity: 'severe',
        seasonality: 'Humid conditions during monsoon'
    },
    {
        id: 'pd004',
        name: 'Powdery Mildew',
        scientificName: 'Erysiphe cichoracearum',
        type: 'disease',
        description: 'Fungal disease appearing as white powdery spots on leaves and stems.',
        symptoms: [
            'White powdery coating on leaves',
            'Yellowing and browning of leaves',
            'Stunted growth',
            'Premature leaf drop'
        ],
        cropsAffected: ['Wheat', 'Tomato', 'Chilli', 'Onion', 'Cucumber'],
        prevention: [
            'Ensure good air circulation',
            'Avoid overhead watering',
            'Space plants properly',
            'Remove infected plant parts'
        ],
        organicTreatment: [
            'Baking soda spray (1 tsp per liter water)',
            'Milk spray (1:10 ratio)',
            'Neem oil application',
            'Sulfur dusting'
        ],
        chemicalTreatment: [
            'Potassium bicarbonate sprays',
            'Systemic fungicides'
        ],
        severity: 'moderate',
        seasonality: 'Cool, dry days with humid nights'
    },
    {
        id: 'pd005',
        name: 'Fall Armyworm',
        scientificName: 'Spodoptera frugiperda',
        type: 'pest',
        description: 'Caterpillars that feed on leaves, stems, and reproductive parts of plants.',
        symptoms: [
            'Windowing on leaves (feeding between veins)',
            'Large irregular holes in leaves',
            'Frass on leaves and in whorls',
            'Severed leaves and stems'
        ],
        cropsAffected: ['Maize', 'Sugarcane', 'Rice', 'Wheat'],
        prevention: [
            'Early planting',
            'Use of resistant varieties',
            'Regular field scouting',
            'Weed control'
        ],
        organicTreatment: [
            'Bacillus thuringiensis (Bt) applications',
            'Beneficial predator conservation',
            'Manual removal of egg masses',
            'Kaolin clay barriers'
        ],
        chemicalTreatment: [
            'Chlorantraniliprole',
            'Emamectin benzoate'
        ],
        severity: 'severe',
        seasonality: 'Warm, humid conditions'
    },
    {
        id: 'pd006',
        name: 'Fusarium Wilt',
        scientificName: 'Fusarium oxysporum',
        type: 'disease',
        description: 'Soil-borne fungal disease causing yellowing and wilting of plants.',
        symptoms: [
            'Yellowing of lower leaves',
            'Wilting during hot periods',
            'Brown discoloration in vascular tissue',
            'Stunted growth'
        ],
        cropsAffected: ['Banana', 'Tomato', 'Chilli', 'Cotton'],
        prevention: [
            'Use of disease-free planting material',
            'Crop rotation',
            'Soil solarization',
            'Balanced fertilization'
        ],
        organicTreatment: [
            'Trichoderma soil application',
            'Compost teas',
            'Biochar amendments',
            'Organic soil conditioners'
        ],
        chemicalTreatment: [
            'Carbendazim-based fungicides',
            'Metalaxyl + mancozeb combinations'
        ],
        severity: 'high',
        seasonality: 'Warm, moist soil conditions'
    }
];

// Service functions

/**
 * Detect pest or disease from image using AI/ML services
 * In a real implementation, this would connect to computer vision APIs
 * @param imageData - Base64 encoded image data
 * @param cropType - Type of crop being analyzed
 * @returns Promise with detection results
 */
export async function detectPestDisease(
    imageData: string,
    cropType?: string
): Promise<PestDetectionResponse> {
    try {
        // TODO: Replace with actual AI/ML pest detection API integration
        // Example API endpoint: POST /api/pest-detection
        // Requires API key registration with agricultural AI service providers
        
        // For now, simulate detection with mock data
        // In a real implementation, this would analyze the image
        const detected = Math.random() > 0.7; // 30% chance of detection

        if (detected) {
            // Select a random pest/disease from mock data
            const randomIndex = Math.floor(Math.random() * MOCK_PEST_DISEASE_DATA.length);
            const detectedPest = MOCK_PEST_DISEASE_DATA[randomIndex];

            // Generate confidence score
            const confidence = 70 + Math.random() * 25; // 70-95% confidence

            // Generate recommendations based on severity
            const recommendations = [
                `Immediate action recommended for ${detectedPest.name}`,
                `Apply ${detectedPest.organicTreatment[0]} as first treatment`,
                `Monitor field daily for spread`,
                `Consult local agricultural officer if symptoms worsen`
            ];

            return {
                success: true,
                data: {
                    detected: true,
                    pestDisease: detectedPest,
                    confidence: parseFloat(confidence.toFixed(1)),
                    recommendations,
                    imageUrl: `data:image/jpeg;base64,${imageData.substring(0, 50)}...`,
                    timestamp: new Date().toISOString()
                }
            };
        } else {
            return {
                success: true,
                data: {
                    detected: false,
                    recommendations: [
                        'No pests or diseases detected in the image',
                        'Continue regular monitoring of crops',
                        'Maintain good agricultural practices'
                    ],
                    timestamp: new Date().toISOString()
                }
            };
        }
    } catch (error) {
        console.error('Error detecting pest/disease:', error);
        return {
            success: false,
            error: 'Failed to analyze image for pests or diseases'
        };
    }
}

/**
 * Get information about a specific pest or disease
 * @param pestId - ID of the pest or disease
 * @returns Promise with pest/disease information
 */
export async function getPestDiseaseInfo(pestId: string): Promise<PestDetectionResponse> {
    try {
        const pestInfo = MOCK_PEST_DISEASE_DATA.find(item => item.id === pestId);

        if (pestInfo) {
            return {
                success: true,
                data: {
                    detected: true,
                    pestDisease: pestInfo,
                    confidence: 100,
                    recommendations: [
                        `Identified: ${pestInfo.name}`,
                        `Type: ${pestInfo.type}`,
                        `Severity: ${pestInfo.severity}`,
                        `Apply appropriate ${pestInfo.type} control measures`
                    ],
                    timestamp: new Date().toISOString()
                }
            };
        } else {
            return {
                success: false,
                error: 'Pest or disease not found'
            };
        }
    } catch (error) {
        console.error('Error fetching pest/disease info:', error);
        return {
            success: false,
            error: 'Failed to fetch pest or disease information'
        };
    }
}

/**
 * Get preventive measures for a specific crop
 * @param cropType - Type of crop
 * @returns Promise with preventive measures
 */
export async function getCropPreventionInfo(cropType: string): Promise<{
    success: boolean;
    data?: {
        crop: string;
        commonPests: PestDiseaseInfo[];
        preventionTips: string[];
        seasonalAlerts: string[]
    };
    error?: string
}> {
    try {
        // Filter pests/diseases that affect this crop
        const cropPests = MOCK_PEST_DISEASE_DATA.filter(item =>
            item.cropsAffected.some(crop =>
                crop.toLowerCase().includes(cropType.toLowerCase())
            )
        );

        // Get unique prevention methods
        const allPrevention: string[] = [];
        cropPests.forEach(pest => {
            allPrevention.push(...pest.prevention);
        });

        // Use a manual approach to get unique values instead of Set
        const uniquePrevention: string[] = [];
        allPrevention.forEach(item => {
            if (!uniquePrevention.includes(item)) {
                uniquePrevention.push(item);
            }
        });

        // Seasonal alerts based on common pests
        const seasonalAlerts = [
            'Monitor for aphids in spring',
            'Check for bollworm during flowering stage',
            'Watch for fungal diseases during monsoon',
            'Implement rodent control before harvest'
        ];

        return {
            success: true,
            data: {
                crop: cropType,
                commonPests: cropPests,
                preventionTips: uniquePrevention,
                seasonalAlerts
            }
        };
    } catch (error) {
        console.error('Error fetching crop prevention info:', error);
        return {
            success: false,
            error: 'Failed to fetch crop prevention information'
        };
    }
}

/**
 * Get predictive alerts based on weather and crop conditions
 * @param cropType - Type of crop
 * @param weatherConditions - Current weather conditions
 * @param location - Location information
 * @returns Promise with predictive alerts
 */
export async function getPredictiveAlerts(
    cropType: string,
    weatherConditions: any,
    location: string
): Promise<{
    success: boolean;
    data?: {
        alerts: {
            pestDisease: string;
            risk: 'low' | 'moderate' | 'high' | 'severe';
            description: string;
            recommendedActions: string[]
        }[]
    };
    error?: string
}> {
    try {
        // In a real implementation, this would use ML models with weather data
        // For now, generate mock alerts based on conditions

        const alerts = [];

        // Temperature-based alerts
        if (weatherConditions.temp > 30) {
            alerts.push({
                pestDisease: 'Aphids',
                risk: 'high' as 'low' | 'moderate' | 'high' | 'severe',
                description: 'High temperatures favor aphid population growth',
                recommendedActions: [
                    'Inspect crops daily for aphid colonies',
                    'Release ladybugs or other natural predators',
                    'Apply neem oil spray in the evening'
                ]
            });
        }

        // Humidity-based alerts
        if (weatherConditions.humidity > 80) {
            alerts.push({
                pestDisease: 'Fungal Diseases',
                risk: 'high' as 'low' | 'moderate' | 'high' | 'severe',
                description: 'High humidity increases risk of fungal infections',
                recommendedActions: [
                    'Improve air circulation around plants',
                    'Avoid overhead watering',
                    'Apply preventive fungicide if needed'
                ]
            });
        }

        // Rain-based alerts
        if (weatherConditions.precipitation > 10) {
            alerts.push({
                pestDisease: 'Bacterial Infections',
                risk: 'moderate' as 'low' | 'moderate' | 'high' | 'severe',
                description: 'Heavy rainfall can spread bacterial pathogens',
                recommendedActions: [
                    'Check for waterlogged areas in field',
                    'Remove affected plant parts immediately',
                    'Apply copper-based bactericides'
                ]
            });
        }

        return {
            success: true,
            data: { alerts }
        };
    } catch (error) {
        console.error('Error generating predictive alerts:', error);
        return {
            success: false,
            error: 'Failed to generate predictive alerts'
        };
    }
}

export default {
    detectPestDisease,
    getPestDiseaseInfo,
    getCropPreventionInfo,
    getPredictiveAlerts
};