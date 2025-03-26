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

    // Get subscription data from the database
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (!subscriptionData?.stripe_customer_id) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscriptionData.stripe_customer_id,
      return_url: `${req.headers.origin}/subscription/manage`,
    });

    return res.status(200).json({
      url: portalSession.url,
    });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({ message: error.message });
  }
} 