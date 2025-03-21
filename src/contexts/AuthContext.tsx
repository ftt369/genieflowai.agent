import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/services';
import * as authService from '../services/auth';
import { UserProfile } from '../types/user';
import { getUserProfile } from '../services/database';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: Error | null }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error: Error | null }>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get the current session
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
        
        // If we have a user, fetch their profile
        if (data.session?.user) {
          const userProfile = await getUserProfile(data.session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          const userProfile = await getUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      }
    );

    // Clean up subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.signUp(email, password);
      
      if (response.error) {
        throw response.error;
      }
      
      return { success: true, error: null };
    } catch (error) {
      setError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.signIn(email, password);
      
      if (response.error) {
        throw response.error;
      }
      
      return { success: true, error: null };
    } catch (error) {
      setError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error: resetError } = await authService.resetPassword(email);
      
      if (resetError) {
        throw resetError;
      }
      
      return { success: true, error: null };
    } catch (error) {
      setError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { error: updateError } = await authService.updatePassword(password);
      
      if (updateError) {
        throw updateError;
      }
      
      return { success: true, error: null };
    } catch (error) {
      setError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with provider
  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      await authService.signInWithProvider(provider);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    signInWithProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 