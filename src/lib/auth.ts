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
      // If it's an invalid credentials error and we're trying to login as admin,
      // provide helpful guidance
      if (error.message === 'Invalid login credentials' && email === 'admin@store.com') {
        throw new Error('Admin user not found in Supabase. Please create the admin user in your Supabase Authentication dashboard with email: admin@store.com and password: admin123');
      }
      throw error;
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || 'Admin User'
    };
  } catch (error: any) {
    // For development fallback when admin user doesn't exist
    if (email === 'admin@store.com' && password === 'admin123') {
      console.warn('⚠️ Supabase admin user not found, using development mode');
      console.warn('To use full Supabase features, create admin user in Supabase dashboard');
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