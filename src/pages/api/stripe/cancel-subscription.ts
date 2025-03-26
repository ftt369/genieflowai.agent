import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../../config/services';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriptionId, cancelImmediately = false } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
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

    // Cancel the subscription with Stripe
    let subscription;
    if (cancelImmediately) {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update the subscription in the database
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        cancelAt: subscription.cancel_at 
          ? new Date(subscription.cancel_at * 1000).toISOString() 
          : null,
        canceledAt: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000).toISOString() 
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('stripeSubscriptionId', subscriptionId);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      return res.status(500).json({ error: 'Failed to update subscription data' });
    }

    return res.status(200).json({ 
      success: true, 
      message: cancelImmediately 
        ? 'Subscription canceled immediately' 
        : 'Subscription will be canceled at the end of the billing period' 
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
  }
} 