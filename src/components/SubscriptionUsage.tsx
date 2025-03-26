import React from 'react';
import { useFeatureUsage } from '../hooks/useFeatureAccess';
import { FEATURES } from '../config/subscription-plans';

interface SubscriptionUsageProps {
  featureId: string;
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Component to display feature usage with a progress bar
 */
export function SubscriptionUsage({
  featureId,
  showLabel = true,
  compact = false,
  className = '',
}: SubscriptionUsageProps) {
  const { usage, limit, percentage, isLoading, error } = useFeatureUsage(featureId);
  
  // Get feature info for display
  const feature = Object.values(FEATURES).find(f => f.id === featureId);
  const featureName = feature?.name || 'Feature';
  
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        {showLabel && <div className="h-4 mt-2 bg-gray-700 rounded w-24"></div>}
      </div>
    );
  }
  
  if (error || !feature) {
    return null;
  }
  
  // If feature is not limited or there's no limit, don't show usage
  if (feature.type !== 'limited' || limit === null) {
    return null;
  }
  
  // Determine color based on usage percentage
  let barColor = 'bg-green-500';
  if (percentage > 90) {
    barColor = 'bg-red-500';
  } else if (percentage > 70) {
    barColor = 'bg-yellow-500';
  } else if (percentage > 50) {
    barColor = 'bg-blue-500';
  }
  
  return (
    <div className={`${className}`}>
      {showLabel && !compact && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">{featureName}</span>
          <span className="text-gray-400">
            {usage} / {limit}
          </span>
        </div>
      )}
      
      <div className="bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${barColor} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {showLabel && compact && (
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-400">
            {usage}/{limit} {featureName}
          </span>
          <span className="text-gray-400">{percentage}%</span>
        </div>
      )}
    </div>
  );
}

/**
 * Component to display all feature usage for a plan
 */
export function AllFeatureUsage({ className = '' }: { className?: string }) {
  // Filter to only show limited features
  const limitedFeatures = Object.values(FEATURES).filter(
    feature => feature.type === 'limited'
  );
  
  if (limitedFeatures.length === 0) {
    return null;
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-white">Usage</h3>
      <div className="space-y-3">
        {limitedFeatures.map(feature => (
          <SubscriptionUsage key={feature.id} featureId={feature.id} />
        ))}
      </div>
    </div>
  );
}

// Add default export for backward compatibility
export default SubscriptionUsage; 