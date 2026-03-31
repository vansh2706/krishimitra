// Helper utilities for saving person-specific data to Firestore
// Use these functions in your components to easily track user actions

import { auth } from './firebase';

/**
 * Save a pest report when user detects a pest
 */
export async function savePestReport(data: {
  pestName?: string;
  cropAffected: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  symptoms?: string[];
  imageUrls?: string[];
  latitude: number;
  longitude: number;
  detectionMethod?: 'manual' | 'ai' | 'camera';
  farmId?: string;
  pestId?: string;
}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to save pest report');
  }

  const response = await fetch('/api/pest-reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.uid,
      ...data,
      symptoms: data.symptoms || [],
      imageUrls: data.imageUrls || [],
    })
  });

  if (!response.ok) {
    throw new Error('Failed to save pest report');
  }

  return await response.json();
}

/**
 * Get pest reports for current user
 */
export async function getUserPestReports() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const response = await fetch(`/api/pest-reports?userId=${user.uid}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch pest reports');
  }

  return await response.json();
}

/**
 * Save a chat interaction (question and answer)
 */
export async function saveChatHistory(data: {
  question: string;
  answer: string;
  category?: 'pest' | 'crop' | 'weather' | 'disease' | 'general';
  language?: string;
  relatedCrop?: string;
  relatedPest?: string;
}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to save chat history');
  }

  const response = await fetch('/api/chat-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.uid,
      ...data,
      category: data.category || 'general',
      language: data.language || 'en',
    })
  });

  if (!response.ok) {
    throw new Error('Failed to save chat history');
  }

  return await response.json();
}

/**
 * Get chat history for current user
 */
export async function getUserChatHistory(category?: string) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const url = category 
    ? `/api/chat-history?userId=${user.uid}&category=${category}`
    : `/api/chat-history?userId=${user.uid}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat history');
  }

  return await response.json();
}

/**
 * Mark a chat answer as helpful or not
 */
export async function updateChatFeedback(chatId: string, helpful: boolean) {
  const response = await fetch('/api/chat-history', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, helpful })
  });

  if (!response.ok) {
    throw new Error('Failed to update feedback');
  }

  return await response.json();
}

/**
 * Log a user activity
 */
export async function logUserActivity(
  action: 'pest_detection' | 'question_asked' | 'crop_viewed' | 'farm_created' | 'pest_report_submitted' | 'chat_interaction',
  details: Record<string, any> = {}
) {
  const user = auth.currentUser;
  if (!user) return; // Silently skip if not authenticated

  try {
    await fetch('/api/user-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        action,
        details
      })
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - activity logging shouldn't break the app
  }
}

/**
 * Get user's activity history
 */
export async function getUserActivity(limit?: number) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const url = limit 
    ? `/api/user-activity?userId=${user.uid}&limit=${limit}`
    : `/api/user-activity?userId=${user.uid}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user activity');
  }

  return await response.json();
}

/**
 * Get current user's location (with permission)
 */
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * Complete helper for pest detection with auto-save
 * Use this when user detects a pest via camera/manual input
 */
export async function handlePestDetection(data: {
  pestName: string;
  cropAffected: string;
  severity: 'low' | 'medium' | 'high';
  description?: string;
  symptoms?: string[];
  imageUrls?: string[];
  detectionMethod: 'manual' | 'ai' | 'camera';
}) {
  try {
    // Get location
    const location = await getCurrentLocation();

    // Save pest report
    const reportResult = await savePestReport({
      ...data,
      description: data.description || `${data.pestName} detected on ${data.cropAffected}`,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    // Log activity
    await logUserActivity('pest_detection', {
      pestName: data.pestName,
      crop: data.cropAffected,
      method: data.detectionMethod,
      reportId: reportResult.reportId
    });

    return reportResult;
  } catch (error) {
    console.error('Error handling pest detection:', error);
    throw error;
  }
}

/**
 * Complete helper for chatbot interaction with auto-save
 * Use this when user asks a question and gets an answer
 */
export async function handleChatInteraction(
  question: string,
  answer: string,
  category: 'pest' | 'crop' | 'weather' | 'disease' | 'general' = 'general',
  metadata?: {
    relatedCrop?: string;
    relatedPest?: string;
    language?: string;
  }
) {
  try {
    // Save chat history
    const chatResult = await saveChatHistory({
      question,
      answer,
      category,
      ...metadata
    });

    // Log activity
    await logUserActivity('chat_interaction', {
      category,
      chatId: chatResult.chatId,
      questionLength: question.length,
      answerLength: answer.length
    });

    return chatResult;
  } catch (error) {
    console.error('Error handling chat interaction:', error);
    throw error;
  }
}
