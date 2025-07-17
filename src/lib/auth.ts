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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name || 'Admin User'
  };
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