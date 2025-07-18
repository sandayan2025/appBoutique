import { supabase, isSupabaseAvailable } from './supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export const signIn = async (email: string, password: string): Promise<User | null> => {
  if (!isSupabaseAvailable()) {
    // Mock authentication for development
    if (email === 'admin@store.com' && password === 'admin123') {
      return { id: '1', email, name: 'Admin User' };
    }
    throw new Error('Invalid credentials');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Handle invalid credentials for admin user - provide development fallback
      if (error.message.trim() === 'Invalid login credentials' && email === 'admin@store.com' && password === 'admin123') {
        console.warn('🔧 SUPABASE ADMIN USER NOT FOUND - Using Development Mode');
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.warn('To enable full Supabase features, create the admin user:');
        console.warn('1. Go to Authentication > Users in your Supabase dashboard');
        console.warn('2. Click "Add user" and create:');
        console.warn('   • Email: admin@store.com');
        console.warn('   • Password: admin123');
        console.warn('3. Go to Authentication > Settings');
        console.warn('4. Disable "Enable email confirmations"');
        console.warn('5. Restart the application');
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Return development admin user
        return { id: 'dev-admin', email, name: 'Admin User (Dev Mode)' };
      }
      throw new Error(error.message);
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || 'Admin User'
    };
  } catch (error: any) {
    // Handle network errors and Supabase request failures
    if (error.message === 'Failed to fetch' || 
        error.name === 'TypeError' || 
        error.message?.includes('Supabase request failed') ||
        error.toString().includes('Supabase request failed')) {
      console.warn('🔧 SUPABASE CONNECTION FAILED - Using Development Mode');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn('Network error occurred. Please check your Supabase configuration:');
      console.warn('1. Verify your VITE_SUPABASE_URL in .env file');
      console.warn('2. Verify your VITE_SUPABASE_ANON_KEY in .env file');
      console.warn('3. Ensure your Supabase project is active');
      console.warn('4. Check your internet connection');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Fallback to development mode for admin user
      if (email === 'admin@store.com' && password === 'admin123') {
        return { id: 'dev-admin', email, name: 'Admin User (Dev Mode)' };
      }
      throw new Error('Connection failed. Please check your Supabase configuration.');
    }
    
    // Handle authentication errors with fallback for admin user
    if (error.message?.includes('Invalid login credentials') && email === 'admin@store.com' && password === 'admin123') {
      console.warn('🔧 SUPABASE ADMIN USER NOT FOUND - Using Development Mode');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn('To enable full Supabase features, create the admin user:');
      console.warn('1. Go to Authentication > Users in your Supabase dashboard');
      console.warn('2. Click "Add user" and create:');
      console.warn('   • Email: admin@store.com');
      console.warn('   • Password: admin123');
      console.warn('3. Go to Authentication > Settings');
      console.warn('4. Disable "Enable email confirmations"');
      console.warn('5. Restart the application');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Return development admin user
      return { id: 'dev-admin', email, name: 'Admin User (Dev Mode)' };
    }
    
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  if (!isSupabaseAvailable()) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!isSupabaseAvailable()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || 'Admin User'
  };
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!isSupabaseAvailable()) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || 'Admin User'
      });
    } else {
      callback(null);
    }
  });
};