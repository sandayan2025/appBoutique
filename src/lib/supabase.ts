import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate Supabase configuration
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('🔥 SUPABASE CONFIGURATION ERROR 🔥');
  console.error('Missing Supabase environment variables:', missingVars);
  console.error('');
  console.error('TO FIX THIS ERROR:');
  console.error('1. Create a .env file in your project root');
  console.error('2. Copy the values from .env.example');
  console.error('3. Replace placeholder values with your actual Supabase config');
  console.error('4. Restart the development server');
  console.error('');
  console.error('Get your Supabase config from: https://app.supabase.com');
}

// Check if we have valid configuration values (not just placeholders)
const hasValidConfig = supabaseUrl && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseAnonKey.length > 20;

if (!hasValidConfig) {
  console.error('🔥 SUPABASE CONFIGURATION ERROR 🔥');
  console.error('Supabase environment variables contain placeholder values.');
  console.error('Please update your .env file with actual Supabase configuration values.');
  console.error('');
  console.error('Current URL:', supabaseUrl);
  console.error('Current Key:', supabaseAnonKey ? 'Set but appears to be placeholder' : 'Not set');
  console.error('');
  console.error('Get your Supabase config from: https://app.supabase.com');
  console.error('Go to Settings > API to find your URL and anon key');
}

// Initialize Supabase client
let supabase;

if (hasValidConfig) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    console.error('Please check your Supabase configuration in .env file');
  }
} else {
  console.warn('🔥 Supabase not initialized due to missing or invalid configuration');
  console.warn('The app will run in offline mode with sample data');
  console.warn('Please set up your Supabase configuration to enable cloud features');
}

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return !!(supabase && hasValidConfig);
};

export { supabase, hasValidConfig };
export default supabase;