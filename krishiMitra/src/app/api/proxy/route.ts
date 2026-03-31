import { NextRequest, NextResponse } from 'next/server'

interface ProxyRequest {
  protocol: string
  origin: string
  path: string
  method: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ProxyRequest = await request.json()

    if (!body.protocol || !body.origin || !body.path || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields: protocol, origin, path, method' },
        { status: 400 }
      )
    }

    // Construct the URL
    const url = `${body.protocol}://${body.origin}${body.path}`

    // Add API key for OpenWeatherMap
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY
    if (body.origin.includes('openweathermap.org') && apiKey) {
      const separator = body.path.includes('?') ? '&' : '?'
      const finalUrl = `${url}${separator}appid=${apiKey}`

      const response = await fetch(finalUrl, {
        method: body.method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: `External API error: ${response.status} ${errorText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    }
    // Add API key for Gemini
    else if (body.origin.includes('generativelanguage.googleapis.com')) {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
      if (geminiApiKey) {
        const separator = body.path.includes('?') ? '&' : '?'
        const finalUrl = `${url}${separator}key=${geminiApiKey}`

        const response = await fetch(finalUrl, {
          method: body.method,
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          return NextResponse.json(
            { error: `Gemini API error: ${response.status} ${errorText}` },
            { status: response.status }
          )
        }

        const data = await response.json()
        return NextResponse.json(data)
      } else {
        return NextResponse.json(
          { error: 'Gemini API key not configured' },
          { status: 401 }
        )
      }
    } else {
      // For APIs without API key or non-OpenWeatherMap APIs
      const response = await fetch(url, {
        method: body.method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: `External API error: ${response.status} ${errorText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Proxy API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Proxy service is operational',
    timestamp: new Date().toISOString(),
    allowedOrigins: [
      'api.openweathermap.org',
      'api.perplexity.ai',
      'api.farcaster.xyz',
      'api.spacetimedb.com',
      'api.openai.com',
      'generativelanguage.googleapis.com'
    ]
  })
}