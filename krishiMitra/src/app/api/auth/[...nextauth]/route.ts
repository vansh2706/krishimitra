import NextAuth, { User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        user: {
            id?: string
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }
}

// Check if required environment variables are available
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET

// Use VERCEL_URL for Vercel deployments, fallback to localhost for local development
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

console.log("NextAuth Environment Variables Check:")
console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "Present" : "Missing")
console.log("GOOGLE_CLIENT_SECRET:", GOOGLE_CLIENT_SECRET ? "Present" : "Missing")
console.log("NEXTAUTH_SECRET:", NEXTAUTH_SECRET ? "Present" : "Missing")
console.log("NEXTAUTH_URL:", NEXTAUTH_URL)

// Only configure GoogleProvider if credentials are available
const providers = []
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CLIENT_ID.trim() !== "" && GOOGLE_CLIENT_SECRET.trim() !== "") {
    console.log("Configuring GoogleProvider with provided credentials")
    try {
        providers.push(
            GoogleProvider({
                clientId: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                authorization: {
                    params: {
                        prompt: "select_account", // This will force Google to show account selection
                        access_type: "offline",
                        response_type: "code"
                    }
                }
            })
        )
        console.log("GoogleProvider configured successfully")
    } catch (error) {
        console.error("Error configuring GoogleProvider:", error)
    }
} else {
    console.log("GoogleProvider not configured due to missing or invalid credentials")
}

// Ensure we have a secret
if (!NEXTAUTH_SECRET) {
    console.error("NEXTAUTH_SECRET is required for NextAuth to function properly")
}

const handler = NextAuth({
    providers,
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub || ""
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            // Handle Vercel deployment URLs
            const resolvedBaseUrl = NEXTAUTH_URL || baseUrl

            // Fix the redirection issue by properly handling the callback URL
            // If it's a relative URL, make it absolute
            if (url.startsWith("/")) {
                return `${resolvedBaseUrl}${url}`
            }
            // If it's already an absolute URL with the same origin, use it
            else if (new URL(url).origin === resolvedBaseUrl) {
                return url
            }
            // For all other cases, redirect to the dashboard
            return `${resolvedBaseUrl}/`
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: NEXTAUTH_SECRET,
    // Add session configuration for better user experience
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    // Add events for better tracking
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            // You can add logging or other actions here
            console.log("User signed in:", user, account, profile, isNewUser)
        },
    },
})

export { handler as GET, handler as POST }