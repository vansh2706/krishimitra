// Predictive Analytics Service for KrishiMitra
// Provides AI-powered crop yield prediction, pest/disease outbreak forecasting, and smart irrigation scheduling
// Enhanced with more sophisticated algorithms for better accuracy and real-world applicability

// Types for predictive analytics data
export interface YieldPredictionInput {
    crop: string;
    location: {
        lat: number;
        lon: number;
    };
    area: number; // in hectares
    plantingDate: string; // ISO date string
    soilType?: string;
    weatherHistory?: WeatherHistoryData[];
    soilData?: SoilDataInput;
}

export interface WeatherHistoryData {
    date: string; // ISO date string
    temperature: {
        min: number;
        max: number;
        avg: number;
    };
    rainfall: number; // in mm
    humidity: number; // percentage
    windSpeed: number; // km/h
}

export interface SoilDataInput {
    pH: number;
    moisture: number; // percentage
    organicMatter: number; // percentage
    nitrogen: number; // ppm
    phosphorus: number; // ppm
    potassium: number; // ppm
}

export interface YieldPredictionResult {
    success: boolean;
    data?: {
        predictedYield: number; // in kg
        yieldRange: {
            min: number;
            max: number;
        };
        confidence: number; // 0-100%
        factors: YieldFactor[];
        recommendations: string[];
    };
    error?: string;
}

export interface YieldFactor {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number; // 0-1
    description: string;
}

export interface PestOutbreakPredictionInput {
    crop: string;
    location: {
        lat: number;
        lon: number;
    };
    plantingDate: string; // ISO date string
    weatherForecast?: WeatherForecastData[];
    pestHistory?: PestHistoryData[];
    soilData?: SoilDataInput;
}

export interface WeatherForecastData {
    date: string; // ISO date string
    temperature: {
        min: number;
        max: number;
        avg: number;
    };
    rainfall: number; // in mm
    humidity: number; // percentage
    windSpeed: number; // km/h
}

export interface PestHistoryData {
    pest: string;
    date: string; // ISO date string
    severity: 'low' | 'moderate' | 'high' | 'severe';
}

export interface PestOutbreakPredictionResult {
    success: boolean;
    data?: {
        predictions: PestOutbreakPrediction[];
        riskLevel: 'low' | 'moderate' | 'high' | 'severe';
        recommendations: string[];
        monitoringSchedule: string[];
    };
    error?: string;
}

export interface PestOutbreakPrediction {
    pest: string;
    date: string; // ISO date string
    probability: number; // 0-100%
    severity: 'low' | 'moderate' | 'high' | 'severe';
    factors: PestFactor[];
}

export interface PestFactor {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number; // 0-1
    description: string;
}

export interface IrrigationScheduleInput {
    crop: string;
    location: {
        lat: number;
        lon: number;
    };
    soilType?: string;
    plantingDate: string; // ISO date string
    weatherForecast?: WeatherForecastData[];
    soilData?: SoilDataInput;
}

export interface IrrigationScheduleResult {
    success: boolean;
    data?: {
        schedule: IrrigationEvent[];
        waterRequirement: number; // in liters
        efficiency: number; // 0-100%
        recommendations: string[];
    };
    error?: string;
}

export interface IrrigationEvent {
    date: string; // ISO date string
    startTime: string; // HH:MM
    duration: number; // in minutes
    waterAmount: number; // in liters
    method: 'drip' | 'sprinkler' | 'flood' | 'furrow';
    priority: 'high' | 'medium' | 'low';
}

/**
 * Predict crop yield based on various factors using enhanced algorithms
 * @param input - Yield prediction input data
 * @returns Promise with yield prediction results
 */
