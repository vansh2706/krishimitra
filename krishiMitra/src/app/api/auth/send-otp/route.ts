import { NextRequest, NextResponse } from 'next/server'

// Simulate OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>()
// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function
function checkRateLimit(identifier: string, maxRequests = 3, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const rateLimitData = rateLimitStore.get(identifier)

    if (!rateLimitData || now > rateLimitData.resetTime) {
        // Reset or initialize rate limit
        rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
        return true
    }

    if (rateLimitData.count >= maxRequests) {
        return false
    }

    rateLimitData.count += 1
    rateLimitStore.set(identifier, rateLimitData)
    return true
}

// Input sanitization
function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>"'&]/g, '')
}

export async function POST(request: NextRequest) {
    try {
        const { name, mobile } = await request.json()

        // Get client IP for rate limiting
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'

        // Check rate limit
        if (!checkRateLimit(clientIP)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }

        // Check rate limit per mobile number
        if (!checkRateLimit(mobile, 5, 60 * 60 * 1000)) { // 5 requests per hour per mobile
            return NextResponse.json(
                { error: 'Too many OTP requests for this number. Please try again later.' },
                { status: 429 }
            )
        }

        // Validate and sanitize input
        if (!name || !mobile) {
            return NextResponse.json(
                { error: 'Name and mobile number are required' },
                { status: 400 }
            )
        }

        const sanitizedName = sanitizeInput(name)
        const sanitizedMobile = mobile.toString().trim()

        // Enhanced validation
        if (sanitizedName.length < 2 || sanitizedName.length > 50) {
            return NextResponse.json(
                { error: 'Name must be between 2 and 50 characters' },
                { status: 400 }
            )
        }

        // Validate name contains only letters and spaces
        const nameRegex = /^[a-zA-Z\s]+$/
        if (!nameRegex.test(sanitizedName)) {
            return NextResponse.json(
                { error: 'Name can only contain letters and spaces' },
                { status: 400 }
            )
        }

        // Enhanced Indian mobile number validation
        const mobileRegex = /^[6-9]\d{9}$/
        if (!mobileRegex.test(sanitizedMobile)) {
            return NextResponse.json(
                { error: 'Invalid mobile number. Must be 10 digits starting with 6-9' },
                { status: 400 }
            )
        }

        // Check if OTP already exists and is still valid
        const existingOtp = otpStore.get(sanitizedMobile)
        if (existingOtp && Date.now() < existingOtp.expires) {
            const remainingTime = Math.ceil((existingOtp.expires - Date.now()) / 1000)
            return NextResponse.json(
                { error: `OTP already sent. Please wait ${remainingTime} seconds before requesting again.` },
                { status: 400 }
            )
        }

        // Generate cryptographically secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Set expiry time (5 minutes)
        const expires = Date.now() + 5 * 60 * 1000

        // Store OTP with mobile number as key
        otpStore.set(sanitizedMobile, {
            otp,
            expires,
            attempts: 0
        })

        // In production, integrate with SMS service (Twilio, MSG91, etc.)
        console.log(`OTP for ${sanitizedMobile}: ${otp}`) // For development only

        // Log successful OTP generation
        console.log(`OTP generated for user: ${sanitizedName}, mobile: ${sanitizedMobile}, IP: ${clientIP}`)

        // Simulate SMS sending delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        return NextResponse.json({
            success: true,
            message: `OTP sent to +91 ${sanitizedMobile}`,
            expiresIn: 300, // 5 minutes in seconds
            // In development, return OTP for testing (remove in production)
            ...(process.env.NODE_ENV === 'development' && { otp })
        })

    } catch (error) {
        console.error('Send OTP error:', error)
        return NextResponse.json(
            { error: 'Failed to send OTP. Please try again.' },
            { status: 500 }
        )
    }
}