import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { getPlanById } from '../../data/subscriptionPlans';
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

    const { planId, addons = [] } = req.body;
    const userId = session.user.id;

    // Get the plan
    const plan = getPlanById(planId);

    if (!plan) {
      return res.status(400).json({ message: 'Plan not found' });
    }

    // Get existing customer or create a new one
    let customerId: string;
    const customerData = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (customerData.data.length > 0) {
      customerId = customerData.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email as string,
        name: session.user.name as string,
        metadata: {
          userId,
        },
      });
      customerId = customer.id;
    }

    // Prepare line items
    const lineItems = [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ];

    // Add addons if any
    if (addons.length > 0) {
      // Add addon prices to line items
      // This would need to be implemented based on how addons are stored
      // For simplicity, assuming addon IDs are Stripe price IDs
      addons.forEach((addonPriceId: string) => {
        lineItems.push({
          price: addonPriceId,
          quantity: 1,
        });
      });
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/subscription/plans`,
      metadata: {
        userId,
        planId,
      },
    });

    return res.status(200).json({
      id: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ message: error.message });
  }
} 