export async function predictCropYield(input: YieldPredictionInput): Promise<YieldPredictionResult> {
    try {
        // Calculate base yield based on crop type and growth stage
        const baseYield = getCropBaseYield(input.crop);

        // Adjust based on growth stage (assuming planting date is known)
        const plantingDate = new Date(input.plantingDate);
        const currentDate = new Date();
        const daysSincePlanting = Math.floor((currentDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));

        // Growth stage factor (simplified model)
        let growthStageFactor = 1.0;
        if (daysSincePlanting < 30) {
            growthStageFactor = 0.3; // Early stage
        } else if (daysSincePlanting < 60) {
            growthStageFactor = 0.6; // Vegetative stage
        } else if (daysSincePlanting < 90) {
            growthStageFactor = 0.9; // Reproductive stage
        } else {
            growthStageFactor = 1.0; // Maturity stage
        }

        // Adjust based on multiple factors with weighted scoring
        const factors: YieldFactor[] = [];
        let yieldAdjustment = 1.0;

        // Weather factors with more sophisticated analysis
        if (input.weatherHistory && input.weatherHistory.length > 0) {
            // Temperature analysis
            const avgTemp = input.weatherHistory.reduce((sum, day) => sum + day.temperature.avg, 0) / input.weatherHistory.length;
            const tempVariance = calculateVariance(input.weatherHistory.map(day => day.temperature.avg));

            if (avgTemp >= 20 && avgTemp <= 35) {
                factors.push({
                    name: 'Optimal Temperature',
                    impact: 'positive',
                    weight: 0.25,
                    description: 'Temperature within optimal range for crop growth'
                });
                yieldAdjustment *= 1.15; // Increased positive impact
            } else if (avgTemp < 15 || avgTemp > 40) {
                factors.push({
                    name: 'Extreme Temperature',
                    impact: 'negative',
                    weight: 0.3, // Increased negative impact
                    description: 'Temperature outside optimal range may reduce yield'
                });
                yieldAdjustment *= 0.7; // Increased negative impact
            }

            // Temperature stability factor
            if (tempVariance < 5) {
                factors.push({
                    name: 'Stable Temperature',
                    impact: 'positive',
                    weight: 0.15,
                    description: 'Consistent temperatures promote healthy growth'
                });
                yieldAdjustment *= 1.08;
            }

            // Rainfall analysis
            const totalRainfall = input.weatherHistory.reduce((sum, day) => sum + day.rainfall, 0);
            const rainDistribution = analyzeRainDistribution(input.weatherHistory);

            if (totalRainfall >= 500 && totalRainfall <= 1500) {
                factors.push({
                    name: 'Adequate Rainfall',
                    impact: 'positive',
                    weight: 0.25, // Increased weight
                    description: 'Rainfall within optimal range for crop growth'
                });
                yieldAdjustment *= 1.12;

                // Even distribution bonus
                if (rainDistribution.even) {
                    factors.push({
                        name: 'Even Rainfall Distribution',
                        impact: 'positive',
                        weight: 0.1,
                        description: 'Well-distributed rainfall throughout the season'
                    });
                    yieldAdjustment *= 1.05;
                }
            } else if (totalRainfall < 300) {
                factors.push({
                    name: 'Insufficient Rainfall',
                    impact: 'negative',
                    weight: 0.3,
                    description: 'Insufficient rainfall may reduce yield'
                });
                yieldAdjustment *= 0.65;
            } else if (totalRainfall > 2000) {
                factors.push({
                    name: 'Excessive Rainfall',
                    impact: 'negative',
                    weight: 0.25,
                    description: 'Excessive rainfall may cause waterlogging'
                });
                yieldAdjustment *= 0.75;

                // Flooding risk
                if (rainDistribution.heavyPeriods > 3) {
                    factors.push({
                        name: 'Flooding Risk',
                        impact: 'negative',
                        weight: 0.15,
                        description: 'Multiple heavy rainfall periods increase flooding risk'
                    });
                    yieldAdjustment *= 0.9;
                }
            }

            // Humidity analysis
            const avgHumidity = input.weatherHistory.reduce((sum, day) => sum + day.humidity, 0) / input.weatherHistory.length;
            if (avgHumidity >= 40 && avgHumidity <= 70) {
                factors.push({
                    name: 'Optimal Humidity',
                    impact: 'positive',
                    weight: 0.1,
                    description: 'Humidity levels support healthy plant transpiration'
                });
                yieldAdjustment *= 1.05;
            } else if (avgHumidity > 80) {
                factors.push({
                    name: 'High Humidity',
                    impact: 'negative',
                    weight: 0.1,
                    description: 'High humidity may increase disease pressure'
                });
                yieldAdjustment *= 0.95;
            }
        }

        // Soil factors with more detailed analysis
        if (input.soilData) {
            // pH factor
            if (input.soilData.pH >= 6.0 && input.soilData.pH <= 7.5) {
                factors.push({
                    name: 'Optimal Soil pH',
                    impact: 'positive',
                    weight: 0.2,
                    description: 'Soil pH within optimal range for nutrient uptake'
                });
                yieldAdjustment *= 1.1;
            } else if (input.soilData.pH < 5.5 || input.soilData.pH > 8.0) {
                factors.push({
                    name: 'Extreme Soil pH',
                    impact: 'negative',
                    weight: 0.2,
                    description: 'Extreme pH levels limit nutrient availability'
                });
                yieldAdjustment *= 0.8;
            }

            // Organic matter factor
            if (input.soilData.organicMatter >= 3.0) {
                factors.push({
                    name: 'High Organic Matter',
                    impact: 'positive',
                    weight: 0.15,
                    description: 'High organic matter improves soil fertility and water retention'
                });
                yieldAdjustment *= 1.08;
            } else if (input.soilData.organicMatter >= 2.0) {
                factors.push({
                    name: 'Adequate Organic Matter',
                    impact: 'positive',
                    weight: 0.1,
                    description: 'Adequate organic matter supports soil health'
                });
                yieldAdjustment *= 1.04;
            } else {
                factors.push({
                    name: 'Low Organic Matter',
                    impact: 'negative',
                    weight: 0.1,
                    description: 'Low organic matter reduces soil fertility'
                });
                yieldAdjustment *= 0.92;
            }

            // Soil moisture factor
            if (input.soilData.moisture >= 30 && input.soilData.moisture <= 70) {
                factors.push({
                    name: 'Optimal Soil Moisture',
                    impact: 'positive',
                    weight: 0.15,
                    description: 'Soil moisture within optimal range'
                });
                yieldAdjustment *= 1.08;
            } else if (input.soilData.moisture < 20) {
                factors.push({
                    name: 'Dry Soil Conditions',
                    impact: 'negative',
                    weight: 0.15,
                    description: 'Insufficient soil moisture limits plant growth'
                });
                yieldAdjustment *= 0.85;
            } else if (input.soilData.moisture > 80) {
                factors.push({
                    name: 'Waterlogged Soil',
                    impact: 'negative',
                    weight: 0.1,
                    description: 'Excessive soil moisture may cause root problems'
                });
                yieldAdjustment *= 0.9;
            }

            // Nutrient balance factor
            const nutrientBalance = calculateNutrientBalance(input.soilData);
            if (nutrientBalance >= 0.8) {
                factors.push({
                    name: 'Balanced Nutrition',
                    impact: 'positive',
                    weight: 0.2,
                    description: 'Optimal nutrient levels support maximum yield'
                });
                yieldAdjustment *= 1.12;
            } else if (nutrientBalance >= 0.6) {
                factors.push({
                    name: 'Adequate Nutrition',
                    impact: 'positive',
                    weight: 0.1,
                    description: 'Sufficient nutrients for good yield'
                });
                yieldAdjustment *= 1.05;
            } else {
                factors.push({
                    name: 'Nutrient Deficiency',
                    impact: 'negative',
                    weight: 0.2,
                    description: 'Nutrient limitations may reduce yield potential'
                });
                yieldAdjustment *= 0.8;
            }
        }

        // Calculate final yield with growth stage consideration
        const predictedYield = Math.round(baseYield * input.area * yieldAdjustment * growthStageFactor);

        // Calculate confidence based on data availability and quality
        let confidence = 75; // Base confidence

        // Adjust based on data completeness
        if (input.weatherHistory && input.weatherHistory.length >= 30) {
            confidence += 10; // Good weather data
        } else if (input.weatherHistory && input.weatherHistory.length >= 15) {
            confidence += 5;
        }

        if (input.soilData) {
            confidence += 10; // Soil data adds confidence
        }

        // Adjust based on positive/negative factors
        const positiveFactors = factors.filter(f => f.impact === 'positive').length;
        const negativeFactors = factors.filter(f => f.impact === 'negative').length;
        confidence = Math.min(95, Math.max(60, confidence + (positiveFactors * 3) - (negativeFactors * 4)));

        // Generate enhanced recommendations
        const recommendations = generateEnhancedYieldRecommendations(input, factors);

        return {
            success: true,
            data: {
                predictedYield,
                yieldRange: {
                    min: Math.round(predictedYield * 0.8),
                    max: Math.round(predictedYield * 1.2)
                },
                confidence,
                factors,
                recommendations
            }
        };
    } catch (error) {
        console.error('Error predicting crop yield:', error);
        return {
            success: false,
            error: 'Failed to predict crop yield: ' + (error instanceof Error ? error.message : 'Unknown error')
        };
    }
}

/**
 * Predict pest/disease outbreaks based on environmental conditions using enhanced algorithms
 * @param input - Pest outbreak prediction input data
 * @returns Promise with pest outbreak prediction results
 */
export async function predictPestOutbreaks(input: PestOutbreakPredictionInput): Promise<PestOutbreakPredictionResult> {
    try {
        // Get common pests for the crop with their characteristics
        const commonPests = getCommonPestsDetailed(input.crop);
        const predictions: PestOutbreakPrediction[] = [];

        // Generate predictions for each pest with more sophisticated modeling
        for (const pestInfo of commonPests) {
            const { pest, optimalConditions } = pestInfo;
            const probability = calculateEnhancedPestProbability(pest, optimalConditions, input);
            const severity = probability > 85 ? 'severe' : probability > 70 ? 'high' : probability > 50 ? 'moderate' : 'low';
            const factors = generateEnhancedPestFactors(pest, optimalConditions, input);

            // Predict outbreak timing based on conditions
            const outbreakDate = predictOutbreakTiming(pest, input);

            predictions.push({
                pest,
                date: outbreakDate,
                probability,
                severity,
                factors
            });
        }

        // Calculate overall risk level
        const maxProbability = Math.max(...predictions.map(p => p.probability));
        const riskLevel = maxProbability > 85 ? 'severe' : maxProbability > 70 ? 'high' : maxProbability > 50 ? 'moderate' : 'low';

        // Generate enhanced recommendations
        const recommendations = generateEnhancedPestRecommendations(input, predictions);
        const monitoringSchedule = generateEnhancedMonitoringSchedule(predictions, input);

        return {
            success: true,
            data: {
                predictions,
                riskLevel,
                recommendations,
                monitoringSchedule
            }
        };
    } catch (error) {
        console.error('Error predicting pest outbreaks:', error);
        return {
            success: false,
            error: 'Failed to predict pest outbreaks: ' + (error instanceof Error ? error.message : 'Unknown error')
        };
    }
}

