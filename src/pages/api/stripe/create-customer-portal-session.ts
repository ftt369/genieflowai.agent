import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../config/services';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest API version
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, returnUrl } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user's Stripe customer ID from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return res.status(500).json({ error: 'Failed to retrieve user data' });
    }

    if (!userData?.stripe_customer_id) {
      return res.status(404).json({ error: 'No Stripe customer found for this user' });
    }

    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: returnUrl || `${req.headers.origin}/account/billing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating customer portal session:', error);
    return res.status(500).json({ error: error.message || 'Failed to create customer portal session' });
  }
} 