import { UUID } from './common';

/**
 * Core user type from authentication provider
 */
export interface User {
  id: UUID;
  email: string;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

/**
 * Extended user profile with additional information
 */
export interface UserProfile {
  id: UUID;          // Same as User.id
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  company?: string;
  job_title?: string;
  website?: string;
  timezone?: string;
  preferences?: UserPreferences;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
}

/**
 * User preferences for application settings
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    in_app: boolean;
  };
  default_mode_id?: UUID;
  default_knowledge_base_id?: UUID;
} 