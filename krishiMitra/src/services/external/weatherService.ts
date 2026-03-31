// External Weather Service for KrishiMitra
// Integrates with weather APIs like Farmonaut and WeatherBit

// Types for weather data
export interface WeatherData {
    location: {
        name: string;
        region?: string;
        country: string;
        lat: number;
        lon: number;
    };
    current: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
        wind_speed: number;
        wind_direction: number;
        visibility: number;
        uv_index: number;
        condition: string;
        icon?: string;
    };
    forecast?: {
        date: string;
        max_temp: number;
        min_temp: number;
        condition: string;
        precipitation: number;
        humidity: number;
        wind_speed: number;
    }[];
    alerts?: {
        title: string;
        description: string;
        severity: 'low' | 'moderate' | 'high' | 'severe';
        start_time: string;
        end_time: string;
    }[];
    lastUpdated?: string;
}

export interface WeatherResponse {
    success: boolean;
    data?: WeatherData;
    error?: string;
}

// Mock data for development/testing
const MOCK_WEATHER_DATA: WeatherData = {
    location: {
        name: 'Delhi',
        region: 'Delhi',
        country: 'India',
        lat: 28.6139,
        lon: 77.2090
    },
    current: {
        temp: 32,
        feels_like: 35,
        humidity: 45,
        pressure: 1013,
        wind_speed: 12,
        wind_direction: 180,
        visibility: 10000,
        uv_index: 8,
        condition: 'Partly Cloudy',
        icon: '02d'
    },
    forecast: [
        {
            date: new Date().toISOString().split('T')[0],
            max_temp: 34,
            min_temp: 22,
            condition: 'Partly Cloudy',
            precipitation: 0,
            humidity: 45,
            wind_speed: 12
        },
        {
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            max_temp: 36,
            min_temp: 24,
            condition: 'Sunny',
            precipitation: 0,
            humidity: 40,
            wind_speed: 10
        },
        {
            date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
            max_temp: 38,
            min_temp: 25,
            condition: 'Sunny',
            precipitation: 0,
            humidity: 38,
            wind_speed: 8
        }
    ],
    alerts: [
        {
            title: 'High UV Index',
            description: 'UV index will be very high today. Take precautions.',
            severity: 'moderate',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 86400000).toISOString()
        }
    ],
    lastUpdated: new Date().toISOString()
};

// Service functions

/**
 * Fetch current weather from Farmonaut API
 * In a real implementation, this would connect to the Farmonaut API
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise with weather data
 */
export async function fetchFarmonautWeather(
    lat: number,
    lon: number
): Promise<WeatherResponse> {
    try {
        // TODO: Replace with actual Farmonaut API integration
        // Example API endpoint: https://api.farmonaut.com/weather?lat={lat}&lon={lon}
        // Requires API key registration at https://farmonaut.com
        
        // For now, return mock data with location-based variations
        const mockData = JSON.parse(JSON.stringify(MOCK_WEATHER_DATA));
        mockData.location.lat = lat;
        mockData.location.lon = lon;

        // Adjust temperature based on latitude (simplified model)
        const tempAdjustment = (lat - 20) * 0.5;
        mockData.current.temp = Math.max(10, Math.min(45, 32 - tempAdjustment));
        mockData.current.feels_like = mockData.current.temp + (Math.random() * 5);
        mockData.lastUpdated = new Date().toISOString();

        return {
            success: true,
            data: mockData
        };
    } catch (error) {
        console.error('Error fetching Farmonaut weather:', error);
        return {
            success: false,
            error: 'Failed to fetch weather from Farmonaut'
        };
    }
}

/**
 * Fetch current weather from WeatherBit API
 * In a real implementation, this would connect to the WeatherBit API
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise with weather data
 */
export async function fetchWeatherBitWeather(
    lat: number,
    lon: number
): Promise<WeatherResponse> {
    try {
        // TODO: Replace with actual WeatherBit API integration
        // Example API endpoint: https://api.weatherbit.io/v2.0/current?lat={lat}&lon={lon}&key={WEATHERBIT_API_KEY}
        // Requires API key registration at https://weatherbit.io
        
        // For now, return mock data with location-based variations
        const mockData = JSON.parse(JSON.stringify(MOCK_WEATHER_DATA));
        mockData.location.lat = lat;
        mockData.location.lon = lon;

        // Adjust temperature based on latitude (simplified model)
        const tempAdjustment = (lat - 20) * 0.5;
        mockData.current.temp = Math.max(10, Math.min(45, 32 - tempAdjustment));
        mockData.current.feels_like = mockData.current.temp + (Math.random() * 5);
        mockData.lastUpdated = new Date().toISOString();

        return {
            success: true,
            data: mockData
        };
    } catch (error) {
        console.error('Error fetching WeatherBit weather:', error);
        return {
            success: false,
            error: 'Failed to fetch weather from WeatherBit'
        };
    }
}

