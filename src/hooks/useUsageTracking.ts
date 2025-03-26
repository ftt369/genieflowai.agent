import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { trackFeatureUsage, checkUsageLimit } from '../services/usageTracker';

/**
 * Hook to track usage of features and check limits
 * 
 * @param featureId The feature ID to track usage for
 * @returns Object with track, usageWarning and usagePercentage
 */
export function useUsageTracking(featureId: string) {
  const { user } = useAuth();
  const [usageWarning, setUsageWarning] = useState<'none' | 'approaching' | 'critical'>('none');
  const [usagePercentage, setUsagePercentage] = useState<number>(0);
  
  /**
   * Track usage of the feature
   * @param amount Amount to increment (default: 1)
   */
  const track = useCallback((amount: number = 1) => {
    trackFeatureUsage(user, featureId, amount);
  }, [user, featureId]);
  
  // Check usage limits on mount and when user changes
  useEffect(() => {
    if (!user) return;
    
    async function checkUsage() {
      const { warningLevel, percentage } = await checkUsageLimit(user, featureId);
      setUsageWarning(warningLevel);
      setUsagePercentage(percentage);
    }
    
    checkUsage();
    
    // Set up an interval to check usage periodically (every minute)
    const intervalId = setInterval(checkUsage, 60000);
    
    return () => clearInterval(intervalId);
  }, [user, featureId]);
  
  /**
   * Force a refresh of the usage data
   */
  const refreshUsage = useCallback(async () => {
    if (!user) return;
    
    const { warningLevel, percentage } = await checkUsageLimit(user, featureId);
    setUsageWarning(warningLevel);
    setUsagePercentage(percentage);
  }, [user, featureId]);
  
  return {
    /** Track usage of this feature */
    track,
    
    /** Current warning level for usage */
    usageWarning,
    
    /** Current usage as a percentage of the limit */
    usagePercentage,
    
    /** Force a refresh of usage data */
    refreshUsage
  };
} 