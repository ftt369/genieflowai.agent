import { supabase } from '../config/services';
import { User, Provider } from '@supabase/supabase-js';

export type AuthUser = User;

export interface AuthResponse {
  user: AuthUser | null;
  session: any | null;
  error: Error | null;
}

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    return {
      user: data?.user || null,
      session: data?.session || null,
      error: error,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error as Error,
    };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return {
      user: data?.user || null,
      session: data?.session || null,
      error: error,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error as Error,
    };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get current session
export const getSession = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Password reset request
export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

// Update user password
export const updatePassword = async (new_password: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({ password: new_password });
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

// Sign in with OAuth provider
export const signInWithProvider = async (provider: Provider) => {
  return await supabase.auth.signInWithOAuth({
    provider,
  });
};

// Auth state change listener
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};

// Verify email
export const verifyEmail = async (token: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

// Resend verification email
export const resendVerificationEmail = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}; 