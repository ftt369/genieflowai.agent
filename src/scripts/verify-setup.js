// Verification script for Supabase database setup
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
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

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or Anon Key is missing from environment variables.');
  process.exit(1);
}

console.log(`Connecting to Supabase at ${supabaseUrl} using anon key`);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// List of tables to verify
const tables = [
  'profiles',
  'user_preferences',
  'modes',
  'knowledge_bases',
  'knowledge_documents',
  'workers_comp_documents',
  'prompts',
  'subscription_plans',
  'user_subscriptions',
  'subscription_usage',
  'invoices',
  'payment_methods'
];

// Function to verify tables
async function verifyTables() {
  console.log('Verifying database tables...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Table ${table}: ERROR - ${error.message}`);
        failed++;
      } else {
        console.log(`✅ Table ${table}: OK - Found in database`);
        success++;
      }
    } catch (err) {
      console.error(`❌ Table ${table}: ERROR - ${err.message}`);
      failed++;
    }
  }
  
  console.log('\nVerification complete!');
  console.log(`✅ ${success} tables verified successfully`);
  console.log(`❌ ${failed} tables had errors`);
  
  // Check subscription plans specifically
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (error) {
      console.error('Could not verify subscription plans:', error.message);
    } else if (data && data.length > 0) {
      console.log('\nFound subscription plans:');
      data.forEach(plan => {
        console.log(`- ${plan.name} (${plan.tier}): $${plan.price} per ${plan.period}`);
      });
    } else {
      console.log('\nNo subscription plans found. You may need to run:');
      console.log('npm run db:simple-seed');
    }
  } catch (err) {
    console.error('Error checking subscription plans:', err.message);
  }
}

// Run verification
verifyTables().catch(err => {
  console.error('Verification failed:', err);
}); 