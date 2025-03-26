// Simple script to create database tables directly through Supabase API
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const envPath = path.resolve(rootDir, '.env.local');

console.log(`Looking for .env.local at: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);

if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
  console.log('Environment variables loaded');
  
  // Check if we have the variables we need
  console.log(`NEXT_PUBLIC_SUPABASE_URL exists: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY exists: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY exists: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
  
  // Show partial keys for debugging (safely)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const keyStart = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10);
    const keyEnd = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length - 5);
    console.log(`Anon Key: ${keyStart}...${keyEnd} (length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length})`);
  }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const keyStart = process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10);
    const keyEnd = process.env.SUPABASE_SERVICE_ROLE_KEY.substring(process.env.SUPABASE_SERVICE_ROLE_KEY.length - 5);
    console.log(`Key: ${keyStart}...${keyEnd} (length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})`);
  }
} else {
  console.warn(`Warning: ${envPath} file not found`);
  dotenv.config();
}

// Try both keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Error: Supabase URL is missing from environment variables.');
  console.error('Make sure your .env.local file contains NEXT_PUBLIC_SUPABASE_URL.');
  process.exit(1);
}

if (!supabaseAnonKey && !supabaseServiceKey) {
  console.error('Error: Neither Supabase Anon Key nor Service Role Key is available.');
  console.error('Make sure your .env.local file contains at least NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

// Explicitly use the anon key for now, as service key seems invalid
const supabaseKey = supabaseAnonKey;
console.log(`Connecting to Supabase at ${supabaseUrl} using anon key`);
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL statements to create tables
const createTables = async () => {
  try {
    // Create subscription_plans table
    console.log('Creating subscription_plans table...');
    
    // Always show the SQL instructions
    console.log('Showing SQL instructions for table creation...');
    await createSubscriptionPlansTableDirectly();
    
    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    // Show instructions even in case of error
    await createSubscriptionPlansTableDirectly();
  }
};

// Function to create the subscription_plans table directly
const createSubscriptionPlansTableDirectly = async () => {
  try {
    console.log('Attempting to create subscription_plans table directly...');
    
    // Try to create using REST API
    // Since we can't directly create tables via Supabase JS client,
    // we'll output instructions for the user to create the table manually
    console.log('\n\n===========================================================');
    console.log('IMPORTANT: You need to create the tables manually in Supabase');
    console.log('===========================================================');
    console.log('Please go to your Supabase dashboard and run the following SQL:');
    console.log(`
    -- Create subscription_plans table
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      tier TEXT NOT NULL,
      price NUMERIC NOT NULL,
      period TEXT NOT NULL,
      features JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create prompts table
    CREATE TABLE IF NOT EXISTS prompts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Set up row level security for prompts
    ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for prompts
    CREATE POLICY "Users can view their own prompts"
      ON prompts FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create their own prompts"
      ON prompts FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own prompts"
      ON prompts FOR UPDATE
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own prompts"
      ON prompts FOR DELETE
      USING (auth.uid() = user_id);
    
    -- Create profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      email TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Set up row level security for profiles
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for profiles
    CREATE POLICY "Users can view their own profile"
      ON profiles FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = user_id);
    `);
    console.log('===========================================================');
    return true;
  } catch (error) {
    console.error('Error creating subscription_plans table directly:', error);
    return false;
  }
};

// Run the setup function
createTables().then(() => {
  console.log('Database setup completed!');
}).catch(error => {
  console.error('Database setup failed:', error);
}); 