/**
 * Generate smart irrigation schedule based on crop needs, weather forecast, and soil conditions using enhanced algorithms
 * @param input - Irrigation schedule input data
 * @returns Promise with irrigation schedule results
 */
export async function generateIrrigationSchedule(input: IrrigationScheduleInput): Promise<IrrigationScheduleResult> {
    try {
        // Generate irrigation events for the next 14 days with more sophisticated scheduling
        const schedule: IrrigationEvent[] = [];
        const today = new Date();

        // Track cumulative water stress to optimize scheduling
        let cumulativeWaterStress = 0;

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Determine if irrigation is needed based on enhanced analysis
            const irrigationDecision = shouldIrrigateEnhanced(input, date, cumulativeWaterStress);

            if (irrigationDecision.needed) {
                const waterAmount = calculateEnhancedWaterAmount(input.crop, input.soilType, input.soilData, date);
                const duration = calculateEnhancedIrrigationDuration(waterAmount, input.soilType, irrigationDecision.intensity);
                const method = determineOptimalIrrigationMethod(input.soilType, input.crop, waterAmount);
                const priority = determineIrrigationPriority(waterAmount, irrigationDecision.intensity);

                // Determine optimal start time based on weather
                const startTime = determineOptimalStartTime(input, date);

                schedule.push({
                    date: date.toISOString().split('T')[0],
                    startTime,
                    duration,
                    waterAmount,
                    method,
                    priority
                });

                // Reset water stress after irrigation
                cumulativeWaterStress = 0;
            } else {
                // Accumulate water stress if no irrigation
                cumulativeWaterStress += irrigationDecision.stressContribution || 0;
            }
        }

        // Calculate total water requirement
        const waterRequirement = schedule.reduce((sum, event) => sum + event.waterAmount, 0);

        // Calculate efficiency based on method, scheduling, and water savings
        const efficiency = calculateEnhancedIrrigationEfficiency(schedule, input);

        // Generate enhanced recommendations
        const recommendations = generateEnhancedIrrigationRecommendations(input, schedule);

        return {
            success: true,
            data: {
                schedule,
                waterRequirement,
                efficiency,
                recommendations
            }
        };
    } catch (error) {
        console.error('Error generating irrigation schedule:', error);
        return {
            success: false,
            error: 'Failed to generate irrigation schedule: ' + (error instanceof Error ? error.message : 'Unknown error')
        };
    }
}

// Helper functions

function getCropBaseYield(crop: string): number {
    const baseYields: { [key: string]: number } = {
        'Wheat': 3000, // kg/hectare
        'Rice': 4000,
        'Maize': 5000,
        'Cotton': 800,
        'Sugarcane': 80000,
        'Soybean': 1500,
        'Groundnut': 2000,
        'Mustard': 1200,
        'Onion': 20000,
        'Potato': 25000,
        'Tomato': 30000,
        'Chilli': 8000
    };

    return baseYields[crop] || 3000;
}

function generateYieldRecommendations(input: YieldPredictionInput, factors: YieldFactor[]): string[] {
    const recommendations: string[] = [];

    // Add general recommendations
    recommendations.push('Monitor crop growth regularly and adjust practices as needed');
    recommendations.push('Maintain proper soil nutrition through balanced fertilization');

    // Add specific recommendations based on negative factors
    const negativeFactors = factors.filter(f => f.impact === 'negative');
    if (negativeFactors.length > 0) {
        recommendations.push('Address limiting factors to improve yield potential');
        negativeFactors.forEach(factor => {
            recommendations.push(`Improve ${factor.name.toLowerCase()} conditions: ${factor.description}`);
        });
    }

    // Add positive reinforcement
    const positiveFactors = factors.filter(f => f.impact === 'positive');
    if (positiveFactors.length > 0) {
        recommendations.push('Continue practices that contribute to positive outcomes');
    }

    return recommendations;
}

interface PestInfo {
    pest: string;
    optimalConditions: {
        temperature: { min: number; max: number };
        humidity: { min: number; max: number };
        rainfall: { min: number; max: number };
    };
}

function getCommonPests(crop: string): string[] {
    const pestMap: { [key: string]: string[] } = {
        'Wheat': ['Aphids', 'Bollworm', 'Armyworm', 'Rust'],
        'Rice': ['Brown Planthopper', 'Stem Borer', 'Rice Blast', 'Sheath Blight'],
        'Maize': ['Fall Armyworm', 'Corn Borer', 'Aphids', 'Rust'],
        'Cotton': ['Bollworm', 'Aphids', 'Whitefly', 'Thrips'],
        'Sugarcane': ['Borer', 'Aphids', 'Whitefly', 'Scale Insects'],
        'Soybean': ['Pod Borer', 'Aphids', 'Whitefly', 'Rust'],
        'Groundnut': ['Aphids', 'Whitefly', 'Rust', 'Leaf Spot'],
        'Mustard': ['Aphids', 'Diamondback Moth', 'White Rust', 'Alternaria Blight'],
        'Onion': ['Thrips', 'Aphids', 'Purple Blotch', 'Basal Rot'],
        'Potato': ['Colorado Beetle', 'Aphids', 'Late Blight', 'Early Blight'],
        'Tomato': ['Aphids', 'Whitefly', 'Blight', 'Fruit Borer'],
        'Chilli': ['Aphids', 'Thrips', 'Anthracnose', 'Fruit Rot']
    };

    return pestMap[crop] || ['General Pests'];
}

function getCommonPestsDetailed(crop: string): PestInfo[] {
    const pestDetails: { [key: string]: PestInfo[] } = {
        'Wheat': [
            {
                pest: 'Aphids',
                optimalConditions: {
                    temperature: { min: 15, max: 25 },
                    humidity: { min: 60, max: 80 },
                    rainfall: { min: 0, max: 10 }
                }
            },
            {
                pest: 'Bollworm',
                optimalConditions: {
                    temperature: { min: 20, max: 30 },
                    humidity: { min: 50, max: 70 },
                    rainfall: { min: 5, max: 20 }
                }
            },
            {
                pest: 'Armyworm',
                optimalConditions: {
                    temperature: { min: 18, max: 28 },
                    humidity: { min: 65, max: 85 },
                    rainfall: { min: 10, max: 30 }
                }
            },
            {
                pest: 'Rust',
                optimalConditions: {
                    temperature: { min: 15, max: 25 },
                    humidity: { min: 75, max: 95 },
                    rainfall: { min: 15, max: 40 }
                }
            }
        ],
        'Rice': [
            {
                pest: 'Brown Planthopper',
                optimalConditions: {
                    temperature: { min: 20, max: 32 },
                    humidity: { min: 70, max: 90 },
                    rainfall: { min: 10, max: 30 }
                }
            },
            {
                pest: 'Stem Borer',
                optimalConditions: {
                    temperature: { min: 22, max: 35 },
                    humidity: { min: 60, max: 80 },
                    rainfall: { min: 5, max: 25 }
                }
            },
            {
                pest: 'Rice Blast',
                optimalConditions: {
                    temperature: { min: 18, max: 28 },
                    humidity: { min: 80, max: 100 },
                    rainfall: { min: 20, max: 50 }
                }
            }
        ]
        // Additional crops can be added with detailed pest information
    };

    return pestDetails[crop] || [
        {
            pest: 'General Pests',
            optimalConditions: {
                temperature: { min: 15, max: 35 },
                humidity: { min: 50, max: 80 },
                rainfall: { min: 0, max: 30 }
            }
        }
    ];
}

