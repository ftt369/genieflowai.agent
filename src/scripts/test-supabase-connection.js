// Test Supabase connection
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
} else {
  console.warn(`Warning: ${envPath} file not found`);
  dotenv.config();
}

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Error: Supabase URL is missing from environment variables.');
  process.exit(1);
}

console.log('Testing Supabase connections:');
console.log(`Supabase URL: ${supabaseUrl}`);

// Try anonymous key connection
if (supabaseAnonKey) {
  console.log('Testing connection with anon key...');
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test a simple query with anon key - simpler query
  supabaseAnon.from('subscription_plans')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('Anon key connection failed:', error);
      } else {
        console.log('Anon key connection successful!');
        console.log(`Found ${data.length} subscription plans`);
      }
    })
    .catch(err => {
      console.error('Error with anon key connection:', err.message);
    });
} else {
  console.log('No anon key available to test');
}

// Try service role key connection
if (supabaseServiceKey) {
  console.log('Testing connection with service role key...');
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  
  // Test a simple query with service role key - simpler query
  supabaseService.from('subscription_plans')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('Service role key connection failed:', error);
      } else {
        console.log('Service role key connection successful!');
        console.log(`Found ${data.length} subscription plans`);
      }
    })
    .catch(err => {
      console.error('Error with service role connection:', err.message);
    });
} else {
  console.log('No service role key available to test');
}

// Also try to test a simple HTTP request to the Supabase URL
try {
  console.log(`Testing HTTP access to ${supabaseUrl}...`);
  
  // Parse the URL to display more details
  try {
    const url = new URL(supabaseUrl);
    console.log(`Protocol: ${url.protocol}`);
    console.log(`Hostname: ${url.hostname}`);
    console.log(`Path: ${url.pathname}`);
  } catch (e) {
    console.error('Failed to parse URL:', e.message);
  }
  
  fetch(supabaseUrl)
    .then(response => {
      console.log(`HTTP status: ${response.status}`);
      console.log(`Response type: ${response.type}`);
      console.log(`Response headers: ${JSON.stringify([...response.headers])}`);
      if (response.ok) {
        console.log('Supabase URL is accessible');
        return response.text().then(text => {
          console.log(`Response first 100 chars: ${text.substring(0, 100)}...`);
        });
      } else {
        console.log('Supabase URL returned an error status');
      }
    })
    .catch(err => {
      console.error('Error accessing Supabase URL:', err.message);
    });
} catch (error) {
  console.error('Failed to test HTTP access:', error.message);
} 