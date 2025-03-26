// ESM version of the subscription plans seeding script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get the current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\x1b[31mError: Supabase URL and service role key are required.\x1b[0m');
  console.error('Please ensure your .env.local file contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', 'Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Subscription plan data
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic access to essential features',
    tier: 'free',
    price: 0,
    period: 'month',
    features: {
      messages_per_day: 10,
      documents_per_month: 5,
      max_document_size_mb: 2,
      knowledge_bases: 1,
      advanced_features: false,
      priority_support: false,
      team_members: 1
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Enhanced access with higher limits',
    tier: 'basic',
    price: 9.99,
    period: 'month',
    features: {
      messages_per_day: 50,
      documents_per_month: 50,
      max_document_size_mb: 10,
      knowledge_bases: 3,
      advanced_features: false,
      priority_support: false,
      team_members: 1
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
      messages_per_day: 200,
      documents_per_month: 200,
      max_document_size_mb: 25,
      knowledge_bases: 10,
      advanced_features: true,
      priority_support: true,
      team_members: 3
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Comprehensive solution for teams',
    tier: 'enterprise',
    price: 49.99,
    period: 'month',
    features: {
      messages_per_day: 1000,
      documents_per_month: 1000,
      max_document_size_mb: 100,
      knowledge_bases: 25,
      advanced_features: true,
      priority_support: true,
      team_members: 10
    }
  }
];

// Subscription features data
const subscriptionFeatures = [
  {
    id: 'messages_per_day',
    name: 'Daily Messages',
    description: 'Number of messages that can be sent per day',
    type: 'limit'
  },
  {
    id: 'documents_per_month',
    name: 'Monthly Document Uploads',
    description: 'Number of documents that can be uploaded per month',
    type: 'limit'
  },
  {
    id: 'max_document_size_mb',
    name: 'Maximum Document Size',
    description: 'Maximum size of a single document in MB',
    type: 'limit'
  },
  {
    id: 'knowledge_bases',
    name: 'Knowledge Bases',
    description: 'Number of knowledge bases that can be created',
    type: 'limit'
  },
  {
    id: 'advanced_features',
    name: 'Advanced Features',
    description: 'Access to advanced features',
    type: 'boolean'
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Access to priority customer support',
    type: 'boolean'
  },
  {
    id: 'team_members',
    name: 'Team Members',
    description: 'Number of team members allowed',
    type: 'limit'
  }
];

// Function to seed subscription plans
async function seedSubscriptionPlans() {
  try {
    console.log('\x1b[36m%s\x1b[0m', 'Seeding subscription plans...');
    
    // Insert subscription plans
    for (const plan of subscriptionPlans) {
      const { error } = await supabase
        .from('subscription_plans')
        .upsert({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          tier: plan.tier,
          price: plan.price,
          period: plan.period,
          features: plan.features
        }, { onConflict: 'id' });
      
      if (error) {
        console.error(`\x1b[31mError inserting plan ${plan.id}: ${error.message}\x1b[0m`);
      } else {
        console.log(`\x1b[32mPlan ${plan.id} inserted/updated successfully\x1b[0m`);
      }
    }

    // Insert subscription features (if using separate features table)
    if (await tableExists('subscription_features')) {
      console.log('\x1b[36m%s\x1b[0m', 'Seeding subscription features...');
      
      for (const feature of subscriptionFeatures) {
        const { error } = await supabase
          .from('subscription_features')
          .upsert({
            id: feature.id,
            name: feature.name,
            description: feature.description,
            type: feature.type
          }, { onConflict: 'id' });
        
        if (error) {
          console.error(`\x1b[31mError inserting feature ${feature.id}: ${error.message}\x1b[0m`);
        } else {
          console.log(`\x1b[32mFeature ${feature.id} inserted/updated successfully\x1b[0m`);
        }
      }
      
      // Insert plan-feature relationships (if using junction table)
      if (await tableExists('plan_features')) {
        console.log('\x1b[36m%s\x1b[0m', 'Seeding plan features relationships...');
        
        for (const plan of subscriptionPlans) {
          for (const [featureId, value] of Object.entries(plan.features)) {
            const planFeature = {
              plan_id: plan.id,
              feature_id: featureId,
              included: typeof value === 'boolean' ? value : true,
              limit: typeof value === 'number' ? value : null
            };
            
            const { error } = await supabase
              .from('plan_features')
              .upsert(planFeature, { 
                onConflict: 'plan_id,feature_id'
              });
            
            if (error) {
              console.error(`\x1b[31mError linking feature ${featureId} to plan ${plan.id}: ${error.message}\x1b[0m`);
            }
          }
        }
      }
    }
    
    console.log('\x1b[32m%s\x1b[0m', '✓ Subscription plans seeded successfully!');
  } catch (error) {
    console.error('\x1b[31mError seeding subscription plans:\x1b[0m', error);
    process.exit(1);
  }
}

// Check if a table exists in the database
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .eq('table_schema', 'public');
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('\x1b[35m%s\x1b[0m', '=== GenieAgent Subscription Plans Seeding ===');
    
    await seedSubscriptionPlans();
    
    console.log('\x1b[32m%s\x1b[0m', '✓ All done!');
    console.log('\x1b[36m%s\x1b[0m', 'You can now use the subscription plans in your application.');
  } catch (error) {
    console.error('\x1b[31mError during seeding:\x1b[0m', error);
    process.exit(1);
  }
}

// Run the main function
main(); 