function calculatePestProbability(pest: string, input: PestOutbreakPredictionInput): number {
    // In a real implementation, this would use ML models
    // For now, we'll use a simple heuristic based on conditions

    let probability = 30; // Base probability

    // Increase probability based on weather conditions
    if (input.weatherForecast) {
        const avgHumidity = input.weatherForecast.reduce((sum, day) => sum + day.humidity, 0) / input.weatherForecast.length;
        const avgTemp = input.weatherForecast.reduce((sum, day) => sum + day.temperature.avg, 0) / input.weatherForecast.length;

        if (avgHumidity > 70) probability += 20;
        if (avgTemp > 25 && avgTemp < 35) probability += 15;
        if (input.weatherForecast.some(day => day.rainfall > 10)) probability += 10;
    }

    // Increase probability based on pest history
    if (input.pestHistory && input.pestHistory.some(record => record.pest === pest)) {
        probability += 25;
    }

    // Adjust based on crop susceptibility
    const susceptibleCrops: { [key: string]: string[] } = {
        'Aphids': ['Wheat', 'Rice', 'Tomato', 'Potato', 'Onion'],
        'Bollworm': ['Cotton', 'Tomato', 'Chilli', 'Maize'],
        'Armyworm': ['Maize', 'Wheat', 'Rice'],
        'Rust': ['Wheat', 'Soybean', 'Groundnut', 'Mustard']
    };

    if (susceptibleCrops[pest] && susceptibleCrops[pest].includes(input.crop)) {
        probability += 20;
    }

    return Math.min(100, probability);
}

function generatePestFactors(pest: string, input: PestOutbreakPredictionInput): PestFactor[] {
    const factors: PestFactor[] = [];

    // Weather factors
    if (input.weatherForecast) {
        const avgHumidity = input.weatherForecast.reduce((sum, day) => sum + day.humidity, 0) / input.weatherForecast.length;
        const avgTemp = input.weatherForecast.reduce((sum, day) => sum + day.temperature.avg, 0) / input.weatherForecast.length;

        if (avgHumidity > 70) {
            factors.push({
                name: 'High Humidity',
                impact: 'positive',
                weight: 0.3,
                description: 'High humidity favors pest development'
            });
        }

        if (avgTemp > 25 && avgTemp < 35) {
            factors.push({
                name: 'Optimal Temperature',
                impact: 'positive',
                weight: 0.25,
                description: 'Temperature within optimal range for pest activity'
            });
        }
    }

    // History factor
    if (input.pestHistory && input.pestHistory.some(record => record.pest === pest)) {
        factors.push({
            name: 'Pest History',
            impact: 'positive',
            weight: 0.35,
            description: 'Previous pest occurrences increase likelihood of recurrence'
        });
    }

    // Crop susceptibility
    const susceptibleCrops: { [key: string]: string[] } = {
        'Aphids': ['Wheat', 'Rice', 'Tomato', 'Potato', 'Onion'],
        'Bollworm': ['Cotton', 'Tomato', 'Chilli', 'Maize']
    };

    if (susceptibleCrops[pest] && susceptibleCrops[pest].includes(input.crop)) {
        factors.push({
            name: 'Crop Susceptibility',
            impact: 'positive',
            weight: 0.2,
            description: 'Crop variety is susceptible to this pest'
        });
    }

    return factors;
}

function generatePestRecommendations(input: PestOutbreakPredictionInput, predictions: PestOutbreakPrediction[]): string[] {
    const recommendations: string[] = [];

    // General recommendations
    recommendations.push('Implement integrated pest management (IPM) practices');
    recommendations.push('Monitor crops regularly for early pest detection');
    recommendations.push('Maintain field hygiene to reduce pest habitats');

    // Specific recommendations based on high probability pests
    const highRiskPests = predictions.filter(p => p.probability > 60);
    if (highRiskPests.length > 0) {
        recommendations.push('Take preventive measures for high-risk pests:');
        highRiskPests.forEach(pest => {
            recommendations.push(`- Monitor for ${pest.pest} and apply appropriate controls if detected`);
        });
    }

    // Weather-based recommendations
    if (input.weatherForecast) {
        const highHumidityDays = input.weatherForecast.filter(day => day.humidity > 70);
        if (highHumidityDays.length > 0) {
            recommendations.push('Increase monitoring frequency during high humidity periods');
        }
    }

    return recommendations;
}

function generateMonitoringSchedule(predictions: PestOutbreakPrediction[]): string[] {
    const schedule: string[] = [];

    // Add regular monitoring
    schedule.push('Daily visual inspection of crops');
    schedule.push('Weekly pest trapping and identification');

    // Add specific monitoring based on predictions
    const highRiskPests = predictions.filter(p => p.probability > 60);
    if (highRiskPests.length > 0) {
        schedule.push('Enhanced monitoring for high-risk pests:');
        highRiskPests.forEach(pest => {
            schedule.push(`- Check for ${pest.pest} signs twice daily`);
        });
    }

    return schedule;
}

