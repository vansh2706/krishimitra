import { NextRequest, NextResponse } from 'next/server';
import { addDocument, queryDocuments, getDocumentsByUserId } from '@/lib/firestore-helpers';
import { COLLECTIONS, PestReport } from '@/lib/firestore-types';

// GET - Fetch pest reports (all or by userId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const cropAffected = searchParams.get('crop');

    let reports: PestReport[];

    if (userId) {
      // Get reports for specific user
      reports = await getDocumentsByUserId<PestReport>(COLLECTIONS.PEST_REPORTS, userId);
    } else {
      // Get all reports with optional filters
      const filters: any[] = [];
      
      if (status) {
        filters.push({ field: 'status', operator: '==', value: status });
      }
      
      if (cropAffected) {
        filters.push({ field: 'cropAffected', operator: '==', value: cropAffected });
      }

      reports = await queryDocuments<PestReport>(
        COLLECTIONS.PEST_REPORTS,
        filters,
        'reportedAt',
        'desc'
      );
    }

    return NextResponse.json({ 
      success: true,
      reports,
      count: reports.length 
    });
  } catch (error) {
    console.error('Error fetching pest reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pest reports' },
      { status: 500 }
    );
  }
}

// POST - Create a new pest report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['userId', 'cropAffected', 'severity', 'description', 'latitude', 'longitude'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate severity
    if (!['low', 'medium', 'high'].includes(body.severity)) {
      return NextResponse.json(
        { success: false, error: 'Severity must be low, medium, or high' },
        { status: 400 }
      );
    }

    // Create pest report object
    const pestReport: Omit<PestReport, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: body.userId,
      farmId: body.farmId || undefined,
      pestId: body.pestId || undefined,
      pestName: body.pestName || undefined,
      cropAffected: body.cropAffected,
      severity: body.severity,
      description: body.description,
      symptoms: Array.isArray(body.symptoms) ? body.symptoms : [],
      imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : [],
      latitude: body.latitude,
      longitude: body.longitude,
      status: body.status || 'pending',
      detectionMethod: body.detectionMethod || 'manual',
      reportedAt: new Date()
    };

    // Save to Firestore
    const reportId = await addDocument<Omit<PestReport, 'id'>>(
      COLLECTIONS.PEST_REPORTS,
      pestReport as any
    );

    return NextResponse.json({
      success: true,
      message: 'Pest report created successfully',
      reportId,
      report: { ...pestReport, id: reportId }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating pest report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create pest report' },
      { status: 500 }
    );
  }
}
