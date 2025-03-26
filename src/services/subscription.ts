import { supabase } from '../config/services';
import { UUID } from '../types/common';
import { UserSubscription, SubscriptionPlan, PaymentMethod, Invoice, AddonFeature, SubscriptionUsage } from '../types/subscription';
import { getPlanById } from '../data/subscriptionPlans';
import { User } from '@supabase/supabase-js';
import { loadStripe as initStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = initStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const STRIPE_API_URL = import.meta.env.VITE_STRIPE_API_URL || '/api/stripe';

/**
 * Gets the current subscription for a user
 */
export const getUserSubscription = async (userId: UUID): Promise<UserSubscription | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data as UserSubscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

/**
 * Gets subscription details including plan information
 */
export const getSubscriptionDetails = async (userId: UUID) => {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return {
      subscription: null,
      plan: null,
      endDate: null,
      isActive: false,
    };
  }

  const plan = getPlanById(subscription.planId);
  const endDate = new Date(subscription.currentPeriodEnd);
  const isActive = ['active', 'trialing'].includes(subscription.status);

  return {
    subscription,
    plan,
    endDate,
    isActive,
  };
};

/**
 * Create a checkout session for subscription purchase
 */
export const createCheckoutSession = async (
  userId: string,
  planId: string,
  addons: string[] = []
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        planId,
        addons,
        successUrl: `${window.location.origin}/account/billing?success=true`,
        cancelUrl: `${window.location.origin}/checkout?planId=${planId}&canceled=true`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    const data = await response.json();
    return { url: data.url, error: null };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return { url: null, error };
  }
};

/**
 * Create a customer portal session for managing subscriptions
 */
export const createCustomerPortalSession = async (
  userId: string
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-customer-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        returnUrl: `${window.location.origin}/account/billing`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create customer portal session');
    }

    const data = await response.json();
    return { url: data.url, error: null };
  } catch (error: any) {
    console.error('Error creating customer portal session:', error);
    return { url: null, error };
  }
};

/**
 * Gets user payment methods
 */
export const getUserPaymentMethods = async (userId: UUID): Promise<PaymentMethod[]> => {
  try {
    // Query the payment_methods table for the user's payment methods
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('userId', userId);
    
    if (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error(`Failed to fetch payment methods: ${error.message}`);
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error in getUserPaymentMethods:', error);
    throw new Error(`Failed to get payment methods: ${error.message}`);
  }
};

/**
 * Gets user invoices
 */
export const getUserInvoices = async (userId: UUID): Promise<Invoice[]> => {
  try {
    // Query the invoices table for the user's invoices
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('userId', userId)
      .order('invoiceDate', { ascending: false });
    
    if (error) {
      console.error('Error fetching invoices:', error);
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error in getUserInvoices:', error);
    throw new Error(`Failed to get invoices: ${error.message}`);
  }
};

/**
 * Cancels a subscription
 */
export const cancelSubscription = async (
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<{ success: boolean; error: any }> => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        cancelImmediately,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        error: null
      };
    } else {
      return {
        success: false,
        error: new Error(data.message || 'Error canceling subscription')
      };
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Updates a subscription plan
 */
export const updateSubscriptionPlan = async (
  subscriptionId: string,
  newPlanId: string
): Promise<{ success: boolean; error: any }> => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/update-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        planId: newPlanId,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        error: null
      };
    } else {
      return {
        success: false,
        error: new Error(data.message || 'Error updating subscription')
      };
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Adds an addon to a subscription
 */
export const addSubscriptionAddon = async (
  subscriptionId: string,
  addonId: string
): Promise<{ success: boolean; error: any }> => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/add-addon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        addonId,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        error: null
      };
    } else {
      return {
        success: false,
        error: new Error(data.message || 'Error adding subscription addon')
      };
    }
  } catch (error) {
    console.error('Error adding subscription addon:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Removes an addon from a subscription
 */
export const removeSubscriptionAddon = async (
  subscriptionId: string,
  addonId: string
): Promise<{ success: boolean; error: any }> => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/remove-addon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        addonId,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        error: null
      };
    } else {
      return {
        success: false,
        error: new Error(data.message || 'Error removing subscription addon')
      };
    }
  } catch (error) {
    console.error('Error removing subscription addon:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Get the current user's subscription
 */
export const getCurrentSubscription = async (
  userId: string
): Promise<{ subscription: UserSubscription | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return { subscription: data as UserSubscription, error: null };
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return { subscription: null, error };
  }
};

/**
 * Check if user has access to a specific feature based on their subscription tier
 */
export const hasFeatureAccess = async (
  user: User | null,
  featureId: string
): Promise<boolean> => {
  if (!user) return false;

  try {
    // Get current subscription
    const { subscription, error } = await getCurrentSubscription(user.id);
    
    if (error || !subscription) {
      // Fallback to free tier if no subscription found
      return isFreeFeature(featureId);
    }

    // Get subscription plan details
    const plan = getPlanById(subscription.planId);
    
    if (!plan) {
      return isFreeFeature(featureId);
    }

    // Check if feature is included in plan
    const feature = plan.features.find((f: { id: string }) => f.id === featureId);
    return feature?.included === true;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
};

/**
 * Check if a feature is available in the free tier
 */
const isFreeFeature = (featureId: string): boolean => {
  // List of features available in the free tier
  const freeFeatures = [
    'chat-messages',
    'knowledge-bases',
    'file-storage',
    // Add other free features here
  ];
  
  return freeFeatures.includes(featureId);
};

/**
 * Get usage statistics for a specific feature
 */
export const getFeatureUsage = async (
  userId: string,
  featureId: string
): Promise<{ used: number; limit: number | null; error: Error | null }> => {
  try {
    // Get current period (current month in format YYYY-MM)
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Get usage from database
    const { data, error } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('userId', userId)
      .eq('featureId', featureId)
      .eq('period', currentPeriod)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      throw error;
    }

    // If no usage record, return 0 used
    if (!data) {
      return { used: 0, limit: null, error: null };
    }

    return { used: data.used, limit: data.limit, error: null };
  } catch (error: any) {
    console.error('Error fetching feature usage:', error);
    return { used: 0, limit: null, error };
  }
};

/**
 * Increment usage for a specific feature
 */
export const incrementFeatureUsage = async (
  userId: string,
  featureId: string,
  incrementBy: number = 1
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // Get current period (current month in format YYYY-MM)
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Check if usage record exists
    const { data, error } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('userId', userId)
      .eq('featureId', featureId)
      .eq('period', currentPeriod)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      // Create new usage record
      // First, get feature limit from user's subscription
      const { subscription, error: subError } = await getCurrentSubscription(userId);
      if (subError) throw subError;

      let limit = null;
      if (subscription) {
        // Get subscription plan details
        const plan = getPlanById(subscription.planId);
        if (plan) {
          const feature = plan.features.find((f: { id: string }) => f.id === featureId);
          limit = feature?.limit || null;
        }
      }

      // Insert new usage record
      const { error: insertError } = await supabase
        .from('subscription_usage')
        .insert({
          userId,
          featureId,
          used: incrementBy,
          limit,
          period: currentPeriod,
          updatedAt: new Date().toISOString()
        });

      if (insertError) throw insertError;
    } else {
      // Update existing usage record
      const { error: updateError } = await supabase
        .from('subscription_usage')
        .update({
          used: data.used + incrementBy,
          updatedAt: new Date().toISOString()
        })
        .eq('userId', userId)
        .eq('featureId', featureId)
        .eq('period', currentPeriod);

      if (updateError) throw updateError;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error incrementing feature usage:', error);
    return { success: false, error };
  }
};

