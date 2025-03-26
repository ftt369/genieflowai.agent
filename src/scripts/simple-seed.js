// Simple script to seed subscription plans to Supabase
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

if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
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

// Subscription plans to add
const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic access for small teams',
    tier: 'free',
    price: 0,
    period: 'month',
    features: {
      messages_per_day: 50,
      documents_per_month: 20,
      max_document_size_mb: 5,
      knowledge_bases: 1
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Enhanced features for growing teams',
    tier: 'basic',
    price: 9.99,
    period: 'month',
    features: {
      messages_per_day: 250,
      documents_per_month: 100,
      max_document_size_mb: 15,
      knowledge_bases: 3
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Advanced features for power users',
    tier: 'pro',
    price: 19.99,
    period: 'month',
    features: {
      messages_per_day: 1000,
      documents_per_month: 500,
      max_document_size_mb: 50,
      knowledge_bases: 10
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Comprehensive features for large organizations',
    tier: 'enterprise',
    price: 49.99,
    period: 'month',
    features: {
      messages_per_day: 5000,
      documents_per_month: 2000,
      max_document_size_mb: 200,
      knowledge_bases: 'Unlimited'
    }
  }
];

// Function to insert plans
async function seedPlans() {
  console.log('Seeding subscription plans...');
  
  for (const plan of plans) {
    const { data, error } = await supabase
      .from('subscription_plans')
      .upsert(plan, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error inserting plan ${plan.id}:`, error);
    } else {
      console.log(`Successfully inserted/updated plan: ${plan.name}`);
    }
  }
  
  console.log('Seeding completed!');
}

// Run the seeding function
seedPlans(); 