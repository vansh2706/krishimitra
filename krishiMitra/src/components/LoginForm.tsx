'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Eye, EyeOff, Lock, User, Phone, Shield, RefreshCw } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'

interface LoginFormProps {
    onLogin: (userData: { name: string; mobile: string }) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
    const { t, language } = useLanguage()
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        captcha: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [captchaCode, setCaptchaCode] = useState('')

    // Generate a simple captcha
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setCaptchaCode(result)
    }

    // Initialize captcha on component mount
    React.useEffect(() => {
        generateCaptcha()
    }, [])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = t('nameRequired')
        } else if (formData.name.trim().length < 2) {
            newErrors.name = t('nameMinLength')
        } else if (!/^[a-zA-Z\s\u0900-\u097F\u0980-\u09FF\u0A80-\u0AFF\u0B80-\u0BFF\u0C80-\u0CFF\u0D80-\u0DFF]+$/.test(formData.name)) {
            newErrors.name = t('nameLettersOnly')
        }

        // Mobile validation
        if (!formData.mobile.trim()) {
            newErrors.mobile = t('mobileRequired')
        } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
            newErrors.mobile = t('mobileInvalid')
        }

        // Captcha validation
        if (!formData.captcha.trim()) {
            newErrors.captcha = t('captchaRequired')
        } else if (formData.captcha !== captchaCode) {
            newErrors.captcha = t('captchaIncorrect')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // Simulate login process
            await new Promise(resolve => setTimeout(resolve, 1500))

            // In a real app, this would involve API calls for authentication
            console.log('Login successful:', formData)
            
            onLogin({
                name: formData.name,
                mobile: formData.mobile
            })
        } catch (error) {
            console.error('Login error:', error)
            setErrors({ general: t('loginError') })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">🌾</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {t('loginTitle')}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('loginSubtitle')}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {t('fullName')}
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder={t('enterFullName')}
                                className={errors.name ? 'border-red-500' : ''}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name}</p>
                            )}
                        </div>

                        {/* Mobile Field */}
                        <div className="space-y-2">
                            <Label htmlFor="mobile" className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {t('mobileNumber')}
                            </Label>
                            <Input
                                id="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="9876543210"
                                className={errors.mobile ? 'border-red-500' : ''}
                                disabled={isLoading}
                            />
                            {errors.mobile && (
                                <p className="text-red-500 text-sm">{errors.mobile}</p>
                            )}
                        </div>

                        {/* Captcha Field */}
                        <div className="space-y-2">
                            <Label htmlFor="captcha" className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {t('securityCode')}
                            </Label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        id="captcha"
                                        type="text"
                                        value={formData.captcha}
                                        onChange={(e) => handleInputChange('captcha', e.target.value)}
                                        placeholder={t('enterCaptcha')}
                                        className={errors.captcha ? 'border-red-500' : ''}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-lg px-3 py-2 bg-gray-100 dark:bg-gray-800">
                                        {captchaCode}
                                    </Badge>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={generateCaptcha}
                                        disabled={isLoading}
                                        title={t('newCaptcha')}
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            {errors.captcha && (
                                <p className="text-red-500 text-sm">{errors.captcha}</p>
                            )}
                        </div>

                        {/* General Error */}
                        {errors.general && (
                            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                                <AlertDescription className="text-red-600 dark:text-red-400">
                                    {errors.general}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    {t('loggingIn')}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    {t('secureLogin')}
                                </div>
                            )}
                        </Button>

                        {/* Security Note */}
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('securityNote')}
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}