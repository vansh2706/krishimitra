// Firestore Helper Functions
import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from './firebase';
import { COLLECTIONS } from './firestore-types';

// Convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Convert Date to Firestore Timestamp
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Convert Firestore document to object with id
export const docToObject = <T extends DocumentData>(
  doc: QueryDocumentSnapshot<DocumentData>
): T & { id: string } => {
  const data = doc.data();
  
  // Convert Timestamps to Dates
  const convertedData: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] && typeof data[key].toDate === 'function') {
      convertedData[key] = data[key].toDate();
    } else {
      convertedData[key] = data[key];
    }
  });
  
  return {
    id: doc.id,
    ...convertedData
  } as T & { id: string };
};

// Get all documents from a collection
export const getAllDocuments = async <T extends DocumentData>(
  collectionName: string
): Promise<(T & { id: string })[]> => {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => docToObject<T>(doc));
};

// Get a single document by ID
export const getDocumentById = async <T extends DocumentData>(
  collectionName: string,
  documentId: string
): Promise<(T & { id: string }) | null> => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docToObject<T>(docSnap as QueryDocumentSnapshot<DocumentData>);
  }
  return null;
};

// Add a new document
export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const colRef = collection(db, collectionName);
  const now = Timestamp.now();
  
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await addDoc(colRef, docData);
  return docRef.id;
};

// Update a document
export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  const now = Timestamp.now();
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: now
  });
};

// Delete a document
export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
};

// Query documents with filters
export const queryDocuments = async <T extends DocumentData>(
  collectionName: string,
  filters: { field: string; operator: any; value: any }[],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc',
  limitCount?: number
): Promise<(T & { id: string })[]> => {
  let q = query(collection(db, collectionName));
  
  // Apply filters
  filters.forEach(filter => {
    q = query(q, where(filter.field, filter.operator, filter.value));
  });
  
  // Apply ordering
  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection));
  }
  
  // Apply limit
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToObject<T>(doc));
};

// Get documents by user ID
export const getDocumentsByUserId = async <T extends DocumentData>(
  collectionName: string,
  userId: string
): Promise<(T & { id: string })[]> => {
  return queryDocuments<T>(collectionName, [
    { field: 'userId', operator: '==', value: userId }
  ]);
};

// Check if Firestore is connected
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    const testRef = collection(db, '_health_check');
    await getDocs(query(testRef, limit(1)));
    return true;
  } catch (error) {
    console.error('Firestore connection error:', error);
    return false;
  }
};
