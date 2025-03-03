export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'trialing' | 'past_due' | 'canceled';
    current_period_end?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email: boolean;
      push: boolean;
    };
  };
}

export interface AuthState {
  user: User | null;
  session: any | null; // Supabase session type
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User | null;
  session: any | null;
  error?: string;
} 