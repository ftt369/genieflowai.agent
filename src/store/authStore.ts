import { create } from 'zustand';
import { User, AuthState, AuthResponse } from '../types/auth';
import { mockDataService } from './mockDataStore';

interface AuthStore extends AuthState {
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: string | null }>;
  loadUser: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      const { user, error } = await mockDataService.signUp(email, password, fullName);
      if (error) throw new Error(error);

      set({
        user,
        session: { user }, // Simple mock session
        error: null,
      });

      return { user, session: { user } };
    } catch (error) {
      const message = (error as Error).message;
      set({ error: message });
      return { user: null, session: null, error: message };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { user, error } = await mockDataService.signIn(email, password);
      if (error) throw new Error(error);

      set({
        user,
        session: { user }, // Simple mock session
        error: null,
      });

      return { user, session: { user } };
    } catch (error) {
      const message = (error as Error).message;
      set({ error: message });
      return { user: null, session: null, error: message };
    }
  },

  signOut: async () => {
    set({
      user: null,
      session: null,
      error: null,
    });
  },

  resetPassword: async (email: string) => {
    // Mock implementation - in real app, this would send a reset email
    return { error: null };
  },

  updateProfile: async (updates: Partial<User>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      // Update the user in the store
      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      }));

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  loadUser: async () => {
    try {
      // For mock data, we'll check if there's a user in localStorage
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({
          user,
          session: { user },
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        user: null,
        session: null,
        isLoading: false,
        error: (error as Error).message,
      });
    }
  },

  setError: (error) => set({ error }),
})); 