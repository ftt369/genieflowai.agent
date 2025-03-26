import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../config/services';
import { getPlanById } from '../../../data/subscriptionPlans';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest API version
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, planId, addons = [], successUrl, cancelUrl } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get the plan details
    const plan = getPlanById(planId);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Check if user exists in Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user data:', userError);
      return res.status(500).json({ error: 'Failed to retrieve user data' });
    }

    // Get or create Stripe customer
    let customerId: string;

    if (userData?.stripe_customer_id) {
      customerId = userData.stripe_customer_id;
    } else {
      // Get user email from auth
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError || !authData?.user) {
        console.error('Error fetching user auth data:', authError);
        return res.status(500).json({ error: 'Failed to retrieve user authentication data' });
      }

      // Create a new customer
      const customer = await stripe.customers.create({
        email: authData.user.email,
        metadata: {
          userId: userId,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user with Stripe customer ID:', updateError);
        // Continue anyway, as this is not critical for checkout
      }
    }

    // Set up line items for the checkout session
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Add the subscription plan
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: plan.name,
          description: plan.description,
        },
        unit_amount: plan.price, // Price in cents
        recurring: {
          interval: plan.period === 'monthly' ? 'month' : 'year',
        },
      },
      quantity: 1,
    });

    // Add any addon items
    if (addons.length > 0) {
      // Implementation for addons would go here
      // For each addon, fetch its details and add to line items
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
        addons: JSON.stringify(addons),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
} 