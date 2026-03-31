"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CropPriceSelector } from "../components/CropPriceSelector";
import {
  Sprout,
  CloudSun,
  Bug,
  TrendingUp,
  MessageSquare,
  Globe,
  Leaf,
  Droplets,
  Sun,
  AlertTriangle,
  Moon,
  Wifi,
  WifiOff,
  Calculator,
  MessageCircle,
  ChevronDown,
  Volume2,
  VolumeX,
  LogOut,
  User,
  Calendar,
  BarChart3,
  Zap,
  Home,
} from "lucide-react";

import EnhancedChatBot from "../components/EnhancedChatBot";
import { WeatherDashboard } from "../components/WeatherDashboard";
import { SoilGuide } from "../components/SoilGuide";
import { EnhancedPestDetection } from "../components/EnhancedPestDetection";
import { EnhancedMarketPrices } from "../components/EnhancedMarketPrices";
import { CostBenefitAnalysis } from "../components/CostBenefitAnalysis";
import { AdvisoryFeedback } from "../components/AdvisoryFeedback";
import { PredictiveAnalyticsDashboard } from "../components/PredictiveAnalyticsDashboard";
import { IoTDashboard } from "../components/IoTDashboard";
import { EnergyOptimizationDashboard } from "../components/EnergyOptimizationDashboard";

import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";
import {
  getLanguageDisplayText,
  getLanguageDisplayEmoji,
} from "@/hooks/useLanguageFallback";
import { cleanupOldData } from "@/lib/offlineStorage";
import {
  getWeatherByCity,
  getCurrentLocation,
  getWeatherByCoordinates,
  formatTemperature,
  getWeatherAlerts,
  type WeatherData,
  isWeatherError,
} from "@/lib/weatherApi";
import ClientOnly from "@/components/ClientOnly";

