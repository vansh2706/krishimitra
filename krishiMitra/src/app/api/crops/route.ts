import { NextRequest, NextResponse } from 'next/server'
import { queryDocuments, addDocument } from '@/lib/firestore-helpers'
import { COLLECTIONS, Crop } from '@/lib/firestore-types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const season = searchParams.get('season')
  const type = searchParams.get('type')
  
  try {
    // Build filters
    const filters: { field: string; operator: any; value: any }[] = [];
    if (season) {
      filters.push({ field: 'season', operator: '==', value: season });
    }
    if (type) {
      filters.push({ field: 'type', operator: '==', value: type });
    }
    
    // Query crops with filters
    const crops = await queryDocuments<Crop>(
      COLLECTIONS.CROPS,
      filters,
      'name', // orderBy
      'asc'   // order direction
    );
    
    return NextResponse.json({ crops })
  } catch (e: any) {
    console.error('Crops GET error:', e);
    return NextResponse.json({ error: e.message || 'Failed to fetch crops' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate required fields
    if (!body.name || !body.type || !body.season) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Add crop to Firestore
    const cropId = await addDocument<Crop>(COLLECTIONS.CROPS, {
      name: body.name,
      type: body.type,
      season: body.season,
      sowingMonths: body.sowingMonths || '',
      harvestMonths: body.harvestMonths || '',
      waterRequirement: body.waterRequirement || 'Medium',
      soilTypes: body.soilTypes || [],
      yieldPerHectare: body.yieldPerHectare || 0
    });
    
    return NextResponse.json({ 
      crop: { id: cropId, ...body } 
    }, { status: 201 })
  } catch (e: any) {
    console.error('Crops POST error:', e);
    return NextResponse.json({ error: e.message || 'Failed to create crop' }, { status: 500 })
  }
}
