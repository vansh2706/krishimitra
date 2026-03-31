'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Phone,
    Mail,
    Loader2,
    ArrowRight,
    CheckCircle,
    Lock,
    Award,
    Users,
    Heart,
    Sparkles,
    User
} from 'lucide-react'
import { useLanguage, LanguageProvider } from '@/hooks/useLanguage'
import ClientOnly from '@/components/ClientOnly'
import { useAuth } from '@/contexts/AuthContext'
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth'
import { auth } from '@/lib/firebase'

// Google OAuth Icon Component
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
)

function LoginPageContent() {
    const router = useRouter()
    const { t } = useLanguage()
    const { user, loading: authLoading, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithPhone, error: authError, setError } = useAuth()
    
    const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone')
    const [isSignUp, setIsSignUp] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState('')
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)

    // Initialize reCAPTCHA verifier for phone auth (after component mounts)
    useEffect(() => {
        if (typeof window !== 'undefined' && !recaptchaVerifier) {
            try {
                // Wait for DOM to be ready
                const container = document.getElementById('recaptcha-container');
                if (container) {
                    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                        size: 'invisible',
                        callback: () => {
                            console.log('reCAPTCHA solved');
                        },
                        'expired-callback': () => {
                            console.log('reCAPTCHA expired');
                        }
                    });
                    setRecaptchaVerifier(verifier);
                }
            } catch (error) {
                console.error('Error initializing reCAPTCHA:', error);
            }
        }
        
        // Cleanup function
        return () => {
            if (recaptchaVerifier) {
                recaptchaVerifier.clear();
            }
        };
    }, []); // Run only once on mount

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            setSuccess('Login successful! Redirecting...')
            setTimeout(() => {
                router.push('/')
            }, 1500)
        }
    }, [user, router])

    const validateForm = () => {
        if (loginMethod === 'email') {
            if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setError('Please enter a valid email address')
                return false
            }
            if (isSignUp && !formData.name.trim()) {
                setError('Name is required for sign up')
                return false
            }
            if (!formData.password || formData.password.length < 6) {
                setError('Password must be at least 6 characters')
                return false
            }
        } else if (loginMethod === 'phone') {
            if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone)) {
                setError('Please enter a valid 10-digit mobile number')
                return false
            }
            if (isSignUp && !formData.name.trim()) {
                setError('Name is required')
                return false
            }
        }
        return true
    }

    const handleEmailAuth = async () => {
        if (!validateForm()) return

        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                await signUpWithEmail(formData.email, formData.password, formData.name)
                setSuccess('Account created successfully! Redirecting...')
            } else {
                await signInWithEmail(formData.email, formData.password)
                setSuccess('Login successful! Redirecting...')
            }
        } catch (err: any) {
            console.error('Email auth error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePhoneAuth = async () => {
        if (!validateForm()) return

        setLoading(true)
        setError(null)

        try {
            if (!recaptchaVerifier) {
                // Try to initialize recaptcha if not already done
                try {
                    const container = document.getElementById('recaptcha-container');
                    if (container) {
                        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                            size: 'invisible',
                            callback: () => {
                                console.log('reCAPTCHA solved');
                            }
                        });
                        setRecaptchaVerifier(verifier);
                        
                        // Use the newly created verifier
                        const phoneNumber = `+91${formData.phone}`;
                        const confirmation = await signInWithPhone(phoneNumber, verifier);
                        setConfirmationResult(confirmation);
                        setOtpSent(true);
                        setSuccess('OTP sent successfully! Check your phone.');
                        setLoading(false);
                        return;
                    }
                } catch (initError) {
                    console.error('Error initializing reCAPTCHA:', initError);
                }
                
                setError('Please refresh the page and try again');
                setLoading(false);
                return;
            }

            const phoneNumber = `+91${formData.phone}`
            const confirmation = await signInWithPhone(phoneNumber, recaptchaVerifier)
            setConfirmationResult(confirmation)
            setOtpSent(true)
            setSuccess('OTP sent successfully! Check your phone.')
        } catch (err: any) {
            console.error('Phone auth error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP')
            return
        }

        setLoading(true)
        setError(null)

        try {
            if (!confirmationResult) {
                setError('Please request OTP first')
                return
            }

            await confirmationResult.confirm(otp)
            
            // Update profile with name if sign up
            if (isSignUp && formData.name && auth.currentUser) {
                const { updateProfile } = await import('firebase/auth')
                await updateProfile(auth.currentUser, {
                    displayName: formData.name
                })
            }

            setSuccess('Phone verified successfully! Redirecting...')
        } catch (err: any) {
            setError('Invalid OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        setLoading(true)
        setError(null)
        setSuccess('')

        try {
            await signInWithGoogle()
            setSuccess('Google login successful! Redirecting...')
        } catch (err: any) {
            // Error already handled in AuthContext
            // Only log for debugging
            if (err.message && !err.message.includes('cancelled')) {
                console.error('Google auth error:', err)
            }
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
        } else if (field === 'otp') {
            sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 6)
        }

        if (field === 'otp') {
            setOtp(sanitizedValue)
        } else {
            setFormData(prev => ({ ...prev, [field]: sanitizedValue }))
        }
        setError(null)
    }

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">🌾</span>
                    </div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading KrishiMitra...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800 flex items-center justify-center p-4">
            {/* Hidden reCAPTCHA container */}
            <div id="recaptcha-container"></div>

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Welcome Message */}
                <div className="hidden lg:flex flex-col justify-center p-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white shadow-xl">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🌾</span>
                            </div>
                            <h1 className="text-3xl font-bold">KrishiMitra</h1>
                        </div>

                        <h2 className="text-2xl font-semibold">Welcome, Farmer Friend!</h2>

                        <p className="text-green-100">
                            Your trusted companion for smart farming decisions. Get real-time insights,
                            expert advice, and market information right at your fingertips.
                        </p>

                        <div className="space-y-4 mt-8">
                            <div className="flex items-start gap-3">
                                <Award className="h-6 w-6 text-yellow-300 mt-1" />
                                <div>
                                    <h3 className="font-semibold">Expert Agricultural Advice</h3>
                                    <p className="text-green-100 text-sm">AI-powered guidance for better yields</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Users className="h-6 w-6 text-yellow-300 mt-1" />
                                <div>
                                    <h3 className="font-semibold">Community Support</h3>
                                    <p className="text-green-100 text-sm">Connect with fellow farmers</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Heart className="h-6 w-6 text-yellow-300 mt-1" />
                                <div>
                                    <h3 className="font-semibold">Personalized Experience</h3>
                                    <p className="text-green-100 text-sm">Tailored to your crops and location</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Sparkles className="h-6 w-6 text-yellow-300 mt-1" />
                                <div>
                                    <h3 className="font-semibold">Real-Time Market Prices</h3>
                                    <p className="text-green-100 text-sm">Updated crop prices from mandis</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-green-600/30 rounded-lg">
                            <p className="text-sm text-green-100">
                                <span className="font-semibold">🔒 Secure & Private:</span> Your data is protected with
                                Firebase Authentication and never shared without your consent.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <Card className="w-full shadow-xl border-0">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4 lg:hidden">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-2xl">🌾</span>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isSignUp ? 'Sign up to get started' : 'Sign in to access your dashboard'}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {!otpSent ? (
                            <>
                                {/* Login Method Tabs */}
                                <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as 'phone' | 'email')}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="phone" className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Mobile
                                        </TabsTrigger>
                                        <TabsTrigger value="email" className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="phone" className="space-y-4 mt-6">
                                        {/* Name field for sign up */}
                                        {isSignUp && (
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                        )}

                                        {/* Phone field */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                Mobile Number
                                            </Label>
                                            <div className="flex">
                                                <div className="flex items-center px-4 bg-gray-100 dark:bg-gray-800 border border-r-0 rounded-l-lg text-sm font-medium">
                                                    +91
                                                </div>
                                                <Input
                                                    type="tel"
                                                    placeholder="Enter 10-digit mobile number"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className="rounded-l-none"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handlePhoneAuth}
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    Sending OTP...
                                                </>
                                            ) : (
                                                <>
                                                    <Phone className="w-5 h-5 mr-2" />
                                                    Send OTP
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="email" className="space-y-4 mt-6">
                                        {/* Google Login */}
                                        <div className="space-y-4">
                                            <Button
                                                onClick={handleGoogleAuth}
                                                disabled={loading}
                                                variant="outline"
                                                className="w-full py-6 transition-all duration-300 hover:shadow-md"
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                ) : (
                                                    <GoogleIcon />
                                                )}
                                                <span className="ml-3">Continue with Google</span>
                                            </Button>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <span className="w-full border-t border-gray-300" />
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-white dark:bg-gray-900 px-3 text-gray-500">Or with email</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Name field for sign up */}
                                        {isSignUp && (
                                            <div className="space-y-2">
                                                <Label htmlFor="email-name" className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="email-name"
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                        )}

                                        {/* Email field */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                Email Address
                                            </Label>
                                            <Input
                                                type="email"
                                                placeholder="Enter your email address"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>

                                        {/* Password field */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                Password
                                            </Label>
                                            <Input
                                                type="password"
                                                placeholder="Enter password (min 6 characters)"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>

                                        <Button
                                            onClick={handleEmailAuth}
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    {isSignUp ? 'Creating Account...' : 'Logging in...'}
                                                </>
                                            ) : success ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 mr-2" />
                                                    Success!
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-5 h-5 mr-2" />
                                                    {isSignUp ? 'Sign Up' : 'Sign In'}
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </TabsContent>
                                </Tabs>

                                {/* Toggle Sign Up / Sign In */}
                                <div className="text-center text-sm">
                                    <button
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-green-600 hover:text-green-700 font-medium"
                                        disabled={loading}
                                    >
                                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* OTP Verification Screen */
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                    <h3 className="text-lg font-semibold">Verify OTP</h3>
                                    <p className="text-sm text-gray-600">Enter the 6-digit code sent to your phone</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>OTP Code</Label>
                                    <Input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => handleInputChange('otp', e.target.value)}
                                        disabled={loading}
                                        className="text-center text-2xl tracking-widest"
                                        maxLength={6}
                                    />
                                </div>

                                <Button
                                    onClick={handleVerifyOTP}
                                    disabled={loading || otp.length !== 6}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-700"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Verify OTP
                                        </>
                                    )}
                                </Button>

                                <button
                                    onClick={() => {
                                        setOtpSent(false)
                                        setOtp('')
                                        setConfirmationResult(null)
                                    }}
                                    className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
                                    disabled={loading}
                                >
                                    Change phone number
                                </button>
                            </div>
                        )}

                        {/* Messages */}
                        {(authError || success) && (
                            <Alert variant={authError ? "destructive" : "default"} className={!authError ? "border-green-200 bg-green-50 text-green-800" : ""}>
                                <AlertDescription>{authError || success}</AlertDescription>
                            </Alert>
                        )}

                        {/* Security Note */}
                        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                            <Lock className="w-3 h-3 inline mr-1" />
                            Secured with Firebase Authentication
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <ClientOnly fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">🌾</span>
                    </div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-gray-600">Loading KrishiMitra...</p>
                </div>
            </div>
        }>
            <LanguageProvider>
                <LoginPageContent />
            </LanguageProvider>
        </ClientOnly>
    )
}
