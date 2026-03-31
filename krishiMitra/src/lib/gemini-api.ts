// Gemini API Service
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured')
  }
  return new GoogleGenerativeAI(apiKey)
}

// Safety settings for Gemini
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// Chat with Gemini
export async function geminiChat(messages: ChatMessage[]): Promise<string> {
  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      safetySettings 
    })

    // Convert messages to Gemini format
    const prompt = messages.map(msg => {
      if (msg.role === 'user') return msg.content
      if (msg.role === 'assistant') return `Assistant: ${msg.content}`
      return msg.content
    }).join('\n\n')

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to get response from Gemini AI')
  }
}

// Image analysis with Gemini Vision
export async function geminiImageAnalysis(
  imageData: string, 
  prompt: string = "Analyze this agricultural image and provide farming insights"
): Promise<string> {
  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro-vision',
      safetySettings 
    })

    // Convert base64 to proper format
    const imagePart = {
      inlineData: {
        data: imageData.replace(/^data:image\/[a-z]+;base64,/, ''),
        mimeType: 'image/jpeg'
      }
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini Vision API error:', error)
    throw new Error('Failed to analyze image with Gemini Vision')
  }
}

// Check Gemini services availability
export async function checkGeminiServices(): Promise<boolean> {
  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent('Hello')
    await result.response
    return true
  } catch (error) {
    console.error('Gemini service check failed:', error)
    return false
  }
}

// Text-to-Speech functionality (placeholder)
export async function playTTSAudio(text: string): Promise<void> {
  try {
    // Use browser's built-in speech synthesis if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8
      
      // Try to use an English voice
      const voices = speechSynthesis.getVoices()
      const englishVoice = voices.find(voice => voice.lang.startsWith('en'))
      if (englishVoice) {
        utterance.voice = englishVoice
      }
      
      speechSynthesis.speak(utterance)
    } else {
      console.warn('Text-to-speech not supported in this environment')
    }
  } catch (error) {
    console.error('TTS error:', error)
    // Fail silently for TTS errors
  }
}