function shouldIrrigate(input: IrrigationScheduleInput, date: Date): boolean {
    // In a real implementation, this would use more sophisticated models
    // For now, we'll use a simple heuristic

    // Check if it's a regular irrigation day (every 3 days)
    const plantingDate = new Date(input.plantingDate);
    const daysSincePlanting = Math.floor((date.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSincePlanting % 3 === 0) {
        return true;
    }

    // Check weather forecast for the day
    if (input.weatherForecast) {
        const forecastForDate = input.weatherForecast.find(f => f.date === date.toISOString().split('T')[0]);
        if (forecastForDate) {
            // If no rain is expected and it's hot, irrigate
            if (forecastForDate.rainfall < 2 && forecastForDate.temperature.avg > 30) {
                return true;
            }

            // If soil is likely to be dry, irrigate
            if (forecastForDate.humidity < 40) {
                return true;
            }
        }
    }

    return false;
}

function calculateWaterAmount(crop: string, soilType?: string): number {
    const baseAmounts: { [key: string]: number } = {
        'Wheat': 800,
        'Rice': 1200,
        'Maize': 900,
        'Cotton': 700,
        'Sugarcane': 1500,
        'Soybean': 600,
        'Groundnut': 500,
        'Mustard': 400,
        'Onion': 300,
        'Potato': 600,
        'Tomato': 500,
        'Chilli': 400
    };

    let amount = baseAmounts[crop] || 600;

    // Adjust based on soil type
    if (soilType) {
        switch (soilType.toLowerCase()) {
            case 'clay':
                amount *= 0.8; // Clay retains water better
                break;
            case 'sandy':
                amount *= 1.3; // Sandy soil drains quickly
                break;
            case 'loamy':
                amount *= 1.0; // Loamy is ideal
                break;
        }
    }

    return Math.round(amount);
}

function calculateIrrigationDuration(waterAmount: number, soilType?: string): number {
    // Duration in minutes based on water amount and soil type
    let duration = waterAmount / 10; // Base calculation

    // Adjust based on soil type
    if (soilType) {
        switch (soilType.toLowerCase()) {
            case 'clay':
                duration *= 1.2; // Clay needs longer to absorb water
                break;
            case 'sandy':
                duration *= 0.8; // Sandy soil absorbs water quickly
                break;
            case 'loamy':
                duration *= 1.0; // Loamy is ideal
                break;
        }
    }

    return Math.round(duration);
}

function determineIrrigationMethod(soilType?: string): 'drip' | 'sprinkler' | 'flood' | 'furrow' {
    // In a real implementation, this would consider more factors
    // For now, we'll make simple determinations

    if (soilType) {
        switch (soilType.toLowerCase()) {
            case 'clay':
                return 'furrow'; // Better for clay soils
            case 'sandy':
                return 'drip'; // Most efficient for sandy soils
            case 'loamy':
                return 'drip'; // Most efficient overall
        }
    }

    return 'drip'; // Default to most efficient method
}

function calculateIrrigationEfficiency(schedule: IrrigationEvent[]): number {
    // Calculate efficiency based on method and scheduling
    if (schedule.length === 0) return 100;

    const methodEfficiencies: { [key: string]: number } = {
        'drip': 0.95,
        'sprinkler': 0.85,
        'flood': 0.65,
        'furrow': 0.70
    };

    const totalEfficiency = schedule.reduce((sum, event) => {
        return sum + (methodEfficiencies[event.method] || 0.8);
    }, 0);

    return Math.round((totalEfficiency / schedule.length) * 100);
}

function generateIrrigationRecommendations(input: IrrigationScheduleInput, schedule: IrrigationEvent[]): string[] {
    const recommendations: string[] = [];

    // General recommendations
    recommendations.push('Monitor soil moisture regularly to optimize irrigation timing');
    recommendations.push('Apply mulch to reduce evaporation and retain soil moisture');

    // Method-specific recommendations
    const methods: { [key: string]: boolean } = {};
    schedule.forEach(event => {
        methods[event.method] = true;
    });

    Object.keys(methods).forEach(method => {
        switch (method) {
            case 'drip':
                recommendations.push('Maintain drip system regularly to ensure uniform water distribution');
                break;
            case 'sprinkler':
                recommendations.push('Irrigate during early morning or late evening to reduce evaporation');
                break;
            case 'flood':
                recommendations.push('Ensure proper field leveling to achieve uniform water distribution');
                break;
            case 'furrow':
                recommendations.push('Monitor for waterlogging and improve drainage if necessary');
                break;
        }
    });

    // Schedule-based recommendations
    if (schedule.length > 0) {
        const totalWater = schedule.reduce((sum, event) => sum + event.waterAmount, 0);
        recommendations.push(`Total weekly water requirement: ${totalWater} liters`);

        const highPriorityEvents = schedule.filter(event => event.priority === 'high');
        if (highPriorityEvents.length > 0) {
            recommendations.push('Pay special attention to high-priority irrigation events');
        }
    }

    return recommendations;
}

// Additional helper functions for enhanced analytics

function calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    const variance = squaredDiffs.reduce((sum, num) => sum + num, 0) / numbers.length;
    return variance;
}

function analyzeRainDistribution(weatherHistory: WeatherHistoryData[]): { even: boolean; heavyPeriods: number } {
    // Simple analysis: check if rainfall is relatively evenly distributed
    // and count periods with heavy rainfall (>15mm/day)

    const totalRainfall = weatherHistory.reduce((sum, day) => sum + day.rainfall, 0);
    const averageRainfall = totalRainfall / weatherHistory.length;

    // Calculate standard deviation of rainfall
    const variance = weatherHistory.reduce((sum, day) =>
        sum + Math.pow(day.rainfall - averageRainfall, 2), 0) / weatherHistory.length;
    const stdDev = Math.sqrt(variance);

    // Consider distribution even if standard deviation is less than 50% of average
    const even = stdDev < (averageRainfall * 0.5);

    // Count heavy rainfall periods
    const heavyPeriods = weatherHistory.filter(day => day.rainfall > 15).length;

    return { even, heavyPeriods };
}

function calculateNutrientBalance(soilData: SoilDataInput): number {
    // Simplified nutrient balance calculation based on NPK ratios
    // Optimal ranges: N (100-200 ppm), P (20-50 ppm), K (100-200 ppm)

    const nRatio = Math.min(1, soilData.nitrogen / 150); // Optimal at 150ppm
    const pRatio = Math.min(1, soilData.phosphorus / 35); // Optimal at 35ppm
    const kRatio = Math.min(1, soilData.potassium / 150); // Optimal at 150ppm

    // Calculate geometric mean for overall balance
    const balance = Math.pow(nRatio * pRatio * kRatio, 1 / 3);

    return balance;
}

function generateEnhancedYieldRecommendations(input: YieldPredictionInput, factors: YieldFactor[]): string[] {
    const recommendations: string[] = [];

    // Add general recommendations
    recommendations.push('Monitor crop growth regularly and adjust practices as needed');
    recommendations.push('Maintain proper soil nutrition through balanced fertilization');

    // Add specific recommendations based on negative factors
    const negativeFactors = factors.filter(f => f.impact === 'negative');
    if (negativeFactors.length > 0) {
        recommendations.push('Address limiting factors to improve yield potential');
        negativeFactors.forEach(factor => {
            recommendations.push(`Improve ${factor.name.toLowerCase()} conditions: ${factor.description}`);
        });
    }

    // Add positive reinforcement
    const positiveFactors = factors.filter(f => f.impact === 'positive');
    if (positiveFactors.length > 0) {
        recommendations.push('Continue practices that contribute to positive outcomes');

        // Specific positive recommendations
        const optimalTemp = positiveFactors.find(f => f.name === 'Optimal Temperature');
        if (optimalTemp) {
            recommendations.push('Maintain current temperature management practices');
        }

        const adequateRain = positiveFactors.find(f => f.name === 'Adequate Rainfall');
        if (adequateRain) {
            recommendations.push('Continue monitoring rainfall patterns for irrigation planning');
        }

        const optimalPH = positiveFactors.find(f => f.name === 'Optimal Soil pH');
        if (optimalPH) {
            recommendations.push('Maintain current soil pH management through appropriate amendments');
        }
    }

    // Crop-specific recommendations
    const cropSpecific: { [key: string]: string[] } = {
        'Wheat': [
            'Ensure proper nitrogen application during tillering stage',
            'Monitor for rust diseases during flowering'
        ],
        'Rice': [
            'Maintain proper water levels during panicle initiation',
            'Apply potassium during grain filling stage'
        ],
        'Maize': [
            'Side-dress with nitrogen at knee-high stage',
            'Monitor for corn borer during tasseling'
        ]
    };

    if (cropSpecific[input.crop]) {
        recommendations.push(...cropSpecific[input.crop]);
    }

    return recommendations;
}

// Enhanced pest prediction helper functions

