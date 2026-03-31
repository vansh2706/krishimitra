'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import {
    CloudSun,
    Thermometer,
    Droplets,
    Wind,
    Eye,
    Gauge,
    Sunrise,
    Sunset,
    AlertTriangle,
    MapPin,
    RefreshCw,
    WifiOff,
    Navigation,
    Navigation2
} from 'lucide-react'
import { getWeatherByCity, getWeatherByCoordinates, getCurrentLocation, type WeatherData, isWeatherError, getWeatherIconUrl, formatTemperature } from '../lib/weatherApi'
// Weather dashboard component for agricultural weather monitoring
import { useLanguage } from '../hooks/useLanguage'

interface WeatherDashboardProps {
    voiceEnabled: boolean
    onSpeak: (text: string) => void
}

export function WeatherDashboard({ voiceEnabled, onSpeak }: WeatherDashboardProps) {
    const { t, language, isOnline } = useLanguage()
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [location, setLocation] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
    const [locationPermission, setLocationPermission] = useState<'checking' | 'granted' | 'denied' | 'unavailable'>('checking')
    const [useCurrentLocation, setUseCurrentLocation] = useState(true)

    // Get weather for user's current location on component mount
    useEffect(() => {
        getCurrentUserLocation()
    }, [isOnline]) // Add isOnline as dependency

    const getCurrentUserLocation = async () => {
        if (!isOnline) {
            setLocationPermission('unavailable')
            setUseCurrentLocation(false)
            fetchWeatherData('Delhi') // Fallback to Delhi
            return
        }

        setLocationPermission('checking')
        const locationResult = await getCurrentLocation()

        if ('error' in locationResult) {
            console.warn('Location access failed:', locationResult.error)
            setLocationPermission('denied')
            setUseCurrentLocation(false)
            fetchWeatherData('Delhi') // Fallback to Delhi
        } else {
            setLocationPermission('granted')
            setUserLocation(locationResult)
            setUseCurrentLocation(true)
            fetchWeatherByCoordinates(locationResult.lat, locationResult.lon)
        }
    }

    const fetchWeatherByCoordinates = async (lat: number, lon: number) => {
        if (!isOnline) {
            setError(language === 'hi'
                ? 'इंटरनेट कनेक्शन उपलब्ध नहीं है'
                : 'No internet connection available'
            )
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const data = await getWeatherByCoordinates(lat, lon)

            if (isWeatherError(data)) {
                setError(language === 'hi'
                    ? `मौसम की जानकारी प्राप्त करने में त्रुटि: ${data.message}`
                    : `Weather error: ${data.message}`
                )
                setWeather(null)
            } else {
                setWeather(data)
                setLastUpdated(new Date())
                setLocation(data.name) // Update location field with actual location name

                // Speak weather summary if voice is enabled
                if (voiceEnabled) {
                    const temp = Math.round(data.main.temp)
                    const description = data.weather[0]?.description || ''
                    const humidity = data.main.humidity
                    const windSpeed = Math.round(data.wind.speed)

                    const weatherSummary = language === 'hi'
                        ? `${data.name} में मौसम: तापमान ${temp} डिग्री सेल्सियस, ${description}, नमी ${humidity} प्रतिशत, हवा की गति ${windSpeed} किमी प्रति घंटा`
                        : `Weather in ${data.name}: ${temp}°C, ${description}, humidity ${humidity}%, wind speed ${windSpeed} km/h`
                    onSpeak(weatherSummary)
                }
            }
        } catch (err) {
            console.error('Weather fetch error:', err)
            setError(language === 'hi'
                ? 'मौसम की जानकारी लोड करने में समस्या हुई'
                : 'Failed to load weather data. Please try again.'
            )
            setWeather(null)
        }

        setIsLoading(false)
    }

    const fetchWeatherData = async (city: string) => {
        if (!city.trim()) return

        if (!isOnline) {
            setError(language === 'hi'
                ? 'इंटरनेट कनेक्शन उपलब्ध नहीं है'
                : 'No internet connection available'
            )
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const data = await getWeatherByCity(city.trim())

            if (isWeatherError(data)) {
                setError(language === 'hi'
                    ? `मौसम की जानकारी प्राप्त करने में त्रुटि: ${data.message}`
                    : `Weather error: ${data.message}`
                )
                setWeather(null)
            } else {
                setWeather(data)
                setLastUpdated(new Date())
                setLocation(data.name) // Update location field with actual city name

                // Speak weather summary if voice is enabled
                if (voiceEnabled) {
                    const temp = Math.round(data.main.temp)
                    const description = data.weather[0]?.description || ''
                    const humidity = data.main.humidity
                    const windSpeed = Math.round(data.wind.speed)

                    const weatherSummary = language === 'hi'
                        ? `${data.name} में मौसम: तापमान ${temp} डिग्री सेल्सियस, ${description}, नमी ${humidity} प्रतिशत, हवा की गति ${windSpeed} किमी प्रति घंटा`
                        : `Weather in ${data.name}: ${temp}°C, ${description}, humidity ${humidity}%, wind speed ${windSpeed} km/h`
                    onSpeak(weatherSummary)
                }
            }
        } catch (err) {
            console.error('Weather fetch error:', err)
            setError(language === 'hi'
                ? 'मौसम की जानकारी लोड करने में समस्या हुई'
                : 'Failed to load weather data. Please try again.'
            )
            setWeather(null)
        }

        setIsLoading(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (location.trim()) {
            setUseCurrentLocation(false)
            fetchWeatherData(location)
        }
    }

    const handleUseCurrentLocation = () => {
        if (userLocation) {
            setUseCurrentLocation(true)
            fetchWeatherByCoordinates(userLocation.lat, userLocation.lon)
        } else {
            getCurrentUserLocation()
        }
    }

    interface WeatherAlert {
        type: string;
        message: string;
    }

    const getWeatherAlerts = (weatherData: WeatherData) => {
        const alerts: WeatherAlert[] = []

        // Temperature alerts
        if (weatherData.main.temp > 35) {
            alerts.push({
                type: 'heat',
                message: language === 'hi'
                    ? 'उच्च तापमान चेतावनी: फसलों की अतिरिक्त सिंचाई करें'
                    : 'High temperature alert: Ensure adequate irrigation for crops'
            })
        }

        if (weatherData.main.temp < 5) {
            alerts.push({
                type: 'cold',
                message: language === 'hi'
                    ? 'कम तापमान चेतावनी: फसलों को ठंड से बचाएं'
                    : 'Low temperature alert: Protect crops from frost'
            })
        }

        // Wind alerts
        if (weatherData.wind.speed > 10) {
            alerts.push({
                type: 'wind',
                message: language === 'hi'
                    ? 'तेज हवा की चेतावनी: छिड़काव कार्य स्थगित करें'
                    : 'Strong wind alert: Postpone spraying activities'
            })
        }

        // Rain alerts
        if (weatherData.rain && weatherData.rain['1h'] > 10) {
            alerts.push({
                type: 'rain',
                message: language === 'hi'
                    ? 'भारी बारिश चेतावनी: खेत की जल निकासी सुनिश्चित करें'
                    : 'Heavy rain alert: Ensure proper field drainage'
            })
        }

        return alerts
    }

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000)
        return date.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Location Input */}
            <Card className="border dark:border-gray-800 dark:bg-gray-950 transition-colors duration-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CloudSun className="w-6 h-6 text-yellow-600" />
                        {t('weatherAlerts')}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (useCurrentLocation && userLocation) {
                                    fetchWeatherByCoordinates(userLocation.lat, userLocation.lon)
                                } else if (location.trim()) {
                                    fetchWeatherData(location)
                                } else {
                                    getCurrentUserLocation()
                                }
                            }}
                            disabled={isLoading || !isOnline}
                            className="ml-auto"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {language === 'hi' ? 'नवीनीकरण' : 'Refresh'}
                        </Button>
                        <Link href="/weather" className="ml-2">
                            <Button variant="secondary" size="sm">
                                {language === 'hi' ? 'पूर्ण पृष्ठ' : 'Full Page'}
                            </Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Location Status */}
                    {locationPermission === 'checking' && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-blue-600 dark:text-blue-400">
                                {language === 'hi' ? 'आपका स्थान खोजा जा रहा है...' : 'Detecting your location...'}
                            </span>
                        </div>
                    )}

                    {locationPermission === 'granted' && useCurrentLocation && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <Navigation2 className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 dark:text-green-400">
                                {language === 'hi' ? 'आपके वर्तमान स्थान का मौसम दिखाया जा रहा है' : 'Showing weather for your current location'}
                            </span>
                        </div>
                    )}

                    {locationPermission === 'denied' && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="text-yellow-600 dark:text-yellow-400">
                                {language === 'hi'
                                    ? 'स्थान की अनुमति नहीं दी गई - शहर का नाम दर्ज करें'
                                    : 'Location access denied - Please enter city name'}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={language === 'hi'
                                ? 'शहर का नाम दर्ज करें (जैसे: दिल्ली, मुंबई, बंगलौर)'
                                : 'Enter city name (e.g., Delhi, Mumbai, Bangalore)'
                            }
                            className="flex-1"
                            disabled={!isOnline || isLoading}
                        />
                        <Button type="submit" disabled={!isOnline || isLoading || !location.trim()}>
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : !isOnline ? (
                                <WifiOff className="w-4 h-4" />
                            ) : (
                                <MapPin className="w-4 h-4" />
                            )}
                            {language === 'hi' ? 'मौसम देखें' : 'Get Weather'}
                        </Button>

                        {/* Current Location Button */}
                        {(locationPermission === 'granted' || locationPermission === 'denied') && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleUseCurrentLocation}
                                disabled={!isOnline || isLoading || (locationPermission === 'denied' && !userLocation)}
                                title={language === 'hi' ? 'वर्तमान स्थान का मौसम' : 'Use current location'}
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Navigation className="w-4 h-4" />
                                )}
                            </Button>
                        )}
                    </form>

                    {error && (
                        <Alert className="mb-4 dark:bg-red-900/20 dark:border-red-800 transition-colors duration-200">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <AlertDescription className="text-red-600 dark:text-red-400">{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="space-y-4 animate-pulse">
                    <Card className="border dark:border-gray-800 dark:bg-gray-950">
                        <CardHeader>
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                                <div className="grid gap-4 grid-cols-2">
                                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : weather && (
                <>
                    {/* Current Weather */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {weather.name}, {weather.sys.country}
                                </span>
                                {lastUpdated && (
                                    <Badge variant="outline" className="text-xs">
                                        {t('lastUpdated')}: {lastUpdated.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US')}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Main Weather Info */}
                                <div className="flex items-center gap-4">
                                    <img
                                        src={getWeatherIconUrl(weather.weather[0]?.icon || '01d')}
                                        alt={weather.weather[0]?.description || ''}
                                        className="w-16 h-16"
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6m0 12v2M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m12 0h2M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24"/></svg>';
                                        }}
                                    />
                                    <div>
                                        <div className="text-3xl font-bold">
                                            {formatTemperature(weather.main.temp)}
                                        </div>
                                        <div className="text-lg text-gray-600 capitalize">
                                            {weather.weather[0]?.description || ''}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {t('temperature')}: {formatTemperature(weather.main.feels_like)} {language === 'hi' ? 'महसूस होता है' : 'feels like'}
                                        </div>
                                    </div>
                                </div>

                                {/* Weather Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Droplets className="w-4 h-4 text-blue-600" />
                                        <div>
                                            <div className="text-sm text-gray-600">{t('humidity')}</div>
                                            <div className="font-semibold">{weather.main.humidity}%</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Wind className="w-4 h-4 text-gray-600" />
                                        <div>
                                            <div className="text-sm text-gray-600">{t('windSpeed')}</div>
                                            <div className="font-semibold">{weather.wind.speed} m/s</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Gauge className="w-4 h-4 text-purple-600" />
                                        <div>
                                            <div className="text-sm text-gray-600">{t('pressure')}</div>
                                            <div className="font-semibold">{weather.main.pressure} hPa</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-green-600" />
                                        <div>
                                            <div className="text-sm text-gray-600">{t('visibility')}</div>
                                            <div className="font-semibold">{(weather.visibility / 1000).toFixed(1)} km</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sun Times */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Sunrise className="w-4 h-4 text-orange-500" />
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                {language === 'hi' ? 'सूर्योदय' : 'Sunrise'}
                                            </div>
                                            <div className="font-semibold">{formatTime(weather.sys.sunrise)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Sunset className="w-4 h-4 text-red-500" />
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                {language === 'hi' ? 'सूर्यास्त' : 'Sunset'}
                                            </div>
                                            <div className="font-semibold">{formatTime(weather.sys.sunset)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weather Alerts for Farming */}
                    {(() => {
                        const alerts = getWeatherAlerts(weather)
                        return alerts.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-orange-600">
                                        <AlertTriangle className="w-5 h-5" />
                                        {language === 'hi' ? 'कृषि चेतावनी' : 'Farming Alerts'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {alerts.map((alert, idx) => (
                                            <Alert key={idx} className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 transition-colors duration-200">
                                                <AlertTriangle className="w-4 h-4" />
                                                <AlertDescription className="font-medium">
                                                    {alert.message}
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })()}

                    {/* Farming Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Thermometer className="w-5 h-5 text-green-600" />
                                {language === 'hi' ? 'कृषि सुझाव' : 'Farming Recommendations'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {weather.main.temp > 30 && weather.main.humidity < 40 && (
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-800">
                                            {language === 'hi'
                                                ? '🌡️ गर्म और शुष्क मौसम: सुबह जल्दी या शाम को सिंचाई करें। मल्चिंग का उपयोग करें।'
                                                : '🌡️ Hot and dry weather: Irrigate early morning or evening. Use mulching to retain moisture.'
                                            }
                                        </p>
                                    </div>
                                )}

                                {weather.main.humidity > 80 && (
                                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <p className="text-sm text-yellow-800">
                                            {language === 'hi'
                                                ? '💧 उच्च आर्द्रता: फंगल रोगों से सावधान रहें। हवा के प्रवाह को बेहतर बनाएं।'
                                                : '💧 High humidity: Watch for fungal diseases. Improve air circulation around plants.'
                                            }
                                        </p>
                                    </div>
                                )}

                                {weather.wind.speed < 2 && (
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-sm text-green-800">
                                            {language === 'hi'
                                                ? '🌬️ कम हवा: छिड़काव के लिए अच्छी स्थिति। कीटनाशकों का प्रभावी उपयोग करें।'
                                                : '🌬️ Low wind: Good conditions for spraying. Ideal time for pesticide application.'
                                            }
                                        </p>
                                    </div>
                                )}

                                {weather.clouds.all < 30 && (
                                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <p className="text-sm text-purple-800">
                                            {language === 'hi'
                                                ? '☀️ धूप वाला मौसम: फसलों की कटाई और सुखाने के लिए उत्तम समय।'
                                                : '☀️ Clear skies: Excellent conditions for harvesting and drying crops.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}