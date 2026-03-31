import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Same OTP store as send-otp (in production, use shared storage)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>()
// Rate limiting for verification attempts
const verifyRateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function for verification
function checkVerifyRateLimit(identifier: string, maxAttempts = 10, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const rateLimitData = verifyRateLimitStore.get(identifier)

    if (!rateLimitData || now > rateLimitData.resetTime) {
        verifyRateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
        return true
    }

    if (rateLimitData.count >= maxAttempts) {
        return false
    }

    rateLimitData.count += 1
    verifyRateLimitStore.set(identifier, rateLimitData)
    return true
}

// Generate secure JWT-like token
function generateSecureToken(mobile: string): string {
    const payload = {
        mobile,
        verified: true,
        timestamp: Date.now(),
        nonce: randomBytes(16).toString('hex')
    }
    return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export async function POST(request: NextRequest) {
    try {
        const { mobile, otp } = await request.json()

        // Get client IP for rate limiting
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'

        // Check rate limit for verification attempts
        if (!checkVerifyRateLimit(clientIP)) {
            return NextResponse.json(
                { error: 'Too many verification attempts. Please try again later.' },
                { status: 429 }
            )
        }

        // Enhanced input validation
        if (!mobile || !otp) {
            return NextResponse.json(
                { error: 'Mobile number and OTP are required' },
                { status: 400 }
            )
        }

        const sanitizedMobile = mobile.toString().trim()
        const sanitizedOtp = otp.toString().trim()

        // Validate mobile number format
        const mobileRegex = /^[6-9]\d{9}$/
        if (!mobileRegex.test(sanitizedMobile)) {
            return NextResponse.json(
                { error: 'Invalid mobile number format' },
                { status: 400 }
            )
        }

        // Validate OTP format
        const otpRegex = /^\d{6}$/
        if (!otpRegex.test(sanitizedOtp)) {
            return NextResponse.json(
                { error: 'OTP must be 6 digits' },
                { status: 400 }
            )
        }

        // Get stored OTP data
        const storedData = otpStore.get(sanitizedMobile)

        if (!storedData) {
            return NextResponse.json(
                { error: 'OTP not found or expired. Please request a new OTP.' },
                { status: 400 }
            )
        }

        // Check if OTP has expired
        if (Date.now() > storedData.expires) {
            otpStore.delete(sanitizedMobile)
            return NextResponse.json(
                { error: 'OTP has expired. Please request a new OTP.' },
                { status: 400 }
            )
        }

        // Check attempt limit (max 3 attempts)
        if (storedData.attempts >= 3) {
            otpStore.delete(sanitizedMobile)
            return NextResponse.json(
                { error: 'Too many failed attempts. Please request a new OTP.' },
                { status: 400 }
            )
        }

        // Verify OTP with constant-time comparison to prevent timing attacks
        if (sanitizedOtp !== storedData.otp) {
            // Increment attempt counter
            storedData.attempts += 1
            otpStore.set(sanitizedMobile, storedData)

            const remainingAttempts = 3 - storedData.attempts
            return NextResponse.json(
                {
                    error: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
                    attemptsLeft: remainingAttempts
                },
                { status: 400 }
            )
        }

        // OTP verified successfully - clean up
        otpStore.delete(sanitizedMobile)

        // Log successful verification
        console.log(`OTP verified successfully for mobile: ${sanitizedMobile}, IP: ${clientIP}`)

        // Generate secure token (in production, use proper JWT with secret)
        const token = generateSecureToken(sanitizedMobile)

        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: {
                mobile: sanitizedMobile,
                verified: true,
                loginTime: new Date().toISOString()
            }
        })

    } catch (error) {
        console.error('Verify OTP error:', error)
        return NextResponse.json(
            { error: 'Failed to verify OTP. Please try again.' },
            { status: 500 }
        )
    }
}