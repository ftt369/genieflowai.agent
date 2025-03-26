import { incrementFeatureUsage, getFeatureUsage } from './subscription';

// User type that only requires an id property
interface UserWithId {
  id: string;
  [key: string]: any;
}

/**
 * Service for tracking feature usage
 */
class UsageTracker {
  private static instance: UsageTracker;
  private trackingQueue: Array<{ userId: string; featureId: string; amount: number }> = [];
  private isProcessing = false;
  private initialized = false;

  private constructor() {
    // Initialize the batch processing
    this.initializeBatchProcessing();
  }

  /**
   * Get the UsageTracker singleton instance
   */
  public static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  /**
   * Initialize batch processing of usage tracking
   */
  private initializeBatchProcessing(): void {
    if (this.initialized) return;
    
    // Process the queue every 10 seconds
    setInterval(() => this.processQueue(), 10000);
    this.initialized = true;
  }

  /**
   * Process the queue of usage tracking requests
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.trackingQueue.length === 0) return;

    this.isProcessing = true;

    try {
      // Group by userId and featureId to aggregate usage
      const usageMap = new Map<string, Map<string, number>>();
      
      // Aggregate usage by user and feature
      for (const item of this.trackingQueue) {
        const userKey = item.userId;
        if (!usageMap.has(userKey)) {
          usageMap.set(userKey, new Map<string, number>());
        }
        
        const featureMap = usageMap.get(userKey)!;
        const currentAmount = featureMap.get(item.featureId) || 0;
        featureMap.set(item.featureId, currentAmount + item.amount);
      }
      
      // Process aggregated usage
      const promises: Promise<any>[] = [];
      
      for (const [userId, featureMap] of usageMap.entries()) {
        for (const [featureId, amount] of featureMap.entries()) {
          promises.push(incrementFeatureUsage(userId, featureId, amount));
        }
      }
      
      // Wait for all updates to complete
      await Promise.all(promises);
      
      // Clear the queue
      this.trackingQueue = [];
    } catch (error) {
      console.error('Error processing usage tracking queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Track usage of a feature for a user
   * @param user The user using the feature (any object with an id property)
   * @param featureId The feature being used
   * @param amount The amount to increment (default: 1)
   */
  public trackUsage(user: UserWithId | null, featureId: string, amount: number = 1): void {
    if (!user) return;
    
    // Add to tracking queue
    this.trackingQueue.push({
      userId: user.id,
      featureId,
      amount
    });
    
    // If the queue is getting large, process it immediately
    if (this.trackingQueue.length > 50 && !this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Check if a user is approaching their usage limit
   * @param user The user to check (any object with an id property)
   * @param featureId The feature to check
   * @returns Object containing warning level and percentage
   */
  public async checkUsageWarning(user: UserWithId | null, featureId: string): Promise<{ 
    warningLevel: 'none' | 'approaching' | 'critical'; 
    percentage: number;
  }> {
    if (!user) {
      return { warningLevel: 'none', percentage: 0 };
    }

    try {
      const { used, limit, error } = await getFeatureUsage(user.id, featureId);
      
      if (error || !limit || limit <= 0) {
        return { warningLevel: 'none', percentage: 0 };
      }
      
      const percentage = Math.min((used / limit) * 100, 100);
      
      if (percentage >= 90) {
        return { warningLevel: 'critical', percentage };
      } else if (percentage >= 75) {
        return { warningLevel: 'approaching', percentage };
      } else {
        return { warningLevel: 'none', percentage };
      }
    } catch (err) {
      console.error(`Error checking usage warning for feature ${featureId}:`, err);
      return { warningLevel: 'none', percentage: 0 };
    }
  }
}

// Export a singleton instance
export const usageTracker = UsageTracker.getInstance();

/**
 * Track usage of a feature
 * @param user The user using the feature (any object with an id property)
 * @param featureId The feature being used
 * @param amount The amount to increment
 */
export function trackFeatureUsage(user: UserWithId | null, featureId: string, amount: number = 1): void {
  usageTracker.trackUsage(user, featureId, amount);
}

/**
 * Check if the user is approaching their usage limit
 * @param user The user to check (any object with an id property)
 * @param featureId The feature to check
 */
export async function checkUsageLimit(user: UserWithId | null, featureId: string): Promise<{
  warningLevel: 'none' | 'approaching' | 'critical';
  percentage: number;
}> {
  return await usageTracker.checkUsageWarning(user, featureId);
} 