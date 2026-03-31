import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getDocumentsByUserId, updateDocument } from '@/lib/firestore-helpers';
import { COLLECTIONS, ChatHistory } from '@/lib/firestore-types';

// GET - Fetch chat history for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get all chat history for user
    let chatHistory = await getDocumentsByUserId<ChatHistory>(COLLECTIONS.CHAT_HISTORY, userId);

    // Filter by category if provided
    if (category) {
      chatHistory = chatHistory.filter(chat => chat.category === category);
    }

    // Sort by most recent first
    chatHistory.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      chatHistory,
      count: chatHistory.length
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

// POST - Save a new chat interaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.question || !body.answer) {
      return NextResponse.json(
        { success: false, error: 'userId, question, and answer are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['pest', 'crop', 'weather', 'disease', 'general'];
    if (body.category && !validCategories.includes(body.category)) {
      return NextResponse.json(
        { success: false, error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Create chat history object
    const chatHistory: Omit<ChatHistory, 'id'> = {
      userId: body.userId,
      question: body.question,
      answer: body.answer,
      category: body.category || 'general',
      language: body.language || 'en',
      relatedCrop: body.relatedCrop || undefined,
      relatedPest: body.relatedPest || undefined,
      helpful: body.helpful || undefined,
      createdAt: new Date()
    };

    // Save to Firestore
    const chatId = await addDocument<Omit<ChatHistory, 'id'>>(
      COLLECTIONS.CHAT_HISTORY,
      chatHistory as any
    );

    return NextResponse.json({
      success: true,
      message: 'Chat history saved successfully',
      chatId,
      chat: { ...chatHistory, id: chatId }
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving chat history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save chat history' },
      { status: 500 }
    );
  }
}

// PATCH - Update chat feedback (helpful or not)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.chatId || body.helpful === undefined) {
      return NextResponse.json(
        { success: false, error: 'chatId and helpful fields are required' },
        { status: 400 }
      );
    }

    await updateDocument<Partial<ChatHistory>>(
      COLLECTIONS.CHAT_HISTORY,
      body.chatId,
      { helpful: body.helpful }
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully'
    });

  } catch (error) {
    console.error('Error updating chat feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