function calculateEnhancedPestProbability(pest: string, optimalConditions: PestInfo['optimalConditions'], input: PestOutbreakPredictionInput): number {
    let probability = 20; // Base probability

    // Weather-based probability calculation
    if (input.weatherForecast) {
        const avgHumidity = input.weatherForecast.reduce((sum, day) => sum + day.humidity, 0) / input.weatherForecast.length;
        const avgTemp = input.weatherForecast.reduce((sum, day) => sum + day.temperature.avg, 0) / input.weatherForecast.length;
        const totalRainfall = input.weatherForecast.reduce((sum, day) => sum + day.rainfall, 0);
        const avgRainfall = totalRainfall / input.weatherForecast.length;

        // Temperature match factor
        if (avgTemp >= optimalConditions.temperature.min && avgTemp <= optimalConditions.temperature.max) {
            probability += 30;
        } else if (avgTemp >= optimalConditions.temperature.min - 5 && avgTemp <= optimalConditions.temperature.max + 5) {
            probability += 15;
        }

        // Humidity match factor
        if (avgHumidity >= optimalConditions.humidity.min && avgHumidity <= optimalConditions.humidity.max) {
            probability += 25;
        } else if (avgHumidity >= optimalConditions.humidity.min - 10 && avgHumidity <= optimalConditions.humidity.max + 10) {
            probability += 10;
        }

        // Rainfall match factor
        if (avgRainfall >= optimalConditions.rainfall.min && avgRainfall <= optimalConditions.rainfall.max) {
            probability += 20;
        } else if (avgRainfall >= optimalConditions.rainfall.min - 5 && avgRainfall <= optimalConditions.rainfall.max + 5) {
            probability += 10;
        }
    }

    // Pest history factor
    if (input.pestHistory && input.pestHistory.some(record => record.pest === pest)) {
        probability += 25;
    }

    // Crop susceptibility factor
    const susceptibleCrops: { [key: string]: string[] } = {
        'Aphids': ['Wheat', 'Rice', 'Tomato', 'Potato', 'Onion'],
        'Bollworm': ['Cotton', 'Tomato', 'Chilli', 'Maize'],
        'Armyworm': ['Maize', 'Wheat', 'Rice']
    };

    if (susceptibleCrops[pest] && susceptibleCrops[pest].includes(input.crop)) {
        probability += 20;
    }

    return Math.min(100, probability);
}

function generateEnhancedPestFactors(pest: string, optimalConditions: PestInfo['optimalConditions'], input: PestOutbreakPredictionInput): PestFactor[] {
    const factors: PestFactor[] = [];

    // Weather factors
    if (input.weatherForecast) {
        const avgHumidity = input.weatherForecast.reduce((sum, day) => sum + day.humidity, 0) / input.weatherForecast.length;
        const avgTemp = input.weatherForecast.reduce((sum, day) => sum + day.temperature.avg, 0) / input.weatherForecast.length;
        const avgRainfall = input.weatherForecast.reduce((sum, day) => sum + day.rainfall, 0) / input.weatherForecast.length;

        // Temperature factor
        if (avgTemp >= optimalConditions.temperature.min && avgTemp <= optimalConditions.temperature.max) {
            factors.push({
                name: 'Optimal Temperature for Pest',
                impact: 'positive',
                weight: 0.3,
                description: `Temperature (${avgTemp.toFixed(1)}°C) within optimal range for ${pest}`
            });
        } else if (avgTemp < optimalConditions.temperature.min - 5 || avgTemp > optimalConditions.temperature.max + 5) {
            factors.push({
                name: 'Suboptimal Temperature',
                impact: 'negative',
                weight: 0.2,
                description: `Temperature (${avgTemp.toFixed(1)}°C) outside optimal range for ${pest}`
            });
        }

        // Humidity factor
        if (avgHumidity >= optimalConditions.humidity.min && avgHumidity <= optimalConditions.humidity.max) {
            factors.push({
                name: 'Optimal Humidity for Pest',
                impact: 'positive',
                weight: 0.25,
                description: `Humidity (${avgHumidity.toFixed(1)}%) within optimal range for ${pest}`
            });
        }

        // Rainfall factor
        if (avgRainfall >= optimalConditions.rainfall.min && avgRainfall <= optimalConditions.rainfall.max) {
            factors.push({
                name: 'Optimal Rainfall for Pest',
                impact: 'positive',
                weight: 0.2,
                description: `Rainfall (${avgRainfall.toFixed(1)}mm) within optimal range for ${pest}`
            });
        }
    }

    // History factor
    if (input.pestHistory && input.pestHistory.some(record => record.pest === pest)) {
        factors.push({
            name: 'Pest History',
            impact: 'positive',
            weight: 0.35,
            description: 'Previous pest occurrences increase likelihood of recurrence'
        });
    }

    // Crop susceptibility
    const susceptibleCrops: { [key: string]: string[] } = {
        'Aphids': ['Wheat', 'Rice', 'Tomato', 'Potato', 'Onion'],
        'Bollworm': ['Cotton', 'Tomato', 'Chilli', 'Maize']
    };

    if (susceptibleCrops[pest] && susceptibleCrops[pest].includes(input.crop)) {
        factors.push({
            name: 'Crop Susceptibility',
            impact: 'positive',
            weight: 0.2,
            description: 'Crop variety is susceptible to this pest'
        });
    }

    return factors;
}

function predictOutbreakTiming(pest: string, input: PestOutbreakPredictionInput): string {
    // Predict outbreak timing based on current date and conditions
    const currentDate = new Date();

    // Simple model: if conditions are favorable, outbreak in 3-7 days
    // If conditions are moderately favorable, outbreak in 7-14 days
    // If conditions are unfavorable, no immediate outbreak predicted

    // For now, we'll return a date 5-10 days in the future
    const daysToAdd = Math.floor(Math.random() * 6) + 5; // 5-10 days
    const outbreakDate = new Date(currentDate);
    outbreakDate.setDate(currentDate.getDate() + daysToAdd);

    return outbreakDate.toISOString().split('T')[0];
}

function generateEnhancedPestRecommendations(input: PestOutbreakPredictionInput, predictions: PestOutbreakPrediction[]): string[] {
    const recommendations: string[] = [];

    // General recommendations
    recommendations.push('Implement integrated pest management (IPM) practices');
    recommendations.push('Monitor crops regularly for early pest detection');
    recommendations.push('Maintain field hygiene to reduce pest habitats');

    // Specific recommendations based on high probability pests
    const highRiskPests = predictions.filter(p => p.probability > 70);
    if (highRiskPests.length > 0) {
        recommendations.push('Take preventive measures for high-risk pests:');
        highRiskPests.forEach(pest => {
            recommendations.push(`- Monitor for ${pest.pest} and apply appropriate controls if detected`);
        });
    }

    // Weather-based recommendations
    if (input.weatherForecast) {
        const highHumidityDays = input.weatherForecast.filter(day => day.humidity > 75);
        if (highHumidityDays.length > 0) {
            recommendations.push('Increase monitoring frequency during high humidity periods');
        }

        const highRainfallDays = input.weatherForecast.filter(day => day.rainfall > 20);
        if (highRainfallDays.length > 0) {
            recommendations.push('Prepare for potential pest outbreaks following heavy rainfall');
        }
    }

    // Crop-specific recommendations
    const cropSpecific: { [key: string]: string[] } = {
        'Wheat': [
            'Apply neem-based treatments during tillering stage',
            'Use yellow sticky traps for aphid monitoring'
        ],
        'Rice': [
            'Maintain proper water levels to deter stem borers',
            'Remove weed hosts around fields'
        ],
        'Maize': [
            'Destroy crop residues after harvest',
            'Use pheromone traps for armyworm monitoring'
        ]
    };

    if (cropSpecific[input.crop]) {
        recommendations.push(...cropSpecific[input.crop]);
    }

    return recommendations;
}

