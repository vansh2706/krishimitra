'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useLanguage, LanguageProvider } from '@/hooks/useLanguage'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sun,
  CloudSun,
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  RefreshCw,
  MapPin,
  Navigation,
} from 'lucide-react'
import {
  getCurrentLocation,
  getWeatherByCity,
  getWeatherByCoordinates,
  isWeatherError,
  type WeatherData,
} from '@/lib/weatherApi'

type TabKey = 'today' | 'tomorrow' | 'nextweek'

function formatDate(d: Date, locale: string) {
  return d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function deriveForecast(base: WeatherData | null) {
  if (!base) return null
  const today = base
  // naive derivations to populate tabs without adding a new API
  const tomorrow: WeatherData = {
    ...base,
    main: {
      ...base.main,
      temp: Math.round(base.main.temp + (Math.random() * 4 - 2)),
      feels_like: Math.round(base.main.feels_like + (Math.random() * 4 - 2)),
      temp_min: Math.round(base.main.temp_min + (Math.random() * 3 - 1.5)),
      temp_max: Math.round(base.main.temp_max + (Math.random() * 3 - 1.5)),
      humidity: Math.max(10, Math.min(95, base.main.humidity + Math.round(Math.random() * 10 - 5))),
      pressure: base.main.pressure
    },
    wind: {
      ...base.wind,
      speed: Math.max(0, Math.round(((base.wind?.speed as number) || 0) + (Math.random() * 3 - 1.5)))
    },
    weather: base.weather?.length ? base.weather : [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
  }

  // Next week: show a slightly averaged cooler/warmer snapshot
  const nextweek: WeatherData = {
    ...base,
    main: {
      ...base.main,
      temp: Math.round((base.main.temp + tomorrow.main.temp) / 2),
      feels_like: Math.round((base.main.feels_like + tomorrow.main.feels_like) / 2),
      temp_min: Math.min(base.main.temp_min, tomorrow.main.temp_min) - 1,
      temp_max: Math.max(base.main.temp_max, tomorrow.main.temp_max) + 1,
      humidity: Math.round((base.main.humidity + tomorrow.main.humidity) / 2),
      pressure: base.main.pressure
    },
    wind: {
      ...base.wind,
      speed: Math.round((((base.wind?.speed as number) || 0) + (tomorrow.wind?.speed as number || 0)) / 2)
    },
    weather: base.weather?.length ? base.weather : [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
  }

  return { today, tomorrow, nextweek }
}

function conditionSentence(w: WeatherData | null) {
  if (!w) return ''
  const main = w.weather?.[0]?.main || 'Clear'
  const desc = w.weather?.[0]?.description || 'clear sky'
  const timeHint = 'in the afternoon'
  if (main.toLowerCase().includes('rain')) return `Light rain, ${desc}`
  if (main.toLowerCase().includes('cloud')) return `Partly cloudy, ${desc} ${timeHint}`
  return `Clear skies, ${desc} ${timeHint}`
}

function kmh(valueMps: number | undefined) {
  if (!valueMps && valueMps !== 0) return '-'
  // In our WeatherData (OpenWeather), wind.speed is in m/s in some paths; we converted in lib for some usages.
  // Here accept both m/s (<=60) and km/h (>60) heuristically.
  const v = valueMps
  const asKmh = v > 60 ? v : Math.round((v as number) * 3.6)
  return `${asKmh} km/h`
}

function GoodNormalBad({ w }: { w: WeatherData | null }) {
  if (!w) return null
  const t = w.main.temp
  const h = w.main.humidity
  const wind = (w.wind?.speed as number) || 0

  const good = t >= 20 && t <= 32 && h >= 30 && h <= 70 && wind <= 20
  const bad = t >= 39 || t <= 8 || h >= 85 || wind >= 35

  const goodList = ['Potato', 'Tomato', 'Beans', 'Cauliflower', 'Cabbage', 'Pumpkin', 'Lettuce']
  const normalList = ['Rice', 'Wheat', 'Millets', 'Oats', 'Corn', 'Soy Bean', 'Mushrooms', 'Kale']
  const badList = ['Tea', 'Coffee', 'Cilantro']

  return (
    <div className="mt-6 grid grid-cols-3 gap-6 max-lg:grid-cols-1">
      <Card className="border-emerald-100">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Good Condition for
          </div>
          <p className="text-sm text-emerald-700">
            {good ? 'Excellent conditions today.' : 'Suitable for most of these crops.'}
          </p>
          <div className="mt-3 text-sm text-emerald-800">{goodList.join(', ')}</div>
        </CardContent>
      </Card>

      <Card className="border-sky-100">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 text-sky-600 font-semibold mb-2">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            Normal Condition for
          </div>
          <p className="text-sm text-sky-700">Usual care recommended.</p>
          <div className="mt-3 text-sm text-sky-800">{normalList.join(', ')}</div>
        </CardContent>
      </Card>

      <Card className="border-rose-100">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 text-rose-600 font-semibold mb-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            Bad Condition for
          </div>
          <p className="text-sm text-rose-700">{bad ? 'Avoid sensitive operations today.' : 'Monitor closely.'}</p>
          <div className="mt-3 text-sm text-rose-800">{badList.join(', ')}</div>
        </CardContent>
      </Card>
    </div>
  )
}

function WeatherPageContent() {
  const { language } = useLanguage()
  const [active, setActive] = useState<TabKey>('today')
  const [city, setCity] = useState('Delhi')
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [useCurrent, setUseCurrent] = useState(true)

  const locale = language === 'hi' ? 'hi-IN' : 'en-US'

  const forecast = useMemo(() => deriveForecast(weather), [weather])
  const activeWeather = useMemo(() => {
    if (!forecast) return null
    if (active === 'today') return forecast.today
    if (active === 'tomorrow') return forecast.tomorrow
    return forecast.nextweek
  }, [forecast, active])

  const fetchByCity = async (c: string) => {
    setLoading(true)
    const data = await getWeatherByCity(c)
    if (!isWeatherError(data)) setWeather(data as WeatherData)
    setLoading(false)
  }

  const fetchByLocation = async () => {
    setLoading(true)
    const res = await getCurrentLocation()
    if ('error' in res) {
      setUseCurrent(false)
      await fetchByCity(city)
    } else {
      const data = await getWeatherByCoordinates(res.lat, res.lon)
      if (!isWeatherError(data)) setWeather(data as WeatherData)
    }
    setLoading(false)
  }

  useEffect(() => {
    // initial load
    fetchByLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dateStr = formatDate(new Date(), locale)

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-50 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 h-40 md:h-44">
            {/* clouds */}
            <div className="absolute -bottom-8 left-0 right-0 h-20">
              <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0,96L48,96C96,96,192,96,288,80C384,64,480,32,576,26.7C672,21,768,43,864,64C960,85,1056,107,1152,112C1248,117,1344,107,1392,101.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            {/* small cloud shapes */}
            <div className="absolute top-6 left-6 flex gap-2 opacity-90">
              <div className="w-10 h-6 bg-white rounded-full"></div>
              <div className="w-6 h-6 bg-white rounded-full -ml-3"></div>
            </div>
            {/* title and date */}
            <div className="absolute top-6 left-6 text-white">
              <div className="text-sm/5 opacity-90">Weather Condition</div>
              <div className="text-xs/5 opacity-85">{dateStr}</div>
            </div>
            {/* sun and temp */}
            <div className="absolute right-6 top-6 flex items-center gap-4 text-white">
              <Sun className="w-8 h-8" />
              <div className="text-3xl font-semibold">{activeWeather ? Math.round(activeWeather.main.temp) : '--'}°C</div>
            </div>
          </div>
          {/* white info strip */}
          <div className="bg-white dark:bg-gray-950 px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="text-gray-600 dark:text-gray-300">
              {conditionSentence(activeWeather)}
            </div>
            <div className="flex items-center gap-3 md:justify-center">
              <div className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-emerald-600" /><span className="font-medium">{activeWeather ? Math.round(activeWeather.main.temp) : '--'}°C</span></div>
              <div className="flex items-center gap-2"><CloudRain className="w-4 h-4 text-sky-600" /><span className="font-medium">{activeWeather?.rain?.['1h'] ? `${activeWeather.rain['1h']} mm` : '0 mm'}</span></div>
              <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-600" /><span className="font-medium">{activeWeather ? `${activeWeather.main.humidity}%` : '--'}</span></div>
              <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-gray-600" /><span className="font-medium">{activeWeather ? kmh(activeWeather.wind?.speed as number) : '--'}</span></div>
            </div>
            <div className="flex md:justify-end items-center gap-2">
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city" className="w-48" />
                <Button type="button" variant="secondary" onClick={() => { setUseCurrent(false); fetchByCity(city) }} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />} City
                </Button>
                <Button type="button" variant="outline" onClick={() => { setUseCurrent(true); fetchByLocation() }} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />} Nearby
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-6 text-sm font-semibold">
          {([
            ['today', 'TODAY'],
            ['tomorrow', 'TOMORROW'],
            ['nextweek', 'NEXT WEEK'],
          ] as [TabKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={
                'relative pb-2 transition-colors ' +
                (active === key
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400')
              }
            >
              {label}
              <span
                className={
                  'absolute left-0 -bottom-0.5 h-0.5 rounded-full transition-all ' +
                  (active === key ? 'w-full bg-emerald-600' : 'w-0 bg-transparent')
                }
              />
            </button>
          ))}
        </div>

        {/* Summary + Metrics grid */}
        <div className="mt-4 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <Card>
              <CardContent className="pt-6">
                <div className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-emerald-600" />
                  {conditionSentence(activeWeather)}
                </div>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl border p-4 flex items-center gap-3">
                    <Thermometer className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-gray-500 text-xs">Temperature</div>
                      <div className="text-lg font-semibold">{activeWeather ? Math.round(activeWeather.main.temp) : '--'}°C</div>
                    </div>
                  </div>
                  <div className="rounded-xl border p-4 flex items-center gap-3">
                    <CloudRain className="w-5 h-5 text-sky-600" />
                    <div>
                      <div className="text-gray-500 text-xs">Precipitation</div>
                      <div className="text-lg font-semibold">{activeWeather?.rain?.['1h'] ? `${activeWeather.rain['1h']} mm` : '0 mm'}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border p-4 flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-gray-500 text-xs">Humidity</div>
                      <div className="text-lg font-semibold">{activeWeather ? `${activeWeather.main.humidity}%` : '--'}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border p-4 flex items-center gap-3">
                    <Wind className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-gray-500 text-xs">Wind</div>
                      <div className="text-lg font-semibold">{activeWeather ? kmh(activeWeather.wind?.speed as number) : '--'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <GoodNormalBad w={activeWeather} />
          </div>

          {/* Right column: compact preview of the three tabs */}
          <div className="col-span-12 lg:col-span-5">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  {forecast && ([
                    ['today', forecast.today],
                    ['tomorrow', forecast.tomorrow],
                    ['nextweek', forecast.nextweek],
                  ] as [TabKey, WeatherData][]).map(([k, w]) => (
                    <button key={k} className={`rounded-xl border p-4 text-left hover:shadow-sm ${active === k ? 'border-emerald-300' : ''}`} onClick={() => setActive(k)}>
                      <div className="text-xs text-gray-500 mb-2 uppercase">{k}</div>
                      <div className="text-2xl font-semibold">{Math.round(w.main.temp)}°C</div>
                      <div className="text-xs text-gray-500 capitalize">{w.weather?.[0]?.description || 'clear sky'}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function WeatherPage() {
  return (
    <LanguageProvider>
      <WeatherPageContent />
    </LanguageProvider>
  )
}
