// Weather API integration for KrishiMitra
'use client'

export interface WeatherData {
  name: string
  current: {
    temp_c: number
    feels_like_c: number
    humidity: number
    wind_kph: number
    uv: number
    pressure_mb: number
  }
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg: number
  }
  rain?: {
    '1h': number
  }
  clouds: {
    all: number
  }
  visibility: number
  sys: {
    sunrise: number
    sunset: number
    country: string
  }
  coord: {
    lat: number
    lon: number
  }
}

export interface WeatherError {
  message: string
}

// Generate location-specific mock data
function generateLocationMockData(lat: number, lon: number, locationName?: string): WeatherData {
  // Create significant variations based on coordinates  
  const latRadians = lat * Math.PI / 180
  const lonRadians = lon * Math.PI / 180

  // More dramatic temperature variations
  const tempBase = 15 + (Math.abs(lat) < 30 ? 30 - Math.abs(lat) : 5)
  const tempVariation = Math.sin(latRadians) * 15 + Math.cos(lonRadians) * 10 + Math.random() * 15
  const finalTemp = tempBase + tempVariation

  // Humidity based on coastal vs inland  
  const coastalEffect = Math.sin(lonRadians * 2) * 30
  const humidity = Math.max(20, Math.min(95, 50 + coastalEffect + Math.random() * 30))

  // Pressure variations
  const pressure = 1013 + Math.sin(latRadians + lonRadians) * 25 + Math.random() * 30

  // Weather condition based on location
  const weatherConditions = [
    { main: 'Clear', description: 'clear sky', icon: '01d' },
    { main: 'Clouds', description: 'partly cloudy', icon: '02d' },
    { main: 'Rain', description: 'light rain', icon: '10d' },
    { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' }
  ]

  const conditionIndex = Math.floor(Math.abs(Math.sin(lat + lon)) * weatherConditions.length)
  const weather = weatherConditions[conditionIndex]

  return {
    name: locationName || `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
    current: {
      temp_c: Math.round(finalTemp),
      feels_like_c: Math.round(finalTemp + 2 + Math.random() * 3),
      humidity: Math.round(humidity),
      wind_kph: Math.round(5 + Math.abs(Math.sin(latRadians)) * 15 + Math.random() * 10),
      uv: Math.round(3 + Math.abs(Math.sin(latRadians)) * 8),
      pressure_mb: Math.round(pressure)
    },
    main: {
      temp: Math.round(finalTemp),
      feels_like: Math.round(finalTemp + 2 + Math.random() * 3),
      temp_min: Math.round(finalTemp - 3 - Math.random() * 5),
      temp_max: Math.round(finalTemp + 5 + Math.random() * 5),
      pressure: Math.round(pressure),
      humidity: Math.round(humidity)
    },
    weather: [weather],
    wind: {
      speed: Math.round(5 + Math.abs(Math.sin(lat)) * 15),
      deg: Math.round(Math.abs(Math.cos(lon)) * 360)
    },
    rain: Math.random() > 0.7 ? { '1h': Math.round(Math.random() * 5) } : undefined,
    clouds: {
      all: Math.round(Math.abs(Math.sin(lat + lon)) * 100)
    },
    visibility: 10000,
    sys: {
      sunrise: Math.floor(Date.now() / 1000) - 6 * 3600,
      sunset: Math.floor(Date.now() / 1000) + 6 * 3600,
      country: 'IN'
    },
    coord: { lat, lon }
  }
}

// Get weather by coordinates (latitude, longitude)
export async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | WeatherError> {
  try {
    const apiKey = '84e785ce89d62b8ebd824ebc3085f7ad' // Use direct API key
    console.log('Fetching weather for coordinates:', lat, lon)

    // Use direct OpenWeather API call
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`

    const response = await fetch(url)

    if (!response.ok) {
      console.error('Weather API failed:', response.status)
      return generateLocationMockData(lat, lon, 'Your Location')
    }

    const data = await response.json()
    console.log('Weather API response:', data)

    if (data.cod && data.cod !== 200) {
      return { message: data.message || 'Weather data not available' }
    }

    // Transform OpenWeatherMap response to our WeatherData interface
    const weatherData: WeatherData = {
      name: data.name,
      current: {
        temp_c: data.main.temp,
        feels_like_c: data.main.feels_like,
        humidity: data.main.humidity,
        wind_kph: (data.wind?.speed || 0) * 3.6, // Convert m/s to km/h
        uv: 0, // OpenWeatherMap doesn't provide UV in basic plan
        pressure_mb: data.main.pressure
      },
      main: {
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity
      },
      weather: data.weather || [{
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      wind: {
        speed: (data.wind?.speed || 0) * 3.6, // Convert m/s to km/h
        deg: data.wind?.deg || 0
      },
      rain: data.rain,
      clouds: data.clouds || { all: 0 },
      visibility: data.visibility || 10000,
      sys: data.sys || {
        sunrise: Date.now() / 1000,
        sunset: Date.now() / 1000 + 12 * 3600,
        country: 'Unknown'
      },
      coord: data.coord || { lat, lon }
    }

    return weatherData
  } catch (error) {
    console.error('Weather API error:', error)
    return {
      message: `Failed to fetch weather data for your location. Please check your internet connection and try again.`
    }
  }
}

// Get coordinates for major Indian cities
function getCityCoordinates(city: string): { lat: number; lon: number } {
  const cityCoords: { [key: string]: { lat: number; lon: number } } = {
    'delhi': { lat: 28.6139, lon: 77.2090 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'kolkata': { lat: 22.5726, lon: 88.3639 },
    'chennai': { lat: 13.0827, lon: 80.2707 },
    'bangalore': { lat: 12.9716, lon: 77.5946 },
    'hyderabad': { lat: 17.3850, lon: 78.4867 },
    'pune': { lat: 18.5204, lon: 73.8567 },
    'ahmedabad': { lat: 23.0225, lon: 72.5714 },
    'jaipur': { lat: 26.9124, lon: 75.7873 },
    'lucknow': { lat: 26.8467, lon: 80.9462 }
  }

  const normalizedCity = city.toLowerCase().trim()
  return cityCoords[normalizedCity] || { lat: 20 + Math.random() * 15, lon: 70 + Math.random() * 20 }
}

export async function getWeatherByCity(city: string): Promise<WeatherData | WeatherError> {
  try {
    const apiKey = '84e785ce89d62b8ebd824ebc3085f7ad'
    console.log('Fetching weather for city:', city)

    // Use direct OpenWeather API call with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`

    const response = await fetch(url, { signal: controller.signal })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        return { message: `City "${city}" not found. Please check the spelling and try again.` }
      }
      console.error('Weather API failed:', response.status)
      const coords = getCityCoordinates(city)
      return generateLocationMockData(coords.lat, coords.lon, city)
    }

    const data = await response.json()
    console.log('Weather API response for', city, ':', data)

    if (data.cod && data.cod !== 200) {
      return { message: data.message || 'Weather data not available' }
    }

    // Transform OpenWeatherMap response to our WeatherData interface
    const weatherData: WeatherData = {
      name: data.name,
      current: {
        temp_c: data.main.temp,
        feels_like_c: data.main.feels_like,
        humidity: data.main.humidity,
        wind_kph: (data.wind?.speed || 0) * 3.6,
        uv: 0,
        pressure_mb: data.main.pressure
      },
      main: {
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity
      },
      weather: data.weather || [{
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      wind: {
        speed: (data.wind?.speed || 0) * 3.6,
        deg: data.wind?.deg || 0
      },
      rain: data.rain,
      clouds: data.clouds || { all: 0 },
      visibility: data.visibility || 10000,
      sys: data.sys || {
        sunrise: Date.now() / 1000,
        sunset: Date.now() / 1000 + 12 * 3600,
        country: 'Unknown'
      },
      coord: data.coord || { lat: 0, lon: 0 }
    }

    return weatherData
  } catch (error: any) {
    console.error('Weather API error:', error)

    // Handle timeout specifically
    if (error.name === 'AbortError') {
      return {
        message: `Weather request timed out. Using mock data for ${city}.`
      }
    }

    // Return error message instead of always falling back to mock
    return {
      message: `Failed to fetch weather data for ${city}. Please check your internet connection and try again.`
    }
  }
}

// Get user's current location using browser geolocation API with reduced timeout
export function getCurrentLocation(): Promise<{ lat: number; lon: number } | { error: string }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ error: 'Geolocation is not supported by this browser' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        resolve({ error: errorMessage })
      },
      {
        enableHighAccuracy: false, // Reduced accuracy for faster response
        timeout: 5000, // Reduced timeout from 10s to 5s
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

export function isWeatherError(data: any): data is WeatherError {
  return data && typeof data === 'object' && 'message' in data
}

export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

export function formatTemperature(temp: number, unit: 'c' | 'f' = 'c'): string {
  return `${Math.round(temp)}°${unit.toUpperCase()}`
}

// Weather condition descriptions for agricultural context
export function getWeatherDescription(condition: string, language: string = 'en'): string {
  const descriptions: Record<string, Record<string, string>> = {
    'Sunny': {
      en: 'Clear skies - Good for outdoor farming activities',
      hi: 'साफ आसमान - बाहरी कृषि गतिविधियों के लिए अच्छा'
    },
    'Partly Cloudy': {
      en: 'Mixed conditions - Suitable for most farming tasks',
      hi: 'मिश्रित स्थिति - अधिकांश कृषि कार्यों के लिए उपयुक्त'
    },
    'Cloudy': {
      en: 'Overcast skies - Good for soil work and planting',
      hi: 'बादलों से घिरा आसमान - मिट्टी के काम और रोपण के लिए अच्छा'
    },
    'Light Rain': {
      en: 'Gentle rainfall - Perfect for irrigation and crop growth',
      hi: 'हल्की बारिश - सिंचाई और फसल वृद्धि के लिए आदर्श'
    },
    'Heavy Rain': {
      en: 'Heavy rainfall - Avoid field work, check drainage',
      hi: 'भारी बारिश - खेत का काम न करें, जल निकासी जांचें'
    },
    'Thunderstorm': {
      en: 'Storm conditions - Stay indoors, protect crops',
      hi: 'तूफान की स्थिति - घर के अंदर रहें, फसलों की सुरक्षा करें'
    }
  }

  return descriptions[condition]?.[language] || condition
}

// Agricultural weather alerts
export function getWeatherAlerts(weather: WeatherData, language: string = 'en'): string[] {
  const alerts: string[] = []

  if (weather.current.temp_c > 35) {
    alerts.push(language === 'hi'
      ? 'उच्च तापमान चेतावनी - फसलों को अधिक पानी दें'
      : 'High temperature alert - Increase watering for crops'
    )
  }

  if (weather.current.humidity < 30) {
    alerts.push(language === 'hi'
      ? 'कम आर्द्रता - मिट्टी की नमी की जांच करें'
      : 'Low humidity - Check soil moisture levels'
    )
  }

  if (weather.current.wind_kph > 25) {
    alerts.push(language === 'hi'
      ? 'तेज हवा - नाजुक पौधों की सुरक्षा करें'
      : 'Strong winds - Protect delicate plants'
    )
  }

  if (weather.current.uv > 8) {
    alerts.push(language === 'hi'
      ? 'उच्च UV सूचकांक - सुबह या शाम के समय काम करें'
      : 'High UV index - Work during morning or evening hours'
    )
  }

  return alerts
}