function generateEnhancedMonitoringSchedule(predictions: PestOutbreakPrediction[], input: PestOutbreakPredictionInput): string[] {
    const schedule: string[] = [];

    // Add regular monitoring
    schedule.push('Daily visual inspection of crops');
    schedule.push('Weekly pest trapping and identification');

    // Add specific monitoring based on predictions
    const highRiskPests = predictions.filter(p => p.probability > 70);
    if (highRiskPests.length > 0) {
        schedule.push('Enhanced monitoring for high-risk pests:');
        highRiskPests.forEach(pest => {
            schedule.push(`- Check for ${pest.pest} signs twice daily`);
        });
    }

    // Add weather-based monitoring
    if (input.weatherForecast) {
        const highHumidityDays = input.weatherForecast.filter(day => day.humidity > 80);
        highHumidityDays.forEach(day => {
            schedule.push(`- Intensive monitoring required on ${day.date} due to high humidity (${day.humidity}%)`);
        });

        const highRainfallDays = input.weatherForecast.filter(day => day.rainfall > 25);
        highRainfallDays.forEach(day => {
            schedule.push(`- Post-rainfall inspection recommended on ${day.date} for pest activity`);
        });
    }

    return schedule;
}

// Enhanced irrigation scheduling helper functions

interface IrrigationDecision {
    needed: boolean;
    intensity: 'light' | 'moderate' | 'heavy';
    stressContribution?: number;
}

function shouldIrrigateEnhanced(input: IrrigationScheduleInput, date: Date, cumulativeWaterStress: number): IrrigationDecision {
    // Enhanced irrigation decision based on multiple factors

    // Base irrigation need (every 3-4 days for most crops)
    const plantingDate = new Date(input.plantingDate);
    const daysSincePlanting = Math.floor((date.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));

    // Growth stage factor
    let growthStageFactor = 1.0;
    if (daysSincePlanting < 30) {
        growthStageFactor = 0.7; // Early stage - less water needed
    } else if (daysSincePlanting < 60) {
        growthStageFactor = 1.0; // Vegetative stage - normal water needs
    } else if (daysSincePlanting < 90) {
        growthStageFactor = 1.3; // Reproductive stage - more water needed
    } else {
        growthStageFactor = 1.1; // Maturity stage - slightly less water needed
    }

    // Weather-based factors
    let weatherFactor = 1.0;
    let stressContribution = 0;

    if (input.weatherForecast) {
        // Find forecast for the specific date
        const forecastForDate = input.weatherForecast.find(f => f.date === date.toISOString().split('T')[0]);
        if (forecastForDate) {
            // Temperature factor
            if (forecastForDate.temperature.avg > 35) {
                weatherFactor *= 1.4; // Hot weather increases water needs
                stressContribution += 3;
            } else if (forecastForDate.temperature.avg > 30) {
                weatherFactor *= 1.2;
                stressContribution += 2;
            } else if (forecastForDate.temperature.avg < 15) {
                weatherFactor *= 0.8; // Cool weather reduces water needs
            }

            // Rainfall factor
            if (forecastForDate.rainfall > 15) {
                weatherFactor *= 0.5; // Significant rainfall reduces irrigation need
            } else if (forecastForDate.rainfall > 5) {
                weatherFactor *= 0.8; // Light rainfall slightly reduces need
            } else if (forecastForDate.rainfall === 0) {
                stressContribution += 1; // No rainfall adds stress
            }

            // Humidity factor
            if (forecastForDate.humidity < 30) {
                weatherFactor *= 1.3; // Low humidity increases water needs
                stressContribution += 2;
            } else if (forecastForDate.humidity > 70) {
                weatherFactor *= 0.8; // High humidity reduces water needs
            }

            // Wind factor
            if (forecastForDate.windSpeed > 20) {
                weatherFactor *= 1.2; // Windy conditions increase evapotranspiration
                stressContribution += 1;
            }
        }
    }

    // Soil moisture factor
    if (input.soilData && input.soilData.moisture < 20) {
        weatherFactor *= 1.5; // Dry soil needs more water
        stressContribution += 3;
    } else if (input.soilData && input.soilData.moisture > 60) {
        weatherFactor *= 0.7; // Moist soil needs less water
    }

    // Cumulative stress factor
    if (cumulativeWaterStress > 10) {
        weatherFactor *= 1.3; // High cumulative stress increases need
    }

    // Adjust irrigation interval based on factors
    const baseInterval = 4; // Base irrigation every 4 days
    const adjustedInterval = Math.max(1, Math.round(baseInterval / (weatherFactor * growthStageFactor)));

    // Determine if irrigation is needed today
    const daysSincePlantingAdjusted = daysSincePlanting * growthStageFactor;
    const irrigationNeeded = (daysSincePlantingAdjusted % adjustedInterval) === 0;

    // Determine intensity based on factors
    let intensity: 'light' | 'moderate' | 'heavy' = 'moderate';
    if (weatherFactor > 1.3) {
        intensity = 'heavy';
    } else if (weatherFactor < 0.8) {
        intensity = 'light';
    }

    return {
        needed: irrigationNeeded,
        intensity,
        stressContribution
    };
}

function calculateEnhancedWaterAmount(crop: string, soilType: string | undefined, soilData: SoilDataInput | undefined, date: Date): number {
    // Base water requirement by crop
    const baseAmounts: { [key: string]: number } = {
        'Wheat': 800,
        'Rice': 1200,
        'Maize': 900,
        'Cotton': 700,
        'Sugarcane': 1500,
        'Soybean': 600,
        'Groundnut': 500,
        'Mustard': 400,
        'Onion': 300,
        'Potato': 600,
        'Tomato': 500,
        'Chilli': 400
    };

    let amount = baseAmounts[crop] || 600;

    // Adjust based on soil type
    if (soilType) {
        switch (soilType.toLowerCase()) {
            case 'clay':
                amount *= 0.8; // Clay retains water better
                break;
            case 'sandy':
                amount *= 1.4; // Sandy soil drains quickly
                break;
            case 'loamy':
                amount *= 1.0; // Loamy is ideal
                break;
        }
    }

    // Adjust based on soil data if available
    if (soilData) {
        // Organic matter factor (higher organic matter retains more water)
        amount *= (1 - (soilData.organicMatter / 100) * 0.5);

        // pH factor (extreme pH affects water uptake)
        if (soilData.pH < 5.5 || soilData.pH > 8.0) {
            amount *= 1.1; // Plants may need more water under stress
        }
    }

    // Seasonal adjustment
    const month = date.getMonth();
    if (month >= 4 && month <= 8) { // Hot summer months
        amount *= 1.3;
    } else if (month >= 9 && month <= 11) { // Autumn
        amount *= 1.1;
    } else if (month >= 0 && month <= 2) { // Winter
        amount *= 0.8;
    }

    return Math.round(amount);
}

