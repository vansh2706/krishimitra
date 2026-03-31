// External Crop Price Service for KrishiMitra
// Integrates with government APIs like eNAM, AGMARKNET, and Farmonaut

// Types for crop price data
export interface CropPriceData {
    crop: string;
    variety?: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    unit: string;
    market: string;
    district: string;
    state: string;
    date: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    changePercent: number;
}

export interface MarketPriceResponse {
    success: boolean;
    data?: CropPriceData[];
    error?: string;
    lastUpdated?: string;
}

// Mock data for development/testing
const MOCK_CROP_PRICES: CropPriceData[] = [
    {
        crop: 'Wheat',
        variety: 'HD-2967',
        minPrice: 2100,
        maxPrice: 2350,
        modalPrice: 2250,
        unit: 'per quintal',
        market: 'Delhi',
        district: 'Delhi',
        state: 'Delhi',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: 150,
        changePercent: 7.14
    },
    {
        crop: 'Rice',
        variety: 'Basmati-1121',
        minPrice: 5500,
        maxPrice: 6200,
        modalPrice: 5850,
        unit: 'per quintal',
        market: 'Delhi',
        district: 'Delhi',
        state: 'Delhi',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: 200,
        changePercent: 3.54
    },
    {
        crop: 'Cotton',
        variety: 'MCU-5',
        minPrice: 6800,
        maxPrice: 7500,
        modalPrice: 7200,
        unit: 'per quintal',
        market: 'Mumbai',
        district: 'Mumbai',
        state: 'Maharashtra',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: 300,
        changePercent: 4.35
    },
    {
        crop: 'Sugarcane',
        variety: 'Co-238',
        minPrice: 320,
        maxPrice: 420,
        modalPrice: 380,
        unit: 'per quintal',
        market: 'Bangalore',
        district: 'Bangalore',
        state: 'Karnataka',
        date: new Date().toISOString().split('T')[0],
        trend: 'stable',
        change: 10,
        changePercent: 2.70
    },
    {
        crop: 'Maize',
        variety: 'Hybrid',
        minPrice: 1800,
        maxPrice: 2100,
        modalPrice: 1950,
        unit: 'per quintal',
        market: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        date: new Date().toISOString().split('T')[0],
        trend: 'down',
        change: -50,
        changePercent: -2.50
    },
    {
        crop: 'Soybean',
        variety: 'JS-335',
        minPrice: 4200,
        maxPrice: 4700,
        modalPrice: 4450,
        unit: 'per quintal',
        market: 'Indore',
        district: 'Indore',
        state: 'Madhya Pradesh',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: 150,
        changePercent: 3.49
    },
    {
        crop: 'Groundnut',
        variety: 'Bold',
        minPrice: 5800,
        maxPrice: 6500,
        modalPrice: 6200,
        unit: 'per quintal',
        market: 'Ahmedabad',
        district: 'Ahmedabad',
        state: 'Gujarat',
        date: new Date().toISOString().split('T')[0],
        trend: 'stable',
        change: 50,
        changePercent: 0.81
    },
    {
        crop: 'Mustard',
        variety: 'Yellow',
        minPrice: 5200,
        maxPrice: 5600,
        modalPrice: 5400,
        unit: 'per quintal',
        market: 'Jaipur',
        district: 'Jaipur',
        state: 'Rajasthan',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: 100,
        changePercent: 1.89
    },
    {
        crop: 'Onion',
        variety: 'Red',
        minPrice: 1600,
        maxPrice: 2000,
        modalPrice: 1800,
        unit: 'per quintal',
        market: 'Kolkata',
        district: 'Kolkata',
        state: 'West Bengal',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: 200,
        changePercent: 12.50
    },
    {
        crop: 'Potato',
        variety: 'Jyoti',
        minPrice: 900,
        maxPrice: 1000,
        modalPrice: 950,
        unit: 'per quintal',
        market: 'Lucknow',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        date: new Date().toISOString().split('T')[0],
        trend: 'stable',
        change: 0,
        changePercent: 0
    },
    {
        crop: 'Tomato',
        variety: 'Hybrid',
        minPrice: 1800,
        maxPrice: 2500,
        modalPrice: 2200,
        unit: 'per quintal',
        market: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: 300,
        changePercent: 15.79
    },
    {
        crop: 'Chilli',
        variety: 'Red',
        minPrice: 8200,
        maxPrice: 8800,
        modalPrice: 8500,
        unit: 'per quintal',
        market: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        date: new Date().toISOString().split('T')[0],
        trend: 'down',
        change: -200,
        changePercent: -2.30
    }
];

