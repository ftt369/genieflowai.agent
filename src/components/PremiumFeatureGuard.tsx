import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { FEATURES } from '../config/subscription-plans';
import { StripeCheckoutButton } from './StripeCheckoutButton';
import { SubscriptionPeriod } from '../types/subscription';

interface PremiumFeatureGuardProps {
  /**
   * ID of the feature to check access for
   */
  featureId: string;
  /**
   * Content to render when user has access
   */
  children: ReactNode;
  /**
   * Custom component to render when access is denied
   */
  fallback?: ReactNode;
  /**
   * Whether to redirect to pricing page when access is denied
   */
  redirectToPricing?: boolean;
  /**
   * Whether to show a loading state while checking access
   */
  showLoading?: boolean;
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Whether to show an upgrade button
   */
  showUpgrade?: boolean;
  /**
   * Text to display in the upgrade prompt
   */
  upgradeText?: string;
  /**
   * ID of the plan to upgrade to
   */
  planId?: string;
}

/**
 * Component to guard premium features and show upgrade prompt if needed
 */
export function PremiumFeatureGuard({
  featureId,
  children,
  fallback,
  redirectToPricing = false,
  showLoading = true,
  className = '',
  showUpgrade = true,
  upgradeText = 'Upgrade to access this feature',
  planId = 'pro',
}: PremiumFeatureGuardProps) {
  const router = useRouter();
  const { hasAccess, isLoading, error } = useFeatureAccess(featureId);
  
  // Get feature info for display
  const feature = Object.values(FEATURES).find(f => f.id === featureId);
  const featureName = feature?.name || 'Premium Feature';

  // Redirect to pricing page if requested
  if (!isLoading && !hasAccess && redirectToPricing) {
    router.push('/pricing?feature=' + featureId);
    return null;
  }

  // Handle loading state
  if (isLoading && showLoading) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-700 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
        <p className="text-red-400">Error checking feature access: {error}</p>
      </div>
    );
  }

  // Handle access granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Use custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <div className={`border border-gray-700 rounded-lg p-6 my-4 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-gray-800 p-3 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          Upgrade to Access {featureName}
        </h3>
        <p className="text-gray-400 mb-4">
          This feature is available on premium plans. Upgrade your subscription to unlock it.
        </p>
        {showUpgrade && (
          <StripeCheckoutButton
            planId={planId}
            period={SubscriptionPeriod.MONTHLY}
            buttonText="Upgrade Now"
            size="md"
          />
        )}
      </div>
    </div>
  );
} 