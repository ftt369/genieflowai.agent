import { buffer } from 'micro';
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../config/services';
import { getPlanById } from '../../../data/subscriptionPlans';

// Disable body parsing, we need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Webhook secret for verifying events
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    // Verify the event came from Stripe
    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        
        if (!userId || !planId) {
          console.error('Missing user ID or plan ID in session metadata');
          return res.status(400).json({ error: 'Missing metadata' });
        }

        // Get subscription ID from the session
        const subscriptionId = session.subscription as string;
        
        if (!subscriptionId) {
          console.error('No subscription created');
          return res.status(400).json({ error: 'No subscription created' });
        }

        // Fetch the subscription to get billing details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Calculate next billing date and trial end
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const trialEnd = subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : null;

        // Get the plan details
        const plan = getPlanById(planId);
        
        if (!plan) {
          console.error(`Plan not found: ${planId}`);
          return res.status(400).json({ error: 'Invalid plan ID' });
        }

        // Create or update user subscription in database
        const { error: upsertError } = await supabase
          .from('user_subscriptions')
          .upsert({
            userId,
            planId,
            status: subscription.status,
            stripeSubscriptionId: subscriptionId,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd,
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trialEnd,
            priceId: (subscription.items.data[0]?.price.id || ''),
            nextPaymentDate: currentPeriodEnd,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

        if (upsertError) {
          console.error('Error upserting user subscription:', upsertError);
          return res.status(500).json({ error: 'Database error' });
        }

        // Initialize usage tracking for the user's features
        if (plan.features) {
          const featurePromises = plan.features
            .filter(feature => feature.included && feature.limit !== undefined)
            .map(feature => {
              // Get current period (YYYY-MM)
              const now = new Date();
              const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
              
              return supabase
                .from('subscription_usage')
                .upsert({
                  userId,
                  featureId: feature.id,
                  used: 0,
                  limit: feature.limit,
                  period,
                  updatedAt: new Date().toISOString(),
                });
            });
          
          await Promise.all(featurePromises);
        }

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (!subscriptionId) {
          break; // Not a subscription invoice
        }

        // Fetch the subscription to get customer ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Fetch customer to get user ID
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if (!customer || customer.deleted) {
          console.error('Customer not found or deleted');
          break;
        }

        const userId = customer.metadata.userId;
        
        if (!userId) {
          console.error('User ID not found in customer metadata');
          break;
        }

        // Store invoice in database
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            userId,
            subscriptionId,
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: invoice.status,
            billingReason: invoice.billing_reason,
            invoiceDate: new Date(invoice.created * 1000).toISOString(),
            dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
            pdfUrl: invoice.invoice_pdf,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

        if (invoiceError) {
          console.error('Error inserting invoice:', invoiceError);
        }

        // Update subscription status
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq('stripeSubscriptionId', subscriptionId);

        if (subscriptionError) {
          console.error('Error updating subscription status:', subscriptionError);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (!subscriptionId) {
          break; // Not a subscription invoice
        }

        // Update subscription status
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'past_due',
            updatedAt: new Date().toISOString(),
          })
          .eq('stripeSubscriptionId', subscriptionId);

        if (subscriptionError) {
          console.error('Error updating subscription status:', subscriptionError);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get user ID from subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if (!customer || customer.deleted) {
          console.error('Customer not found or deleted');
          break;
        }

        const userId = customer.metadata.userId;
        
        if (!userId) {
          console.error('User ID not found in customer metadata');
          break;
        }

        // Update subscription in database
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            nextPaymentDate: new Date(subscription.current_period_end * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq('stripeSubscriptionId', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription in database
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            canceledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq('stripeSubscriptionId', subscription.id);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
        }

        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ error: error.message || 'Webhook handler failed' });
  }
} 