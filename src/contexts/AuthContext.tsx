import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase, Profile, getProfile, Provider } from '../config/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (provider: Provider) => Promise<void>;
  clearError: () => void;
  updateUserProfile: (updates: Partial<Profile>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier l'état de l'authentification initial
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        try {
          const profile = await getProfile(session.user.id);
          setProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string, rememberMe = true) => {
    try {
      setLoading(true);
      clearError();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        const profile = await getProfile(data.user.id);
        setProfile(profile);
        navigate('/dashboard');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      clearError();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: data.name,
            email: data.email,
            role: 'user',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
          },
        ]);

      if (profileError) throw profileError;

      const profile = await getProfile(authData.user.id);
      setProfile(profile);

      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider: Provider) => {
    try {
      setLoading(true);
      clearError();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // La redirection sera gérée par Supabase
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<Profile>) => {
    try {
      setLoading(true);
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      const updatedProfile = await getProfile(user.id);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    socialLogin,
    clearError,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
