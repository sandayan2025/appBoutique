import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, getCurrentUser, onAuthStateChange, User } from '../lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    getCurrentUser().then(user => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
      }
      setLoading(false);
    }).catch(async (error) => {
      console.error('Error getting current user:', error);
      // Clear any stale session data
      try {
        await signOut();
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
      }
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await signIn(email, password);
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      // Handle authentication errors gracefully
      if (error instanceof Error) {
        console.error('Login error:', error.message);
        // Don't return false for development fallback scenarios
        if (error.message.includes('Invalid login credentials') && email === 'admin@store.com') {
          // This should have been handled in signIn, but if it reaches here, try again
          try {
            const fallbackUser = await signIn(email, password);
            if (fallbackUser) {
              setUser(fallbackUser);
              setIsAuthenticated(true);
              return true;
            }
          } catch (fallbackError) {
            console.error('Fallback login failed:', fallbackError);
          }
        }
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};