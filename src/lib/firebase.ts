import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('🔥 FIREBASE CONFIGURATION ERROR 🔥');
  console.error('Missing Firebase environment variables:', missingVars);
  console.error('');
  console.error('TO FIX THIS ERROR:');
  console.error('1. Create a .env file in your project root');
  console.error('2. Copy the values from .env.example');
  console.error('3. Replace placeholder values with your actual Firebase config');
  console.error('4. Restart the development server');
  console.error('');
  console.error('Get your Firebase config from: https://console.firebase.google.com');
}

// Check if we have valid configuration values (not just placeholders)
const hasValidConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== 'your_api_key_here' &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'your_project_id';

if (!hasValidConfig) {
  console.error('🔥 FIREBASE CONFIGURATION ERROR 🔥');
  console.error('Firebase environment variables contain placeholder values.');
  console.error('Please update your .env file with actual Firebase configuration values.');
  console.error('');
  console.error('Current API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
  console.error('Current Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
}

// Initialize Firebase with error handling
let app;
let db;
let storage;
let auth;
let analytics;

if (hasValidConfig) {
  try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  // Initialize Firebase services with error handling
  try {
    db = getFirestore(app);
    console.log('Firestore initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    console.error('Make sure Firestore Database is enabled in your Firebase project');
  }
  
  try {
    storage = getStorage(app);
    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Storage:', error);
    console.error('Make sure Storage is enabled in your Firebase project');
  }
  
  try {
    auth = getAuth(app);
    console.log('Auth initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Auth:', error);
    console.error('Make sure Authentication is enabled in your Firebase project');
  }
  
  // Initialize Analytics (only in browser environment)
  if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    try {
      analytics = getAnalytics(app);
      console.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Analytics:', error);
    }
  }
  
  } catch (error) {
  console.error('Failed to initialize Firebase app:', error);
  console.error('Please check your Firebase configuration in .env file');
  }
} else {
  console.warn('🔥 Firebase not initialized due to missing or invalid configuration');
  console.warn('The app will run in offline mode with sample data');
  console.warn('Please set up your Firebase configuration to enable cloud features');
}

// Export services (may be undefined if initialization failed)
export { db, storage, auth, analytics };

// Helper function to check if Firebase services are available
export const isFirebaseAvailable = () => {
  return !!(app && db && storage && auth) && hasValidConfig;
};

// Helper function to get initialization status
export const getFirebaseStatus = () => {
  return {
    app: !!app,
    firestore: !!db,
    storage: !!storage,
    auth: !!auth,
    analytics: !!analytics
  };
};

export { hasValidConfig };

export default app;