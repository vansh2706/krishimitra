// External Services Index for KrishiMitra
// Exports all external data services

export {
    fetchENAMPrices,
    fetchAgmarknetPrices,
    fetchDataGovPrices,
    fetchFarmonautPrices,
    getBestAvailablePrices,
    getPriceTrends,
    type CropPriceData,
    type MarketPriceResponse
} from './cropPriceService';

export {
    fetchFarmonautWeather,
    fetchWeatherBitWeather,
    fetchSoilMoisture,
    getBestAvailableWeather,
    getAgriculturalAlerts,
    type WeatherData,
    type WeatherResponse
} from './weatherService';

export {
    detectPestDisease,
    getPestDiseaseInfo,
    getCropPreventionInfo,
    getPredictiveAlerts,
    type PestDiseaseInfo,
    type PestDetectionResponse
} from './pestService';

export {
    analyzeSoil,
    type SoilDataInput,
    type SoilAnalysisResult
} from './soilService';

export {
    predictCropYield,
    predictPestOutbreaks,
    generateIrrigationSchedule,
    type YieldPredictionInput,
    type YieldPredictionResult,
    type PestOutbreakPredictionInput,
    type PestOutbreakPredictionResult,
    type IrrigationScheduleInput,
    type IrrigationScheduleResult
} from './predictiveAnalyticsService';

export {
    fetchSoilSensorData,
    fetchDroneImageData,
    fetchIrrigationData,
    controlIrrigationSystem,
    getIoTFieldAnalysis,
    type SoilSensorData,
    type DroneImageData,
    type AutomatedIrrigationData,
    type IoTDataResponse
} from './iotService';

export {
    analyzeEnergyEfficiency,
    type EnergyOptimizationInput,
    type EnergyOptimizationResult,
    type EnergySolution
} from './energyOptimizationService';