/**
 * Fetch soil moisture data from satellite sources
 * In a real implementation, this would connect to ISRO/MOSDAC or EOSDA APIs
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise with soil moisture data
 */
export async function fetchSoilMoisture(
    lat: number,
    lon: number
): Promise<{ success: boolean; data?: { moisture: number; index: number; status: string }; error?: string }> {
    try {
        // TODO: Replace with actual ISRO/MOSDAC or EOSDA API integration
        // Example API endpoint: https://mosdac.gov.in/api/soil-moisture?lat={lat}&lon={lon}
        // Requires API key registration at https://mosdac.gov.in
        
        // For now, generate mock soil moisture data based on location
        // This is a simplified model - in reality, soil moisture depends on many factors
        const moisture = Math.max(10, Math.min(90, 50 + (lat - 20) + (Math.random() * 20)));
        const index = moisture / 100;

        let status = 'optimal';
        if (moisture < 30) status = 'dry';
        if (moisture > 70) status = 'waterlogged';

        return {
            success: true,
            data: {
                moisture: Math.round(moisture),
                index: parseFloat(index.toFixed(2)),
                status
            }
        };
    } catch (error) {
        console.error('Error fetching soil moisture data:', error);
        return {
            success: false,
            error: 'Failed to fetch soil moisture data'
        };
    }
}

/**
 * Get the best available weather data by trying multiple sources
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise with the best available weather data
 */
export async function getBestAvailableWeather(
    lat: number,
    lon: number
): Promise<WeatherResponse> {
    // Try sources in order of preference
    const sources = [
        () => fetchFarmonautWeather(lat, lon),
        () => fetchWeatherBitWeather(lat, lon)
    ];

    for (const source of sources) {
        try {
            const result = await source();
            if (result.success && result.data) {
                return result;
            }
        } catch (error) {
            console.warn('Weather source failed, trying next:', error);
        }
    }

    // If all sources fail, return mock data
    const mockData = JSON.parse(JSON.stringify(MOCK_WEATHER_DATA));
    mockData.location.lat = lat;
    mockData.location.lon = lon;

    return {
        success: true,
        data: mockData,
        error: 'Using mock data - real sources unavailable'
    };
}

/**
 * Get agricultural weather alerts based on current conditions
 * @param weatherData - Current weather data
 * @returns Array of agricultural alerts
 */
export function getAgriculturalAlerts(weatherData: WeatherData): WeatherData['alerts'] {
    const alerts: WeatherData['alerts'] = [];
    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();

    // High temperature alert
    if (weatherData.current.temp > 35) {
        alerts.push({
            title: 'High Temperature',
            description: `Temperature is ${weatherData.current.temp}°C. Take precautions to protect crops from heat stress.`,
            severity: weatherData.current.temp > 40 ? 'high' : 'moderate',
            start_time: now,
            end_time: tomorrow
        });
    }

    // Low temperature alert
    if (weatherData.current.temp < 10) {
        alerts.push({
            title: 'Low Temperature',
            description: `Temperature is ${weatherData.current.temp}°C. Protect cold-sensitive crops from frost.`,
            severity: weatherData.current.temp < 5 ? 'high' : 'moderate',
            start_time: now,
            end_time: tomorrow
        });
    }

    // High wind alert
    if (weatherData.current.wind_speed > 25) {
        alerts.push({
            title: 'High Winds',
            description: `Wind speed is ${weatherData.current.wind_speed} km/h. Secure young plants and check for damage.`,
            severity: weatherData.current.wind_speed > 40 ? 'high' : 'moderate',
            start_time: now,
            end_time: tomorrow
        });
    }

    // High UV index alert
    if (weatherData.current.uv_index > 7) {
        alerts.push({
            title: 'High UV Index',
            description: `UV index is ${weatherData.current.uv_index}. Take precautions when working outdoors.`,
            severity: weatherData.current.uv_index > 10 ? 'high' : 'moderate',
            start_time: now,
            end_time: tomorrow
        });
    }

    // Heavy rain forecast alert
    if (weatherData.forecast && weatherData.forecast[0].precipitation > 10) {
        alerts.push({
            title: 'Heavy Rain Expected',
            description: `Heavy rain (${weatherData.forecast[0].precipitation}mm) expected today. Ensure proper drainage.`,
            severity: weatherData.forecast[0].precipitation > 25 ? 'high' : 'moderate',
            start_time: now,
            end_time: tomorrow
        });
    }

    return alerts;
}

export default {
    fetchFarmonautWeather,
    fetchWeatherBitWeather,
    fetchSoilMoisture,
    getBestAvailableWeather,
    getAgriculturalAlerts
};