function calculateEnhancedIrrigationDuration(waterAmount: number, soilType: string | undefined, intensity: 'light' | 'moderate' | 'heavy'): number {
    // Duration in minutes based on water amount, soil type, and intensity
    let duration = waterAmount / 10; // Base calculation

    // Adjust based on soil type
    if (soilType) {
        switch (soilType.toLowerCase()) {
            case 'clay':
                duration *= 1.3; // Clay needs longer to absorb water
                break;
            case 'sandy':
                duration *= 0.7; // Sandy soil absorbs water quickly
                break;
            case 'loamy':
                duration *= 1.0; // Loamy is ideal
                break;
        }
    }

    // Adjust based on intensity
    switch (intensity) {
        case 'light':
            duration *= 0.7;
            break;
        case 'heavy':
            duration *= 1.4;
            break;
        case 'moderate':
        default:
            duration *= 1.0;
            break;
    }

    return Math.round(duration);
}

function determineOptimalIrrigationMethod(soilType: string | undefined, crop: string, waterAmount: number): 'drip' | 'sprinkler' | 'flood' | 'furrow' {
    // Determine optimal irrigation method based on multiple factors

    // Default to drip (most efficient)
    let method: 'drip' | 'sprinkler' | 'flood' | 'furrow' = 'drip';

    // Adjust based on soil type
    if (soilType) {
        switch (soilType.toLowerCase()) {
            case 'clay':
                method = 'furrow'; // Better for clay soils
                break;
            case 'sandy':
                method = 'drip'; // Most efficient for sandy soils
                break;
            case 'loamy':
                method = 'drip'; // Most efficient overall
                break;
        }
    }

    // Adjust based on crop
    const floodCrops = ['Rice']; // Crops that benefit from flood irrigation
    if (floodCrops.includes(crop)) {
        method = 'flood';
    }

    // Adjust based on water amount (very large amounts may need flood)
    if (waterAmount > 2000) {
        method = 'flood';
    } else if (waterAmount > 1500) {
        method = 'furrow';
    }

    return method;
}

function determineIrrigationPriority(waterAmount: number, intensity: 'light' | 'moderate' | 'heavy'): 'high' | 'medium' | 'low' {
    // Determine priority based on water amount and intensity

    if (intensity === 'heavy' || waterAmount > 1200) {
        return 'high';
    } else if (intensity === 'moderate' || waterAmount > 800) {
        return 'medium';
    } else {
        return 'low';
    }
}

function determineOptimalStartTime(input: IrrigationScheduleInput, date: Date): string {
    // Determine optimal start time based on weather conditions
    let startTime = '06:00'; // Default early morning

    if (input.weatherForecast) {
        const forecastForDate = input.weatherForecast.find(f => f.date === date.toISOString().split('T')[0]);
        if (forecastForDate) {
            // Adjust for temperature
            if (forecastForDate.temperature.max > 35) {
                startTime = '04:00'; // Very early morning for extreme heat
            } else if (forecastForDate.temperature.max > 30) {
                startTime = '05:00'; // Early morning
            } else if (forecastForDate.temperature.max < 20) {
                startTime = '07:00'; // Later start for cooler conditions
            }

            // Adjust for wind
            if (forecastForDate.windSpeed > 15) {
                // Earlier start to avoid windy periods
                startTime = '05:00';
            }
        }
    }

    return startTime;
}

function calculateEnhancedIrrigationEfficiency(schedule: IrrigationEvent[], input: IrrigationScheduleInput): number {
    // Calculate efficiency based on method, scheduling, and potential water savings
    if (schedule.length === 0) return 100;

    const methodEfficiencies: { [key: string]: number } = {
        'drip': 0.95,
        'sprinkler': 0.85,
        'flood': 0.65,
        'furrow': 0.70
    };

    // Calculate base efficiency
    const totalEfficiency = schedule.reduce((sum, event) => {
        return sum + (methodEfficiencies[event.method] || 0.8);
    }, 0);

    let efficiency = (totalEfficiency / schedule.length) * 100;

    // Adjust based on timing optimization
    let timingBonus = 0;
    schedule.forEach(event => {
        // Bonus for early morning irrigation (04:00-07:00)
        const hour = parseInt(event.startTime.split(':')[0]);
        if (hour >= 4 && hour <= 7) {
            timingBonus += 2;
        }
    });

    // Bonus for avoiding wasteful scheduling
    let wasteReduction = 0;
    if (input.weatherForecast) {
        schedule.forEach(event => {
            const forecastForDate = input.weatherForecast?.find(f => f.date === event.date);
            if (forecastForDate && forecastForDate.rainfall > 10) {
                // Penalty for irrigating before heavy rainfall
                wasteReduction -= 5;
            } else if (forecastForDate && forecastForDate.rainfall > 0) {
                // Small penalty for irrigating before light rainfall
                wasteReduction -= 2;
            }
        });
    }

    efficiency = Math.min(100, efficiency + timingBonus + wasteReduction);
    return Math.round(efficiency);
}

function generateEnhancedIrrigationRecommendations(input: IrrigationScheduleInput, schedule: IrrigationEvent[]): string[] {
    const recommendations: string[] = [];

    // General recommendations
    recommendations.push('Monitor soil moisture regularly to optimize irrigation timing');
    recommendations.push('Apply mulch to reduce evaporation and retain soil moisture');

    // Method-specific recommendations
    const methods: { [key: string]: boolean } = {};
    schedule.forEach(event => {
        methods[event.method] = true;
    });

    Object.keys(methods).forEach(method => {
        switch (method) {
            case 'drip':
                recommendations.push('Maintain drip system regularly to ensure uniform water distribution');
                break;
            case 'sprinkler':
                recommendations.push('Irrigate during early morning or late evening to reduce evaporation');
                break;
            case 'flood':
                recommendations.push('Ensure proper field leveling to achieve uniform water distribution');
                break;
            case 'furrow':
                recommendations.push('Monitor for waterlogging and improve drainage if necessary');
                break;
        }
    });

    // Schedule-based recommendations
    if (schedule.length > 0) {
        const totalWater = schedule.reduce((sum, event) => sum + event.waterAmount, 0);
        recommendations.push(`Total bi-weekly water requirement: ${totalWater} liters`);

        const highPriorityEvents = schedule.filter(event => event.priority === 'high');
        if (highPriorityEvents.length > 0) {
            recommendations.push('Pay special attention to high-priority irrigation events');
        }

        // Timing recommendations
        const earlyMorningEvents = schedule.filter(event => {
            const hour = parseInt(event.startTime.split(':')[0]);
            return hour >= 4 && hour <= 7;
        });

        if (earlyMorningEvents.length > schedule.length * 0.7) {
            recommendations.push('Good timing: Most irrigation events scheduled during optimal hours');
        } else {
            recommendations.push('Consider adjusting irrigation timing to early morning hours for better efficiency');
        }
    }

    // Crop-specific recommendations
    const cropSpecific: { [key: string]: string[] } = {
        'Wheat': [
            'Increase irrigation frequency during heading and grain filling stages',
            'Reduce irrigation just before harvest to prevent lodging'
        ],
        'Rice': [
            'Maintain continuous flooding during panicle initiation',
            'Drain fields 1-2 weeks before harvest'
        ],
        'Maize': [
            'Critical irrigation during tasseling and silking stages',
            'Reduce irrigation during grain filling to prevent kernel abortion'
        ]
    };

    if (cropSpecific[input.crop]) {
        recommendations.push(...cropSpecific[input.crop]);
    }

    return recommendations;
}