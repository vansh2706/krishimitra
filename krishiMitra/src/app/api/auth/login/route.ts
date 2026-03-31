import { NextRequest, NextResponse } from 'next/server'

// Temporary user storage (in production, use a proper database)
const userStore = new Map<string, {
    name: string;
    contact: string;
    contactType: 'phone' | 'email';
    id: string;
    token: string;
}>()

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function
function checkRateLimit(identifier: string, maxRequests = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const rateLimitData = rateLimitStore.get(identifier)

    if (!rateLimitData || now > rateLimitData.resetTime) {
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

// Generate simple token
function generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
    try {
        const { name, contact, contactType, captcha } = await request.json()

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

        // Validate required fields
        if (!name || !contact || !contactType || !captcha) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        // Sanitize inputs
        const sanitizedName = sanitizeInput(name)
        const sanitizedContact = contact.toString().trim()

        // Validate name
        if (sanitizedName.length < 2 || sanitizedName.length > 50) {
            return NextResponse.json(
                { error: 'Name must be between 2 and 50 characters' },
                { status: 400 }
            )
        }

        const nameRegex = /^[a-zA-Z\s]+$/
        if (!nameRegex.test(sanitizedName)) {
            return NextResponse.json(
                { error: 'Name can only contain letters and spaces' },
                { status: 400 }
            )
        }

        // Validate contact based on type
        if (contactType === 'phone') {
            const mobileRegex = /^[6-9]\d{9}$/
            if (!mobileRegex.test(sanitizedContact)) {
                return NextResponse.json(
                    { error: 'Invalid mobile number. Must be 10 digits starting with 6-9' },
                    { status: 400 }
                )
            }
        } else if (contactType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(sanitizedContact)) {
                return NextResponse.json(
                    { error: 'Invalid email address format' },
                    { status: 400 }
                )
            }
        } else {
            return NextResponse.json(
                { error: 'Contact type must be phone or email' },
                { status: 400 }
            )
        }

        // For this simple login system, we'll accept any valid captcha
        // In production, you'd validate against a stored captcha
        if (!captcha.trim()) {
            return NextResponse.json(
                { error: 'Captcha is required' },
                { status: 400 }
            )
        }

        // Generate user ID and token
        const userId = Date.now().toString() + Math.random().toString(36).substring(2)
        const token = generateToken()

        // Create user object
        const user = {
            id: userId,
            name: sanitizedName,
            contact: sanitizedContact,
            contactType: contactType as 'phone' | 'email',
            token
        }

        // Store user (in production, save to database)
        userStore.set(sanitizedContact, user)

        // Log successful login
        console.log(`User logged in: ${sanitizedName}, contact: ${sanitizedContact}, IP: ${clientIP}`)

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    contact: user.contact,
                    contactType: user.contactType
                },
                token: user.token,
                requiresOtp: false, // Simple login without OTP
                otpSent: false
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        )
    }
}

// GET method to check if login endpoint is working
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Login API is ready',
        endpoints: {
            POST: '/api/auth/login - Login with name, contact, contactType, and captcha'
        }
    })
}