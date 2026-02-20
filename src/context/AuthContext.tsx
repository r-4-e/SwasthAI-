import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.access_token) {
        // Set cookie for backend access
        document.cookie = `token=${session.access_token}; path=/; max-age=3600; SameSite=None; Secure`;
      } else {
        document.cookie = 'token=; path=/; max-age=0; SameSite=None; Secure';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync user with backend when user changes
  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Send token to backend to sync user record
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0]
              })
            });
          }
        } catch (error) {
          console.error('Failed to sync user', error);
        }
      }
    };

    if (user) {
      syncUser();
    }
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