function App() {
  const router = useRouter();
  const { language, setLanguage, t, isOnline, isDarkMode, toggleDarkMode } =
    useLanguage();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null,
  );
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check for authentication and cleanup old data
  useEffect(() => {
    // Only run after hydration
    if (!isHydrated) return;

    // Check authentication
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const storedAuth = localStorage.getItem("userAuth");
        if (storedAuth) {
          try {
            const parsed = JSON.parse(storedAuth);
            setUserData(parsed);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Invalid auth data:", error);
            localStorage.removeItem("userAuth");
          }
        }
      }
      setAuthLoading(false);
    };

    checkAuth();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setVoiceEnabled(true);
    }
    // Clean up old offline data on app start
    cleanupOldData();

    // Don't fetch weather immediately on load - wait for user interaction
    // fetchCurrentWeather() - Removed this line
  }, [isHydrated]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Logout function
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userAuth");
    }
    setIsAuthenticated(false);
    setUserData(null);
    router.push("/login");
  };

  // Refresh weather when coming back online
  useEffect(() => {
    if (isOnline && !currentWeather) {
      fetchCurrentWeather();
    }
  }, [isOnline]);

  // Fetch weather data for dashboard tile - only when needed
  const fetchCurrentWeather = async () => {
    // Only fetch if we haven't already fetched or if forced refresh
    if (currentWeather && !weatherLoading) {
      return;
    }

    if (!isOnline) {
      setWeatherLoading(false);
      return;
    }

    try {
      setWeatherLoading(true);

      // Try to get user's location first
      const locationResult = await getCurrentLocation();

      if ("error" in locationResult) {
        // Fallback to Delhi if location access fails
        const weatherData = await getWeatherByCity("Delhi");
        if (!isWeatherError(weatherData)) {
          setCurrentWeather(weatherData);
        }
      } else {
        // Use current location
        const weatherData = await getWeatherByCoordinates(
          locationResult.lat,
          locationResult.lon,
        );
        if (!isWeatherError(weatherData)) {
          setCurrentWeather(weatherData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch weather for dashboard:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuOpen) {
        setLanguageMenuOpen(false);
      }
    };

    if (languageMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [languageMenuOpen]);

  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const speak = (text: string) => {
    if (voiceEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      // Set language based on current selection
      const langMap: { [key: string]: string } = {
        en: "en-US",
        hi: "hi-IN",
        ta: "ta-IN",
        te: "te-IN",
        bn: "bn-BD",
        gu: "gu-IN",
        mr: "mr-IN",
        pa: "pa-IN",
      };

      utterance.lang = langMap[language] || "en-US";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Set voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find((voice) =>
        voice.lang.startsWith(langMap[language] || "en"),
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Show loading while checking auth or hydrating
  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">&#127774;</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {!isHydrated ? "Initializing..." : "Loading KrishiMitra..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800 p-6 transition-all duration-300">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        {/* App Header with Logo */}
        <div className="flex flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src="/krishimitra-logo.jpg"
              alt="KrishiMitra Logo"
              className="h-14 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                KrishiMitra
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("appSubtitle")}
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center gap-2 px-3 py-2"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">
                  {getLanguageDisplayText(language)}
                </span>
                <ChevronDown className="w-3 h-3" />
              </Button>
              {languageMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50 min-w-[160px]">
                  {["en", "hi", "ta", "te", "bn", "gu", "mr", "pa"].map(
                    (lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang as any);
                          setLanguageMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        {getLanguageDisplayEmoji(lang)}{" "}
                        {getLanguageDisplayText(lang)}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* User Info and Logout */}
            {userData && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{userData.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="p-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            )}

            {/* Voice Control Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoice}
              className="p-2"
              title={
                voiceEnabled ? "Disable Voice Output" : "Enable Voice Output"
              }
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4 text-green-600" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2"
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Online Status */}
            <div className="flex items-center gap-1">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {t("offlineMode")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {t("welcomeFarmer")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base max-w-2xl mx-auto">
            {t("appSubtitle")}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className="p-5 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setActiveTab("weather");
              // Only fetch weather when user clicks on the weather card
              if (!currentWeather) {
                fetchCurrentWeather();
              }
            }}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("todayWeather")}
                </div>
                <div className="font-semibold">
                  {weatherLoading ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : currentWeather ? (
                    <div className="flex items-center gap-2">
                      <span>{formatTemperature(currentWeather.main.temp)}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {currentWeather.weather[0]?.description || ""}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">--°C</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <CropPriceSelector voiceEnabled={voiceEnabled} onSpeak={speak} />

          <Card
            className="p-5 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setActiveTab("weather");
              // Only fetch weather when user clicks on the alerts card
              if (!currentWeather) {
                fetchCurrentWeather();
              }
            }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("alerts")}
                </div>
                <div className="font-semibold">
                  {weatherLoading ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : currentWeather ? (
                    <>
                      {getWeatherAlerts(currentWeather, language).length > 0 ? (
                        <div className="flex flex-col">
                          {getWeatherAlerts(currentWeather, language)
                            .slice(0, 2)
                            .map((alert: string, index: number) => (
                              <span
                                key={index}
                                className="text-orange-600 text-sm"
                              >
                                {alert}
                              </span>
                            ))}
                          {getWeatherAlerts(currentWeather, language).length >
                            2 && (
                            <span className="text-orange-600 text-sm">
                              +
                              {getWeatherAlerts(currentWeather, language)
                                .length - 2}{" "}
                              more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-green-600 text-sm">
                          {t("noAlertsForLocation")}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      {t("noAlertsForLocation")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modern Dashboard Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        {/* Top Navigation Bar - Large Rounded Tabs with Light Backgrounds */}
        <div className="flex flex-wrap gap-3 mb-6 p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "dashboard"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">{t("dashboard")}</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "calendar"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">{t("calendar")}</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "chat"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">{t("advisor")}</span>
          </button>

          <button
            onClick={() => setActiveTab("weather")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "weather"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <CloudSun className="w-5 h-5" />
            <span className="font-medium">{t("weather")}</span>
          </button>

          <button
            onClick={() => setActiveTab("soil")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "soil"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <Leaf className="w-5 h-5" />
            <span className="font-medium">{t("soil")}</span>
          </button>

          <button
            onClick={() => setActiveTab("pest")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "pest"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <Bug className="w-5 h-5" />
            <span className="font-medium">{t("pest")}</span>
          </button>

          <button
            onClick={() => setActiveTab("market")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "market"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">{t("market")}</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "analytics"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">{t("analytics")}</span>
          </button>

          <button
            onClick={() => setActiveTab("energy")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "energy"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="font-medium">
              {language === "hi" ? "ऊर्जा" : "Energy"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("iot")}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 ${
              activeTab === "iot"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner border border-gray-200 dark:border-gray-600"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <Wifi className="w-5 h-5" />
            <span className="font-medium">IoT</span>
          </button>

          <button
            onClick={() => router.push('/history')}
            className="flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-5 rounded-xl transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border border-purple-300 dark:border-purple-700 shadow-sm"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">{language === "hi" ? "इतिहास" : "History"}</span>
          </button>
        </div>

        {/* Secondary Feature Row - Rounded Buttons/Cards */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <button
              onClick={() => setActiveTab("pest")}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/80 transition-all duration-200 shadow-sm min-h-[90px]"
            >
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Bug className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {t("pest")}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("cost")}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/80 transition-all duration-200 shadow-sm min-h-[90px]"
            >
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {t("costBenefit")}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/80 transition-all duration-200 shadow-sm min-h-[90px]"
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {t("analytics")}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("energy")}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/80 transition-all duration-200 shadow-sm min-h-[90px]"
            >
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {language === "hi" ? "ऊर्जा" : "Energy"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("iot")}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/80 transition-all duration-200 shadow-sm min-h-[90px]"
            >
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Wifi className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                IoT
              </span>
            </button>

            <button
              onClick={() => router.push('/history')}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border-2 border-pink-200 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-200 shadow-sm min-h-[90px] hover:shadow-md"
            >
              <div className="p-3 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg">
                <User className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {language === "hi" ? "इतिहास" : "History"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* First Row of Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => setActiveTab("chat")}
              >
                <div className="border-l-4 border-blue-500 h-full rounded-l-2xl">
                  <div className="h-full p-6 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {t("aiAdvisor")}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {t("aiAdvisorDesc")}
                      </p>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        {t("askAnything")}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => setActiveTab("weather")}
              >
                <div className="border-l-4 border-yellow-500 h-full rounded-l-2xl">
                  <div className="h-full p-6 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <CloudSun className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {t("weatherAlerts")}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {t("weatherAlertsDesc")}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        {t("realTimeData")}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => setActiveTab("soil")}
              >
                <div className="border-l-4 border-green-500 h-full rounded-l-2xl">
                  <div className="h-full p-6 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {t("soilFertilizer")}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {t("soilFertilizerDesc")}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        {t("getRecommendations")}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </div>

            {/* Divider Line */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white dark:bg-gray-900 px-3 sm:px-4">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                </div>
              </div>
            </div>

            {/* Second Row of Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => setActiveTab("pest")}
              >
                <div className="border-l-4 border-red-500 h-full rounded-l-2xl">
                  <div className="h-full p-6 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Bug className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {t("pestDetection")}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {t("pestDetectionDesc")}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                        >
                          {t("uploadPhoto")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open camera directly
                            const fileInput = document.createElement("input");
                            fileInput.type = "file";
                            fileInput.accept = "image/*";
                            fileInput.capture = "environment";
                            fileInput.onchange = (ev) => {
                              const file = (ev.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                // Handle file upload
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  // Navigate to pest tab and trigger analysis
                                  setActiveTab("pest");
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            fileInput.click();
                          }}
                        >
                          📷 {t("useCamera")}
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => setActiveTab("market")}
              >
                <div className="border-l-4 border-purple-500 h-full rounded-l-2xl">
                  <div className="h-full p-6 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {t("marketPrices")}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {t("marketPricesDesc")}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        {t("liveRates")}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => setActiveTab("cost")}
              >
                <div className="border-l-4 border-indigo-500 h-full rounded-l-2xl">
                  <div className="h-full p-6 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Calculator className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {t("costBenefit")}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {t("profitCalculator")}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        {t("profitCalculator")}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </div>

            {/* Divider Line */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white dark:bg-gray-900 px-3 sm:px-4">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                </div>
              </div>
            </div>

            {/* Third Row of Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => setActiveTab("analytics")}
              >
                <div className="border-l-4 border-cyan-500 h-full rounded-l-2xl">
                  <div className="h-full p-6 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {t("analytics")}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {t("predictiveAnalyticsDesc")}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        {t("viewAnalytics")}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => setActiveTab("iot")}
              >
                <div className="border-l-4 border-teal-500 h-full rounded-l-2xl">
                  <div className="h-full p-6 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                            <Zap className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {language === "hi"
                              ? "IoT और ड्रोन"
                              : "IoT & Drones"}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {language === "hi"
                          ? "सेंसर, ड्रोन छवियों और स्वचालित सिंचाई के साथ फील्ड मॉनिटरिंग"
                          : "Field monitoring with sensors, drone imagery, and automated irrigation"}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        {language === "hi" ? "देखें" : "View"}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => setActiveTab("energy")}
              >
                <div className="border-l-4 border-green-500 h-full rounded-l-2xl">
                  <div className="h-full p-6 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {language === "hi"
                              ? "ऊर्जा अनुकूलन"
                              : "Energy Optimization"}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {language === "hi"
                          ? "ऊर्जा दक्षता और लागत बचत के लिए समाधान"
                          : "Solutions for energy efficiency and cost savings"}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 w-full py-5 text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        {language === "hi" ? "देखें" : "View"}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Other Tab Content */}
        {activeTab === "calendar" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("cropCalendar")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("cropCalendarDesc")}
            </p>
            <Button
              onClick={() => router.push("/crop-calendar")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {t("viewFullCalendar")}
            </Button>
          </div>
        )}

        {activeTab === "chat" &&
          (isTabLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <EnhancedChatBot voiceEnabled={voiceEnabled} onSpeak={speak} />
          ))}

        {activeTab === "weather" && (
          <WeatherDashboard voiceEnabled={voiceEnabled} onSpeak={speak} />
        )}

        {activeTab === "soil" && (
          <SoilGuide voiceEnabled={voiceEnabled} onSpeak={speak} />
        )}

        {activeTab === "pest" && (
          <EnhancedPestDetection voiceEnabled={voiceEnabled} onSpeak={speak} />
        )}

        {activeTab === "market" && (
          <EnhancedMarketPrices voiceEnabled={voiceEnabled} onSpeak={speak} />
        )}

        {activeTab === "cost" && (
          <CostBenefitAnalysis voiceEnabled={voiceEnabled} onSpeak={speak} />
        )}

        {activeTab === "feedback" && (
          <AdvisoryFeedback voiceEnabled={voiceEnabled} onSpeak={speak} />
        )}

        {activeTab === "analytics" && (
          <PredictiveAnalyticsDashboard
            voiceEnabled={voiceEnabled}
            onSpeak={speak}
          />
        )}

        {activeTab === "energy" && (
          <EnergyOptimizationDashboard
            voiceEnabled={voiceEnabled}
            onSpeak={speak}
          />
        )}

        {activeTab === "iot" && (
          <IoTDashboard voiceEnabled={voiceEnabled} onSpeak={speak} />
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors-smooth">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">{t("footerText")}</p>
          <div className="flex flex-row justify-center items-center gap-4">
            <span>
              {t("supportedLanguages")}: English, हिंदी, தமிழ், తెలుగు, বাংলা,
              ગુજરાતી, मराठी, ਪੰਜਾਬੀ
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span>Status: {isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">&#x1F33E;</span>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-gray-600">Initializing KrishiMitra...</p>
          </div>
        </div>
      }
    >
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ClientOnly>
  );
}
