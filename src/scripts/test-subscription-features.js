// Test subscription features with Supabase
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

// Test functions
async function testGetSubscriptionPlans() {
  console.log('\n🔹 Testing getSubscriptionPlans...');
  
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (error) {
      console.error('❌ Getting subscription plans failed:', error.message);
      return null;
    } else {
      console.log('✅ Got subscription plans successfully!');
      console.log(`Found ${data.length} subscription plans:`);
      data.forEach(plan => {
        console.log(`- ${plan.name} (${plan.tier}): $${plan.price} per ${plan.period}`);
      });
      return data;
    }
  } catch (err) {
    console.error('❌ Error getting subscription plans:', err.message);
    return null;
  }
}

async function testCreateUserSubscription(userId) {
  console.log('\n🔹 Testing creating user subscription...');
  
  if (!userId) {
    console.error('❌ Cannot create subscription: No user ID provided');
    return false;
  }
  
  try {
    // Use the free tier for testing
    const subscriptionData = {
      user_id: userId,
      plan_id: 'free',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData)
      .select();
    
    if (error) {
      console.error('❌ Creating user subscription failed:', error.message);
      return false;
    } else {
      console.log('✅ User subscription created/updated successfully!');
      console.log('Subscription:', data[0]);
      return true;
    }
  } catch (err) {
    console.error('❌ Error creating user subscription:', err.message);
    return false;
  }
}

async function testTrackUsage(userId) {
  console.log('\n🔹 Testing usage tracking...');
  
  if (!userId) {
    console.error('❌ Cannot track usage: No user ID provided');
    return false;
  }
  
  try {
    const currentDate = new Date();
    const period = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const usageData = {
      user_id: userId,
      feature_id: 'messages_per_day',
      used: 1, // Increment by 1
      period: period
    };
    
    // First check if there's existing usage
    const { data: existingData, error: fetchError } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_id', 'messages_per_day')
      .eq('period', period)
      .maybeSingle();
    
    if (fetchError) {
      console.error('❌ Fetching usage data failed:', fetchError.message);
      return false;
    }
    
    let result;
    
    if (existingData) {
      // Update existing usage
      const { data, error } = await supabase
        .from('subscription_usage')
        .update({ used: existingData.used + 1, updated_at: new Date().toISOString() })
        .eq('id', existingData.id)
        .select();
      
      result = { data, error };
    } else {
      // Create new usage record
      const { data, error } = await supabase
        .from('subscription_usage')
        .insert(usageData)
        .select();
      
      result = { data, error };
    }
    
    if (result.error) {
      console.error('❌ Tracking usage failed:', result.error.message);
      return false;
    } else {
      console.log('✅ Usage tracked successfully!');
      console.log('Usage data:', result.data[0]);
      return true;
    }
  } catch (err) {
    console.error('❌ Error tracking usage:', err.message);
    return false;
  }
}

// Sign in to get a user ID for testing
async function signIn() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.error('❌ Signin failed:', error.message);
      return null;
    } else {
      console.log('✅ Signed in as test user');
      return data.user?.id;
    }
  } catch (err) {
    console.error('❌ Signin error:', err.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting subscription feature tests with Supabase...');
  
  // Get subscription plans
  const plans = await testGetSubscriptionPlans();
  
  if (!plans || plans.length === 0) {
    console.error('❌ No subscription plans found. Exiting tests.');
    return;
  }
  
  // Sign in to get a user ID
  const userId = await signIn();
  
  if (userId) {
    // Create/update user subscription
    await testCreateUserSubscription(userId);
    
    // Track usage
    await testTrackUsage(userId);
    
    // Sign out
    await supabase.auth.signOut();
  }
  
  console.log('\n🏁 Subscription feature testing complete!');
}

// Run the tests
runTests().catch(err => {
  console.error('Test suite error:', err);
}); 