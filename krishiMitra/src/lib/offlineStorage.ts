// Offline storage utility for KrishiMitra
'use client'

export interface OfflineData {
    chatMessages: Array<{
        id: string
        role: 'user' | 'assistant'
        content: string
        timestamp: Date
        synced?: boolean
    }>
    feedbacks: Array<{
        id: string
        rating: number
        message: string
        category: string
        timestamp: Date
        synced?: boolean
    }>
    searchHistory: Array<{
        query: string
        timestamp: Date
    }>
    favoriteAdvice: Array<{
        id: string
        title: string
        content: string
        timestamp: Date
    }>
}

const STORAGE_KEY = 'krishimitra-offline-data'

// Get offline data from localStorage
export function getOfflineData(): OfflineData {
    if (typeof window === 'undefined') {
        return {
            chatMessages: [],
            feedbacks: [],
            searchHistory: [],
            favoriteAdvice: []
        }
    }

    try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (data) {
            const parsed = JSON.parse(data)
            // Convert timestamp strings back to Date objects
            parsed.chatMessages = parsed.chatMessages?.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            })) || []
            parsed.feedbacks = parsed.feedbacks?.map((feedback: any) => ({
                ...feedback,
                timestamp: new Date(feedback.timestamp)
            })) || []
            parsed.searchHistory = parsed.searchHistory?.map((search: any) => ({
                ...search,
                timestamp: new Date(search.timestamp)
            })) || []
            parsed.favoriteAdvice = parsed.favoriteAdvice?.map((advice: any) => ({
                ...advice,
                timestamp: new Date(advice.timestamp)
            })) || []
            return parsed
        }
    } catch (error) {
        console.error('Error loading offline data:', error)
    }

    return {
        chatMessages: [],
        feedbacks: [],
        searchHistory: [],
        favoriteAdvice: []
    }
}

// Save offline data to localStorage
export function saveOfflineData(data: OfflineData): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('Error saving offline data:', error)
    }
}

// Add chat message to offline storage
export function addOfflineChatMessage(message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}): void {
    const data = getOfflineData()
    data.chatMessages.push({ ...message, synced: false })
    saveOfflineData(data)
}

// Add feedback to offline storage
export function addOfflineFeedback(feedback: {
    id: string
    rating: number
    message: string
    category: string
    timestamp: Date
}): void {
    const data = getOfflineData()
    data.feedbacks.push({ ...feedback, synced: false })
    saveOfflineData(data)
}

// Add search query to history
export function addSearchHistory(query: string): void {
    const data = getOfflineData()
    data.searchHistory.unshift({
        query,
        timestamp: new Date()
    })

    // Keep only last 50 searches
    data.searchHistory = data.searchHistory.slice(0, 50)
    saveOfflineData(data)
}

// Add advice to favorites
export function addFavoriteAdvice(advice: {
    id: string
    title: string
    content: string
}): void {
    const data = getOfflineData()
    data.favoriteAdvice.unshift({
        ...advice,
        timestamp: new Date()
    })
    saveOfflineData(data)
}

// Get unsynced data for sync when online
export function getUnsyncedData(): {
    chatMessages: any[]
    feedbacks: any[]
} {
    const data = getOfflineData()
    return {
        chatMessages: data.chatMessages.filter(msg => !msg.synced),
        feedbacks: data.feedbacks.filter(feedback => !feedback.synced)
    }
}

// Mark data as synced
export function markAsSynced(type: 'chatMessages' | 'feedbacks', ids: string[]): void {
    const data = getOfflineData()

    if (type === 'chatMessages') {
        data.chatMessages = data.chatMessages.map(msg =>
            ids.includes(msg.id) ? { ...msg, synced: true } : msg
        )
    } else if (type === 'feedbacks') {
        data.feedbacks = data.feedbacks.map(feedback =>
            ids.includes(feedback.id) ? { ...feedback, synced: true } : feedback
        )
    }

    saveOfflineData(data)
}

// Clear old data (keep last 30 days)
export function cleanupOldData(): void {
    const data = getOfflineData()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    data.chatMessages = data.chatMessages.filter(msg => msg.timestamp > thirtyDaysAgo)
    data.feedbacks = data.feedbacks.filter(feedback => feedback.timestamp > thirtyDaysAgo)
    data.searchHistory = data.searchHistory.filter(search => search.timestamp > thirtyDaysAgo)
    data.favoriteAdvice = data.favoriteAdvice.filter(advice => advice.timestamp > thirtyDaysAgo)

    saveOfflineData(data)
}