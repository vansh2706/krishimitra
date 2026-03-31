'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/hooks/useLanguage'
import { getLanguageDisplayName } from '@/utils/languageDetection'
import { Loader2, RefreshCw, Shield, User, Phone, Globe, Mail, Leaf, Info, Sparkles } from 'lucide-react'
import { authApi, setAuthToken } from '@/lib/api'

import { Language } from '../hooks/useLanguage'

interface SimpleLoginPageProps {
    onLoginSuccess: (userData: { name: string; contact: string; contactType: 'phone' | 'email' }) => void
}

export default function LoginPage({ onLoginSuccess }: SimpleLoginPageProps) {
    const { t, language, setLanguage } = useLanguage()
    const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone')
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        captcha: ''
    })
    const [captchaAnswer, setCaptchaAnswer] = useState('')
    const [captchaQuestion, setCaptchaQuestion] = useState('')
    const [captchaType, setCaptchaType] = useState<'math' | 'text'>('math')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Generate enhanced captcha (math or text)
    const generateCaptcha = () => {
        const type = Math.random() > 0.5 ? 'math' : 'text'
        setCaptchaType(type)

        if (type === 'math') {
            const num1 = Math.floor(Math.random() * 15) + 1
            const num2 = Math.floor(Math.random() * 15) + 1
            const operators = ['+', '-', '*']
            const operator = operators[Math.floor(Math.random() * operators.length)]

            let answer: number
            let question: string

            switch (operator) {
                case '+':
                    answer = num1 + num2
                    question = `${num1} + ${num2}`
                    break
                case '-':
                    answer = Math.max(num1, num2) - Math.min(num1, num2)
                    question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`
                    break
                case '*':
                    const smallNum1 = Math.floor(Math.random() * 5) + 1
                    const smallNum2 = Math.floor(Math.random() * 5) + 1
                    answer = smallNum1 * smallNum2
                    question = `${smallNum1} × ${smallNum2}`
                    break
                default:
                    answer = num1 + num2
                    question = `${num1} + ${num2}`
            }

            setCaptchaQuestion(question)
            setCaptchaAnswer(answer.toString())
        } else {
            // Simple text captcha
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            let captcha = ''
            for (let i = 0; i < 5; i++) {
                captcha += characters.charAt(Math.floor(Math.random() * characters.length))
            }
            setCaptchaQuestion(captcha)
            setCaptchaAnswer(captcha)
        }
    }

    // Initialize captcha on component mount
    useEffect(() => {
        generateCaptcha()
    }, [])

    // Reset form data when login method changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            phone: '',
            email: ''
        }))
        setError('')
    }, [loginMethod])

    const validateForm = () => {
        // Validate name
        if (!formData.name.trim()) {
            setError(t('nameRequired') || 'Name is required')
            return false
        }

        if (formData.name.trim().length < 2) {
            setError(t('nameMinLength') || 'Name must be at least 2 characters')
            return false
        }

        const nameRegex = /^[a-zA-Z\s]+$/
        if (!nameRegex.test(formData.name.trim())) {
            setError(t('invalidName') || 'Name can only contain letters and spaces')
            return false
        }

        // Validate contact based on login method
        if (loginMethod === 'phone') {
            if (!formData.phone.trim()) {
                setError(t('mobileRequired') || 'Mobile number is required')
                return false
            }
            const mobileRegex = /^[6-9]\d{9}$/
            if (!mobileRegex.test(formData.phone)) {
                setError(t('invalidMobile') || 'Please enter a valid 10-digit mobile number starting with 6-9')
                return false
            }
        } else {
            if (!formData.email.trim()) {
                setError(t('emailRequired') || 'Email address is required')
                return false
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.email)) {
                setError(t('invalidEmail') || 'Please enter a valid email address')
                return false
            }
        }

        // Validate captcha
        if (!formData.captcha.trim()) {
            setError(t('captchaRequired') || 'Please solve the captcha')
            return false
        }

        if (formData.captcha.toUpperCase() !== captchaAnswer.toUpperCase()) {
            setError(t('invalidCaptcha') || 'Incorrect captcha. Please try again.')
            generateCaptcha()
            setFormData(prev => ({ ...prev, captcha: '' }))
            return false
        }

        return true
    }

    const handleLogin = async () => {
        if (!validateForm()) return

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            // Call the real login API
            const loginData = {
                name: formData.name.trim(),
                contact: loginMethod === 'phone' ? formData.phone : formData.email,
                contactType: loginMethod,
                captcha: formData.captcha
            }

            const response = await authApi.login(loginData)

            if (!response.success) {
                setError(response.error || t('loginError') || 'Login failed. Please try again.')
                return
            }

            // Handle successful login
            if (response.data) {
                if (response.data.requiresOtp) {
                    // OTP verification required
                    setSuccess(t('otpSent') || 'OTP sent successfully!')
                    // You can implement OTP verification UI here
                    // For now, we'll proceed with login
                } else {
                    // Direct login success
                    if (response.data.token) {
                        setAuthToken(response.data.token)
                    }
                    setSuccess(t('loginSuccess') || 'Login successful!')
                }

                // Call parent callback with user data
                setTimeout(() => {
                    onLoginSuccess({
                        name: response.data!.user.name,
                        contact: response.data!.user.contact,
                        contactType: response.data!.user.contactType
                    })
                }, 1000)
            }

        } catch (err) {
            console.error('Login error:', err)
            setError(t('networkError') || 'Network error. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        let sanitizedValue = value

        if (field === 'name') {
            sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50)
        } else if (field === 'phone') {
            sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 10)
        } else if (field === 'email') {
            sanitizedValue = value.slice(0, 50)
        } else if (field === 'captcha') {
            sanitizedValue = value.slice(0, 10)
        }

        setFormData(prev => ({ ...prev, [field]: sanitizedValue }))
        setError('')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md shadow-lg border-0">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto mb-4 flex items-center justify-center">
                        <img
                            src="/krishimitra-logo.jpg"
                            alt="KrishiMitra Logo"
                            className="h-12 w-auto"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {t('welcomeFarmer') || 'Welcome My Farmer Friend!'}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                        {t('loginSubtitle') || 'Start your agricultural journey'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Language Selector */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <Globe className="h-4 w-4" />
                            {t('supportedLanguages') || 'Supported Languages'}
                        </Label>
                        <div className="grid grid-cols-4 gap-2">
                            <Button
                                variant={language === 'en' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('en')}
                                className="text-xs py-2 transition-all duration-200 hover:scale-105"
                            >
                                🇺🇸 EN
                            </Button>
                            <Button
                                variant={language === 'hi' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('hi')}
                                className="text-xs py-2 transition-all duration-200 hover:scale-105"
                            >
                                🇮🇳 हिं
                            </Button>
                            <Button
                                variant={language === 'ta' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('ta')}
                                className="text-xs py-2 transition-all duration-200 hover:scale-105"
                            >
                                🇮🇳 தமி
                            </Button>
                            <Button
                                variant={language === 'te' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('te')}
                                className="text-xs py-2 transition-all duration-200 hover:scale-105"
                            >
                                🇮🇳 తెలు
                            </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <Button
                                variant={language === 'bn' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('bn')}
                                className="text-xs py-2 transition-all duration-200 hover:scale-105"
                            >
                                🇧🇩 বাং
                            </Button>
                            <Button
                                variant={language === 'gu' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('gu')}
                                className="text-xs py-2 transition-all duration-200 hover:scale-105"
                            >
                                🇮🇳 ગુજ
                            </Button>
                            <Button
                                variant={language === 'mr' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('mr')}
                                className="text-xs py-2 transition-all duration-200 hover:scale-105"
                            >
                                🇮🇳 मरा
                            </Button>
                            <Button
                                variant={language === 'pa' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('pa')}
                                className="text-xs py-2 transition-all duration-200 hover:scale-105"
                            >
                                🇮🇳 ਪੰਜ
                            </Button>
                        </div>
                    </div>

                    {/* Login Method Selector */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            {t('loginMethod') || 'Login Method'}
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant={loginMethod === 'phone' ? 'default' : 'outline'}
                                onClick={() => setLoginMethod('phone')}
                                className="flex items-center gap-2 py-5 transition-all duration-300 hover:shadow-md"
                            >
                                <Phone className="h-5 w-5" />
                                <span>{t('mobileNumber') || 'Mobile'}</span>
                            </Button>
                            <Button
                                variant={loginMethod === 'email' ? 'default' : 'outline'}
                                onClick={() => setLoginMethod('email')}
                                className="flex items-center gap-2 py-5 transition-all duration-300 hover:shadow-md"
                            >
                                <Mail className="h-5 w-5" />
                                <span>{t('emailAddress') || 'Email'}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t('fullName') || 'Full Name'}
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder={t('enterFullName') || 'Enter your full name'}
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full py-5 transition-all duration-300 focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Contact Field */}
                    <div className="space-y-2">
                        <Label htmlFor="contact" className="flex items-center gap-2">
                            {loginMethod === 'phone' ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                            {loginMethod === 'phone' ? (t('mobileNumber') || 'Mobile Number') : (t('emailAddress') || 'Email Address')}
                        </Label>
                        {loginMethod === 'phone' ? (
                            <div className="flex">
                                <div className="flex items-center px-4 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    +91
                                </div>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder={t('enterMobile') || 'Enter 10-digit mobile number'}
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="rounded-l-none py-5 transition-all duration-300 focus:ring-2 focus:ring-green-500"
                                    maxLength={10}
                                />
                            </div>
                        ) : (
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('enterEmail') || 'Enter your email address'}
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full py-5 transition-all duration-300 focus:ring-2 focus:ring-green-500"
                            />
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {loginMethod === 'phone'
                                ? (t('mobileHint') || 'Enter your 10-digit mobile number')
                                : (t('emailHint') || 'Enter a valid email address')
                            }
                        </p>
                    </div>

                    {/* Enhanced Captcha */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {t('captcha') || 'Security Check'}
                            <span className="text-xs text-gray-500 ml-auto">
                                {captchaType === 'math' ? t('solveMath') || 'Solve' : t('enterText') || 'Type exactly'}
                            </span>
                        </Label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-mono text-lg border-2 border-dashed min-h-[56px] flex items-center justify-center transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                {captchaType === 'math' ? (
                                    <span className="text-xl font-bold">{captchaQuestion} = ?</span>
                                ) : (
                                    <span className="tracking-wider font-bold text-xl">
                                        {captchaQuestion}
                                    </span>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={generateCaptcha}
                                className="p-3 transition-all duration-300 hover:scale-110"
                                title={t('refreshCaptcha') || 'Refresh captcha'}
                            >
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                        <Input
                            type="text"
                            placeholder={captchaType === 'math' ? (t('enterAnswer') || 'Enter answer') : (t('typeExactly') || 'Type exactly as shown')}
                            value={formData.captcha}
                            onChange={(e) => handleInputChange('captcha', e.target.value)}
                            className="w-full py-5 transition-all duration-300 focus:ring-2 focus:ring-green-500"
                            autoComplete="off"
                        />
                    </div>

                    {/* Login Button */}
                    <Button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 py-6 text-base transition-all duration-300 hover:shadow-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {t('loggingIn') || 'Logging in...'}
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-5 w-5" />
                                {t('secureLogin') || 'Secure Login'}
                            </>
                        )}
                    </Button>

                    {/* Security Note */}
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" />
                        {t('securityNote') || '🔒 Your information is secure and will only be used for agricultural advice'}
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}