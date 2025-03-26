import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabase } from '../../config/services';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

// Disable the default body parser to get the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const signature = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      buf.toString(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  console.log(`Event received: ${event.type}`);

  // Handle specific event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        
        if (!userId || !planId) {
          console.error('Missing metadata in checkout session');
          return res.status(400).json({ message: 'Missing metadata in checkout session' });
        }
        
        // Create subscription record in database
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        const { error } = await supabase.from('subscriptions').insert({
          user_id: userId,
          plan_id: planId,
          status: subscription.status,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        if (error) {
          console.error('Error creating subscription record:', error);
          return res.status(500).json({ message: 'Error creating subscription record' });
        }
        
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (!subscriptionId) {
          console.error('Missing subscription ID in invoice');
          return res.status(400).json({ message: 'Missing subscription ID in invoice' });
        }
        
        // Get subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Get user ID from subscription in database
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
        
        if (subscriptionError || !subscriptionData) {
          console.error('Error fetching subscription:', subscriptionError);
          return res.status(500).json({ message: 'Error fetching subscription' });
        }
        
        // Create invoice record in database
        const { error } = await supabase.from('invoices').insert({
          user_id: subscriptionData.user_id,
          subscription_id: subscriptionId,
          amount: invoice.total,
          currency: invoice.currency,
          status: invoice.status,
          billing_reason: invoice.billing_reason,
          invoice_date: new Date(invoice.created * 1000).toISOString(),
          due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
          pdf_url: invoice.invoice_pdf,
          stripe_invoice_id: invoice.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        if (error) {
          console.error('Error creating invoice record:', error);
          return res.status(500).json({ message: 'Error creating invoice record' });
        }
        
        // Update subscription status in database
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        if (updateError) {
          console.error('Error updating subscription record:', updateError);
          return res.status(500).json({ message: 'Error updating subscription record' });
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status in database
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (error) {
          console.error('Error updating subscription record:', error);
          return res.status(500).json({ message: 'Error updating subscription record' });
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status in database
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (error) {
          console.error('Error updating subscription record:', error);
          return res.status(500).json({ message: 'Error updating subscription record' });
        }
        
        break;
      }
      
      // Add more event handlers as needed
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ message: error.message });
  }
} 