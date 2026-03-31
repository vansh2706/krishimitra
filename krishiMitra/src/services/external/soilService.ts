// Soil Analysis Service for KrishiMitra
// Provides soil health analysis and recommendations

// Types for soil data
export interface SoilDataInput {
    location?: {
        lat: number;
        lon: number;
    };
    soilType?: string;
    pH?: number;
    moisture?: number;
    organicMatter?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    crop?: string;
}

export interface SoilAnalysisResult {
    success: boolean;
    data?: {
        healthRating: 'Good' | 'Moderate' | 'Poor';
        recommendedCrops: string[];
        fertilizers: {
            nitrogen: string;
            phosphorus: string;
            potassium: string;
            micronutrients: string[];
        };
        irrigationAdvice: string;
        improvementSuggestions: string[];
        pHManagement: string;
        organicMatterAdvice: string;
    };
    error?: string;
}

/**
 * Analyze soil data and provide recommendations
 * @param soilData - Soil data input
 * @returns Promise with soil analysis results
 */
export async function analyzeSoil(soilData: SoilDataInput): Promise<SoilAnalysisResult> {
    try {
        // In a real implementation, this would call an external soil analysis API
        // For now, we'll generate mock data based on the input

        // Determine soil health rating based on input parameters
        let healthRating: 'Good' | 'Moderate' | 'Poor' = 'Moderate';
        let pHStatus = 'optimal';

        if (soilData.pH !== undefined) {
            if (soilData.pH >= 6.0 && soilData.pH <= 7.5) {
                pHStatus = 'optimal';
            } else if (soilData.pH >= 5.5 && soilData.pH <= 8.0) {
                pHStatus = 'acceptable';
            } else {
                pHStatus = 'problematic';
            }
        }

        // Simple health rating algorithm
        const factors = [];
        if (soilData.pH !== undefined) factors.push(pHStatus === 'optimal' ? 1 : pHStatus === 'acceptable' ? 0.5 : 0);
        if (soilData.moisture !== undefined) factors.push(soilData.moisture >= 30 && soilData.moisture <= 70 ? 1 : 0.5);
        if (soilData.organicMatter !== undefined) factors.push(soilData.organicMatter >= 2 ? 1 : soilData.organicMatter >= 1 ? 0.5 : 0);

        const avgFactor = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;

        if (avgFactor >= 0.8) {
            healthRating = 'Good';
        } else if (avgFactor >= 0.5) {
            healthRating = 'Moderate';
        } else {
            healthRating = 'Poor';
        }

        // Generate recommendations based on soil data
        const recommendedCrops = generateCropRecommendations(soilData);
        const fertilizers = generateFertilizerRecommendations(soilData);
        const irrigationAdvice = generateIrrigationAdvice(soilData);
        const improvementSuggestions = generateImprovementSuggestions(soilData);
        const pHManagement = generatePHManagementAdvice(soilData);
        const organicMatterAdvice = generateOrganicMatterAdvice(soilData);

        return {
            success: true,
            data: {
                healthRating,
                recommendedCrops,
                fertilizers,
                irrigationAdvice,
                improvementSuggestions,
                pHManagement,
                organicMatterAdvice
            }
        };
    } catch (error) {
        console.error('Error analyzing soil:', error);
        return {
            success: false,
            error: 'Failed to analyze soil data'
        };
    }
}

/**
 * Generate crop recommendations based on soil data
 */
function generateCropRecommendations(soilData: SoilDataInput): string[] {
    // In a real implementation, this would be more sophisticated
    const commonCrops = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Soybean'];

    if (soilData.soilType) {
        switch (soilData.soilType.toLowerCase()) {
            case 'clay':
                return ['Rice', 'Sugarcane', 'Cotton', 'Jute'];
            case 'sandy':
                return ['Millets', 'Groundnut', 'Watermelon', 'Carrot'];
            case 'loamy':
                return ['Wheat', 'Maize', 'Vegetables', 'Pulses'];
            case 'black':
                return ['Cotton', 'Sugarcane', 'Wheat', 'Sorghum'];
            case 'red':
                return ['Rice', 'Groundnut', 'Pulses', 'Oilseeds'];
            default:
                return commonCrops;
        }
    }

    return commonCrops;
}

/**
 * Generate fertilizer recommendations based on soil data
 */
