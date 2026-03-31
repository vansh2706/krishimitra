// DeepSeek API Service

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Chat with DeepSeek
export async function deepseekChat(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch('/api/deepseek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'deepseek-chat',
        temperature: 0.7,
        maxTokens: 1500
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'DeepSeek API request failed')
    }

    const data = await response.json()
    return data.message || data.choices?.[0]?.message?.content || 'No response from DeepSeek'
  } catch (error) {
    console.error('DeepSeek API error:', error)
    throw new Error('Failed to get response from DeepSeek AI')
  }
}

// Image analysis with DeepSeek Vision
export async function deepseekImageAnalysis(
  imageData: string,
  prompt: string = "Analyze this agricultural image for pest detection and crop health assessment"
): Promise<string> {
  try {
    const response = await fetch('/api/deepseek-vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        prompt,
        model: 'deepseek-vl-chat',
        temperature: 0.3,
        maxTokens: 1000
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'DeepSeek Vision API request failed')
    }

    const data = await response.json()
    return data.message || data.analysis || 'No analysis available from DeepSeek Vision'
  } catch (error) {
    console.error('DeepSeek Vision API error:', error)
    throw new Error('Failed to analyze image with DeepSeek Vision')
  }
}

// Check DeepSeek services availability
export async function checkDeepSeekServices(): Promise<boolean> {
  try {
    const response = await fetch('/api/deepseek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'deepseek-chat'
      }),
    })

    return response.ok
  } catch (error) {
    console.error('DeepSeek service check failed:', error)
    return false
  }
}