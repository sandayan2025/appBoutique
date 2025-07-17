import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  increment,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, StoreSettings } from '../contexts/StoreContext';

// Products
export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Product[];
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date()
    } as Product;
  }
  return null;
};

export const addProduct = async (product: Omit<Product, 'id' | 'views' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...product,
    views: 0,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, updates);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'products', id));
};

export const incrementProductViews = async (id: string): Promise<void> => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, {
    views: increment(1)
  });
};

// Store Settings
export const getStoreSettings = async (): Promise<StoreSettings | null> => {
  const docRef = doc(db, 'settings', 'store');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as StoreSettings;
  }
  return null;
};

export const updateStoreSettings = async (settings: StoreSettings): Promise<void> => {
  const docRef = doc(db, 'settings', 'store');
  await updateDoc(docRef, settings);
};

// Analytics
export interface VisitData {
  id?: string;
  timestamp: Date;
  source?: string;
  userAgent: string;
  referrer: string;
  page: string;
  location?: {
    country?: string;
    city?: string;
  };
}

export const trackVisit = async (visitData: Omit<VisitData, 'id'>): Promise<void> => {
  // Filter out undefined values before saving to Firestore
  const cleanedData: any = {
    timestamp: Timestamp.now(),
    userAgent: visitData.userAgent,
    referrer: visitData.referrer,
    page: visitData.page
  };

  // Only include source if it's defined
  if (visitData.source && visitData.source.trim() !== '') {
    cleanedData.source = visitData.source;
  }

  // Only include location if it's defined
  if (visitData.location) {
    cleanedData.location = visitData.location;
  }

  await addDoc(collection(db, 'visits'), cleanedData);
};

// Orders
export interface OrderData {
  id?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  timestamp: Date;
  source?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export const addOrder = async (order: Omit<OrderData, 'id' | 'timestamp'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...order,
    timestamp: Timestamp.now()
  });
  return docRef.id;
};

export const getOrders = async (startDate?: Date, endDate?: Date): Promise<OrderData[]> => {
  let q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
  
  if (startDate && endDate) {
    q = query(
      collection(db, 'orders'),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date()
  })) as OrderData[];
};

// Real-time subscriptions
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Product[];
    callback(products);
  });
};