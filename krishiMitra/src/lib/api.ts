// API configuration and helper functions for KrishiMitra
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

// Check if we're in development and API server might not be running
const isDevelopment = process.env.NODE_ENV === 'development'

// API response types
interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

interface LoginRequest {
    name: string
    contact: string
    contactType: 'phone' | 'email'
    captcha: string
}

interface LoginResponse {
    user: {
        id: string
        name: string
        contact: string
        contactType: 'phone' | 'email'
    }
    token: string
    requiresOtp: boolean
    otpSent?: boolean
}

interface OtpRequest {
    contact: string
    contactType: 'phone' | 'email'
    otp: string
}

interface OtpResponse {
    verified: boolean
    token: string
    user: {
        id: string
        name: string
        contact: string
        contactType: 'phone' | 'email'
    }
}

// Generic API call function
async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    try {
        const response = await fetch(url, defaultOptions)
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`)
        }

        return {
            success: true,
            data: data.data || data,
            message: data.message
        }
    } catch (error) {
        console.error('API call failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}

// Authentication API functions
export const authApi = {
    // Login with name, contact, and captcha
    async login(loginData: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        return apiCall<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        })
    },

    // Verify OTP
    async verifyOtp(otpData: OtpRequest): Promise<ApiResponse<OtpResponse>> {
        return apiCall<OtpResponse>('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify(otpData)
        })
    },

    // Resend OTP
    async resendOtp(contact: string, contactType: 'phone' | 'email'): Promise<ApiResponse<{ otpSent: boolean }>> {
        return apiCall<{ otpSent: boolean }>('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ contact, contactType })
        })
    },

    // Logout
    async logout(token: string): Promise<ApiResponse<{ success: boolean }>> {
        return apiCall<{ success: boolean }>('/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
    }
}

// Weather API functions
export const weatherApi = {
    async getCurrentWeather(lat: number, lon: number): Promise<ApiResponse<any>> {
        return apiCall(`/weather/current?lat=${lat}&lon=${lon}`)
    },

    async getForecast(lat: number, lon: number): Promise<ApiResponse<any>> {
        return apiCall(`/weather/forecast?lat=${lat}&lon=${lon}`)
    }
}

// Crop advisory API functions
export const cropApi = {
    async getCropAdvice(cropType: string, location: string): Promise<ApiResponse<any>> {
        return apiCall('/crop/advice', {
            method: 'POST',
            body: JSON.stringify({ cropType, location })
        })
    },

    async getPestDetection(imageData: string): Promise<ApiResponse<any>> {
        return apiCall('/crop/pest-detection', {
            method: 'POST',
            body: JSON.stringify({ image: imageData })
        })
    }
}

// Market prices API functions
export const marketApi = {
    async getPrices(crop?: string, location?: string): Promise<ApiResponse<any>> {
        const params = new URLSearchParams()
        if (crop) params.append('crop', crop)
        if (location) params.append('location', location)

        return apiCall(`/market/prices?${params.toString()}`)
    }
}

// Chat/AI API functions
export const chatApi = {
    async sendMessage(message: string, context?: any): Promise<ApiResponse<any>> {
        return apiCall('/chat/message', {
            method: 'POST',
            body: JSON.stringify({ message, context })
        })
    }
}

// Utility function to get auth token from localStorage
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('krishimitra-token')
    }
    return null
}

// Utility function to set auth token
export function setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('krishimitra-token', token)
    }
}

// Utility function to remove auth token
export function removeAuthToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('krishimitra-token')
    }
}

// Authenticated API call wrapper
export async function authenticatedApiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAuthToken()

    if (!token) {
        return {
            success: false,
            error: 'No authentication token found'
        }
    }

    return apiCall<T>(endpoint, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    })
}
