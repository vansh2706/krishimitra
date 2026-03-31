import { NextResponse } from 'next/server'
import { addDocument, getAllDocuments } from '@/lib/firestore-helpers'
import { COLLECTIONS, Crop, Pest } from '@/lib/firestore-types'

const seedData = {
  crops: [
    {
      name: 'Rice',
      type: 'Cereal',
      season: 'Kharif',
      sowingMonths: '6,7,8',
      harvestMonths: '11,12',
      waterRequirement: 'High',
      soilTypes: ['Clay', 'Loamy'],
      yieldPerHectare: 3.5
    },
    {
      name: 'Wheat',
      type: 'Cereal',
      season: 'Rabi',
      sowingMonths: '11,12',
      harvestMonths: '4,5',
      waterRequirement: 'Medium',
      soilTypes: ['Loamy', 'Sandy'],
      yieldPerHectare: 4.2
    },
    {
      name: 'Maize',
      type: 'Cereal',
      season: 'Kharif',
      sowingMonths: '6,7',
      harvestMonths: '10,11',
      waterRequirement: 'Medium',
      soilTypes: ['Loamy', 'Sandy'],
      yieldPerHectare: 5.8
    },
    {
      name: 'Cotton',
      type: 'Cash Crop',
      season: 'Kharif',
      sowingMonths: '5,6',
      harvestMonths: '11,12,1',
      waterRequirement: 'Medium',
      soilTypes: ['Black', 'Loamy'],
      yieldPerHectare: 2.5
    },
    {
      name: 'Sugarcane',
      type: 'Cash Crop',
      season: 'Year-round',
      sowingMonths: '1,2,3',
      harvestMonths: '12,1,2',
      waterRequirement: 'High',
      soilTypes: ['Loamy', 'Clay'],
      yieldPerHectare: 70.0
    }
  ],
  
  pests: [
    {
      name: 'Brown Planthopper',
      scientificName: 'Nilaparvata lugens',
      symptoms: ['Yellowing of leaves', 'Stunted growth', 'Hopper burn'],
      affectedCrops: ['Rice'],
      severity: 'high' as const,
      treatment: 'Use neem oil spray or approved insecticides',
      prevention: ['Maintain water level', 'Remove weeds', 'Use resistant varieties']
    },
    {
      name: 'Aphids',
      scientificName: 'Aphidoidea',
      symptoms: ['Curled leaves', 'Sticky honeydew', 'Stunted growth'],
      affectedCrops: ['Wheat', 'Maize', 'Cotton'],
      severity: 'medium' as const,
      treatment: 'Spray with soap solution or neem oil',
      prevention: ['Encourage natural predators', 'Regular monitoring', 'Remove infected plants']
    },
    {
      name: 'Bollworm',
      scientificName: 'Helicoverpa armigera',
      symptoms: ['Holes in leaves', 'Damaged bolls', 'Frass on leaves'],
      affectedCrops: ['Cotton'],
      severity: 'high' as const,
      treatment: 'Use Bt cotton varieties and approved pesticides',
      prevention: ['Crop rotation', 'Pheromone traps', 'Early detection']
    },
    {
      name: 'Stem Borer',
      scientificName: 'Scirpophaga incertulas',
      symptoms: ['Dead heart', 'White ear head', 'Damaged stems'],
      affectedCrops: ['Rice'],
      severity: 'high' as const,
      treatment: 'Apply granular insecticides in whorl',
      prevention: ['Remove stubbles', 'Use light traps', 'Release egg parasitoids']
    }
  ]
};

export async function POST() {
  try {
    const results = {
      crops: [] as string[],
      pests: [] as string[],
      errors: [] as string[]
    };

    // Check if data already exists
    const existingCrops = await getAllDocuments<Crop>(COLLECTIONS.CROPS);
    const existingPests = await getAllDocuments<Pest>(COLLECTIONS.PESTS);

    if (existingCrops.length > 0 || existingPests.length > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
        existingCrops: existingCrops.length,
        existingPests: existingPests.length
      });
    }

    // Seed crops
    for (const crop of seedData.crops) {
      try {
        const id = await addDocument<Crop>(COLLECTIONS.CROPS, crop);
        results.crops.push(id);
      } catch (e: any) {
        results.errors.push(`Crop ${crop.name}: ${e.message}`);
      }
    }

    // Seed pests
    for (const pest of seedData.pests) {
      try {
        const pestData = {
          ...pest,
          description: `${pest.name} is a common pest affecting ${pest.affectedCrops.join(', ')}.`
        };
        const id = await addDocument<Pest>(COLLECTIONS.PESTS, pestData);
        results.pests.push(id);
      } catch (e: any) {
        results.errors.push(`Pest ${pest.name}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      seeded: {
        crops: results.crops.length,
        pests: results.pests.length
      },
      errors: results.errors.length > 0 ? results.errors : undefined
    });

  } catch (e: any) {
    console.error('Seed error:', e);
    return NextResponse.json({
      success: false,
      error: e.message || 'Failed to seed database'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const crops = await getAllDocuments<Crop>(COLLECTIONS.CROPS);
    const pests = await getAllDocuments<Pest>(COLLECTIONS.PESTS);

    return NextResponse.json({
      counts: {
        crops: crops.length,
        pests: pests.length
      },
      message: crops.length === 0 && pests.length === 0 
        ? 'Database is empty. Call POST /api/seed to populate.'
        : 'Database is seeded'
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e.message || 'Failed to check seed status'
    }, { status: 500 });
  }
}
