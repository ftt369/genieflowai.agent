import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SubscriptionPeriod, SubscriptionUsage } from '../types/subscription';
import { getFeatureLimitByPlan, getPlanById } from '../config/subscription-plans';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }
  return supabaseInstance;
};

/**
 * Get the current period in YYYY-MM format
 */
function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Calculate reset timestamp for the next period
 */
function getResetTimestamp(period: SubscriptionPeriod): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (period === SubscriptionPeriod.MONTHLY) {
    // For monthly, reset on the 1st of next month
    return new Date(year, month + 1, 1).getTime();
  } else {
    // For yearly, reset next year same month/day
    return new Date(year + 1, month, now.getDate()).getTime();
  }
}

/**
 * Get feature usage for a user
 */
export async function getFeatureUsage(userId: string, featureId: string): Promise<number> {
  if (!userId || !featureId) return 0;
  
  const period = getCurrentPeriod();
  
  const { data, error } = await getSupabaseClient()
    .from('subscription_usage')
    .select('used')
    .eq('user_id', userId)
    .eq('feature_id', featureId)
    .eq('period', period)
    .single();
  
  if (error || !data) return 0;
  
  return data.used;
}

/**
 * Get feature limit for a user's current plan
 */
export async function getFeatureLimit(userId: string, featureId: string): Promise<number | null> {
  if (!userId || !featureId) return null;
  
  // Get user's current subscription
  const { data: subscription, error: subscriptionError } = await getSupabaseClient()
    .from('user_subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (subscriptionError || !subscription) return null;
  
  // Get the limit from the plan configuration
  return getFeatureLimitByPlan(subscription.plan_id, featureId);
}

/**
 * Check if a user has available usage for a feature
 */
export async function hasAvailableUsage(userId: string, featureId: string): Promise<boolean> {
  if (!userId || !featureId) return false;
  
  // Get current usage
  const currentUsage = await getFeatureUsage(userId, featureId);
  
  // Get feature limit
  const limit = await getFeatureLimit(userId, featureId);
  
  // If there's no limit, or usage is less than limit, return true
  return limit === null || currentUsage < limit;
}

/**
 * Increment usage for a feature
 */
export async function incrementUsage(
  userId: string, 
  featureId: string, 
  amount = 1
): Promise<boolean> {
  if (!userId || !featureId) return false;
  
  const period = getCurrentPeriod();
  
  // Get user's current subscription to determine the plan
  const { data: subscription, error: subscriptionError } = await getSupabaseClient()
    .from('user_subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (subscriptionError || !subscription) return false;
  
  // Get the limit from the plan configuration
  const limit = getFeatureLimitByPlan(subscription.plan_id, featureId);
  
  // Get current usage
  const currentUsage = await getFeatureUsage(userId, featureId);
  
  // If limit is set and new usage would exceed it, return false
  if (limit !== null && currentUsage + amount > limit) {
    return false;
  }
  
  // Determine feature period from the plan (default to monthly)
  const featurePeriod = SubscriptionPeriod.MONTHLY;
  
  // Calculate reset timestamp
  const resetAt = getResetTimestamp(featurePeriod);
  
  // Update or insert usage record
  const { error } = await getSupabaseClient()
    .from('subscription_usage')
    .upsert({
      user_id: userId,
      feature_id: featureId,
      used: currentUsage + amount,
      limit: limit || 0,
      period,
      reset_at: resetAt,
      updated_at: Date.now()
    }, {
      onConflict: 'user_id,feature_id,period'
    });
  
  return !error;
}

/**
 * Reset usage for a feature
 */
export async function resetUsage(userId: string, featureId: string): Promise<boolean> {
  if (!userId || !featureId) return false;
  
  const period = getCurrentPeriod();
  
  // Get the feature limit for the user's current plan
  const limit = await getFeatureLimit(userId, featureId);
  
  // Determine feature period (default to monthly)
  const featurePeriod = SubscriptionPeriod.MONTHLY;
  
  // Calculate reset timestamp
  const resetAt = getResetTimestamp(featurePeriod);
  
  // Reset the usage to 0
  const { error } = await getSupabaseClient()
    .from('subscription_usage')
    .upsert({
      user_id: userId,
      feature_id: featureId,
      used: 0,
      limit: limit || 0,
      period,
      reset_at: resetAt,
      updated_at: Date.now()
    }, {
      onConflict: 'user_id,feature_id,period'
    });
  
  return !error;
}

/**
 * Initialize usage tracking for all features in a plan
 */
export async function initializeUsageTracking(
  userId: string, 
  planId: string
): Promise<boolean> {
  if (!userId || !planId) return false;
  
  // Get the plan from configuration
  const plan = getPlanById(planId);
  if (!plan) return false;
  
  const period = getCurrentPeriod();
  const resetAt = getResetTimestamp(SubscriptionPeriod.MONTHLY);
  
  // Initialize all limited features with 0 usage
  const usageRecords = Object.entries(plan.features)
    .filter(([_, feature]) => feature.type === 'limited' && feature.included)
    .map(([featureId, feature]) => ({
      user_id: userId,
      feature_id: featureId,
      used: 0,
      limit: feature.limit || 0,
      period,
      reset_at: resetAt,
      updated_at: Date.now()
    }));
  
  if (usageRecords.length === 0) return true;
  
  // Insert usage records for all features
  const { error } = await getSupabaseClient()
    .from('subscription_usage')
    .upsert(usageRecords, {
      onConflict: 'user_id,feature_id,period'
    });
  
  return !error;
}

/**
 * Get all usage records for a user
 */
export async function getAllUsageRecords(userId: string): Promise<SubscriptionUsage[]> {
  if (!userId) return [];
  
  const period = getCurrentPeriod();
  
  const { data, error } = await getSupabaseClient()
    .from('subscription_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('period', period);
  
  if (error || !data) return [];
  
  return data as SubscriptionUsage[];
}

// Update the usage service to use the singleton
export const usageService = {
  // ... existing code ...
  async trackUsage() {
    const supabase = getSupabaseClient();
    // ... rest of the existing code ...
  }
}; 