import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { createClient } from '@supabase/supabase-js';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(firebaseApp) : null;

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service feature flags
export const serviceConfig = {
  analytics: {
    provider: 'firebase', // or 'custom'
    enabled: true,
  },
  auth: {
    provider: 'supabase', // We're using Supabase as primary auth
    enabled: true,
  },
  storage: {
    provider: 'supabase', // Could be 'firebase' for specific use cases
    enabled: true,
  },
  database: {
    provider: 'supabase',
    enabled: true,
  },
  realtime: {
    provider: 'supabase', // Could be 'firebase' for specific features
    enabled: true,
  },
};