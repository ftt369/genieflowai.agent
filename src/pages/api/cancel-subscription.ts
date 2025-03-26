import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { supabase } from '../../config/services';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = session.user.id;
    const { subscriptionId, cancelImmediately = false } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ message: 'Subscription ID is required' });
    }

    // Verify subscription belongs to user
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subscriptionError || !subscriptionData) {
      console.error('Error fetching subscription:', subscriptionError);
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Cancel subscription in Stripe
    if (cancelImmediately) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update subscription in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: cancelImmediately ? 'canceled' : subscriptionData.status,
        cancel_at: cancelImmediately ? new Date().toISOString() : subscriptionData.current_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      console.error('Error updating subscription record:', updateError);
      return res.status(500).json({ message: 'Error updating subscription record' });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ message: error.message });
  }
} 