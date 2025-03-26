import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../../config/services';
import { getPlanById } from '../../../data/subscriptionPlans';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriptionId, planId } = req.body;

    if (!subscriptionId || !planId) {
      return res.status(400).json({ error: 'Subscription ID and Plan ID are required' });
    }

    // Get the plan details
    const plan = getPlanById(planId);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Fetch the subscription from database to verify ownership
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('stripeSubscriptionId', subscriptionId)
      .single();

    if (subscriptionError || !subscriptionData) {
      console.error('Error fetching subscription data:', subscriptionError);
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Fetch the current subscription from Stripe
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get the current price ID
    const currentPriceId = currentSubscription.items.data[0].price.id;
    
    // Create a new price for the plan if it doesn't exist in Stripe yet
    let newPriceId;
    
    // In a production app, you would store the price IDs in your database
    // For simplicity, we'll create a new price each time
    const price = await stripe.prices.create({
      product_data: {
        name: plan.name,
        metadata: {
          description: plan.description
        }
      },
      unit_amount: plan.price, // in cents
      currency: 'usd',
      recurring: {
        interval: plan.period === 'monthly' ? 'month' : 'year',
      },
      metadata: {
        planId: plan.id,
      },
    });
    
    newPriceId = price.id;

    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      proration_behavior: 'create_prorations',
      items: [
        {
          id: currentSubscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      metadata: {
        planId: plan.id,
      },
    });

    // Update the subscription in the database
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        planId: plan.id,
        status: updatedSubscription.status,
        currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
        priceId: newPriceId,
        updatedAt: new Date().toISOString(),
      })
      .eq('stripeSubscriptionId', subscriptionId);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      return res.status(500).json({ error: 'Failed to update subscription data' });
    }

    // Update usage limits for the new plan
    if (plan.features) {
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // For each feature with a limit, update the limit in the usage table
      const usagePromises = plan.features
        .filter(feature => feature.included && feature.limit !== undefined)
        .map(feature => {
          return supabase
            .from('subscription_usage')
            .upsert({
              userId: subscriptionData.userId,
              featureId: feature.id,
              limit: feature.limit,
              used: 0, // Reset usage when upgrading/downgrading
              period,
              updatedAt: new Date().toISOString(),
            }, {
              onConflict: 'userId, featureId, period',
              ignoreDuplicates: false,
            });
        });
      
      await Promise.all(usagePromises);
    }

    return res.status(200).json({ 
      success: true, 
      subscription: {
        id: updatedSubscription.id,
        planId: plan.id,
        status: updatedSubscription.status,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ error: error.message || 'Failed to update subscription' });
  }
} 