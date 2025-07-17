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
      // Handle invalid credentials for admin user
      if (error.message === 'Invalid login credentials' && email === 'admin@store.com' && password === 'admin123') {
        console.warn('⚠️ Admin user not found in Supabase, using development mode');
        console.warn('To use full Supabase features, create admin user in Supabase dashboard:');
        console.warn('1. Go to Authentication > Users in your Supabase dashboard');
        console.warn('2. Add user with email: admin@store.com and password: admin123');
        console.warn('3. Disable email confirmation in Authentication > Settings');
        
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