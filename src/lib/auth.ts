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
      if (error.message === 'Invalid login credentials' && email === 'admin@store.com' && password === 'admin123') {
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