/**
 * Gets user addon subscriptions
 */
export const getUserAddons = async (userId: UUID): Promise<AddonFeature[]> => {
  try {
    // In a real app, you would fetch this from your backend
    // This is placeholder data
    return [];
  } catch (error) {
    console.error('Error fetching user addons:', error);
    return [];
  }
};

/**
 * Get the user's subscription usage for the current billing period
 * @param userId The user ID
 * @returns Array of subscription usage data
 */
export async function getSubscriptionUsage(userId: string): Promise<SubscriptionUsage[]> {
  try {
    // Get the current period (YYYY-MM)
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Query the subscription_usage table for the user's current period usage
    const { data, error } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('userId', userId)
      .eq('period', period);
    
    if (error) {
      console.error('Error fetching subscription usage:', error);
      throw new Error(`Failed to fetch subscription usage: ${error.message}`);
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error in getSubscriptionUsage:', error);
    throw new Error(`Failed to get subscription usage: ${error.message}`);
  }
}

/**
 * Check if a user has access to a specific feature
 * This checks both the user's subscription plan and their current usage
 * 
 * @param userId The user ID
 * @param featureId The feature ID to check access for
 * @returns Object containing access status and possible error
 */
export async function checkFeatureAccess(userId: string, featureId: string): Promise<{ hasAccess: boolean, error?: Error }> {
  try {
    // Get the user's current subscription
    const { subscription, error: subscriptionError } = await getCurrentSubscription(userId);
    
    if (subscriptionError) {
      return { hasAccess: false, error: subscriptionError };
    }
    
    // If no subscription or not active/trialing, no access to premium features
    if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
      // Free tier users still have access to basic features
      if (featureId === 'chat-messages' || featureId === 'knowledge-bases') {
        // For free features, check the usage limits
        const usageData = await getSubscriptionUsage(userId);
        const featureUsage = usageData.find(item => item.featureId === featureId);
        
        // If we have usage data and the user is under their limit, grant access
        if (featureUsage && featureUsage.used < featureUsage.limit) {
          return { hasAccess: true };
        }
        
        // No usage data or over limit
        return { hasAccess: false };
      }
      
      // For premium features, no access without an active subscription
      return { hasAccess: false };
    }
    
    // User has an active subscription, get the plan
    const plan = getPlanById(subscription.planId);
    
    if (!plan) {
      return { hasAccess: false, error: new Error('Subscription plan not found') };
    }
    
    // Check if the feature is included in the plan
    const feature = plan.features.find((f: { id: string }) => f.id === featureId);
    
    if (!feature || !feature.included) {
      return { hasAccess: false };
    }
    
    // For features with limits, check current usage
    if (feature.limit !== undefined && feature.limit !== -1) {
      const usageData = await getSubscriptionUsage(userId);
      const featureUsage = usageData.find(item => item.featureId === featureId);
      
      if (featureUsage && featureUsage.used >= featureUsage.limit) {
        // User has reached their limit for this feature
        return { hasAccess: false };
      }
    }
    
    // User has access to this feature
    return { hasAccess: true };
  } catch (error: any) {
    console.error('Error checking feature access:', error);
    return { hasAccess: false, error: new Error(`Failed to check feature access: ${error.message}`) };
  }
} 