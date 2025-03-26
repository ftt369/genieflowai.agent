// Test authentication flow with Supabase
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

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or Anon Key is missing from environment variables.');
  process.exit(1);
}

// Initialize Supabase client
console.log(`Connecting to Supabase at ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials - REPLACE THESE with test values
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123456!';

// Test signup function
async function testSignup() {
  console.log('\n🔹 Testing signup...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.error('❌ Signup failed:', error.message);
      return false;
    } else {
      console.log('✅ Signup successful!');
      console.log('📧 A confirmation email would be sent to:', TEST_EMAIL);
      console.log('User ID:', data.user?.id);
      return true;
    }
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    return false;
  }
}

// Test signin function
async function testSignin() {
  console.log('\n🔹 Testing signin...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.error('❌ Signin failed:', error.message);
      return false;
    } else {
      console.log('✅ Signin successful!');
      console.log('User ID:', data.user?.id);
      return true;
    }
  } catch (err) {
    console.error('❌ Signin error:', err.message);
    return false;
  }
}

// Test creating profile
async function testCreateProfile(userId) {
  console.log('\n🔹 Testing profile creation...');
  
  if (!userId) {
    console.error('❌ Cannot create profile: No user ID provided');
    return false;
  }
  
  try {
    const profileData = {
      id: userId,
      user_id: userId,
      full_name: 'Test User',
      email: TEST_EMAIL,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select();
    
    if (error) {
      console.error('❌ Profile creation failed:', error.message);
      return false;
    } else {
      console.log('✅ Profile created/updated successfully!');
      console.log('Profile:', data[0]);
      return true;
    }
  } catch (err) {
    console.error('❌ Profile creation error:', err.message);
    return false;
  }
}

// Test signout function
async function testSignout() {
  console.log('\n🔹 Testing signout...');
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Signout failed:', error.message);
      return false;
    } else {
      console.log('✅ Signout successful!');
      return true;
    }
  } catch (err) {
    console.error('❌ Signout error:', err.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting auth flow tests with Supabase...');
  
  let userId = null;
  
  // Test signup
  const signupSuccess = await testSignup();
  
  // Test signin
  if (signupSuccess || true) { // Continue even if signup fails (user might already exist)
    const signinResult = await testSignin();
    
    if (signinResult) {
      // Get user
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id;
      
      // Create/update profile
      await testCreateProfile(userId);
      
      // Test signout
      await testSignout();
    }
  }
  
  console.log('\n🏁 Auth flow testing complete!');
}

// Run the tests
runTests().catch(err => {
  console.error('Test suite error:', err);
}); 