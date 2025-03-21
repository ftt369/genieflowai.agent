/**
 * Common types used throughout the application
 */

// Using string for UUID type for better type safety
export type UUID = string;

// Common API response interface
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
} 