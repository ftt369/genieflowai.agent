import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { STRIPE_CONFIG } from '../config/stripe';

interface CustomerPortalButtonProps {
  className?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSpinner?: boolean;
  returnUrl?: string;
}

/**
 * Button component that opens Stripe Customer Portal
 */
export function CustomerPortalButton({
  className = '',
  buttonText = 'Manage Subscription',
  variant = 'secondary',
  disabled = false,
  size = 'md',
  showSpinner = true,
  returnUrl,
}: CustomerPortalButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Style classes for different button variants
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    outline: 'bg-transparent border border-gray-700 hover:border-gray-600 text-gray-300',
  };

  // Style classes for different button sizes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const handleClick = async () => {
    if (!user) {
      // Redirect to sign in page if not authenticated
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call the API to create a customer portal session
      const response = await fetch(STRIPE_CONFIG.billingPortalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: returnUrl || window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create customer portal session');
      }

      // Redirect to Stripe customer portal
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Error creating customer portal session:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          rounded-md font-medium transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {isLoading && showSpinner ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : (
          buttonText
        )}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
} 