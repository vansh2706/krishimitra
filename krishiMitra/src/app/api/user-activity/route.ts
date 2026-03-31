import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getDocumentsByUserId, queryDocuments } from '@/lib/firestore-helpers';
import { COLLECTIONS, UserActivity } from '@/lib/firestore-types';

// GET - Fetch user activity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get all activities for user
    let activities = await getDocumentsByUserId<UserActivity>(COLLECTIONS.USER_ACTIVITY, userId);

    // Filter by action if provided
    if (action) {
      activities = activities.filter(activity => activity.action === action);
    }

    // Sort by most recent first
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Limit results if specified
    if (limit) {
      activities = activities.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
}

// POST - Log a new user activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.action) {
      return NextResponse.json(
        { success: false, error: 'userId and action are required' },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = [
      'pest_detection',
      'question_asked',
      'crop_viewed',
      'farm_created',
      'pest_report_submitted',
      'chat_interaction'
    ];

    if (!validActions.includes(body.action)) {
      return NextResponse.json(
        { success: false, error: `Action must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Get client info from headers
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined;

    // Create activity object
    const activity: Omit<UserActivity, 'id'> = {
      userId: body.userId,
      action: body.action,
      details: body.details || {},
      ipAddress,
      userAgent,
      createdAt: new Date()
    };

    // Save to Firestore
    const activityId = await addDocument<Omit<UserActivity, 'id'>>(
      COLLECTIONS.USER_ACTIVITY,
      activity as any
    );

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully',
      activityId
    }, { status: 201 });

  } catch (error) {
    console.error('Error logging user activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
