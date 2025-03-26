import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasFeatureAccess } from '../config/subscription-plans';
import { hasAvailableUsage } from '../services/usage';
import { supabase } from '../config/services';

/**
 * Hook to check if a user has access to a feature
 * @param featureId - The feature ID to check access for
 * @returns Object with access state, loading state, and error message
 */
export function useFeatureAccess(featureId: string) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAccess() {
      if (!user || !featureId) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get user's active subscription
        const { data: subscription, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (subscriptionError) {
          // No active subscription found, default to free tier access
          setHasAccess(hasFeatureAccess('free', featureId));
          setIsLoading(false);
          return;
        }

        // Check if the feature is included in the plan
        const accessAllowed = hasFeatureAccess(subscription.plan_id, featureId);
        
        if (!accessAllowed) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // For limited features, check if user has available usage
        const hasUsage = await hasAvailableUsage(user.id, featureId);
        setHasAccess(hasUsage);
      } catch (err) {
        console.error('Error checking feature access:', err);
        setError('Failed to check feature access');
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [user, featureId]);

  return { hasAccess, isLoading, error };
}

/**
 * Hook to get usage and limit for a feature
 * @param featureId - The feature ID to get usage for
 * @returns Object with usage, limit, and percentage
 */
export function useFeatureUsage(featureId: string) {
  const { user } = useAuth();
  const [usage, setUsage] = useState<number>(0);
  const [limit, setLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      if (!user || !featureId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get usage data from Supabase
        const { data, error: usageError } = await supabase
          .from('subscription_usage')
          .select('used, limit')
          .eq('user_id', user.id)
          .eq('feature_id', featureId)
          .order('period', { ascending: false })
          .limit(1)
          .single();

        if (usageError || !data) {
          setUsage(0);
          setLimit(null);
          return;
        }

        setUsage(data.used);
        setLimit(data.limit);
      } catch (err) {
        console.error('Error fetching feature usage:', err);
        setError('Failed to fetch usage data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();
  }, [user, featureId]);

  // Calculate percentage of usage
  const percentage = limit ? Math.min(100, Math.round((usage / limit) * 100)) : 0;

  return { usage, limit, percentage, isLoading, error };
} 