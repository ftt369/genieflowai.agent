import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { SUBSCRIPTION_PLANS, FEATURES } from '../config/subscription-plans';
import { SubscriptionPeriod } from '../types/subscription';

// Load environment variables
dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedStripeProducts() {
  console.log('Seeding Stripe products and prices...');
  
  for (const plan of SUBSCRIPTION_PLANS) {
    if (plan.id === 'free') continue; // Skip free plan as it doesn't need Stripe products
    
    console.log(`Creating/updating product for ${plan.name} plan...`);
    
    // Create or update the product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        plan_id: plan.id,
        tier: plan.tier,
      },
    });
    
    console.log(`Created product: ${product.id}`);
    
    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price[SubscriptionPeriod.MONTHLY] * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_id: plan.id,
        period: SubscriptionPeriod.MONTHLY,
      },
    });
    
    console.log(`Created monthly price: ${monthlyPrice.id}`);
    
    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price[SubscriptionPeriod.YEARLY] * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan_id: plan.id,
        period: SubscriptionPeriod.YEARLY,
      },
    });
    
    console.log(`Created yearly price: ${yearlyPrice.id}`);
    
    // Store the price IDs (you would update your configuration or database with these)
    console.log(`Update your subscription-plans.ts with these price IDs:`);
    console.log(`Plan: ${plan.id}`);
    console.log(`- Monthly Price ID: ${monthlyPrice.id}`);
    console.log(`- Yearly Price ID: ${yearlyPrice.id}`);
    console.log('--------------------------');
  }
}

async function seedSupabasePlans() {
  console.log('Seeding Supabase subscription_plans table...');
  
  // Create features in Supabase
  const { error: featuresError } = await supabase
    .from('subscription_features')
    .upsert(
      Object.values(FEATURES).map(feature => ({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        type: feature.type,
      }))
    );
  
  if (featuresError) {
    console.error('Error seeding features:', featuresError);
    return;
  }
  
  console.log('Successfully seeded features');
  
  // Create plans in Supabase
  for (const plan of SUBSCRIPTION_PLANS) {
    console.log(`Creating/updating ${plan.name} plan...`);
    
    // Insert plan
    const { error: planError } = await supabase
      .from('subscription_plans')
      .upsert({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        tier: plan.tier,
        monthly_price: plan.price[SubscriptionPeriod.MONTHLY],
        yearly_price: plan.price[SubscriptionPeriod.YEARLY],
        stripe_monthly_price_id: plan.stripe.monthlyPriceId,
        stripe_yearly_price_id: plan.stripe.yearlyPriceId,
      });
    
    if (planError) {
      console.error(`Error creating plan ${plan.id}:`, planError);
      continue;
    }
    
    // Insert plan features
    const planFeatures = Object.entries(plan.features).map(([featureId, feature]) => ({
      plan_id: plan.id,
      feature_id: featureId,
      included: feature.included,
      limit: feature.limit || null,
      period: feature.period || null,
    }));
    
    const { error: featuresError } = await supabase
      .from('plan_features')
      .upsert(planFeatures);
    
    if (featuresError) {
      console.error(`Error creating features for plan ${plan.id}:`, featuresError);
      continue;
    }
    
    console.log(`Successfully created/updated ${plan.name} plan`);
  }
  
  console.log('Finished seeding subscription plans');
}

async function main() {
  try {
    await seedStripeProducts();
    await seedSupabasePlans();
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

// Run the seed script
main(); 