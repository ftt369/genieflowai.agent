// Environment variables with type safety
export const env = {
  NODE_ENV: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5173',
  wsToken: import.meta.env.VITE_WS_TOKEN || 'development-token',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
} as const;

// Type for environment variables
export type Env = typeof env;

// Validate required environment variables
export function validateEnv() {
  const required: Array<keyof Env> = [];
  const missing = required.filter((key) => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
  
  return env;
} 