function generateFertilizerRecommendations(soilData: SoilDataInput) {
    // Base recommendations
    const fertilizers = {
        nitrogen: 'Based on crop requirement (60-200 kg/ha)',
        phosphorus: 'Based on soil test (30-100 kg/ha)',
        potassium: 'Based on crop and soil (40-120 kg/ha)',
        micronutrients: ['Zinc sulfate (25 kg/ha)', 'Iron sulfate (10 kg/ha)', 'Boron (5 kg/ha)']
    };

    // Adjust based on available data
    if (soilData.nitrogen !== undefined) {
        if (soilData.nitrogen < 200) {
            fertilizers.nitrogen = `Low nitrogen detected. Apply additional nitrogen fertilizer. Recommended: ${200 - soilData.nitrogen} kg/ha more`;
        } else {
            fertilizers.nitrogen = 'Adequate nitrogen levels detected. Maintain current application rates.';
        }
    }

    if (soilData.phosphorus !== undefined) {
        if (soilData.phosphorus < 25) {
            fertilizers.phosphorus = `Low phosphorus detected. Apply additional phosphorus fertilizer. Recommended: ${25 - soilData.phosphorus} kg/ha more`;
        } else {
            fertilizers.phosphorus = 'Adequate phosphorus levels detected. Maintain current application rates.';
        }
    }

    if (soilData.potassium !== undefined) {
        if (soilData.potassium < 200) {
            fertilizers.potassium = `Low potassium detected. Apply additional potassium fertilizer. Recommended: ${200 - soilData.potassium} kg/ha more`;
        } else {
            fertilizers.potassium = 'Adequate potassium levels detected. Maintain current application rates.';
        }
    }

    return fertilizers;
}

/**
 * Generate irrigation advice based on soil data
 */
function generateIrrigationAdvice(soilData: SoilDataInput): string {
    if (soilData.soilType) {
        switch (soilData.soilType.toLowerCase()) {
            case 'clay':
                return 'Clay soil retains water well. Irrigate less frequently but with more water. Use drip irrigation to prevent waterlogging.';
            case 'sandy':
                return 'Sandy soil drains quickly. Irrigate more frequently with smaller amounts. Use mulching to retain moisture.';
            case 'loamy':
                return 'Loamy soil has good water retention. Maintain regular irrigation schedule. Monitor soil moisture to avoid overwatering.';
            default:
                return 'Maintain regular irrigation schedule based on crop requirements. Check soil moisture before irrigating.';
        }
    }

    if (soilData.moisture !== undefined) {
        if (soilData.moisture < 30) {
            return 'Soil moisture is low. Irrigate immediately. Consider using mulch to retain moisture.';
        } else if (soilData.moisture > 70) {
            return 'Soil moisture is high. Delay irrigation to prevent waterlogging. Improve drainage if necessary.';
        } else {
            return 'Soil moisture is optimal. Maintain current irrigation schedule.';
        }
    }

    return 'Maintain regular irrigation schedule based on crop requirements. Check soil moisture before irrigating.';
}

/**
 * Generate soil improvement suggestions
 */
function generateImprovementSuggestions(soilData: SoilDataInput): string[] {
    const suggestions: string[] = [];

    if (soilData.organicMatter !== undefined && soilData.organicMatter < 2) {
        suggestions.push('Add organic matter like compost or well-rotted manure to improve soil structure and fertility.');
    }

    if (soilData.soilType) {
        switch (soilData.soilType.toLowerCase()) {
            case 'clay':
                suggestions.push('Add sand and organic matter to improve drainage in clay soil.');
                suggestions.push('Use raised beds to prevent waterlogging.');
                break;
            case 'sandy':
                suggestions.push('Add clay and organic matter to improve water retention in sandy soil.');
                suggestions.push('Use mulching to reduce evaporation.');
                break;
            case 'black':
                suggestions.push('Ensure proper drainage to prevent waterlogging in black soil.');
                suggestions.push('Add gypsum to improve soil structure.');
                break;
        }
    }

    if (suggestions.length === 0) {
        suggestions.push('Continue current soil management practices.');
        suggestions.push('Regular soil testing is recommended to monitor nutrient levels.');
        suggestions.push('Practice crop rotation to maintain soil health.');
    }

    return suggestions;
}

/**
 * Generate pH management advice
 */
function generatePHManagementAdvice(soilData: SoilDataInput): string {
    if (soilData.pH !== undefined) {
        if (soilData.pH < 5.5) {
            return 'Soil is acidic. Apply lime to raise pH. Use dolomite for magnesium-deficient soils.';
        } else if (soilData.pH > 8.0) {
            return 'Soil is alkaline. Apply sulfur or aluminum sulfate to lower pH. Use organic matter to buffer pH.';
        } else {
            return 'Soil pH is optimal for most crops. Maintain current practices.';
        }
    }

    return 'Test soil pH regularly. Most crops prefer slightly acidic to neutral soil (pH 6.0-7.5).';
}

/**
 * Generate organic matter advice
 */
function generateOrganicMatterAdvice(soilData: SoilDataInput): string {
    if (soilData.organicMatter !== undefined) {
        if (soilData.organicMatter < 1) {
            return 'Organic matter is very low. Add compost, well-rotted manure, or green manure crops immediately.';
        } else if (soilData.organicMatter < 2) {
            return 'Organic matter is low. Regularly add compost or organic fertilizers to maintain levels.';
        } else if (soilData.organicMatter < 5) {
            return 'Organic matter is adequate. Continue current organic matter addition practices.';
        } else {
            return 'Organic matter is high. Maintain current practices but avoid over-application.';
        }
    }

    return 'Regularly add organic matter like compost or well-rotted manure to improve soil health and fertility.';
}

export default {
    analyzeSoil
};