// Service functions

/**
 * Fetch crop prices from eNAM (National Agriculture Market)
 * In a real implementation, this would connect to the eNAM API
 * @param crop - Crop name to filter (optional)
 * @param state - State to filter (optional)
 * @param district - District to filter (optional)
 * @returns Promise with crop price data
 */
export async function fetchENAMPrices(
    crop?: string,
    state?: string,
    district?: string
): Promise<MarketPriceResponse> {
    try {
        // TODO: Replace with actual eNAM API integration
        // Example API endpoint: https://enam.gov.in/api/prices?crop={crop}&state={state}&district={district}
        // Requires API key registration at https://enam.gov.in
        
        // For now, return mock data with optional filtering
        let filteredData = [...MOCK_CROP_PRICES];

        if (crop) {
            filteredData = filteredData.filter(item =>
                item.crop.toLowerCase().includes(crop.toLowerCase())
            );
        }

        if (state) {
            filteredData = filteredData.filter(item =>
                item.state.toLowerCase().includes(state.toLowerCase())
            );
        }

        if (district) {
            filteredData = filteredData.filter(item =>
                item.district.toLowerCase().includes(district.toLowerCase())
            );
        }

        return {
            success: true,
            data: filteredData,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching eNAM prices:', error);
        return {
            success: false,
            error: 'Failed to fetch prices from eNAM'
        };
    }
}

/**
 * Fetch crop prices from AGMARKNET
 * In a real implementation, this would connect to the AGMARKNET API
 * @param commodity - Commodity name to filter (optional)
 * @param state - State to filter (optional)
 * @param market - Market to filter (optional)
 * @returns Promise with crop price data
 */
export async function fetchAgmarknetPrices(
    commodity?: string,
    state?: string,
    market?: string
): Promise<MarketPriceResponse> {
    try {
        // TODO: Replace with actual AGMARKNET API integration
        // Example API endpoint: https://agmarknet.gov.in/api/commoditywise?commodity={commodity}&state={state}&market={market}
        // Requires API key registration at https://agmarknet.gov.in
        
        // For now, return mock data with optional filtering
        let filteredData = [...MOCK_CROP_PRICES];

        if (commodity) {
            filteredData = filteredData.filter(item =>
                item.crop.toLowerCase().includes(commodity.toLowerCase())
            );
        }

        if (state) {
            filteredData = filteredData.filter(item =>
                item.state.toLowerCase().includes(state.toLowerCase())
            );
        }

        if (market) {
            filteredData = filteredData.filter(item =>
                item.market.toLowerCase().includes(market.toLowerCase())
            );
        }

        return {
            success: true,
            data: filteredData,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching AGMARKNET prices:', error);
        return {
            success: false,
            error: 'Failed to fetch prices from AGMARKNET'
        };
    }
}

/**
 * Fetch crop prices from Data.gov.in
 * In a real implementation, this would connect to the government's open data API
 * @param crop - Crop name to filter (optional)
 * @param state - State to filter (optional)
 * @returns Promise with crop price data
 */
export async function fetchDataGovPrices(
    crop?: string,
    state?: string
): Promise<MarketPriceResponse> {
    try {
        // TODO: Replace with actual Data.gov.in API integration
        // Example API endpoint: https://api.data.gov.in/resource/...?crop={crop}&state={state}
        // Requires API key registration at https://data.gov.in
        
        // For now, return mock data with optional filtering
        let filteredData = [...MOCK_CROP_PRICES];

        if (crop) {
            filteredData = filteredData.filter(item =>
                item.crop.toLowerCase().includes(crop.toLowerCase())
            );
        }

        if (state) {
            filteredData = filteredData.filter(item =>
                item.state.toLowerCase().includes(state.toLowerCase())
            );
        }

        return {
            success: true,
            data: filteredData,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching Data.gov.in prices:', error);
        return {
            success: false,
            error: 'Failed to fetch prices from Data.gov.in'
        };
    }
}

/**
 * Fetch crop prices from Farmonaut API
 * In a real implementation, this would connect to the Farmonaut API
 * @param crop - Crop name to filter (optional)
 * @param location - Location to filter (optional)
 * @returns Promise with crop price data
 */
export async function fetchFarmonautPrices(
    crop?: string,
    location?: string
): Promise<MarketPriceResponse> {
    try {
        // TODO: Replace with actual Farmonaut API integration
        // Example API endpoint: https://api.farmonaut.com/prices?crop={crop}&location={location}
        // Requires API key registration at https://farmonaut.com
        
        // For now, return mock data with optional filtering
        let filteredData = [...MOCK_CROP_PRICES];

        if (crop) {
            filteredData = filteredData.filter(item =>
                item.crop.toLowerCase().includes(crop.toLowerCase())
            );
        }

        if (location) {
            filteredData = filteredData.filter(item =>
                item.district.toLowerCase().includes(location.toLowerCase()) ||
                item.state.toLowerCase().includes(location.toLowerCase()) ||
                item.market.toLowerCase().includes(location.toLowerCase())
            );
        }

        return {
            success: true,
            data: filteredData,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching Farmonaut prices:', error);
        return {
            success: false,
            error: 'Failed to fetch prices from Farmonaut'
        };
    }
}

/**
 * Get the best available price data by trying multiple sources
 * @param crop - Crop name to filter (optional)
 * @param location - Location to filter (optional)
 * @returns Promise with the best available crop price data
 */
export async function getBestAvailablePrices(
    crop?: string,
    location?: string
): Promise<MarketPriceResponse> {
    // Try sources in order of preference
    const sources = [
        () => fetchENAMPrices(crop, undefined, location),
        () => fetchAgmarknetPrices(crop, undefined, location),
        () => fetchDataGovPrices(crop, location),
        () => fetchFarmonautPrices(crop, location)
    ];

    for (const source of sources) {
        try {
            const result = await source();
            if (result.success && result.data && result.data.length > 0) {
                return result;
            }
        } catch (error) {
            console.warn('Source failed, trying next:', error);
        }
    }

    // If all sources fail, return mock data
    return {
        success: true,
        data: MOCK_CROP_PRICES,
        lastUpdated: new Date().toISOString(),
        error: 'Using mock data - real sources unavailable'
    };
}

/**
 * Get price trends for a specific crop over time
 * In a real implementation, this would fetch historical data
 * @param crop - Crop name
 * @param days - Number of days of history to fetch
 * @returns Promise with historical price data
 */
export async function getPriceTrends(
    crop: string,
    days: number = 30
): Promise<MarketPriceResponse> {
    try {
        // In a real implementation, this would fetch historical data
        // For now, generate mock trend data
        const today = new Date();
        const trendData: CropPriceData[] = [];

        // Generate mock historical data with some variation
        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Find base price for this crop
            const basePrice = MOCK_CROP_PRICES.find(item =>
                item.crop.toLowerCase() === crop.toLowerCase()
            );

            if (basePrice) {
                // Add some random variation to simulate price changes
                const variation = (Math.random() - 0.5) * 200; // ±100 variation
                const modalPrice = Math.max(100, basePrice.modalPrice + variation);
                const minPrice = Math.max(50, modalPrice - (50 + Math.random() * 100));
                const maxPrice = modalPrice + (50 + Math.random() * 150);

                trendData.push({
                    ...basePrice,
                    modalPrice: Math.round(modalPrice),
                    minPrice: Math.round(minPrice),
                    maxPrice: Math.round(maxPrice),
                    date: date.toISOString().split('T')[0],
                    change: Math.round(variation),
                    changePercent: parseFloat(((variation / basePrice.modalPrice) * 100).toFixed(2))
                });
            }
        }

        return {
            success: true,
            data: trendData,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching price trends:', error);
        return {
            success: false,
            error: 'Failed to fetch price trends'
        };
    }
}

export default {
    fetchENAMPrices,
    fetchAgmarknetPrices,
    fetchDataGovPrices,
    fetchFarmonautPrices,
    getBestAvailablePrices,
    getPriceTrends
};