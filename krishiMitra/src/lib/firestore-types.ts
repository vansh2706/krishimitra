// Firestore Data Models and Types

export interface User {
  uid: string;
  email?: string;
  name?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  soilType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Crop {
  id: string;
  name: string;
  type: string;
  season: string;
  sowingMonths: string; // Comma-separated: "6,7,8"
  harvestMonths: string; // Comma-separated: "11,12"
  waterRequirement: string;
  soilTypes: string[]; // Array of soil types
  yieldPerHectare: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Planting {
  id: string;
  farmId: string;
  cropId: string;
  plantedDate: Date;
  expectedHarvestDate: Date;
  areaHectares: number;
  status: 'planning' | 'planted' | 'growing' | 'harvesting' | 'harvested';
  createdAt: Date;
  updatedAt: Date;
}

export interface Pest {
  id: string;
  name: string;
  scientificName?: string;
  description?: string;
  symptoms: string[];
  affectedCrops: string[];
  severity: 'low' | 'medium' | 'high';
  treatment: string;
  prevention: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PestReport {
  id: string;
  userId: string;
  farmId?: string;
  pestId?: string;
  pestName?: string;
  cropAffected: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  symptoms: string[];
  imageUrls: string[];
  latitude: number;
  longitude: number;
  status: 'pending' | 'identified' | 'resolved';
  detectionMethod?: 'manual' | 'ai' | 'camera';
  reportedAt: Date;
  updatedAt: Date;
}

export interface ChatHistory {
  id: string;
  userId: string;
  question: string;
  answer: string;
  category: 'pest' | 'crop' | 'weather' | 'disease' | 'general';
  language: string; // 'en', 'hi', 'mr', etc.
  relatedCrop?: string;
  relatedPest?: string;
  helpful?: boolean; // User feedback
  createdAt: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: 'pest_detection' | 'question_asked' | 'crop_viewed' | 'farm_created' | 'pest_report_submitted' | 'chat_interaction';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface FarmData {
  id: string;
  userId: string;
  farmId: string;
  dataType: 'soil_test' | 'weather_log' | 'harvest_data' | 'irrigation_log';
  data: Record<string, any>;
  notes?: string;
  recordedAt: Date;
  createdAt: Date;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  FARMS: 'farms',
  CROPS: 'crops',
  PLANTINGS: 'plantings',
  PESTS: 'pests',
  PEST_REPORTS: 'pestReports',
  CHAT_HISTORY: 'chatHistory',
  USER_ACTIVITY: 'userActivity',
  FARM_DATA: 'farmData'
} as const;
