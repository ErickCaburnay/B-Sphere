// Firestore utility functions
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';

// Convert Firestore timestamp to JavaScript Date
export const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
};

// Convert JavaScript Date to Firestore timestamp
export const dateToTimestamp = (date) => {
  if (!date) return null;
  return Timestamp.fromDate(new Date(date));
};

// Convert Firestore document to plain object
export const docToObject = (doc) => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  const converted = { id: doc.id };
  
  // Convert timestamps to dates
  Object.keys(data).forEach(key => {
    if (data[key] && typeof data[key].toDate === 'function') {
      converted[key] = data[key].toDate();
    } else {
      converted[key] = data[key];
    }
  });
  
  return converted;
};

// Convert query snapshot to array of objects
export const querySnapshotToArray = (querySnapshot) => {
  return querySnapshot.docs.map(doc => docToObject(doc));
};

// Generate unique ID similar to Prisma's auto-generated IDs
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Pagination helper
export const createPaginatedQuery = (collectionRef, pageSize = 10, lastDoc = null, orderField = 'createdAt') => {
  let q = query(collectionRef, orderBy(orderField, 'desc'), limit(pageSize));
  
  if (lastDoc) {
    q = query(collectionRef, orderBy(orderField, 'desc'), startAfter(lastDoc), limit(pageSize));
  }
  
  return q;
}; 